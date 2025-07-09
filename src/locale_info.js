// @ts-check

import { iso3166_1 } from "./countries.js";
import { getLanguageByCode } from "./languages.js";

/**
 * Gets the user's current time zone.
 *
 * @returns {string} The user's current time zone. If the time zone could not be found, returns "Unknown".
 */
export function getTimeZone() {
    try {
        return Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch (e) {
        return "-";
    }
}

/**
 * Gets the languages supported by the browser.
 *
 * @returns {string[]} An object containing the default language and an array of supported languages.
 */
export function getLanguages() {
    let languages = {};

    for (let i = 0; i < window.navigator.languages.length; i++) {
        let langString = window.navigator.languages[i];
        let parts = langString.split("-");
        let langISO = parts[0];

        let key = getLanguageByCode(langISO);

        if (!languages[key]) {
            languages[key] = [];
        }

        if (parts.length > 1) {
            for (let y = 1; y < parts.length; y++) {
                let country = iso3166_1[parts[y]];
                if (country) {
                    languages[key].push(country);
                }
            }
        } else {
        }
    }

    let result = [];
    for (let key in languages) {
        if (languages[key].length > 0) {
            let countries = languages[key].join(", ");
            result.push(`${key} (${countries})`);
        } else {
            result.push(key);
        }
    }

    return result;
}
