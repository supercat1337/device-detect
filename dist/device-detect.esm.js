import { detectIncognito } from 'detectincognitojs/dist/detectIncognito.esm.js';

// @ts-check

/**
 * Determines if the device is a sensor device with coarse pointing capabilities.
 *
 * @returns {boolean} True if the device is a sensor device with coarse pointing capabilities, false otherwise.
 */
function isSensorDevice() {
    let hasTouchScreen = false;
    if ("maxTouchPoints" in navigator) {
        hasTouchScreen = navigator.maxTouchPoints > 0;
    } else if ("msMaxTouchPoints" in navigator) {
        // @ts-ignore
        hasTouchScreen = navigator.msMaxTouchPoints > 0;
    } else {
        const mQ = matchMedia?.("(pointer:coarse)");
        if (mQ?.media === "(pointer:coarse)") {
            hasTouchScreen = !!mQ.matches;
        } else if ("orientation" in window) {
            hasTouchScreen = true; // deprecated, but good fallback
        } else {
            // Only as a last resort, fall back to user agent sniffing
            // @ts-ignore
            const userAgent = navigator.userAgent;
            hasTouchScreen =
                /\b(BlackBerry|webOS|iPhone|IEMobile|Mobile)\b/i.test(
                    userAgent
                ) || /\b(Android|Windows Phone|iPad|iPod)\b/i.test(userAgent);
        }
    }
    return hasTouchScreen;
}

/**
 * Determines if the device is a pointer device with fine pointing capabilities.
 *
 * @returns {boolean} True if the device is a pointer device with fine pointing capabilities, false otherwise.
 */
function isPointerDevice() {
    try {
        return matchMedia("(pointer:fine)").matches;
    } catch (e) {
        console.error(e);
        return false;
    }
}

/**
 * Checks if the browser is running on a mobile device.
 *
 * @returns {boolean} True if the browser is running on a mobile device, false otherwise.
 */
function isMobile() {
    // @ts-ignore
    const userAgentData = window.navigator.userAgentData;

    if (userAgentData && typeof userAgentData.mobile != "undefined") {
        return userAgentData.mobile;
    }

    const userAgent = navigator.userAgent.toLowerCase();

    if (/mobi|tablet/.test(userAgent)) {
        return true;
    }

    if (/uZard|Opera Mini/i.test(userAgent)) {
        return true;
    }

    return false;
}

/**
 * Asynchronously gets the device model.
 *
 * @returns {Promise<string|null>} A promise that resolves to the device model if it could be determined, null otherwise.
 */
async function getDeviceModelA() {
    try {
        // @ts-ignore
        const userAgentData = window.navigator.userAgentData;
        if (!userAgentData) return null;

        const androidDeviceInfo = await userAgentData.getHighEntropyValues([
            "model",
        ]);
        return androidDeviceInfo.model || null;
    } catch (error) {
        console.error("Error getting device model:", error);
        return null;
    }
}

