// @ts-check

import { isIPad } from "./device.js";

/**
 * Gets the operating system and version.
 *
 * @returns {string}
 */
export function getOS() {
    var os = "Unknown";
    var userAgent = window.navigator.userAgent;

    /** @type {Array<{os: string, re: RegExp}>} */
    var operatingSystemRules = [
        { os: "iOS", re: /iP(hone|od|ad)/ },
        { os: "Android OS", re: /Android/ },
        { os: "BlackBerry OS", re: /BlackBerry|BB10/ },
        { os: "Windows Mobile", re: /IEMobile/ },
        { os: "Amazon OS", re: /Kindle/ },
        { os: "Windows 3.11", re: /Win16/ },
        { os: "Windows 95", re: /(Windows 95)|(Win95)|(Windows_95)/ },
        { os: "Windows 98", re: /(Windows 98)|(Win98)/ },
        { os: "Windows 2000", re: /(Windows NT 5.0)|(Windows 2000)/ },
        { os: "Windows XP", re: /(Windows NT 5.1)|(Windows XP)/ },
        { os: "Windows Server 2003", re: /(Windows NT 5.2)/ },
        { os: "Windows Vista", re: /(Windows NT 6.0)/ },
        { os: "Windows 7", re: /(Windows NT 6.1)/ },
        { os: "Windows 8", re: /(Windows NT 6.2)/ },
        { os: "Windows 8.1", re: /(Windows NT 6.3)/ },
        { os: "Windows 10", re: /(Windows NT 10.0)/ },
        { os: "Windows ME", re: /Windows ME/ },
        {
            os: "Windows CE",
            re: /Windows CE|WinCE|Microsoft Pocket Internet Explorer/,
        },
        { os: "Open BSD", re: /OpenBSD/ },
        { os: "Sun OS", re: /SunOS/ },
        { os: "Chrome OS", re: /CrOS/ },
        { os: "Linux", re: /(Linux|X11)\s*([^\s;]+)*/ },
        { os: "Mac OS", re: /(Mac_PowerPC)|(Macintosh)/ },
        { os: "QNX", re: /QNX/ },
        { os: "BeOS", re: /BeOS/ },
        { os: "OS/2", re: /OS\/2/ },
        { os: "Aurora", re: /Aurora/ },
    ];

    for (let i = 0, count = operatingSystemRules.length; i < count; i++) {
        const match = operatingSystemRules[i].re.exec(userAgent);
        if (match) {
            os = operatingSystemRules[i].os;
            break;
        }
    }

    if (os == "Aurora") {
        let matchVersion = userAgent.match(/Aurora\/([^\s;]+)/i);
        if (matchVersion) {
            os = os + " " + matchVersion[1];
        }

        return os;
    }

    if (os == "iOS") {
        let matchVersion = userAgent.match(/OS (\d+)_(\d+)_(\d+)/);
        if (matchVersion) {
            os +=
                " " +
                matchVersion[1] +
                "." +
                matchVersion[2] +
                "." +
                matchVersion[3];
        }

        return os;
    }

    if (os == "Mac OS") {
        let matchVersion = userAgent.match(/Mac OS X\s([0-9\.]*)/i);
        if (matchVersion) {
            if (isIPad()) {
                os = "iPad OS";
                let matchSafariVersion = userAgent.match(/Version\/([^\s;]+)/);
                if (matchSafariVersion) {
                    os = os + " " + matchSafariVersion[1];
                }

                return os;
            }

            os = os + " " + matchVersion[1];
        }

        return os;
    }

    if (os == "Android OS") {
        let matchVersion = userAgent.match(/android\s([0-9\.]*)/i);
        if (matchVersion) {
            os = os + " " + matchVersion[1];
        }

        return os;
    }

    return os;
}

/**
 * Asynchronously checks if the operating system is Windows 11.
 *
 * @returns {Promise<boolean>} A promise that resolves to true if the operating system is Windows 11, false otherwise.
 */
export async function isWindows11() {
    // @ts-ignore
    const userAgentData = window.navigator.userAgentData;
    if (!userAgentData) return false;

    let data = await userAgentData.getHighEntropyValues(["platformVersion"]);
    if (userAgentData.platform !== "Windows") {
        return false;
    }

    if (typeof data.platformVersion != "string") return false;

    const majorPlatformVersion = parseInt(data.platformVersion.split(".")[0]);
    if (majorPlatformVersion >= 13) {
        return true;
    } else {
        return false;
    }
}
