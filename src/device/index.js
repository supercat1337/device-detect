// @ts-check
import { getSafeUserAgent } from '../helpers.js';
import { isMobile, isTablet } from './mobile.js';

export { isSensorDevice, isPointerDevice } from './sensor-pointer.js';
export { isMobile } from './mobile.js';
export { isIPhone, isIPad, isMac, getAppleDeviceModel } from './apple.js';
export { getAndroidDeviceName } from './android.js';
export { getDeviceModel } from './model.js';

/**
 * Gets the device type based on capabilities and User-Agent.
 *
 * @param {string} [userAgent=getSafeUserAgent()] The user agent string.
 * @returns {'tablet'|'mobile'|'desktop'} The detected device type.
 */
export function getDeviceType(userAgent = getSafeUserAgent()) {
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
