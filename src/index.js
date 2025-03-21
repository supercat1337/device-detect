// @ts-check

export { getOS, isWindows11 } from "./os.js";

export {
    isMobile,
    getAndroidDeviceNameFromUserAgent,
    getDeviceModel,
    getIosDeviceName,
    isIPad,
    isIPhone,
    isPointerDevice,
    isSensorDevice,
    getDeviceType,
} from "./device.js";

export { getBrowser, isIncognitoMode, isWebview } from "./browser.js";

export { getLanguages, getTimeZone } from "./locale_info.js";
