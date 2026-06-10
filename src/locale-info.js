// @ts-check

import { isClient, safeNavigator } from './helpers.js';

const languageDisplayCache = new Map();

/**
 * Safely retrieves the browser's primary language code.
 * Used as a fallback for environment-agnostic execution (SSR safely returns 'en').
 *
 * @returns {string} The primary language tag (e.g., 'en-US') or 'en'.
 */
function getSafePrimaryLanguage() {
    return isClient && safeNavigator ? safeNavigator.language : 'en';
}

/**
 * Gets the user's current time zone.
 * Safely handles environments where Intl or TimeZone is unavailable (e.g., legacy browsers or SSR).
 *
 * @returns {string} The resolved time zone ID (e.g., "America/New_York") or "UTC" as a fallback.
 */
export function getTimeZone() {
    try {
        return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    } catch (e) {
        // Fallback to 'UTC' instead of an uninformative dash '-' to maintain analytical clarity
        return 'UTC';
    }
}

/**
 * Gets the languages supported by the browser with human-readable names.
 * No duplicate region names – Intl.DisplayNames already includes region when appropriate.
 *
 * @param {string} [displayLocale] The locale to use for displaying names.
 * @param {readonly string[]} [fallbackLanguages] Optional array of language tags.
 * @returns {string[]} Array of formatted language strings.
 */
export function getLanguages(displayLocale, fallbackLanguages) {
    const targetLanguages =
        fallbackLanguages || (isClient && safeNavigator ? safeNavigator.languages : ['en']);
    if (!targetLanguages || targetLanguages.length === 0) {
        return [];
    }

    let safeDisplayLocale = displayLocale || getSafePrimaryLanguage();
    try {
        const canonicalLocales = Intl.getCanonicalLocales(safeDisplayLocale);
        if (canonicalLocales && canonicalLocales[0]) {
            safeDisplayLocale = canonicalLocales[0];
        }
    } catch (e) {
        safeDisplayLocale = getSafePrimaryLanguage();
    }

    // Get or create cached Intl.DisplayNames for language (region is handled internally)
    let langDisplay = languageDisplayCache.get(safeDisplayLocale);
    if (!langDisplay) {
        try {
            langDisplay = new Intl.DisplayNames([safeDisplayLocale], {
                type: 'language',
                languageDisplay: 'dialect',
                fallback: 'code',
            });
            languageDisplayCache.set(safeDisplayLocale, langDisplay);
        } catch (error) {
            console.warn('Intl.DisplayNames not supported. Returning raw tags.', error);
            // Return unique raw tags
            const seen = new Set();
            return targetLanguages.filter(tag => {
                const norm = tag.toLowerCase();
                if (seen.has(norm)) return false;
                seen.add(norm);
                return true;
            });
        }
    }

    const seen = new Set();
    const result = [];

    for (const langTag of targetLanguages) {
        const normalized = langTag.toLowerCase();
        if (seen.has(normalized)) continue;
        seen.add(normalized);

        let formatted;
        try {
            // Intl.DisplayNames already returns "Russian (Russia)" for ru-RU, etc.
            formatted = langDisplay.of(langTag) || langTag;
        } catch (e) {
            formatted = langTag;
        }
        result.push(formatted);
    }
    return result;
}
