import { detectIncognito } from 'detectincognitojs/dist/detectIncognito.esm.js';

// @ts-check

/**
 * Determines if the device is a sensor device with coarse pointing capabilities.
 *
 * @returns {boolean} True if the device is a sensor device with coarse pointing capabilities, false otherwise.
 */
function isSensorDevice() {
    let hasTouchScreen = false;
    if ("maxTouchPoints" in navigator) {
        hasTouchScreen = navigator.maxTouchPoints > 0;
    } else if ("msMaxTouchPoints" in navigator) {
        // @ts-ignore
        hasTouchScreen = navigator.msMaxTouchPoints > 0;
    } else {
        const mQ = matchMedia?.("(pointer:coarse)");
        if (mQ?.media === "(pointer:coarse)") {
            hasTouchScreen = !!mQ.matches;
        } else if ("orientation" in window) {
            hasTouchScreen = true; // deprecated, but good fallback
        } else {
            // Only as a last resort, fall back to user agent sniffing
            // @ts-ignore
            const userAgent = navigator.userAgent;
            hasTouchScreen =
                /\b(BlackBerry|webOS|iPhone|IEMobile|Mobile)\b/i.test(
                    userAgent
                ) || /\b(Android|Windows Phone|iPad|iPod)\b/i.test(userAgent);
        }
    }
    return hasTouchScreen;
}

/**
 * Determines if the device is a pointer device with fine pointing capabilities.
 *
 * @returns {boolean} True if the device is a pointer device with fine pointing capabilities, false otherwise.
 */
function isPointerDevice() {
    try {
        return matchMedia("(pointer:fine)").matches;
    } catch (e) {
        console.error(e);
        return false;
    }
}

/**
 * Checks if the browser is running on a mobile device.
 *
 * @returns {boolean} True if the browser is running on a mobile device, false otherwise.
 */
function isMobile() {
    // @ts-ignore
    const userAgentData = window.navigator.userAgentData;

    if (userAgentData && typeof userAgentData.mobile != "undefined") {
        return userAgentData.mobile;
    }

    const userAgent = navigator.userAgent.toLowerCase();

    if (/mobi|tablet/.test(userAgent)) {
        return true;
    }

    if (/uZard|Opera Mini|BlackBerry/i.test(userAgent)) {
        return true;
    }

    return false;
}

/**
 * Asynchronously gets the device model.
 *
 * @returns {Promise<string|null>} A promise that resolves to the device model if it could be determined, null otherwise.
 */
async function getDeviceModelA() {
    try {
        // @ts-ignore
        const userAgentData = window.navigator.userAgentData;
        if (!userAgentData) return null;

        const androidDeviceInfo = await userAgentData.getHighEntropyValues([
            "model",
        ]);
        return androidDeviceInfo.model || null;
    } catch (error) {
        console.error("Error getting device model:", error);
        return null;
    }
}

