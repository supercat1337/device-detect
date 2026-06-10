// @ts-check

/**
 * Check if the code is executing in a client (browser) environment.
 * @type {boolean}
 */
const isClient = typeof window !== 'undefined';

/**
 * Safe access to the navigator object.
 * @type {Navigator | null}
 */
const safeNavigator = isClient ? window.navigator : null;

/**
 * Safely retrieves the User Agent string.
 * @returns {string} The user agent string or an empty string if not in browser.
 */
function getSafeUserAgent() {
    return safeNavigator ? safeNavigator.userAgent : '';
}

/**
 * Safely retrieves the NavigatorUAData object (User-Agent Client Hints).
 * @returns {import("./types.js").NavigatorUAData | null} The userAgentData object or null if not supported/available.
 */
function getSafeUserAgentData() {
    if (!safeNavigator) return null;

    // @ts-ignore - userAgentData is not standard in all browser typings yet
    return safeNavigator.userAgentData || null;
}

/**
 * Safely requests high-entropy values from User-Agent Client Hints.
 * @param {string[]} hints - Array of hint names to request (e.g., ['model', 'platformVersion']).
 * @returns {Promise<import("./types.js").UADataValues | null>} A promise that resolves to the values or null if unsupported.
 */
async function getHighEntropyValues(hints) {
    const uaData = getSafeUserAgentData();
    if (!uaData || typeof uaData.getHighEntropyValues !== 'function') {
        return null;
    }

    try {
        return await uaData.getHighEntropyValues(hints);
    } catch (error) {
        // Fallback if the promise is rejected or permission is denied
        return null;
    }
}

// @ts-check


/**
 * Asynchronously determines the Android version number.
 * * @param {string} userAgent The user agent string.
 * @returns {Promise<string|false>} A promise that resolves to the Android version string, or false.
 */
async function getAndroidOS(userAgent) {
    if (!/android/i.test(userAgent)) {
        return false;
    }

    // Check if the platformVersion is available in high entropy values
    const data = await getHighEntropyValues(['platformVersion']);
    if (data && data.platformVersion) {
        return 'Android ' + data.platformVersion;
    }

    const matchVersion = userAgent.match(/android\s([0-9\.]*)/i);
    if (matchVersion && matchVersion[1]) {
        return 'Android ' + matchVersion[1];
    }

    return 'Android';
}

/**
 * Gets the operating system name and version.
 *
 * @param {string} [userAgent=getSafeUserAgent()] The user agent string.
 * @returns {Promise<string>} The detected operating system name and version.
 */
async function getOS(userAgent = getSafeUserAgent()) {
    let os = 'Unknown';

    /** @type {Array<import('./types.js').OSRule>} */
    const operatingSystemRules = [
        { os: 'iOS', re: /iP(hone|od|ad)/ },
        { os: 'Android', re: /Android/ },
        { os: 'BlackBerry OS', re: /BlackBerry|BB10/ },
        { os: 'Windows Mobile', re: /IEMobile/ },
        { os: 'Amazon OS', re: /Kindle/ },
        { os: 'Windows 3.11', re: /Win16/ },
        { os: 'Windows 95', re: /(Windows 95)|(Win95)|(Windows_95)/ },
        { os: 'Windows 98', re: /(Windows 98)|(Win98)/ },
        { os: 'Windows 2000', re: /(Windows NT 5.0)|(Windows 2000)/ },
        { os: 'Windows XP', re: /(Windows NT 5.1)|(Windows XP)/ },
        { os: 'Windows Server 2003', re: /(Windows NT 5.2)/ },
        { os: 'Windows Vista', re: /(Windows NT 6.0)/ },
        { os: 'Windows 7', re: /(Windows NT 6.1)/ },
        { os: 'Windows 8', re: /(Windows NT 6.2)/ },
        { os: 'Windows 8.1', re: /(Windows NT 6.3)/ },
        { os: 'Windows 10', re: /(Windows NT 10.0)/ },
        { os: 'Windows ME', re: /Windows ME/ },
        { os: 'Windows CE', re: /Windows CE|WinCE|Microsoft Pocket Internet Explorer/ },
        { os: 'Open BSD', re: /OpenBSD/ },
        { os: 'Sun OS', re: /SunOS/ },
        { os: 'Chrome OS', re: /CrOS/ },
        { os: 'Linux', re: /(Linux|X11)\s*([^\s;]+)*/ },
        { os: 'Mac OS', re: /(Mac_PowerPC)|(Macintosh)/ },
        { os: 'QNX', re: /QNX/ },
        { os: 'BeOS', re: /BeOS/ },
        { os: 'OS/2', re: /OS\/2/ },
        { os: 'Aurora', re: /Aurora/ },
    ];

    for (let i = 0, count = operatingSystemRules.length; i < count; i++) {
        if (operatingSystemRules[i].re.test(userAgent)) {
            os = operatingSystemRules[i].os;
            break;
        }
    }

    if (os === 'Windows 10') {
        const win11 = await isWindows11();
        return win11 ? 'Windows 11' : 'Windows 10';
    }

    if (os === 'Aurora') {
        const matchVersion = userAgent.match(/Aurora\/([^\s;]+)/i);
        return matchVersion ? os + ' ' + matchVersion[1] : os;
    }

    if (os === 'iOS') {
        // Updated regular expression to capture both 2-digit (17.5) and 3-digit (17.4.1) versions properly
        const matchVersion = userAgent.match(/OS\s([0-9]+)[_.](([0-9]+)(?:[_.][0-9]+)?)/);
        if (matchVersion) {
            os += ' ' + matchVersion[1] + '.' + matchVersion[2].replace(/_/g, '.');
        }
        return os;
    }

    if (os === 'Mac OS') {
        const matchVersion = userAgent.match(/Mac OS X\s([0-9\._]*)/i);
        if (matchVersion) {
            // Check if it is a modern iPad masking as a Mac (Touch capability check)
            // This decouples os.js from device/apple.js and resolves the circular dependency
            const isModernIPad = safeNavigator && safeNavigator.maxTouchPoints > 1;

            if (isModernIPad) {
                os = 'iPad OS';
                const matchSafariVersion = userAgent.match(/Version\/([^\s;]+)/);
                if (matchSafariVersion) {
                    os = os + ' ' + matchSafariVersion[1];
                }
                return os;
            }

            os = os + ' ' + matchVersion[1].replace(/_/g, '.');
        }
        return os;
    }

    if (os === 'Android') {
        const androidOS = await getAndroidOS(userAgent);
        if (androidOS) {
            return androidOS;
        }
    }

    return os;
}

