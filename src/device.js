// @ts-check

/**
 * Determines if the device is a sensor device with coarse pointing capabilities.
 *
 * @returns {boolean} True if the device is a sensor device with coarse pointing capabilities, false otherwise.
 */
export function isSensorDevice() {
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
export function isPointerDevice() {
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
export function isMobile() {
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
export async function getDeviceModelA() {
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
    
    ["320x568", "IPhone 5, SE 1st Gen,5C, 5S"],
    ["375x667", "IPhone SE 2nd Gen, 6, 6S, 7, 8"],
    ["375x812", "IPhone X, XS, 11 Pro, 12 Mini, 13 Mini"],
    ["390x844", "IPhone 13, 13 Pro, 12, 12 Pro"],
    ["414x736", "IPhone 8+"],
    ["414x896", "IPhone 11, XR, XS Max, 11 Pro Max"],
    ["428x926", "IPhone 13 Pro Max, 12 Pro Max"],
    ["476x847", "IPhone 7+, 6+, 6S+"],
    */

    ["414x896", "iPhone 11, 11 Pro Max, XR, XS Max"],
    ["375x812", "iPhone 11 Pro, X"],
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
export function getAndroidDeviceNameFromUserAgent(
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
export function getIosDeviceName() {
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
export function isIPhone() {
    let ua = window.navigator.userAgent.toLowerCase();
    return ua.indexOf("iphone") > -1;
}

/**
 * Determines if the current device is an iPad.
 *
 * @returns {boolean} True if the device is identified as an iPad, false otherwise.
 */
export function isIPad() {
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
export function getDeviceType() {
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
export async function getDeviceModel() {
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
