// @ts-check

import { getSafeUserAgent, getSafeUserAgentData, isClient, safeNavigator } from '../helpers.js';

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
export function isIPhone(userAgent = getSafeUserAgent()) {
    if (!userAgent) return false;
    return /iPhone|iPod/i.test(userAgent);
}

/**
 * Determines if the current device is an iPad.
 *
 * @param {string} [userAgent=getSafeUserAgent()] The user agent string.
 * @returns {boolean} True if an iPad is detected, false otherwise.
 */
export function isIPad(userAgent = getSafeUserAgent()) {
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
export function isMac(userAgent = getSafeUserAgent()) {
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
export async function getAppleDeviceModel(userAgent = getSafeUserAgent()) {
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