/**
 * Asynchronously checks if the operating system is Windows 11.
 *
 * @returns {Promise<boolean>} A promise that resolves to true if the operating system is Windows 11, false otherwise.
 */
async function isWindows11() {
    const userAgentData = getSafeUserAgentData();
    if (!userAgentData || userAgentData.platform !== 'Windows') {
        return false;
    }

    const data = await getHighEntropyValues(['platformVersion']);
    if (!data || typeof data.platformVersion !== 'string') {
        return false;
    }

    const majorPlatformVersion = parseInt(data.platformVersion.split('.')[0], 10);
    // Windows 11 build versions return a major platform version of 13 or higher via Client Hints
    return majorPlatformVersion >= 13;
}

// @ts-check


/**
 * Modern and secure cache storage for heavy Intl.DisplayNames instances.
 * Using Map prevents Prototype Pollution vulnerabilities.
 * @type {Map<string, Intl.DisplayNames>}
 */
const displayNamesCache = new Map();

/**
 * Safely retrieves the browser's primary language code for country resolution fallback.
 *
 * @returns {string} The primary language tag (e.g., 'en-US') or 'en'.
 */
function getSafePrimaryLanguage$1() {
    return isClient && safeNavigator ? safeNavigator.language : 'en';
}

/**
 * Gets the human-readable country/region name derived from the user's current locale settings.
 * Performance-optimized via a secure modern Map-based Memoization Cache.
 *
 * @param {string} [displayLocale] The locale to use for translating the country name. Defaults to the client's language.
 * @param {string} [targetLocale] Optional custom locale to extract the country from (crucial for SSR execution).
 * @returns {string} The localized country name (e.g., "United States"), a generic fallback, or an empty string.
 */
function getCountryName(displayLocale, targetLocale) {
    // 1. Resolve the source locale from which we want to extract the country code
    const sourceLocale = targetLocale || getSafePrimaryLanguage$1();
    if (!sourceLocale) return '';

    // 2. Extract the ISO 3166-1 alpha-2 region code safely
    let regionCode = '';
    try {
        const localeObj = new Intl.Locale(sourceLocale);
        if (localeObj.region) {
            regionCode = localeObj.region.toUpperCase();
        }
    } catch (e) {
        // Fallback: A stricter regex that ensures we capture an isolated 2-letter
        // country token separated by dashes/underscores, preventing partial matches.
        const match = sourceLocale.match(/(?:[-_])([A-Za-z]{2})(?:\b|[-_]|$)/);
        if (match && match[1]) {
            regionCode = match[1].toUpperCase();
        }
    }

    // If no valid region identifier could be parsed, return 'Unknown' for clean analytical grouping
    if (!regionCode) {
        return 'Unknown';
    }

    // 3. Resolve and validate the display locale used for translation formatting
    let safeDisplayLocale = displayLocale || getSafePrimaryLanguage$1();
    try {
        const canonicalLocales = Intl.getCanonicalLocales(safeDisplayLocale);
        if (canonicalLocales && canonicalLocales[0]) {
            safeDisplayLocale = canonicalLocales[0];
        }
    } catch (e) {
        safeDisplayLocale = getSafePrimaryLanguage$1();
    }

    // 4. Translate the region code using the secure Map Cache
    try {
        // If the formatter for this specific display locale doesn't exist yet, create and set it
        if (!displayNamesCache.has(safeDisplayLocale)) {
            displayNamesCache.set(
                safeDisplayLocale,
                new Intl.DisplayNames([safeDisplayLocale], { type: 'region', fallback: 'code' })
            );
        }

        const regionDisplay = displayNamesCache.get(safeDisplayLocale);
        return regionDisplay ? regionDisplay.of(regionCode) || regionCode : regionCode;
    } catch (error) {
        console.warn(
            'Intl.DisplayNames is not supported or failed in this environment. Returning raw region code.',
            error
        );
        // Safely return the raw uppercase ISO code (e.g., "US") if the environment lacks full Intl support
        return regionCode;
    }
}

