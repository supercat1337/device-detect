// @ts-check

import { getSafeUserAgent, getSafeUserAgentData, isClient, safeNavigator } from '../helpers.js';

/**
 * Map of logical resolutions (shortSide x longSide) to device name(s).
 * For Apple devices, these are standard non-zoomed resolutions.
 * Some resolutions match multiple models – we list them comma-separated.
 */
const APPLE_LOGICAL_MAPPING = new Map([
    // iPhones
    ['320x480', 'iPhone 4/4s, 3GS'],
    ['320x568', 'iPhone 5, 5c, 5s, SE (1st gen)'],
    ['375x667', 'iPhone 6, 6s, 7, 8, SE (2nd/3rd gen)'],
    ['414x736', 'iPhone 6 Plus, 6s Plus, 7 Plus, 8 Plus'],
    ['375x812', 'iPhone X, XS, 11 Pro, 12 mini, 13 mini'],
    ['390x844', 'iPhone 12, 12 Pro, 13, 13 Pro, 14'],
    ['393x852', 'iPhone 14 Pro, 15, 15 Pro, 16'],
    ['428x926', 'iPhone 12 Pro Max, 13 Pro Max, 14 Plus'],
    ['430x932', 'iPhone 14 Pro Max, 15 Plus, 15 Pro Max, 16 Plus'],
    ['402x874', 'iPhone 16 Pro, iPhone 17'], // iPhone 17 added here
    ['440x956', 'iPhone 16 Pro Max'],
    // iPads
    ['744x1133', 'iPad Mini (6th gen)'],
    ['768x1024', 'iPad Mini (1-5), iPad (1-6), iPad Air 1/2, iPad Pro 9.7"'],
    ['810x1080', 'iPad (7th-9th gen)'],
    ['820x1180', 'iPad Air (4th/5th gen), iPad (10th gen)'],
    ['834x1112', 'iPad Air (3rd gen), iPad Pro 10.5"'],
    ['834x1194', 'iPad Pro 11" (3rd-5th gen)'],
    ['1024x1366', 'iPad Pro 12.9"'],
]);

/**
 * Map of known zoomed logical resolutions to the base device description.
 * When Display Zoom is enabled, the logical resolution is reduced.
 * This map helps identify the original device family.
 */
const ZOOMED_MAPPING = new Map([
    ['320x568', 'iPhone 6/7/8 (Zoomed) or iPhone 5/SE'], // base 375x667 or 320x568
    ['375x812', 'iPhone X/XS/11 Pro (Zoomed) or 12/13/14 mini'], // base 390x844 or 375x812
    ['393x852', 'iPhone 14 Pro (Zoomed)'], // base 402x874
    // Add more as needed
]);

/**
 * Map of Apple internal model codes (from Client Hints) to marketing names.
 * Useful when getHighEntropyValues returns 'model' like "iPhone15,2".
 */
const APPLE_MODEL_CODE_MAP = new Map([
    ['iPhone15,2', 'iPhone 15 Pro Max'],
    ['iPhone15,3', 'iPhone 15 Pro'],
    ['iPhone15,4', 'iPhone 15 Plus'],
    ['iPhone15,5', 'iPhone 15'],
    ['iPhone16,1', 'iPhone 16 Pro'],
    ['iPhone16,2', 'iPhone 16 Pro Max'],
    ['iPhone16,3', 'iPhone 16'],
    ['iPhone16,4', 'iPhone 16 Plus'],
    ['iPhone17,1', 'iPhone 17'],
    ['iPhone17,2', 'iPhone 17 Pro'],
    // Future codes can be added here (e.g., iPhone17,x)
]);

/**
 * Extracts the major iOS version from User-Agent.
 * @param {string} userAgent
 * @returns {number|null}
 */
function getIOSMajorVersion(userAgent) {
    const match = userAgent.match(/OS (\d+)[_.]/);
    return match ? parseInt(match[1], 10) : null;
}

/**
 * Determines if the current device is an iPhone or iPod.
 * Handles both standard User-Agent and "Request Desktop Website" mode (where UA is Macintosh).
 *
 * @param {string} [userAgent=getSafeUserAgent()] The user agent string.
 * @returns {boolean} True if an iPhone/iPod is detected, false otherwise.
 */