// device maps
const iosDeviceMapping = new Map([
    ["320x480", "IPhone 4S, 4, 3GS, 3G, 1st gen"],
    // https://yesviz.com/iphones.php
    /*
    
    ["375x812", "IPhone X, XS, 11 Pro, 12 Mini, 13 Mini"],
    ["390x844", "IPhone 13, 13 Pro, 12, 12 Pro"],
    ["414x736", "IPhone 8+"],
    ["414x896", "IPhone 11, XR, XS Max, 11 Pro Max"],
    ["428x926", "IPhone 13 Pro Max, 12 Pro Max"],
    ["476x847", "IPhone 7+, 6+, 6S+"],
    */

    ["414x896", "iPhone 11, 11 Pro Max, XR, XS Max"],
    ["375x812", "IPhone X, XS, 11 Pro, 12 Mini, 13 Mini"],
    ["390x844", "iPhone 12, 12 Pro, 13, 13 Pro, 14"],
    ["360x780", "iPhone 12 mini, 13 mini"],
    ["428x926", "iPhone 12 Pro Max, 13 Pro Max, 14 Plus"],
    ["393x852", "iPhone 14 Pro, 15, 15 Pro, 16"],
    ["430x932", "iPhone 14 Pro Max, 15 Plus, 15 Pro Max, 16 Plus"],
    ["320x568", "iPhone 5, 5c, 5s, SE"],
    ["375x667", "iPhone 6, 6s, 7, 8, SE (2020), SE (2022)"],
    ["414x736", "iPhone 6s Plus, 7 Plus, 8 Plus"],
    // https://yesviz.com/devices.php
    ["402x874", "iPhone 16 Pro"],
    ["440x956", "iPhone 16 Pro Max"],

    /*
    ["744x1133", "IPad Mini 6th Gen"],
    [
        "768x1024",
        "IPad Mini (5th Gen), IPad (1-6th Gen), iPad Pro (1st Gen 9.7), Ipad Mini (1-4), IPad Air(1-2)  ",
    ],
    ["810x1080", "IPad 7-9th Gen"],
    ["820x1180", "iPad Air (4th gen)"],
    ["834x1194", "iPad Pro (3-5th Gen 11)"],
    ["834x1112", "iPad Air (3rd gen), iPad Pro (2nd gen 10.5)"],
    ["1024x1366", "iPad Pro (1-5th Gen 12.9)"],
    */
    [
        "820x1180",
        "iPad iPad Air (5th gen), iPad Air (4th gen), iPad (10th gen)",
    ],
    ["834x1112", "iPad iPad Air (3rd gen)"],
    ["744x1133", "iPad iPad Mini (6th gen)"],
    [
        "768x1024",
        "iPad iPad Mini (5th gen), iPad Mini 4, iPad (6th gen), iPad (5th gen), iPad III & IV gen, iPad Air 1 & 2, iPad Mini 2 & 3, iPad Mini",
    ],
    ["810x1080", "iPad iPad (9th gen), iPad (8th gen), iPad (7th gen)"],
    ["1024x1366", "iPad iPad Pro"],
]);

/**
 * Gets the device name from the user agent string.
 * @returns {string} The device name, or "" if it could not be determined.
 */
function getAndroidDeviceNameFromUserAgent(
    userAgent = window.navigator.userAgent
) {
    if (userAgent.indexOf("Android") == -1) return "";

    const androidUserAgentString = userAgent.slice(
        window.navigator.userAgent.indexOf("Android")
    );
    const androidDeviceName = androidUserAgentString.slice(
        androidUserAgentString.indexOf("; ") + 1,
        androidUserAgentString.indexOf(")")
    );
    if (androidDeviceName) {
        return androidDeviceName.trim().split(" ")[0];
    }

    return "";
}

/**
 * Gets the device name from the screen resolution.
 * @returns {string} The device name, or "" if it could not be determined.
 */
function getIosDeviceName() {
    let userAgent = window.navigator.userAgent;
    if (!/iphone|ipad|macintosh/i.test(userAgent)) {
        return "";
    }

    let screen = window.screen;
    const screenResolution = `${screen.width}x${screen.height}`;
    const device = iosDeviceMapping.get(screenResolution);
    if (device) {
        return device;
    }
    return "";
}

/**
 * Determines if the current device is an iPhone.
 *
 * @returns {boolean} True if the device is identified as an iPhone, false otherwise.
 */
function isIPhone() {
    let ua = window.navigator.userAgent.toLowerCase();
    return ua.indexOf("iphone") > -1;
}

/**
 * Determines if the current device is an iPad.
 *
 * @returns {boolean} True if the device is identified as an iPad, false otherwise.
 */
function isIPad() {
    if (isIPhone()) {
        return false;
    }
    let ua = window.navigator.userAgent.toLowerCase();
    /** @type {boolean} */
    let a = ua.indexOf("ipad") > -1;

    if (a) {
        return true;
    }

    /** @type {boolean} */
    let b =
        ua.indexOf("macintosh") > -1 &&
        !!navigator.maxTouchPoints &&
        navigator.maxTouchPoints > 2 &&
        navigator.platform !== "iPhone";

    if (b) {
        return true;
    }

    return false;
}