// @ts-check


/**
 * Asynchronously gets the browser name and version.
 *
 * @param {string} [userAgent=getSafeUserAgent()] The user agent string.
 * @returns {Promise<string>} A promise that resolves to the browser name and version, or "Unknown".
 */
async function getBrowser(userAgent = getSafeUserAgent()) {
    if (!userAgent) return 'Unknown';

    // 1. Brave detection (requires async check because isBrave() returns a Promise)
    if (safeNavigator && /** @type {any} */ (safeNavigator).brave) {
        const braveNav = /** @type {import('./types.js').BraveNavigator} */ (
            /** @type {any} */ (safeNavigator).brave
        );
        if (typeof braveNav.isBrave === 'function') {
            try {
                const isBrave = await braveNav.isBrave();
                if (isBrave) {
                    const matchChromeVersion = userAgent.match(/Chrome\/([^\s;]+)/i);
                    return matchChromeVersion ? 'Brave ' + matchChromeVersion[1] : 'Brave';
                }
            } catch (e) {
                // Fail silently and proceed to fallback UA detection
            }
        }
    }

    // see: https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Browser_detection_using_the_user_agent

    // 2. In-App / Messenger Browsers (Highest Priority)
    const matchYandex = userAgent.match(/YaBrowser\/([^\s;]+)/i);
    if (matchYandex) return 'Yandex ' + matchYandex[1];

    const matchMessenger = userAgent.match(/Messenger\/([^\s;]+)/);
    if (matchMessenger) return 'Messenger ' + matchMessenger[1];

    if (/FBAN|FBAV/i.test(userAgent)) {
        let appName = 'Facebook';
        const appNameMatch = userAgent.match(/FBAN\/([^\s;]+)/i);
        if (appNameMatch) {
            appName = 'Facebook ' + appNameMatch[1];
        }

        let appVersion = '';
        const appVersionMatch = userAgent.match(/FBAV\/([^\s;]+)/i);
        if (appVersionMatch) {
            appVersion = appVersionMatch[1];
        }

        return (appName + ' ' + appVersion).trim();
    }

    const matchInstagram = userAgent.match(/Instagram ([^\s;]+)/i);
    if (matchInstagram) return 'Instagram ' + matchInstagram[1];

    if (isClient && typeof (/** @type {any} */ (window).TelegramWebview) !== 'undefined') {
        return 'Telegram InApp Browser';
    }

    if (/(micromessenger|weixin)/i.test(userAgent)) {
        return 'WeChat';
    }

    // 3. Specialized Custom Browsers
    const matchSeaMonkey = userAgent.match(/SeaMonkey\/([^\s;]+)/);
    if (matchSeaMonkey) return 'SeaMonkey ' + matchSeaMonkey[1];

    // Opera 15+
    const matchNewOpera = userAgent.match(/OPR\/([^\s;]+)/);
    if (matchNewOpera) return 'Opera ' + matchNewOpera[1];

    // Opera 12-14
    const matchOldOpera = userAgent.match(/Opera\/([^\s;]+)/);
    if (matchOldOpera) return 'Opera ' + matchOldOpera[1];

    const matchEdge = userAgent.match(/Edg[^\/]*\/([^\s;]+)/);
    if (matchEdge) return 'Edge ' + matchEdge[1];

    // 4. Base Engines (Lowest Priority - checked last to prevent false positives)
    const matchFirefox = userAgent.match(/Firefox\/([^\s;]+)/);
    if (matchFirefox) return 'Firefox ' + matchFirefox[1];

    const matchChromium = userAgent.match(/Chromium\/([^\s;]+)/);
    if (matchChromium) return 'Chromium ' + matchChromium[1];

    const matchChrome = userAgent.match(/Chrome\/([^\s;]+)/);
    if (matchChrome) return 'Chrome ' + matchChrome[1];

    const matchSafari = userAgent.match(/Safari\/([^\s;]+)/);
    if (matchSafari) {
        const versionMatch = userAgent.match(/Version\/([^\s;]+)/);
        const version = versionMatch ? versionMatch[1] : matchSafari[1];

        // Await the asynchronous getOS function from os.js to differentiate mobile/desktop Safari
        const currentOS = await getOS(userAgent);
        if (currentOS.startsWith('iOS') || currentOS.startsWith('iPad OS')) {
            return 'Mobile Safari ' + version;
        }
        return 'Safari ' + version;
    }

    // Legacy Internet Explorer (Trident)
    if (/trident/i.test(userAgent)) {
        const versionMatch = /\brv[ :]+(\d+)/g.exec(userAgent);
        if (versionMatch) return 'IE ' + versionMatch[1];

        const versionMatch2 = /\bMSIE\s([\d\.]+)/g.exec(userAgent);
        if (versionMatch2) return 'IE ' + versionMatch2[1];

        return 'IE';
    }

    return 'Unknown';
}

