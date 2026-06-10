// @ts-check

import { isClient, safeNavigator } from './helpers.js';

/**
 * Modern and secure cache storage for heavy Intl.DisplayNames instances.
 * Using Map prevents Prototype Pollution vulnerabilities.
 * @type {Map<string, Intl.DisplayNames>}
 */
const displayNamesCache = new Map();

/**
 * Safely retrieves the browser's primary language code for country resolution fallback.
 *
 * @returns {string} The primary language tag (e.g., 'en-US') or 'en'.
 */
function getSafePrimaryLanguage() {
    return isClient && safeNavigator ? safeNavigator.language : 'en';
}

/**
 * Gets the human-readable country/region name derived from the user's current locale settings.
 * Performance-optimized via a secure modern Map-based Memoization Cache.
 *
 * @param {string} [displayLocale] The locale to use for translating the country name. Defaults to the client's language.
 * @param {string} [targetLocale] Optional custom locale to extract the country from (crucial for SSR execution).
 * @returns {string} The localized country name (e.g., "United States"), a generic fallback, or an empty string.
 */
export function getCountryName(displayLocale, targetLocale) {
    // 1. Resolve the source locale from which we want to extract the country code
    const sourceLocale = targetLocale || getSafePrimaryLanguage();
    if (!sourceLocale) return '';

    // 2. Extract the ISO 3166-1 alpha-2 region code safely
    let regionCode = '';
    try {
        const localeObj = new Intl.Locale(sourceLocale);
        if (localeObj.region) {
            regionCode = localeObj.region.toUpperCase();
        }
    } catch (e) {
        // Fallback: A stricter regex that ensures we capture an isolated 2-letter
        // country token separated by dashes/underscores, preventing partial matches.
        const match = sourceLocale.match(/(?:[-_])([A-Za-z]{2})(?:\b|[-_]|$)/);
        if (match && match[1]) {
            regionCode = match[1].toUpperCase();
        }
    }

    // If no valid region identifier could be parsed, return 'Unknown' for clean analytical grouping
    if (!regionCode) {
        return 'Unknown';
    }

    // 3. Resolve and validate the display locale used for translation formatting
    let safeDisplayLocale = displayLocale || getSafePrimaryLanguage();
    try {
        const canonicalLocales = Intl.getCanonicalLocales(safeDisplayLocale);
        if (canonicalLocales && canonicalLocales[0]) {
            safeDisplayLocale = canonicalLocales[0];
        }
    } catch (e) {
        safeDisplayLocale = getSafePrimaryLanguage();
    }

    // 4. Translate the region code using the secure Map Cache
    try {
        // If the formatter for this specific display locale doesn't exist yet, create and set it
        if (!displayNamesCache.has(safeDisplayLocale)) {
            displayNamesCache.set(
                safeDisplayLocale,
                new Intl.DisplayNames([safeDisplayLocale], { type: 'region', fallback: 'code' })
            );
        }

        const regionDisplay = displayNamesCache.get(safeDisplayLocale);
        return regionDisplay ? regionDisplay.of(regionCode) || regionCode : regionCode;
    } catch (error) {
        console.warn(
            'Intl.DisplayNames is not supported or failed in this environment. Returning raw region code.',
            error
        );
        // Safely return the raw uppercase ISO code (e.g., "US") if the environment lacks full Intl support
        return regionCode;
    }
}