/**
 * Determines if the current device is a desktop Apple device (e.g. iMac, MacBook).
 *
 * @returns {boolean} True if the device is identified as a desktop Apple device, false otherwise.
 */
function isMac() {
    let userAgent = window.navigator.userAgent;
    if (!/iphone|ipad|macintosh/i.test(userAgent)) {
        return false;
    }

    if (isIPhone() || isIPad()) {
        return false;
    }

    return true;
}

/**
 * Gets the device type (Tablet, Mobile, Desktop) of the current device.
 *
 * @returns {string} The device type.
 */
function getDeviceType() {
    if (isIPad()) {
        return "Tablet";
    }

    if (/tablet|ipad/i.test(window.navigator.userAgent)) return "Tablet";

    if (isIPhone()) {
        return "Mobile";
    }

    if (isMobile()) {
        return "Mobile";
    }

    return "Desktop";
}

/**
 * Asynchronously determines the device model name.
 *
 * This function attempts to identify the device model by checking for iPad or iPhone first,
 * utilizing the iOS device name mappings. If the device is not an iPad or iPhone, it tries
 * to retrieve the device model using `getDeviceModelA`. If the device is not identified as a
 * mobile device, it returns "-". For Android devices, it extracts the device name from the
 * user agent string. If none of the checks are successful, it returns "-".
 *
 * @returns {Promise<string>} A promise that resolves to the device model name or "-" if it could
 * not be determined.
 */
async function getDeviceModel() {
    let device = "";

    if (isIPad()) {
        device = getIosDeviceName();
        if (device == "") {
            return "iPad";
        } else {
            return device;
        }
    }

    if (isIPhone()) {
        device = getIosDeviceName();
        if (device == "") {
            return "iPhone";
        } else {
            return device;
        }
    }

    if (isMac()) {
        return "Mac";
    }

    let deviceName = await getDeviceModelA();
    if (deviceName) {
        return deviceName;
    }

    // check if mobile device
    const isMobileDevice = isMobile();

    if (!isMobileDevice) {
        return "-";
    }

    if (window.navigator.userAgent.includes("Android")) {
        device = getAndroidDeviceNameFromUserAgent();

        if (device) {
            return device;
        }
    }

    return "-";
}

// @ts-check


/**
 * Asynchronously determines the Android version number.
 *
 * @returns {Promise<string|false>} A promise that resolves to the Android version number, or "Android" if the
 * version number could not be determined.
 */
async function getAndroidOS() {
    const userAgent = window.navigator.userAgent;
    if (/android/i.test(userAgent) === false) {
        return false;
    }

    // @ts-ignore
    const userAgentData = window.navigator.userAgentData;

    if (userAgentData) {
        // Check if the platformVersion is available in high entropy values
        let data = await userAgentData.getHighEntropyValues([
            "platformVersion",
        ]);

        if (typeof data.platformVersion == "string") {
            return "Android " + data.platformVersion;
        }
    }

    let matchVersion = userAgent.match(/android\s([0-9\.]*)/i);
    if (matchVersion) {
        return "Android " + matchVersion[1];
    }

    return "Android";
}

/**
 * Gets the operating system and version.
 *
 * @returns {Promise<string>}
 */