export function isIPhone(userAgent = getSafeUserAgent()) {
    if (!userAgent) return false;

    // 1. Standard iPhone/iPod User-Agent detection
    if (/\b(iPhone|iPod)\b/i.test(userAgent)) {
        return true;
    }

    // 2. Fallback for iPhone in "Request Desktop Website" mode (UA = Macintosh)
    if (isClient && safeNavigator) {
        const isMacEnvironment =
            safeNavigator.platform === 'MacIntel' || /\bMacintosh\b/i.test(userAgent);
        const hasTouch = safeNavigator.maxTouchPoints > 0;

        if (isMacEnvironment && hasTouch && window.screen) {
            const minScreenDimension = Math.min(window.screen.width, window.screen.height);

            // Threshold 550 cleanly separates iPhones (max width ~440) from iPads (min width ~744)
            // This prevents iPad in desktop mode from being misidentified as iPhone.
            if (minScreenDimension < 550) {
                return true;
            }
        }
    }

    return false;
}

/**
 * Determines if the current device is an iPad.
 * @param {string} [userAgent=getSafeUserAgent()]
 * @returns {boolean}
 */
export function isIPad(userAgent = getSafeUserAgent()) {
    if (!userAgent) return false;
    if (isIPhone(userAgent)) return false;

    const uaLower = userAgent.toLowerCase();
    if (uaLower.indexOf('ipad') > -1) return true;

    // Modern iPadOS (13+) masquerades as Macintosh
    if (uaLower.indexOf('macintosh') > -1 && safeNavigator) {
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
 * Asynchronously gets the marketing name of the Apple device.
 * Uses Client Hints (model code) first, then falls back to resolution mapping.
 * @param {string} [userAgent=getSafeUserAgent()]
 * @returns {Promise<string>}
 */
export async function getAppleDeviceModel(userAgent = getSafeUserAgent()) {
    if (!userAgent) return '';
    if (!/iphone|ipad|macintosh/i.test(userAgent)) return '';

    // 1. Modern Client Hints (most reliable)
    const userAgentData = getSafeUserAgentData();
    if (userAgentData && typeof userAgentData.getHighEntropyValues === 'function') {
        try {
            const hints = await userAgentData.getHighEntropyValues(['model']);
            if (hints && hints.model) {
                const modelCode = hints.model;
                let model = APPLE_MODEL_CODE_MAP.get(modelCode);
                if (model) {
                    return model;
                }
                // Unknown model code – return as is or attempt fallback
                return modelCode;
            }
        } catch (e) {
            // Fail silently, fallback to resolution mapping
        }
    }

    // 2. Fallback to resolution-based detection (handles zoom and legacy devices)
    return fallbackResolutionMapping(userAgent);
}

/**
 * Fallback resolution-based model detection (used when Client Hints unavailable).
 * Handles zoomed states and unknown future models gracefully.
 * @param {string} userAgent
 * @returns {string}
 */
function fallbackResolutionMapping(userAgent) {
    if (!isClient || typeof window.screen === 'undefined') {
        return isMac(userAgent) ? 'Macintosh' : 'Apple Device';
    }

    let { width, height } = window.screen;
    if (!width || !height) return '';

    const shortSide = Math.min(width, height);
    const longSide = Math.max(width, height);
    const resolutionKey = `${shortSide}x${longSide}`;

    // 1. Check standard (non-zoomed) mapping
    if (APPLE_LOGICAL_MAPPING.has(resolutionKey)) {
        let matched = /** @type {string} */ (APPLE_LOGICAL_MAPPING.get(resolutionKey));
        // For ambiguous resolution shared by multiple models, return a generic descriptor
        if (matched === 'iPhone 16 Pro, iPhone 17') {
            return 'iPhone 16 Pro or newer';
        }
        return matched;
    }

    // 2. Check zoomed mapping
    if (ZOOMED_MAPPING.has(resolutionKey)) {
        return /** @type {string} */ (ZOOMED_MAPPING.get(resolutionKey));
    }

    // 3. Generic fallbacks
    if (isIPhone(userAgent)) return 'iPhone';
    if (isIPad(userAgent)) return 'iPad';
    if (isMac(userAgent)) return 'Macintosh';
    return 'Apple Device';
}
