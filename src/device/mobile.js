// @ts-check

import { getSafeUserAgent, getSafeUserAgentData, safeNavigator } from '../helpers.js';

/**
 * Determines if the device is a mobile phone (excludes desktop and tablets).
 *
 * @param {string} [userAgent=getSafeUserAgent()] The user agent string.
 * @returns {boolean} True if a mobile phone is detected, false otherwise.
 */
export function isMobile(userAgent = getSafeUserAgent()) {
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
export function isTablet(userAgent = getSafeUserAgent()) {
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
export function isMobileOrTablet(userAgent = getSafeUserAgent()) {
    return isMobile(userAgent) || isTablet(userAgent);
}