// device maps
const iosDeviceMapping = new Map([
    ["320x480", "IPhone 4S, 4, 3GS, 3G, 1st gen"],
    // https://yesviz.com/iphones.php
    /*
    
    ["375x812", "IPhone X, XS, 11 Pro, 12 Mini, 13 Mini"],
    ["390x844", "IPhone 13, 13 Pro, 12, 12 Pro"],
    ["414x736", "IPhone 8+"],
    ["414x896", "IPhone 11, XR, XS Max, 11 Pro Max"],
    ["428x926", "IPhone 13 Pro Max, 12 Pro Max"],
    ["476x847", "IPhone 7+, 6+, 6S+"],
    */

    ["414x896", "iPhone 11, 11 Pro Max, XR, XS Max"],
    ["375x812", "IPhone X, XS, 11 Pro, 12 Mini, 13 Mini"],
    ["390x844", "iPhone 12, 12 Pro, 13, 13 Pro, 14"],
    ["360x780", "iPhone 12 mini, 13 mini"],
    ["428x926", "iPhone 12 Pro Max, 13 Pro Max, 14 Plus"],
    ["393x852", "iPhone 14 Pro, 15, 15 Pro, 16"],
    ["430x932", "iPhone 14 Pro Max, 15 Plus, 15 Pro Max, 16 Plus"],
    ["320x568", "iPhone 5, 5c, 5s, SE"],
    ["375x667", "iPhone 6, 6s, 7, 8, SE (2020), SE (2022)"],
    ["414x736", "iPhone 6s Plus, 7 Plus, 8 Plus"],
    // https://yesviz.com/devices.php
    ["402x874", "iPhone 16 Pro"],
    ["440x956", "iPhone 16 Pro Max"],

    /*
    ["744x1133", "IPad Mini 6th Gen"],
    [
        "768x1024",
        "IPad Mini (5th Gen), IPad (1-6th Gen), iPad Pro (1st Gen 9.7), Ipad Mini (1-4), IPad Air(1-2)  ",
    ],
    ["810x1080", "IPad 7-9th Gen"],
    ["820x1180", "iPad Air (4th gen)"],
    ["834x1194", "iPad Pro (3-5th Gen 11)"],
    ["834x1112", "iPad Air (3rd gen), iPad Pro (2nd gen 10.5)"],
    ["1024x1366", "iPad Pro (1-5th Gen 12.9)"],
    */
    [
        "820x1180",
        "iPad iPad Air (5th gen), iPad Air (4th gen), iPad (10th gen)",
    ],
    ["834x1112", "iPad iPad Air (3rd gen)"],
    ["744x1133", "iPad iPad Mini (6th gen)"],
    [
        "768x1024",
        "iPad iPad Mini (5th gen), iPad Mini 4, iPad (6th gen), iPad (5th gen), iPad III & IV gen, iPad Air 1 & 2, iPad Mini 2 & 3, iPad Mini",
    ],
    ["810x1080", "iPad iPad (9th gen), iPad (8th gen), iPad (7th gen)"],
    ["1024x1366", "iPad iPad Pro"],
]);

/**
 * Gets the device name from the user agent string.
 * @returns {string} The device name, or "" if it could not be determined.
 */
function getAndroidDeviceNameFromUserAgent(
    userAgent = window.navigator.userAgent
) {
    if (userAgent.indexOf("Android") == -1) return "";

    const androidUserAgentString = userAgent.slice(
        window.navigator.userAgent.indexOf("Android")
    );
    const androidDeviceName = androidUserAgentString.slice(
        androidUserAgentString.indexOf("; ") + 1,
        androidUserAgentString.indexOf(")")
    );
    if (androidDeviceName) {
        return androidDeviceName.trim().split(" ")[0];
    }

    return "";
}

/**
 * Gets the device name from the screen resolution.
 * @returns {string} The device name, or "" if it could not be determined.
 */
function getIosDeviceName() {
    let screen = window.screen;
    const screenResolution = `${screen.width}x${screen.height}`;
    const device = iosDeviceMapping.get(screenResolution);
    if (device) {
        return device;
    }
    return "";
}

/**
 * Determines if the current device is an iPhone.
 *
 * @returns {boolean} True if the device is identified as an iPhone, false otherwise.
 */
function isIPhone() {
    let ua = window.navigator.userAgent.toLowerCase();
    return ua.indexOf("iphone") > -1;
}

/**
 * Determines if the current device is an iPad.
 *
 * @returns {boolean} True if the device is identified as an iPad, false otherwise.
 */
function isIPad() {
    if (isIPhone()) {
        return false;
    }
    let ua = window.navigator.userAgent.toLowerCase();
    /** @type {boolean} */
    let a = ua.indexOf("ipad") > -1;

    if (a) {
        return true;
    }

    /** @type {boolean} */
    let b =
        ua.indexOf("macintosh") > -1 &&
        !!navigator.maxTouchPoints &&
        navigator.maxTouchPoints > 2 &&
        navigator.platform !== "iPhone";

    if (b) {
        return true;
    }

    return false;
}

