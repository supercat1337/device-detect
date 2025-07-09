// @ts-check

// iso639-1
// see https://www.loc.gov/standards/iso639-2/php/English_list.php for a list of language codes
// see https://en.wikipedia.org/wiki/List_of_ISO_639_language_codes

/**
 * Parses an HTML table containing language codes and their respective names.
 *
 * The table is expected to have two columns. The first column contains the language code (ISO 639-1) and the second column contains the name of the language. The function returns a map where the keys are the language codes and the values are the names of the languages.
 *
 * @param {HTMLTableElement} table - The table to parse.
 *
 * @returns {Object<string, string>} A map containing the language codes and their respective names.
 */
function parseTable(table) {
    let tbody = table.getElementsByTagName("tbody")[0];
    let rows = tbody.getElementsByTagName("tr");

    /** @type {Object<string, string>} */
    let languages = {};

    for (let i = 1; i < rows.length; i++) {
        let columns = rows[i].getElementsByTagName("td");
        let code = columns[4].textContent.trim();
        let name = columns[0].textContent.trim();

        if (code && name) {
            languages[code] = name;
        }
    }

    return languages;
}

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

export { iso639_1, getLanguageByCode };