/**
 * Asynchronously checks if the browser is running in a webview (embedded WebView).
 * Uses the OS detection from os.js to avoid duplication.
 *
 * @param {string} [userAgent=getSafeUserAgent().toLowerCase()] Optional user agent.
 * @returns {Promise<boolean>} True if running in a webview, false otherwise.
 */
async function isWebview(userAgent = getSafeUserAgent().toLowerCase()) {
    if (typeof window === 'undefined') return false;

    const ua = userAgent.toLowerCase();
    const os = await getOS(userAgent); // returns e.g. "iOS 15.4", "Android 13", "Windows 10", ...

    // Android WebView detection
    if (os.startsWith('Android')) {
        // Typical Android WebView contains 'wv' in user agent
        if (ua.includes('wv')) return true;
        // Some older or custom WebViews might not have 'wv'
        if (!ua.includes('chrome') && !ua.includes('safari')) return true;
        return false;
    }

    // iOS WebView detection
    if (os.startsWith('iOS') || os.startsWith('iPad OS')) {
        // Standalone mode (home screen app) is not a webview
        if (window.navigator.standalone) return false;
        // WKWebView exposes message handlers
        // @ts-ignore
        if (window.webkit && window.webkit.messageHandlers) return true;
        // UIWebView or older webview: check user agent patterns
        const isSafari = /safari/.test(ua);
        const hasVersion = /version\//.test(ua);
        if (!isSafari || (isSafari && !hasVersion)) return true;
        return false;
    }

    // Fallback for other operating systems (Windows, macOS, Linux, etc.)
    return ua.includes('wv');
}

/**
 * Gets the human-readable name of the browser's primary language.
 *
 * @param {string} [localeName=window.navigator.language] The locale in which to return the language name.
 *                                                        Defaults to the browser's UI language.
 * @returns {string} Language name in the specified locale (e.g., "Russian" for locale 'en', "русский" for 'ru').
 */
function getBrowserLanguage(localeName = isClient ? window.navigator.language : 'en') {
    if (!isClient) return 'en';
    const langFull = window.navigator.language;

    let safeLocale = localeName;

    try {
        // Validate locale – if invalid, fallback to original (will be caught)
        safeLocale = Intl.getCanonicalLocales(localeName)[0] ?? localeName;
    } catch {
        // If localeName is completely invalid, keep original; will fail later
    }

    try {
        const displayNames = new Intl.DisplayNames([safeLocale], {
            type: 'language',
            languageDisplay: 'dialect',
            fallback: 'code',
        });
        return displayNames.of(langFull) || langFull;
    } catch (error) {
        // Fallback for very old browsers (or if Intl.DisplayNames is unavailable)
        console.warn('Intl.DisplayNames not supported, returning raw language code', error);
        return langFull;
    }
}

// @ts-check


const languageDisplayCache = new Map();

/**
 * Safely retrieves the browser's primary language code.
 * Used as a fallback for environment-agnostic execution (SSR safely returns 'en').
 *
 * @returns {string} The primary language tag (e.g., 'en-US') or 'en'.
 */
function getSafePrimaryLanguage() {
    return isClient && safeNavigator ? safeNavigator.language : 'en';
}

/**
 * Gets the user's current time zone.
 * Safely handles environments where Intl or TimeZone is unavailable (e.g., legacy browsers or SSR).
 *
 * @returns {string} The resolved time zone ID (e.g., "America/New_York") or "UTC" as a fallback.
 */
function getTimeZone() {
    try {
        return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    } catch (e) {
        // Fallback to 'UTC' instead of an uninformative dash '-' to maintain analytical clarity
        return 'UTC';
    }
}

/**
 * Gets the languages supported by the browser with human-readable names.
 * No duplicate region names – Intl.DisplayNames already includes region when appropriate.
 *
 * @param {string} [displayLocale] The locale to use for displaying names.
 * @param {readonly string[]} [fallbackLanguages] Optional array of language tags.
 * @returns {string[]} Array of formatted language strings.
 */