/**
 * Gets the device type (Tablet, Mobile, Desktop) of the current device.
 *
 * @returns {string} The device type.
 */
function getDeviceType() {
    if (isIPad()) {
        return "Tablet";
    }

    if (/tablet|ipad/i.test(window.navigator.userAgent)) return "Tablet";

    if (isIPhone()) {
        return "Mobile";
    }

    if (isMobile()) {
        return "Mobile";
    }

    return "Desktop";
}

/**
 * Asynchronously determines the device model name.
 *
 * This function attempts to identify the device model by checking for iPad or iPhone first,
 * utilizing the iOS device name mappings. If the device is not an iPad or iPhone, it tries
 * to retrieve the device model using `getDeviceModelA`. If the device is not identified as a
 * mobile device, it returns "-". For Android devices, it extracts the device name from the
 * user agent string. If none of the checks are successful, it returns "-".
 *
 * @returns {Promise<string>} A promise that resolves to the device model name or "-" if it could
 * not be determined.
 */
async function getDeviceModel() {
    let device = "";

    if (isIPad()) {
        device = getIosDeviceName();
        if (device == "") {
            return "iPad";
        } else {
            return device;
        }
    }

    if (isIPhone()) {
        device = getIosDeviceName();
        if (device == "") {
            return "iPhone";
        } else {
            return device;
        }
    }

    let deviceName = await getDeviceModelA();
    if (deviceName) {
        return deviceName;
    }

    // check if mobile device
    const isMobileDevice = isMobile();

    if (!isMobileDevice) {
        return "-";
    }

    if (window.navigator.userAgent.includes("Android")) {
        device = getAndroidDeviceNameFromUserAgent();

        if (device) {
            return device;
        }
    }

    return "-";
}

// @ts-check


/**
 * Gets the operating system and version.
 *
 * @returns {string}
 */
function getOS() {
    var os = "Unknown";
    var userAgent = window.navigator.userAgent;

    /** @type {Array<{os: string, re: RegExp}>} */
    var operatingSystemRules = [
        { os: "iOS", re: /iP(hone|od|ad)/ },
        { os: "Android OS", re: /Android/ },
        { os: "BlackBerry OS", re: /BlackBerry|BB10/ },
        { os: "Windows Mobile", re: /IEMobile/ },
        { os: "Amazon OS", re: /Kindle/ },
        { os: "Windows 3.11", re: /Win16/ },
        { os: "Windows 95", re: /(Windows 95)|(Win95)|(Windows_95)/ },
        { os: "Windows 98", re: /(Windows 98)|(Win98)/ },
        { os: "Windows 2000", re: /(Windows NT 5.0)|(Windows 2000)/ },
        { os: "Windows XP", re: /(Windows NT 5.1)|(Windows XP)/ },
        { os: "Windows Server 2003", re: /(Windows NT 5.2)/ },
        { os: "Windows Vista", re: /(Windows NT 6.0)/ },
        { os: "Windows 7", re: /(Windows NT 6.1)/ },
        { os: "Windows 8", re: /(Windows NT 6.2)/ },
        { os: "Windows 8.1", re: /(Windows NT 6.3)/ },
        { os: "Windows 10", re: /(Windows NT 10.0)/ },
        { os: "Windows ME", re: /Windows ME/ },
        {
            os: "Windows CE",
            re: /Windows CE|WinCE|Microsoft Pocket Internet Explorer/,
        },
        { os: "Open BSD", re: /OpenBSD/ },
        { os: "Sun OS", re: /SunOS/ },
        { os: "Chrome OS", re: /CrOS/ },
        { os: "Linux", re: /(Linux|X11)\s*([^\s;]+)*/ },
        { os: "Mac OS", re: /(Mac_PowerPC)|(Macintosh)/ },
        { os: "QNX", re: /QNX/ },
        { os: "BeOS", re: /BeOS/ },
        { os: "OS/2", re: /OS\/2/ },
        { os: "Aurora", re: /Aurora/ },
    ];

    for (let i = 0, count = operatingSystemRules.length; i < count; i++) {
        const match = operatingSystemRules[i].re.exec(userAgent);
        if (match) {
            os = operatingSystemRules[i].os;
            break;
        }
    }

    if (os == "Aurora") {
        let matchVersion = userAgent.match(/Aurora\/([^\s;]+)/i);
        if (matchVersion) {
            os = os + " " + matchVersion[1];
        }

        return os;
    }

    if (os == "iOS") {
        let matchVersion = userAgent.match(/OS (\d+)_(\d+)_(\d+)/);
        if (matchVersion) {
            os +=
                " " +
                matchVersion[1] +
                "." +
                matchVersion[2] +
                "." +
                matchVersion[3];
        }

        return os;
    }

    if (os == "Mac OS") {
        let matchVersion = userAgent.match(/Mac OS X\s([0-9\.]*)/i);
        if (matchVersion) {
            if (isIPad()) {
                os = "iPad OS";
                let matchSafariVersion = userAgent.match(/Version\/([^\s;]+)/);
                if (matchSafariVersion) {
                    os = os + " " + matchSafariVersion[1];
                }

                return os;
            }

            os = os + " " + matchVersion[1];
        }

        return os;
    }

    if (os == "Android OS") {
        let matchVersion = userAgent.match(/android\s([0-9\.]*)/i);
        if (matchVersion) {
            os = os + " " + matchVersion[1];
        }

        return os;
    }

    return os;
}

