// @ts-check

import { detectIncognito } from "detectincognitojs/dist/detectIncognito.esm.js";
//import { detectIncognito } from "detectincognitojs";
import { iso639_1 } from "./languages.js";
/**
 * Gets the browser name and version.
 *
 * @param {string} [userAgent=window.navigator.userAgent] The user agent string.
 * @returns {string} The browser name and version, or "Unknown" if it could not be determined.
 */
export function getBrowser(userAgent = window.navigator.userAgent) {
    // see: https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Browser_detection_using_the_user_agent

    let matchYandex = userAgent.match(/YaBrowser\/([^\s;]+)/i);
    if (matchYandex) {
        return "Yandex " + matchYandex[1];
    }

    let matchMessenger = userAgent.match(/Messenger\/([^\s;]+)/);
    if (matchMessenger) {
        return "Messenger " + matchMessenger[1];
    }

    let matchFacebook = userAgent.match(/FBAN|FBAV/i);
    if (matchFacebook) {
        let appName = "Facebook";
        let appNameMatch = userAgent.match(/FBAN\/([^\s;]+)/i);
        if (appNameMatch) {
            appName = "Facebook " + appNameMatch[1];
        }

        let appVersion = "";
        let appVersionMatch = userAgent.match(/FBAV\/([^\s;]+)/i);
        if (appVersionMatch) {
            appVersion = appVersionMatch[1];
        }

        return (appName + " " + appVersion).trim();
    }

    let matchInstagram = userAgent.match(/Instagram ([^\s;]+)/i);
    if (matchInstagram) {
        return "Instagram " + matchInstagram[1];
    }

    // @ts-ignore
    if (typeof window.TelegramWebview !== "undefined") {
        return "Telegram InApp Browser";
    }

    if (/(micromessenger|weixin)/i.test(userAgent)) {
        return "WeChat";
    }

    let matchSeaMonkey = userAgent.match(/SeaMonkey\/([^\s;]+)/);
    if (matchSeaMonkey) {
        return "SeaMonkey " + matchSeaMonkey[1];
    }

    let matchFirefox = userAgent.match(/Firefox\/([^\s;]+)/);
    if (matchFirefox) {
        if (!userAgent.match(/SeaMonkey\/([^\s;]+)/)) {
            return "Firefox " + matchFirefox[1];
        }
    }

    let matchChrome = userAgent.match(/Chrome\/([^\s;]+)/);
    if (matchChrome) {
        if (!userAgent.match(/(Chromium|Edg[^\/]*)\//))
            return "Chrome " + matchChrome[1];
    }

    let matchChromium = userAgent.match(/Chromium\/([^\s;]+)/);
    if (matchChromium) {
        return "Chromium " + matchChromium[1];
    }

    let matchEdge = userAgent.match(/Edg[^\/]*\/([^\s;]+)/);
    if (matchEdge) {
        return "Edge " + matchEdge[1];
    }

    let matchSafari = userAgent.match(/Safari\/([^\s;]+)/);
    if (matchSafari) {
        if (
            !(
                userAgent.match(/Chrome\/([^\s;]+)/) ||
                userAgent.match(/Chromium\/([^\s;]+)/)
            )
        ) {
            let versionMatch = userAgent.match(/Version\/([^\s;]+)/);
            let version = versionMatch ? versionMatch[1] : null;
            if (version) {
                return "Safari " + version;
            }
        }
    }

    // Opera 15+
    let matchNewOpera = userAgent.match(/OPR\/([^\s;]+)/);
    if (matchNewOpera) {
        return "Opera " + matchNewOpera[1];
    }

    // Opera 12-14
    let matchOldOpera = userAgent.match(/Opera\/([^\s;]+)/);
    if (matchOldOpera) {
        return "Opera " + matchOldOpera[1];
    }

    // MSIE detection
    if (/trident/i.test(userAgent)) {
        let versionMatch = /\brv[ :]+(\d+)/g.exec(userAgent);
        if (versionMatch) {
            return "IE " + versionMatch[1];
        }

        let versionMatch2 = /\bMSIE\s([\d\.]+)/g.exec(userAgent);
        if (versionMatch2) {
            return "IE " + versionMatch2[1];
        }

        return "IE";
    }

    return "Unknown";
}

/**
 * Checks if the browser is running in a webview.
 *
 * @returns {boolean} True if the browser is running in a webview, false otherwise.
 */
export function isWebview(
    userAgent = window.navigator.userAgent.toLowerCase()
) {
    if (typeof window === undefined) {
        return false;
    }

    let navigator = window.navigator;

    // @ts-ignore
    const standalone = navigator.standalone;
    const safari = /safari/.test(userAgent);
    const ios = /iphone|ipod|ipad|macintosh/.test(userAgent);
    const ios_ipad_webview = ios && !safari;

    return ios
        ? (!standalone && !safari) || ios_ipad_webview
        : userAgent.includes("wv");
}

/**
 * Asynchronously checks if the browser is in incognito or private mode.
 *
 * @returns {Promise<boolean>} A promise that resolves to true if the browser is in incognito mode, false otherwise.
 */
export async function isIncognitoMode() {
    try {
        let result = await detectIncognito();
        return result.isPrivate;
    } catch (error) {
        console.error("Error checking incognito mode:", error);
        return false;
    }
}

/**
 * Gets the language of the browser in a human-readable format.
 *
 * @returns {string} The browser language, or the ISO 639-1 language code if the language is not supported.
 */
export function getBrowserLanguage() {
    let langISO = window.navigator.language;
    let langName = iso639_1[langISO];
    if (langName) {
        return langName;
    } else {
        return langISO;
    }
}