function getLanguages(displayLocale, fallbackLanguages) {
    const targetLanguages =
        fallbackLanguages || (isClient && safeNavigator ? safeNavigator.languages : ['en']);
    if (!targetLanguages || targetLanguages.length === 0) {
        return [];
    }

    let safeDisplayLocale = displayLocale || getSafePrimaryLanguage();
    try {
        const canonicalLocales = Intl.getCanonicalLocales(safeDisplayLocale);
        if (canonicalLocales && canonicalLocales[0]) {
            safeDisplayLocale = canonicalLocales[0];
        }
    } catch (e) {
        safeDisplayLocale = getSafePrimaryLanguage();
    }

    // Get or create cached Intl.DisplayNames for language (region is handled internally)
    let langDisplay = languageDisplayCache.get(safeDisplayLocale);
    if (!langDisplay) {
        try {
            langDisplay = new Intl.DisplayNames([safeDisplayLocale], {
                type: 'language',
                languageDisplay: 'dialect',
                fallback: 'code',
            });
            languageDisplayCache.set(safeDisplayLocale, langDisplay);
        } catch (error) {
            console.warn('Intl.DisplayNames not supported. Returning raw tags.', error);
            // Return unique raw tags
            const seen = new Set();
            return targetLanguages.filter(tag => {
                const norm = tag.toLowerCase();
                if (seen.has(norm)) return false;
                seen.add(norm);
                return true;
            });
        }
    }

    const seen = new Set();
    const result = [];

    for (const langTag of targetLanguages) {
        const normalized = langTag.toLowerCase();
        if (seen.has(normalized)) continue;
        seen.add(normalized);

        let formatted;
        try {
            // Intl.DisplayNames already returns "Russian (Russia)" for ru-RU, etc.
            formatted = langDisplay.of(langTag) || langTag;
        } catch (e) {
            formatted = langTag;
        }
        result.push(formatted);
    }
    return result;
}

// @ts-check


/**
 * Asynchronously gets the Android device marketing name or model.
 *
 * @param {string} [userAgent=getSafeUserAgent()] The user agent string.
 * @returns {Promise<string>} A promise that resolves to the device brand/model, or an empty string.
 */
async function getAndroidDeviceName(userAgent = getSafeUserAgent()) {
    // 1. Modern High-Entropy Client Hints check (The most accurate way for modern Chromium)
    const userAgentData = getSafeUserAgentData();
    if (userAgentData && typeof userAgentData.getHighEntropyValues === 'function') {
        try {
            // 'model' gives the exact device model (e.g., "SM-S911B" or "Pixel 7")
            const data = await userAgentData.getHighEntropyValues(['model']);
            if (data && data.model) {
                return data.model.trim();
            }
        } catch (e) {
            // Fail silently and fall back to User-Agent parsing
        }
    }

    if (!userAgent || !/Android/i.test(userAgent)) {
        return '';
    }

    // 2. Fallback: Precise User-Agent token isolation
    // In Android UA strings, the device model is always located right before the "Build/" token
    // or directly before the closing parenthesis of the Linux platform component.
    // Example: "Android 13; SM-S911B)" or "Android 12; ru-ru; Redmi Note 11 Build/..."
    const modelMatch = userAgent.match(/Android\s[^;)]+;\s([^;)]+?)(?:\sBuild|\))/i);

    if (modelMatch && modelMatch[1]) {
        const fullModel = modelMatch[1].trim();

        // Optional: If you only want the FIRST word (e.g., "SAMSUNG" or "Redmi"), keep your split logic:
        // return fullModel.split(' ')[0];

        // Recommendation: Return the full model name token for better analytical precision (e.g., "SM-G998B")
        return fullModel;
    }

    return 'Android Device';
}

// @ts-check


// Optimized Apple device logical resolution mapping (using standard CSS points, orientation-agnostic)
const APPLE_LOGICAL_MAPPING = new Map([
    // iPhones (Short side x Long side)
    ['320x480', 'iPhone 4/4s, 3GS'],
    ['320x568', 'iPhone 5, 5c, 5s, SE (1st gen)'],
    ['375x667', 'iPhone 6, 6s, 7, 8, SE (2nd/3rd gen)'],
    ['414x736', 'iPhone 6 Plus, 6s Plus, 7 Plus, 8 Plus'],
    ['375x812', 'iPhone X, XS, 11 Pro, 12 mini, 13 mini'],
    ['390x844', 'iPhone 12, 12 Pro, 13, 13 Pro, 14'],
    ['393x852', 'iPhone 14 Pro, 15, 15 Pro, 16'],
    ['428x926', 'iPhone 12 Pro Max, 13 Pro Max, 14 Plus'],
    ['430x932', 'iPhone 14 Pro Max, 15 Plus, 15 Pro Max, 16 Plus'],
    ['402x874', 'iPhone 16 Pro'],
    ['440x956', 'iPhone 16 Pro Max'],

    // iPads (Short side x Long side)
    ['744x1133', 'iPad Mini (6th gen)'],
    ['768x1024', 'iPad Mini (1-5), iPad (1-6), iPad Air 1/2, iPad Pro 9.7"'],
    ['810x1080', 'iPad (7th-9th gen)'],
    ['820x1180', 'iPad Air (4th/5th gen), iPad (10th gen)'],
    ['834x1112', 'iPad Air (3rd gen), iPad Pro 10.5"'],
    ['834x1194', 'iPad Pro 11" (3rd-5th gen)'],
    ['1024x1366', 'iPad Pro 12.9"'],
]);

