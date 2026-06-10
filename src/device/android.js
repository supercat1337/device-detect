// @ts-check

import { getSafeUserAgent, getSafeUserAgentData } from '../helpers.js';

/**
 * Asynchronously gets the Android device marketing name or model.
 *
 * @param {string} [userAgent=getSafeUserAgent()] The user agent string.
 * @returns {Promise<string>} A promise that resolves to the device brand/model, or an empty string.
 */
export async function getAndroidDeviceName(userAgent = getSafeUserAgent()) {
    // 1. Modern High-Entropy Client Hints check (The most accurate way for modern Chromium)
    const userAgentData = getSafeUserAgentData();
    if (userAgentData && typeof userAgentData.getHighEntropyValues === 'function') {
        try {
            // 'model' gives the exact device model (e.g., "SM-S911B" or "Pixel 7")
            const data = await userAgentData.getHighEntropyValues(['model']);
            if (data && data.model) {
                return data.model.trim();
            }
        } catch (e) {
            // Fail silently and fall back to User-Agent parsing
        }
    }

    if (!userAgent || !/Android/i.test(userAgent)) {
        return '';
    }

    // 2. Fallback: Precise User-Agent token isolation
    // In Android UA strings, the device model is always located right before the "Build/" token
    // or directly before the closing parenthesis of the Linux platform component.
    // Example: "Android 13; SM-S911B)" or "Android 12; ru-ru; Redmi Note 11 Build/..."
    const modelMatch = userAgent.match(/Android\s[^;)]+;\s([^;)]+?)(?:\sBuild|\))/i);

    if (modelMatch && modelMatch[1]) {
        const fullModel = modelMatch[1].trim();

        // Optional: If you only want the FIRST word (e.g., "SAMSUNG" or "Redmi"), keep your split logic:
        // return fullModel.split(' ')[0];

        // Recommendation: Return the full model name token for better analytical precision (e.g., "SM-G998B")
        return fullModel;
    }

    return 'Android Device';
}
