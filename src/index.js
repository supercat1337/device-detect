// @ts-check

export { getOS, isWindows11 } from './os.js';
export { getCountryName } from './countries.js';
export { getBrowser, getBrowserLanguage, isWebview } from './browser.js';
export { getLanguages, getTimeZone } from './locale-info.js';
export { getEnvironment } from './environment.js';

export {
    isMobile,
    getAppleDeviceModel,
    getDeviceModel,
    getAndroidDeviceName,
    isIPad,
    isIPhone,
    isMac,
    isPointerDevice,
    isSensorDevice,
    getDeviceType,
} from './device/index.js';