/**
 * Determines if the current device is an iPhone or iPod.
 *
 * @param {string} [userAgent=getSafeUserAgent()] The user agent string.
 * @returns {boolean} True if an iPhone is detected, false otherwise.
 */
function isIPhone(userAgent = getSafeUserAgent()) {
    if (!userAgent) return false;
    return /iPhone|iPod/i.test(userAgent);
}

/**
 * Determines if the current device is an iPad.
 *
 * @param {string} [userAgent=getSafeUserAgent()] The user agent string.
 * @returns {boolean} True if an iPad is detected, false otherwise.
 */
function isIPad(userAgent = getSafeUserAgent()) {
    if (!userAgent) return false;
    if (isIPhone(userAgent)) return false;

    const uaLower = userAgent.toLowerCase();

    // 1. Classic User-Agent check
    if (uaLower.indexOf('ipad') > -1) return true;

    // 2. Modern iPadOS check (iPadOS 13+ masking as Macintosh but having multi-touch capabilities)
    if (uaLower.indexOf('macintosh') > -1 && safeNavigator) {
        // Checking for touch support alongside touch points ensures high accuracy
        const hasTouchSupport =
            'ontouchstart' in (isClient ? window : {}) || safeNavigator.maxTouchPoints > 0;
        if (hasTouchSupport && safeNavigator.maxTouchPoints > 2) {
            return true;
        }
    }

    return false;
}

/**
 * Determines if the current device is a desktop Apple computer (Mac).
 *
 * @param {string} [userAgent=getSafeUserAgent()] The user agent string.
 * @returns {boolean} True if a Mac is detected, false otherwise.
 */
function isMac(userAgent = getSafeUserAgent()) {
    if (!userAgent) return false;
    if (!/macintosh/i.test(userAgent)) return false;

    // If it has a Mac UA but features touch points > 2, it's actually an iPad
    return !isIPad(userAgent);
}

/**
 * Asynchronously gets the localized or family name of the Apple device.
 *
 * @param {string} [userAgent=getSafeUserAgent()] The user agent string.
 * @returns {Promise<string>} A promise that resolves to the Apple device name, or an empty string.
 */
async function getAppleDeviceModel(userAgent = getSafeUserAgent()) {
    if (!userAgent) return '';

    // 1. Filter out non-Apple devices immediately
    if (!/iphone|ipad|macintosh/i.test(userAgent)) return '';

    // 2. High-priority: Client Hints check for future Safari compatibility
    const userAgentData = getSafeUserAgentData();
    if (userAgentData && typeof userAgentData.getHighEntropyValues === 'function') {
        try {
            // Apple Client Hints format: model could return "iPhone15,2"
            // We use standard Promise handling inside our architecture façade
            const hints = await userAgentData.getHighEntropyValues(['model']);
            if (hints && hints.model) {
                return hints.model;
            }
        } catch (e) {
            // Fail silently and proceed to resolution mapping
        }
    }

    return fallbackResolutionMapping(userAgent);
}

/**
 * Fallback helper to extract the device name using logical screen resolution.
 *
 * @param {string} userAgent
 * @returns {string}
 */
function fallbackResolutionMapping(userAgent) {
    if (!isClient || typeof window.screen === 'undefined') {
        return isMac(userAgent) ? 'Macintosh' : 'Apple Device';
    }

    const { width, height } = window.screen;
    if (!width || !height) return '';

    // Normalizing orientation: always use the smaller side as width to ensure key consistency
    const shortSide = Math.min(width, height);
    const longSide = Math.max(width, height);
    const resolutionKey = `${shortSide}x${longSide}`;

    const matchedModel = APPLE_LOGICAL_MAPPING.get(resolutionKey);
    if (matchedModel) return matchedModel;

    // Generic fallbacks if resolution isn't explicitly mapped yet
    if (isIPhone(userAgent)) return 'iPhone';
    if (isIPad(userAgent)) return 'iPad';
    if (isMac(userAgent)) return 'Macintosh';

    return 'Apple Device';
}

// @ts-check


/**
 * Determines if the device is a mobile phone (excludes desktop and tablets).
 *
 * @param {string} [userAgent=getSafeUserAgent()] The user agent string.
 * @returns {boolean} True if a mobile phone is detected, false otherwise.
 */