/**
 * Asynchronously checks if the operating system is Windows 11.
 *
 * @returns {Promise<boolean>} A promise that resolves to true if the operating system is Windows 11, false otherwise.
 */
async function isWindows11() {
    // @ts-ignore
    const userAgentData = window.navigator.userAgentData;
    if (!userAgentData) return false;

    let data = await userAgentData.getHighEntropyValues(["platformVersion"]);
    if (userAgentData.platform !== "Windows") {
        return false;
    }

    if (typeof data.platformVersion != "string") return false;

    const majorPlatformVersion = parseInt(data.platformVersion.split(".")[0]);
    if (majorPlatformVersion >= 13) {
        return true;
    } else {
        return false;
    }
}

// @ts-check

//import { detectIncognito } from "detectincognitojs";

/**
 * Gets the browser name and version.
 *
 * @param {string} [userAgent=window.navigator.userAgent] The user agent string.
 * @returns {string} The browser name and version, or "Unknown" if it could not be determined.
 */
function getBrowser(userAgent = window.navigator.userAgent) {
    // see: https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Browser_detection_using_the_user_agent

    let matchYandex = userAgent.match(/YaBrowser\/([^\s;]+)/i);
    if (matchYandex) {
        return "Yandex " + matchYandex[1];
    }

    let matchMessenger = userAgent.match(/Messenger\/([^\s;]+)/);
    if (matchMessenger) {
        return "Messenger " + matchMessenger[1];
    }

    let matchFacebook = userAgent.match(/FBAN|FBAV/i);
    if (matchFacebook) {
        let appName = "Facebook";
        let appNameMatch = userAgent.match(/FBAN\/([^\s;]+)/i);
        if (appNameMatch) {
            appName = "Facebook " + appNameMatch[1];
        }

        let appVersion = "";
        let appVersionMatch = userAgent.match(/FBAV\/([^\s;]+)/i);
        if (appVersionMatch) {
            appVersion = appVersionMatch[1];
        }

        return (appName + " " + appVersion).trim();
    }

    let matchInstagram = userAgent.match(/Instagram ([^\s;]+)/i);
    if (matchInstagram) {
        return "Instagram " + matchInstagram[1];
    }

    // @ts-ignore
    if (typeof window.TelegramWebview !== "undefined") {
        return "Telegram InApp Browser";
    }

    if (/(micromessenger|weixin)/i.test(userAgent)) {
        return "WeChat";
    }

    let matchSeaMonkey = userAgent.match(/SeaMonkey\/([^\s;]+)/);
    if (matchSeaMonkey) {
        return "SeaMonkey " + matchSeaMonkey[1];
    }

    let matchFirefox = userAgent.match(/Firefox\/([^\s;]+)/);
    if (matchFirefox) {
        if (!userAgent.match(/SeaMonkey\/([^\s;]+)/)) {
            return "Firefox " + matchFirefox[1];
        }
    }

    let matchChrome = userAgent.match(/Chrome\/([^\s;]+)/);
    if (matchChrome) {
        if (!userAgent.match(/(Chromium|Edg[^\/]*)\//))
            return "Chrome " + matchChrome[1];
    }

    let matchChromium = userAgent.match(/Chromium\/([^\s;]+)/);
    if (matchChromium) {
        return "Chromium " + matchChromium[1];
    }

    let matchEdge = userAgent.match(/Edg[^\/]*\/([^\s;]+)/);
    if (matchEdge) {
        return "Edge " + matchEdge[1];
    }

    let matchSafari = userAgent.match(/Safari\/([^\s;]+)/);
    if (matchSafari) {
        if (
            !(
                userAgent.match(/Chrome\/([^\s;]+)/) ||
                userAgent.match(/Chromium\/([^\s;]+)/)
            )
        ) {
            let versionMatch = userAgent.match(/Version\/([^\s;]+)/);
            let version = versionMatch ? versionMatch[1] : null;
            if (version) {
                return "Safari " + version;
            }
        }
    }

    // Opera 15+
    let matchNewOpera = userAgent.match(/OPR\/([^\s;]+)/);
    if (matchNewOpera) {
        return "Opera " + matchNewOpera[1];
    }

    // Opera 12-14
    let matchOldOpera = userAgent.match(/Opera\/([^\s;]+)/);
    if (matchOldOpera) {
        return "Opera " + matchOldOpera[1];
    }

    // MSIE detection
    if (/trident/i.test(userAgent)) {
        let versionMatch = /\brv[ :]+(\d+)/g.exec(userAgent);
        if (versionMatch) {
            return "IE " + versionMatch[1];
        }

        let versionMatch2 = /\bMSIE\s([\d\.]+)/g.exec(userAgent);
        if (versionMatch2) {
            return "IE " + versionMatch2[1];
        }

        return "IE";
    }

    return "Unknown";
}

/**
 * Checks if the browser is running in a webview.
 *
 * @returns {boolean} True if the browser is running in a webview, false otherwise.
 */
function isWebview() {
    if (typeof window === undefined) {
        return false;
    }

    let navigator = window.navigator;

    // @ts-ignore
    const standalone = navigator.standalone;
    const userAgent = navigator.userAgent.toLowerCase();
    const safari = /safari/.test(userAgent);
    const ios = /iphone|ipod|ipad|macintosh/.test(userAgent);
    const ios_ipad_webview = ios && !safari;

    return ios
        ? (!standalone && !safari) || ios_ipad_webview
        : userAgent.includes("wv");
}

/**
 * Asynchronously checks if the browser is in incognito or private mode.
 *
 * @returns {Promise<boolean>} A promise that resolves to true if the browser is in incognito mode, false otherwise.
 */
async function isIncognitoMode() {
    try {
        let result = await detectIncognito();
        return result.isPrivate;
    } catch (error) {
        console.error("Error checking incognito mode:", error);
        return false;
    }
}

// @ts-check

/**
 * Gets the user's current time zone.
 *
 * @returns {string} The user's current time zone. If the time zone could not be found, returns "Unknown".
 */
function getTimeZone() {
    try {
        return Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch (e) {
        return "-";
    }
}

/**
 * Gets the languages supported by the browser.
 *
 * @returns {string[]} An object containing the default language and an array of supported languages.
 */
function getLanguages() {
    return window.navigator.languages.map((lang) => lang.toLowerCase()) || [];
}

export { getAndroidDeviceNameFromUserAgent, getBrowser, getDeviceModel, getDeviceType, getIosDeviceName, getLanguages, getOS, getTimeZone, isIPad, isIPhone, isIncognitoMode, isMobile, isPointerDevice, isSensorDevice, isWebview, isWindows11 };