async function getOS(userAgent = window.navigator.userAgent) {
    var os = "Unknown";

    /** @type {Array<{os: string, re: RegExp}>} */
    var operatingSystemRules = [
        { os: "iOS", re: /iP(hone|od|ad)/ },
        { os: "Android", re: /Android/ },
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

    if (os == "Windows 10") {
        let win11 = await isWindows11();
        if (win11) {
            return "Windows 11";
        } else {
            return "Windows 10";
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

    if (os == "Android") {
        let androidOS = await getAndroidOS();
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
async function isWindows11() {
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

// @ts-check


// JSON.stringify(parseTable($0, null, "  "))

const iso3166_1 = {
    AE: "United Arab Emirates",
    AF: "Afghanistan",
    AG: "Antigua and Barbuda",
    AI: "Anguilla",
    AL: "Albania",
    AM: "Armenia",
    AO: "Angola",
    AQ: "Antarctica",
    AR: "Argentina",
    AS: "American Samoa",
    AT: "Austria",
    AU: "Australia",
    AW: "Aruba",
    AX: "Åland Islands",
    AZ: "Azerbaijan",
    BA: "Bosnia and Herzegovina",
    BB: "Barbados",
    BD: "Bangladesh",
    BE: "Belgium",
    BF: "Burkina Faso",
    BG: "Bulgaria",
    BH: "Bahrain",
    BI: "Burundi",
    BJ: "Benin",
    BL: "Saint Barthélemy",
    BM: "Bermuda",
    BN: "Brunei Darussalam",
    BO: "Bolivia, Plurinational State of",
    BQ: "Bonaire, Sint Eustatius and Saba",
    BR: "Brazil",
    BS: "Bahamas",
    BT: "Bhutan",
    BV: "Bouvet Island",
    BW: "Botswana",
    BY: "Belarus",
    BZ: "Belize",
    CA: "Canada",
    CC: "Cocos (Keeling) Islands",
    CD: "Congo, Democratic Republic of the",
    CF: "Central African Republic",
    CG: "Congo",
    CH: "Switzerland",
    CI: "Côte d'Ivoire",
    CK: "Cook Islands",
    CL: "Chile",
    CM: "Cameroon",
    CN: "China",
    CO: "Colombia",
    CR: "Costa Rica",
    CU: "Cuba",
    CV: "Cabo Verde",
    CW: "Curaçao",
    CX: "Christmas Island",
    CY: "Cyprus",
    CZ: "Czechia",
    DE: "Germany",
    DJ: "Djibouti",
    DK: "Denmark",
    DM: "Dominica",
    DO: "Dominican Republic",
    DZ: "Algeria",
    EC: "Ecuador",
    EE: "Estonia",
    EG: "Egypt",
    EH: "Western Sahara",
    ER: "Eritrea",
    ES: "Spain",
    ET: "Ethiopia",
    FI: "Finland",
    FJ: "Fiji",
    FK: "Falkland Islands (Malvinas)",
    FM: "Micronesia, Federated States of",
    FO: "Faroe Islands",
    FR: "France",
    GA: "Gabon",
    GB: "United Kingdom of Great Britain and Northern Ireland",
    GD: "Grenada",
    GE: "Georgia",
    GF: "French Guiana",
    GG: "Guernsey",
    GH: "Ghana",
    GI: "Gibraltar",
    GL: "Greenland",
    GM: "Gambia",
    GN: "Guinea",
    GP: "Guadeloupe",
    GQ: "Equatorial Guinea",
    GR: "Greece",
    GS: "South Georgia and the South Sandwich Islands",
    GT: "Guatemala",
    GU: "Guam",
    GW: "Guinea-Bissau",
    GY: "Guyana",
    HK: "Hong Kong",
    HM: "Heard Island and McDonald Islands",
    HN: "Honduras",
    HR: "Croatia",
    HT: "Haiti",
    HU: "Hungary",
    ID: "Indonesia",
    IE: "Ireland",
    IL: "Israel",
    IM: "Isle of Man",
    IN: "India",
    IO: "British Indian Ocean Territory",
    IQ: "Iraq",
    IR: "Iran, Islamic Republic of",
    IS: "Iceland",
    IT: "Italy",
    JE: "Jersey",
    JM: "Jamaica",
    JO: "Jordan",
    JP: "Japan",
    KE: "Kenya",
    KG: "Kyrgyzstan",
    KH: "Cambodia",
    KI: "Kiribati",
    KM: "Comoros",
    KN: "Saint Kitts and Nevis",
    KP: "Korea, Democratic People's Republic of",
    KR: "Korea, Republic of",
    KW: "Kuwait",
    KY: "Cayman Islands",
    KZ: "Kazakhstan",
    LA: "Lao People's Democratic Republic",
    LB: "Lebanon",
    LC: "Saint Lucia",
    LI: "Liechtenstein",
    LK: "Sri Lanka",
    LR: "Liberia",
    LS: "Lesotho",
    LT: "Lithuania",
    LU: "Luxembourg",
    LV: "Latvia",
    LY: "Libya",
    MA: "Morocco",
    MC: "Monaco",
    MD: "Moldova, Republic of",
    ME: "Montenegro",
    MF: "Saint Martin (French part)",
    MG: "Madagascar",
    MH: "Marshall Islands",
    MK: "North Macedonia",
    ML: "Mali",
    MM: "Myanmar",
    MN: "Mongolia",
    MO: "Macao",
    MP: "Northern Mariana Islands",
    MQ: "Martinique",
    MR: "Mauritania",
    MS: "Montserrat",
    MT: "Malta",
    MU: "Mauritius",
    MV: "Maldives",
    MW: "Malawi",
    MX: "Mexico",
    MY: "Malaysia",
    MZ: "Mozambique",
    NA: "Namibia",
    NC: "New Caledonia",
    NE: "Niger",
    NF: "Norfolk Island",
    NG: "Nigeria",
    NI: "Nicaragua",
    NL: "Netherlands, Kingdom of the",
    NO: "Norway",
    NP: "Nepal",
    NR: "Nauru",
    NU: "Niue",
    NZ: "New Zealand",
    OM: "Oman",
    PA: "Panama",
    PE: "Peru",
    PF: "French Polynesia",
    PG: "Papua New Guinea",
    PH: "Philippines",
    PK: "Pakistan",
    PL: "Poland",
    PM: "Saint Pierre and Miquelon",
    PN: "Pitcairn",
    PR: "Puerto Rico",
    PS: "Palestine, State of",
    PT: "Portugal",
    PW: "Palau",
    PY: "Paraguay",
    QA: "Qatar",
    RE: "Réunion",
    RO: "Romania",
    RS: "Serbia",
    RU: "Russian Federation",
    RW: "Rwanda",
    SA: "Saudi Arabia",
    SB: "Solomon Islands",
    SC: "Seychelles",
    SD: "Sudan",
    SE: "Sweden",
    SG: "Singapore",
    SH: "Saint Helena, Ascension and Tristan da Cunha",
    SI: "Slovenia",
    SJ: "Svalbard and Jan Mayen",
    SK: "Slovakia",
    SL: "Sierra Leone",
    SM: "San Marino",
    SN: "Senegal",
    SO: "Somalia",
    SR: "Suriname",
    SS: "South Sudan",
    ST: "Sao Tome and Principe",
    SV: "El Salvador",
    SX: "Sint Maarten (Dutch part)",
    SY: "Syrian Arab Republic",
    SZ: "Eswatini",
    TC: "Turks and Caicos Islands",
    TD: "Chad",
    TF: "French Southern Territories",
    TG: "Togo",
    TH: "Thailand",
    TJ: "Tajikistan",
    TK: "Tokelau",
    TL: "Timor-Leste",
    TM: "Turkmenistan",
    TN: "Tunisia",
    TO: "Tonga",
    TR: "Türkiye",
    TT: "Trinidad and Tobago",
    TV: "Tuvalu",
    TW: "Taiwan, Province of China[note 1]",
    TZ: "Tanzania, United Republic of",
    UA: "Ukraine",
    UG: "Uganda",
    UM: "United States Minor Outlying Islands",
    US: "United States of America",
    UY: "Uruguay",
    UZ: "Uzbekistan",
    VA: "Holy See",
    VC: "Saint Vincent and the Grenadines",
    VE: "Venezuela, Bolivarian Republic of",
    VG: "Virgin Islands (British)",
    VI: "Virgin Islands (U.S.)",
    VN: "Viet Nam",
    VU: "Vanuatu",
    WF: "Wallis and Futuna",
    WS: "Samoa",
    YE: "Yemen",
    YT: "Mayotte",
    ZA: "South Africa",
    ZM: "Zambia",
    ZW: "Zimbabwe",
};

/**
 * Returns the full name of a country given its ISO 3166-1 alpha-2 code.
 *
 * @param {string} two_letter_code - The ISO 3166-1 alpha-2 code of the country.
 *
 * @returns {string} The name of the country.
 */
function getCountryByCode(two_letter_code) {
    if (two_letter_code.length !== 2) {
        throw new Error(
            "Invalid ISO 3166-1 alpha-2 code. It must be exactly 2 characters long."
        );
    }

    two_letter_code = two_letter_code.toUpperCase();
    return iso3166_1[two_letter_code] || two_letter_code;
}

// @ts-check


// JSON.stringify(parseTable($0, null, "  "))

const iso639_1 = {
    ab: "Abkhazian",
    aa: "Afar",
    af: "Afrikaans",
    ak: "Akan",
    sq: "Albanian",
    am: "Amharic",
    ar: "Arabic",
    an: "Aragonese",
    hy: "Armenian",
    as: "Assamese",
    av: "Avaric",
    ae: "Avestan",
    ay: "Aymara",
    az: "Azerbaijani",
    bm: "Bambara",
    ba: "Bashkir",
    eu: "Basque",
    be: "Belarusian",
    bn: "Bengali",
    bi: "Bislama",
    nb: "Norwegian Bokmål",
    bs: "Bosnian",
    br: "Breton",
    bg: "Bulgarian",
    my: "Burmese",
    es: "Spanish",
    ca: "Valencian",
    km: "Central Khmer",
    ch: "Chamorro",
    ce: "Chechen",
    ny: "Nyanja",
    zh: "Chinese",
    za: "Zhuang",
    cu: "Old Slavonic",
    cv: "Chuvash",
    kw: "Cornish",
    co: "Corsican",
    cr: "Cree",
    hr: "Croatian",
    cs: "Czech",
    da: "Danish",
    dv: "Maldivian",
    nl: "Flemish",
    dz: "Dzongkha",
    en: "English",
    eo: "Esperanto",
    et: "Estonian",
    ee: "Ewe",
    fo: "Faroese",
    fj: "Fijian",
    fi: "Finnish",
    fr: "French",
    ff: "Fulah",
    gd: "Scottish Gaelic",
    gl: "Galician",
    lg: "Ganda",
    ka: "Georgian",
    de: "German",
    ki: "Kikuyu",
    el: "Greek, Modern (1453-)",
    kl: "Kalaallisut",
    gn: "Guarani",
    gu: "Gujarati",
    ht: "Haitian Creole",
    ha: "Hausa",
    he: "Hebrew",
    hz: "Herero",
    hi: "Hindi",
    ho: "Hiri Motu",
    hu: "Hungarian",
    is: "Icelandic",
    io: "Ido",
    ig: "Igbo",
    id: "Indonesian",
    ia: "Interlingua (International Auxiliary Language Association)",
    ie: "Occidental",
    iu: "Inuktitut",
    ik: "Inupiaq",
    ga: "Irish",
    it: "Italian",
    ja: "Japanese",
    jv: "Javanese",
    kn: "Kannada",
    kr: "Kanuri",
    ks: "Kashmiri",
    kk: "Kazakh",
    rw: "Kinyarwanda",
    ky: "Kyrgyz",
    kv: "Komi",
    kg: "Kongo",
    ko: "Korean",
    kj: "Kwanyama",
    ku: "Kurdish",
    lo: "Lao",
    la: "Latin",
    lv: "Latvian",
    lb: "Luxembourgish",
    li: "Limburgish",
    ln: "Lingala",
    lt: "Lithuanian",
    lu: "Luba-Katanga",
    mk: "Macedonian",
    mg: "Malagasy",
    ms: "Malay",
    ml: "Malayalam",
    mt: "Maltese",
    gv: "Manx",
    mi: "Maori",
    mr: "Marathi",
    mh: "Marshallese",
    ro: "Romanian",
    mn: "Mongolian",
    na: "Nauru",
    nv: "Navajo",
    nd: "North Ndebele",
    nr: "South Ndebele",
    ng: "Ndonga",
    ne: "Nepali",
    se: "Northern Sami",
    no: "Norwegian",
    nn: "Nynorsk, Norwegian",
    ii: "Sichuan Yi",
    oc: "Occitan (post 1500)",
    oj: "Ojibwa",
    or: "Oriya",
    om: "Oromo",
    os: "Ossetic",
    pi: "Pali",
    pa: "Punjabi",
    ps: "Pushto",
    fa: "Persian",
    pl: "Polish",
    pt: "Portuguese",
    qu: "Quechua",
    rm: "Romansh",
    rn: "Rundi",
    ru: "Russian",
    sm: "Samoan",
    sg: "Sango",
    sa: "Sanskrit",
    sc: "Sardinian",
    sr: "Serbian",
    sn: "Shona",
    sd: "Sindhi",
    si: "Sinhalese",
    sk: "Slovak",
    sl: "Slovenian",
    so: "Somali",
    st: "Sotho, Southern",
    su: "Sundanese",
    sw: "Swahili",
    ss: "Swati",
    sv: "Swedish",
    tl: "Tagalog",
    ty: "Tahitian",
    tg: "Tajik",
    ta: "Tamil",
    tt: "Tatar",
    te: "Telugu",
    th: "Thai",
    bo: "Tibetan",
    ti: "Tigrinya",
    to: "Tonga (Tonga Islands)",
    ts: "Tsonga",
    tn: "Tswana",
    tr: "Turkish",
    tk: "Turkmen",
    tw: "Twi",
    ug: "Uyghur",
    uk: "Ukrainian",
    ur: "Urdu",
    uz: "Uzbek",
    ve: "Venda",
    vi: "Vietnamese",
    vo: "Volapük",
    wa: "Walloon",
    cy: "Welsh",
    fy: "Western Frisian",
    wo: "Wolof",
    xh: "Xhosa",
    yi: "Yiddish",
    yo: "Yoruba",
    zu: "Zulu",
};

/**
 * Returns the name of a language given its ISO 639-1 code.
 *
 * @param {string} code - The ISO 639-1 code of the language.
 *
 * @returns {string} The name of the language corresponding to the given code, or the code itself if the code is not found.
 */
function getLanguageByCode(code) {
    return iso639_1[code.toLowerCase()] || code;
}

// @ts-check

/**
 * Gets the browser name and version.
 *
 * @param {string} [userAgent=window.navigator.userAgent] The user agent string.
 * @returns {string} The browser name and version, or "Unknown" if it could not be determined.
 */
function getBrowser(userAgent = window.navigator.userAgent) {
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
function isWebview(
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
async function isIncognitoMode() {
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
function getBrowserLanguage() {
    let langISO = window.navigator.language;
    let langName = iso639_1[langISO];
    if (langName) {
        return langName;
    } else {
        return langISO;
    }
}

// @ts-check


/**
 * Gets the user's current time zone.
 *
 * @returns {string} The user's current time zone. If the time zone could not be found, returns "Unknown".
 */
function getTimeZone() {
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
function getLanguages() {
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

export { getAndroidDeviceNameFromUserAgent, getBrowser, getBrowserLanguage, getCountryByCode, getDeviceModel, getDeviceType, getIosDeviceName, getLanguageByCode, getLanguages, getOS, getTimeZone, isIPad, isIPhone, isIncognitoMode, isMac, isMobile, isPointerDevice, isSensorDevice, isWebview, isWindows11 };