function isMobile(userAgent = getSafeUserAgent()) {
    // 1. High-priority check via modern User-Agent Client Hints
    const userAgentData = getSafeUserAgentData();
    if (userAgentData && typeof userAgentData.mobile !== 'undefined') {
        // Note: Client Hints set 'mobile' to true for both phones AND tablets.
        // To strictly get only PHONES, we ensure it's mobile but NOT a tablet.
        if (userAgentData.mobile) {
            return !isTablet(userAgent);
        }
        return false;
    }

    if (!userAgent) return false;

    // 2. Fallback via traditional User-Agent parsing for phones
    // We check for 'Mobi' but strictly exclude 'Tablet' patterns to avoid false positives
    if (/Mobi/i.test(userAgent) && !/Tablet|iPad/i.test(userAgent)) {
        return true;
    }

    // Specific legacy or custom mobile platform tokens
    return /iPhone|iPod|Windows Phone|IEMobile|BlackBerry|webOS|uZard|Opera Mini/i.test(userAgent);
}

/**
 * Determines if the device is a tablet.
 *
 * @param {string} [userAgent=getSafeUserAgent()] The user agent string.
 * @returns {boolean} True if a tablet is detected, false otherwise.
 */
function isTablet(userAgent = getSafeUserAgent()) {
    if (!userAgent) return false;

    // 1. Check traditional tablet user agents
    if (/Tablet|iPad/i.test(userAgent)) {
        return true;
    }

    // Android without 'Mobile' token is traditionally an Android Tablet
    if (/Android/i.test(userAgent) && !/Mobile/i.test(userAgent)) {
        return true;
    }

    // 2. Modern iPadOS check (iPadOS 13+ devices masking as Macintosh but having multi-touch screen)
    if (/Macintosh/i.test(userAgent) && safeNavigator) {
        if ('maxTouchPoints' in safeNavigator && safeNavigator.maxTouchPoints > 1) {
            return true;
        }
    }

    return false;
}

/**
 * Determines if the device is either a mobile phone or a tablet.
 *
 * @param {string} [userAgent=getSafeUserAgent()] The user agent string.
 * @returns {boolean} True if mobile or tablet, false otherwise.
 */
function isMobileOrTablet(userAgent = getSafeUserAgent()) {
    return isMobile(userAgent) || isTablet(userAgent);
}

// @ts-check


/**
 * Asynchronously determines the specific device model name (e.g., "iPhone 14 Pro" or "SM-S911B").
 * Compatible with both modern Client Hints and traditional User-Agent parsing.
 *
 * @param {string} [userAgent=getSafeUserAgent()] The user agent string to parse.
 * @returns {Promise<string>} A promise that resolves to the device model name, 'Desktop', or 'Unknown'.
 */
async function getDeviceModel(userAgent = getSafeUserAgent()) {
    // If the User-Agent is completely missing or empty, return 'Unknown' immediately
    // to distinguish it from parsed but unrecognized devices.
    if (!userAgent) {
        return 'Unknown';
    }

    // 1. Optimize execution path for Apple ecosystem (iPhone, iPad, Mac)
    if (/iphone|ipad|macintosh/i.test(userAgent)) {
        const appleDevice = await getAppleDeviceModel(userAgent);
        if (appleDevice) return appleDevice;
    }

    // 2. Optimize execution path for Android ecosystem
    if (/android/i.test(userAgent)) {
        const androidDevice = await getAndroidDeviceName(userAgent);
        if (androidDevice) return androidDevice;
    }

    // 3. Fallback logic for rare or legacy mobile operating systems
    if (isMobileOrTablet(userAgent)) {
        // Isolate specific tokens for platforms like Windows Phone, BlackBerry, etc.
        const genericMatch = userAgent.match(
            /\b(Windows Phone|BlackBerry|webOS|uZard|Opera Mini)\b/i
        );
        if (genericMatch) return genericMatch[1];

        return 'Generic Mobile/Tablet';
    }

    // 4. Default fallback: If it's a valid UA but no mobile/tablet flags were triggered,
    // it's a standard non-Apple desktop computer.
    return 'Desktop';
}

// @ts-check


/**
 * Helper to split full string (e.g., "Chrome 122.0.0.0") into name and version components.
 * * @param {string} fullString
 * @returns {{ name: string, version: string }}
 */
function parseNameAndVersion(fullString) {
    if (!fullString) {
        return { name: 'Unknown', version: 'Unknown' };
    }

    // Example: "Mobile Safari 17.4" => name = "Mobile Safari", version = "17.4"
    const match = fullString.match(/^([\w\s]+?)\s+([\d\.]+)$/);
    if (match) {
        return {
            name: match[1].trim(),
            version: match[2],
        };
    }

    // Fallback: first space separates name and version (works for simple cases)
    const firstSpaceIndex = fullString.indexOf(' ');
    if (firstSpaceIndex === -1) {
        return { name: fullString, version: 'Unknown' };
    }

    return {
        name: fullString.substring(0, firstSpaceIndex).trim(),
        version: fullString.substring(firstSpaceIndex + 1).trim(),
    };
}

