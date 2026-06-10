// @ts-check

import { getSafeUserAgent } from './helpers.js';
import { getBrowser } from './browser.js';
import { getOS } from './os.js';
import { getDeviceModel } from './device/model.js';
import { isMobile, isTablet } from './device/mobile.js';
import { getTimeZone, getLanguages } from './locale-info.js';

/**
 * Helper to split full string (e.g., "Chrome 122.0.0.0") into name and version components.
 * * @param {string} fullString
 * @returns {{ name: string, version: string }}
 */
function parseNameAndVersion(fullString) {
    if (!fullString) {
        return { name: 'Unknown', version: 'Unknown' };
    }

    // Example: "Mobile Safari 17.4" => name = "Mobile Safari", version = "17.4"
    const match = fullString.match(/^([\w\s]+?)\s+([\d\.]+)$/);
    if (match) {
        return {
            name: match[1].trim(),
            version: match[2],
        };
    }

    // Fallback: first space separates name and version (works for simple cases)
    const firstSpaceIndex = fullString.indexOf(' ');
    if (firstSpaceIndex === -1) {
        return { name: fullString, version: 'Unknown' };
    }

    return {
        name: fullString.substring(0, firstSpaceIndex).trim(),
        version: fullString.substring(firstSpaceIndex + 1).trim(),
    };
}

/**
 * Asynchronously harvests comprehensive environment, browser, device, and locale metrics.
 * Fully safe for SSR (Server-Side Rendering) and performance-optimized.
 *
 * @param {string} [displayLocale] Optional BCP 47 language tag to translate country and language names (e.g., "ru", "en").
 * @param {string} [customUserAgent] Optional User-Agent string override (highly useful for SSR / backend execution).
 * @returns {Promise<import('./types.js').EnvironmentInfo>} A promise that resolves to the unified structured environment report.
 */
export async function getEnvironment(displayLocale, customUserAgent) {
    // 1. Resolve the User-Agent context
    const ua = customUserAgent || getSafeUserAgent();

    // 2. Determine device type synchronously based on the User-Agent tokens
    /** @type {"desktop" | "tablet" | "mobile"} */
    let deviceType = 'desktop';
    if (isTablet(ua)) {
        deviceType = 'tablet';
    } else if (isMobile(ua)) {
        deviceType = 'mobile';
    }

    // 3. Get device model
    const deviceModel = await getDeviceModel(ua);

    // 4. Extract browser and OS full strings, then safely parse them
    const fullBrowser = await getBrowser(ua); // E.g., "Chrome 122.0.0.0"
    const fullOS = await getOS(ua); // E.g., "Windows 11"

    const browserInfo = parseNameAndVersion(fullBrowser);
    const osInfo = parseNameAndVersion(fullOS);

    const timeZone = getTimeZone();
    const languages = getLanguages(displayLocale);

    // 5. Assemble and return the final clean analytical structured report
    return {
        browser: {
            name: browserInfo.name,
            version: browserInfo.version,
        },
        os: {
            name: osInfo.name,
            version: osInfo.version,
        },
        device: {
            model: deviceModel,
            type: deviceType,
        },
        locale: {
            timeZone: timeZone,
            languages: languages,
        },
    };
}
