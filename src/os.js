// @ts-check

import {
    getHighEntropyValues,
    getSafeUserAgent,
    getSafeUserAgentData,
    safeNavigator,
} from './helpers.js';

/**
 * Asynchronously determines the Android version number.
 * * @param {string} userAgent The user agent string.
 * @returns {Promise<string|false>} A promise that resolves to the Android version string, or false.
 */
async function getAndroidOS(userAgent) {
    if (!/android/i.test(userAgent)) {
        return false;
    }

    // Check if the platformVersion is available in high entropy values
    const data = await getHighEntropyValues(['platformVersion']);
    if (data && data.platformVersion) {
        return 'Android ' + data.platformVersion;
    }

    const matchVersion = userAgent.match(/android\s([0-9\.]*)/i);
    if (matchVersion && matchVersion[1]) {
        return 'Android ' + matchVersion[1];
    }

    return 'Android';
}

/**
 * Gets the operating system name and version.
 *
 * @param {string} [userAgent=getSafeUserAgent()] The user agent string.
 * @returns {Promise<string>} The detected operating system name and version.
 */
export async function getOS(userAgent = getSafeUserAgent()) {
    let os = 'Unknown';

    /** @type {Array<import('./types.js').OSRule>} */
    const operatingSystemRules = [
        { os: 'iOS', re: /iP(hone|od|ad)/ },
        { os: 'Android', re: /Android/ },
        { os: 'BlackBerry OS', re: /BlackBerry|BB10/ },
        { os: 'Windows Mobile', re: /IEMobile/ },
        { os: 'Amazon OS', re: /Kindle/ },
        { os: 'Windows 3.11', re: /Win16/ },
        { os: 'Windows 95', re: /(Windows 95)|(Win95)|(Windows_95)/ },
        { os: 'Windows 98', re: /(Windows 98)|(Win98)/ },
        { os: 'Windows 2000', re: /(Windows NT 5.0)|(Windows 2000)/ },
        { os: 'Windows XP', re: /(Windows NT 5.1)|(Windows XP)/ },
        { os: 'Windows Server 2003', re: /(Windows NT 5.2)/ },
        { os: 'Windows Vista', re: /(Windows NT 6.0)/ },
        { os: 'Windows 7', re: /(Windows NT 6.1)/ },
        { os: 'Windows 8', re: /(Windows NT 6.2)/ },
        { os: 'Windows 8.1', re: /(Windows NT 6.3)/ },
        { os: 'Windows 10', re: /(Windows NT 10.0)/ },
        { os: 'Windows ME', re: /Windows ME/ },
        { os: 'Windows CE', re: /Windows CE|WinCE|Microsoft Pocket Internet Explorer/ },
        { os: 'Open BSD', re: /OpenBSD/ },
        { os: 'Sun OS', re: /SunOS/ },
        { os: 'Chrome OS', re: /CrOS/ },
        { os: 'Linux', re: /(Linux|X11)\s*([^\s;]+)*/ },
        { os: 'Mac OS', re: /(Mac_PowerPC)|(Macintosh)/ },
        { os: 'QNX', re: /QNX/ },
        { os: 'BeOS', re: /BeOS/ },
        { os: 'OS/2', re: /OS\/2/ },
        { os: 'Aurora', re: /Aurora/ },
    ];

    for (let i = 0, count = operatingSystemRules.length; i < count; i++) {
        if (operatingSystemRules[i].re.test(userAgent)) {
            os = operatingSystemRules[i].os;
            break;
        }
    }

    if (os === 'Windows 10') {
        const win11 = await isWindows11();
        return win11 ? 'Windows 11' : 'Windows 10';
    }

    if (os === 'Aurora') {
        const matchVersion = userAgent.match(/Aurora\/([^\s;]+)/i);
        return matchVersion ? os + ' ' + matchVersion[1] : os;
    }

    if (os === 'iOS') {
        // Support versions like 17.2.1 (three components)
        const matchVersion = userAgent.match(/OS (\d+)[_.](\d+)(?:[_.](\d+))?/);
        if (matchVersion) {
            let version = `${matchVersion[1]}.${matchVersion[2]}`;
            if (matchVersion[3]) version += `.${matchVersion[3]}`;
            os += ' ' + version;
        }
        return os;
    }

    if (os === 'Mac OS') {
        const matchVersion = userAgent.match(/Mac OS X\s([0-9\._]*)/i);
        if (matchVersion) {
            // Check if it is a modern iPad masking as a Mac (Touch capability check)
            // This decouples os.js from device/apple.js and resolves the circular dependency
            const isModernIPad = safeNavigator && safeNavigator.maxTouchPoints > 1;

            if (isModernIPad) {
                os = 'iPad OS';
                const matchSafariVersion = userAgent.match(/Version\/([^\s;]+)/);
                if (matchSafariVersion) {
                    os = os + ' ' + matchSafariVersion[1];
                }
                return os;
            }

            os = os + ' ' + matchVersion[1].replace(/_/g, '.');
        }
        return os;
    }

    if (os === 'Android') {
        const androidOS = await getAndroidOS(userAgent);
        if (androidOS) {
            return androidOS;
        }
    }

    return os;
}

/**
 * Asynchronously checks if the operating system is Windows 11.
 *
 * @returns {Promise<boolean>} A promise that resolves to true if the operating system is Windows 11, false otherwise.
 */
export async function isWindows11() {
    const userAgentData = getSafeUserAgentData();
    if (!userAgentData || userAgentData.platform !== 'Windows') {
        return false;
    }

    const data = await getHighEntropyValues(['platformVersion']);
    if (!data || typeof data.platformVersion !== 'string') {
        return false;
    }

    const majorPlatformVersion = parseInt(data.platformVersion.split('.')[0], 10);
    // Windows 11 build versions return a major platform version of 13 or higher via Client Hints
    return majorPlatformVersion >= 13;
}
