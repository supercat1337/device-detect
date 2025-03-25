// @ts-check

export { getOS, isWindows11 } from "./os.js";
export { getCountryByCode } from "./countries.js";
export { getLanguageByCode } from "./languages.js";

export {
    isMobile,
    getAndroidDeviceNameFromUserAgent,
    getDeviceModel,
    getIosDeviceName,
    isIPad,
    isIPhone,
    isMac,
    isPointerDevice,
    isSensorDevice,
    getDeviceType,
} from "./device.js";

export {
    getBrowser,
    getBrowserLanguage,
    isIncognitoMode,
    isWebview,
} from "./browser.js";

export { getLanguages, getTimeZone } from "./locale_info.js";