/**
 * Asynchronously harvests comprehensive environment, browser, device, and locale metrics.
 * Fully safe for SSR (Server-Side Rendering) and performance-optimized.
 *
 * @param {string} [displayLocale] Optional BCP 47 language tag to translate country and language names (e.g., "ru", "en").
 * @param {string} [customUserAgent] Optional User-Agent string override (highly useful for SSR / backend execution).
 * @returns {Promise<import('./types.js').EnvironmentInfo>} A promise that resolves to the unified structured environment report.
 */
async function getEnvironment(displayLocale, customUserAgent) {
    // 1. Resolve the User-Agent context
    const ua = customUserAgent || getSafeUserAgent();

    // 2. Determine device type synchronously based on the User-Agent tokens
    /** @type {"desktop" | "tablet" | "mobile"} */
    let deviceType = 'desktop';
    if (isTablet(ua)) {
        deviceType = 'tablet';
    } else if (isMobile(ua)) {
        deviceType = 'mobile';
    }

    // 3. Get device model
    const deviceModel = await getDeviceModel(ua);

    // 4. Extract browser and OS full strings, then safely parse them
    const fullBrowser = await getBrowser(ua); // E.g., "Chrome 122.0.0.0"
    const fullOS = await getOS(ua); // E.g., "Windows 11"

    const browserInfo = parseNameAndVersion(fullBrowser);
    const osInfo = parseNameAndVersion(fullOS);

    const timeZone = getTimeZone();
    const languages = getLanguages(displayLocale);

    // 5. Assemble and return the final clean analytical structured report
    return {
        browser: {
            name: browserInfo.name,
            version: browserInfo.version,
        },
        os: {
            name: osInfo.name,
            version: osInfo.version,
        },
        device: {
            model: deviceModel,
            type: deviceType,
        },
        locale: {
            timeZone: timeZone,
            languages: languages,
        },
    };
}

// @ts-check


/**
 * Determines if the device is a sensor device with coarse pointing capabilities (touchscreen).
 * * @returns {boolean} True if the device has a touchscreen, false otherwise.
 */
function isSensorDevice() {
    let hasTouchScreen = false;

    // 1. Primary check via modern standard Navigator API
    if (safeNavigator && 'maxTouchPoints' in safeNavigator) {
        hasTouchScreen = safeNavigator.maxTouchPoints > 0;
    }
    // 2. Legacy Microsoft pointer check
    else if (safeNavigator && 'msMaxTouchPoints' in safeNavigator) {
        // @ts-ignore
        hasTouchScreen = safeNavigator.msMaxTouchPoints > 0;
    }
    // 3. Client-side fallbacks (Media Queries & User-Agent)
    else if (isClient) {
        // Safe check for matchMedia availability in window
        if (typeof window.matchMedia === 'function') {
            const mQ = window.matchMedia('(pointer:coarse)');
            if (mQ && mQ.matches) {
                hasTouchScreen = true;
            }
        }

        // Final fallback to User-Agent parsing if Media Queries are inconclusive
        if (!hasTouchScreen) {
            const userAgent = getSafeUserAgent();
            hasTouchScreen =
                /\b(BlackBerry|webOS|iPhone|IEMobile|Mobile)\b/i.test(userAgent) ||
                /\b(Android|Windows Phone|iPad|iPod)\b/i.test(userAgent);
        }
    }

    return hasTouchScreen;
}

/**
 * Determines if the device is a pointer device with fine pointing capabilities (mouse/stylus).
 * * @returns {boolean} True if a fine pointer is detected, false otherwise.
 */
function isPointerDevice() {
    if (!isClient || typeof window.matchMedia !== 'function') {
        return false;
    }

    try {
        return window.matchMedia('(pointer:fine)').matches;
    } catch (e) {
        console.error('Error executing pointer:fine media query:', e);
        return false;
    }
}

// @ts-check

/**
 * Gets the device type based on capabilities and User-Agent.
 *
 * @param {string} [userAgent=getSafeUserAgent()] The user agent string.
 * @returns {'tablet'|'mobile'|'desktop'} The detected device type.
 */
function getDeviceType(userAgent = getSafeUserAgent()) {
    // 1. Tablet check MUST go first.
    // Modern iPadOS and Android tablets are highly specific and harder to isolate.
    if (isTablet(userAgent)) {
        return 'tablet';
    }

    // 2. Mobile check goes second.
    // Since tablets are already filtered out, any positive mobile flag guarantees a smartphone.
    if (isMobile(userAgent)) {
        return 'mobile';
    }

    // 3. Fallback to desktop if no mobile/tablet markers were found.
    return 'desktop';
}

export { getAndroidDeviceName, getAppleDeviceModel, getBrowser, getBrowserLanguage, getCountryName, getDeviceModel, getDeviceType, getEnvironment, getLanguages, getOS, getTimeZone, isIPad, isIPhone, isMac, isMobile, isPointerDevice, isSensorDevice, isWebview, isWindows11 };
