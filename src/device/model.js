// @ts-check

import { getSafeUserAgent } from '../helpers.js';
import { getAndroidDeviceName } from './android.js';
import { getAppleDeviceModel } from './apple.js';
import { isMobileOrTablet } from './mobile.js';

/**
 * Asynchronously determines the specific device model name (e.g., "iPhone 14 Pro" or "SM-S911B").
 * Compatible with both modern Client Hints and traditional User-Agent parsing.
 *
 * @param {string} [userAgent=getSafeUserAgent()] The user agent string to parse.
 * @returns {Promise<string>} A promise that resolves to the device model name, 'Desktop', or 'Unknown'.
 */
export async function getDeviceModel(userAgent = getSafeUserAgent()) {
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
