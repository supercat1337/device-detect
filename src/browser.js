// @ts-check

import { getSafeUserAgent, isClient, safeNavigator } from './helpers.js';
import { getOS } from './os.js';

/**
 * Asynchronously gets the browser name and version.
 *
 * @param {string} [userAgent=getSafeUserAgent()] The user agent string.
 * @returns {Promise<string>} A promise that resolves to the browser name and version, or "Unknown".
 */
export async function getBrowser(userAgent = getSafeUserAgent()) {
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
export async function isWebview(userAgent = getSafeUserAgent().toLowerCase()) {
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
export function getBrowserLanguage(localeName = isClient ? window.navigator.language : 'en') {
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
