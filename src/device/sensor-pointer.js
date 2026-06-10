// @ts-check

import { getSafeUserAgent, isClient, safeNavigator } from '../helpers.js';

/**
 * Determines if the device is a sensor device with coarse pointing capabilities (touchscreen).
 * * @returns {boolean} True if the device has a touchscreen, false otherwise.
 */
export function isSensorDevice() {
    let hasTouchScreen = false;

    // 1. Primary check via modern standard Navigator API
    if (safeNavigator && 'maxTouchPoints' in safeNavigator) {
        hasTouchScreen = safeNavigator.maxTouchPoints > 0;
    }
    // 2. Legacy Microsoft pointer check
    else if (safeNavigator && 'msMaxTouchPoints' in safeNavigator) {
        // @ts-ignore
        hasTouchScreen = safeNavigator.msMaxTouchPoints > 0;
    }
    // 3. Client-side fallbacks (Media Queries & User-Agent)
    else if (isClient) {
        // Safe check for matchMedia availability in window
        if (typeof window.matchMedia === 'function') {
            const mQ = window.matchMedia('(pointer:coarse)');
            if (mQ && mQ.matches) {
                hasTouchScreen = true;
            }
        }

        // Final fallback to User-Agent parsing if Media Queries are inconclusive
        if (!hasTouchScreen) {
            const userAgent = getSafeUserAgent();
            hasTouchScreen =
                /\b(BlackBerry|webOS|iPhone|IEMobile|Mobile)\b/i.test(userAgent) ||
                /\b(Android|Windows Phone|iPad|iPod)\b/i.test(userAgent);
        }
    }

    return hasTouchScreen;
}

/**
 * Determines if the device is a pointer device with fine pointing capabilities (mouse/stylus).
 * * @returns {boolean} True if a fine pointer is detected, false otherwise.
 */
export function isPointerDevice() {
    if (!isClient || typeof window.matchMedia !== 'function') {
        return false;
    }

    try {
        return window.matchMedia('(pointer:fine)').matches;
    } catch (e) {
        console.error('Error executing pointer:fine media query:', e);
        return false;
    }
}
