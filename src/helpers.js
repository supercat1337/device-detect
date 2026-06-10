// @ts-check

/**
 * Check if the code is executing in a client (browser) environment.
 * @type {boolean}
 */
export const isClient = typeof window !== 'undefined';

/**
 * Safe access to the navigator object.
 * @type {Navigator | null}
 */
export const safeNavigator = isClient ? window.navigator : null;

/**
 * Safely retrieves the User Agent string.
 * @returns {string} The user agent string or an empty string if not in browser.
 */
export function getSafeUserAgent() {
    return safeNavigator ? safeNavigator.userAgent : '';
}

/**
 * Safely retrieves the NavigatorUAData object (User-Agent Client Hints).
 * @returns {import("./types.js").NavigatorUAData | null} The userAgentData object or null if not supported/available.
 */
export function getSafeUserAgentData() {
    if (!safeNavigator) return null;

    // @ts-ignore - userAgentData is not standard in all browser typings yet
    return safeNavigator.userAgentData || null;
}

/**
 * Safely requests high-entropy values from User-Agent Client Hints.
 * @param {string[]} hints - Array of hint names to request (e.g., ['model', 'platformVersion']).
 * @returns {Promise<import("./types.js").UADataValues | null>} A promise that resolves to the values or null if unsupported.
 */
export async function getHighEntropyValues(hints) {
    const uaData = getSafeUserAgentData();
    if (!uaData || typeof uaData.getHighEntropyValues !== 'function') {
        return null;
    }

    try {
        return await uaData.getHighEntropyValues(hints);
    } catch (error) {
        // Fallback if the promise is rejected or permission is denied
        return null;
    }
}
