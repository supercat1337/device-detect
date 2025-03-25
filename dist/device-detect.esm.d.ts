/**
 * Gets the device name from the user agent string.
 * @returns {string} The device name, or "" if it could not be determined.
 */
export function getAndroidDeviceNameFromUserAgent(userAgent?: string): string;
/**
 * Gets the browser name and version.
 *
 * @param {string} [userAgent=window.navigator.userAgent] The user agent string.
 * @returns {string} The browser name and version, or "Unknown" if it could not be determined.
 */
export function getBrowser(userAgent?: string): string;
/**
 * Gets the language of the browser in a human-readable format.
 *
 * @returns {string} The browser language, or the ISO 639-1 language code if the language is not supported.
 */
export function getBrowserLanguage(): string;
/**
 * Returns the full name of a country given its ISO 3166-1 alpha-2 code.
 *
 * @param {string} two_letter_code - The ISO 3166-1 alpha-2 code of the country.
 *
 * @returns {string} The name of the country.
 */
export function getCountryByCode(two_letter_code: string): string;
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
export function getDeviceModel(): Promise<string>;
/**
 * Gets the device type (Tablet, Mobile, Desktop) of the current device.
 *
 * @returns {string} The device type.
 */
export function getDeviceType(): string;
/**
 * Gets the device name from the screen resolution.
 * @returns {string} The device name, or "" if it could not be determined.
 */
export function getIosDeviceName(): string;
/**
 * Returns the name of a language given its ISO 639-1 code.
 *
 * @param {string} code - The ISO 639-1 code of the language.
 *
 * @returns {string} The name of the language corresponding to the given code, or undefined if the code is not found.
 */
export function getLanguageByCode(code: string): string;
/**
 * Gets the languages supported by the browser.
 *
 * @returns {string[]} An object containing the default language and an array of supported languages.
 */
export function getLanguages(): string[];
/**
 * Gets the operating system and version.
 *
 * @returns {Promise<string>}
 */
export function getOS(userAgent?: string): Promise<string>;
/**
 * Gets the user's current time zone.
 *
 * @returns {string} The user's current time zone. If the time zone could not be found, returns "Unknown".
 */
export function getTimeZone(): string;
/**
 * Determines if the current device is an iPad.
 *
 * @returns {boolean} True if the device is identified as an iPad, false otherwise.
 */
export function isIPad(): boolean;
/**
 * Determines if the current device is an iPhone.
 *
 * @returns {boolean} True if the device is identified as an iPhone, false otherwise.
 */
export function isIPhone(): boolean;
/**
 * Asynchronously checks if the browser is in incognito or private mode.
 *
 * @returns {Promise<boolean>} A promise that resolves to true if the browser is in incognito mode, false otherwise.
 */
export function isIncognitoMode(): Promise<boolean>;
/**
 * Determines if the current device is a desktop Apple device (e.g. iMac, MacBook).
 *
 * @returns {boolean} True if the device is identified as a desktop Apple device, false otherwise.
 */
export function isMac(): boolean;
/**
 * Checks if the browser is running on a mobile device.
 *
 * @returns {boolean} True if the browser is running on a mobile device, false otherwise.
 */
export function isMobile(): boolean;
/**
 * Determines if the device is a pointer device with fine pointing capabilities.
 *
 * @returns {boolean} True if the device is a pointer device with fine pointing capabilities, false otherwise.
 */
export function isPointerDevice(): boolean;
/**
 * Determines if the device is a sensor device with coarse pointing capabilities.
 *
 * @returns {boolean} True if the device is a sensor device with coarse pointing capabilities, false otherwise.
 */
export function isSensorDevice(): boolean;
/**
 * Checks if the browser is running in a webview.
 *
 * @returns {boolean} True if the browser is running in a webview, false otherwise.
 */
export function isWebview(userAgent?: string): boolean;
/**
 * Asynchronously checks if the operating system is Windows 11.
 *
 * @returns {Promise<boolean>} A promise that resolves to true if the operating system is Windows 11, false otherwise.
 */
export function isWindows11(): Promise<boolean>;
//# sourceMappingURL=device-detect.esm.d.ts.map