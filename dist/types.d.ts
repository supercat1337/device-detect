// Type definitions for browser APIs not yet standardized or extended

export {};

declare global {
    interface Navigator {
        /** Brave browser exposes this property */
        brave?: {
            isBrave: () => Promise<boolean>;
        };
        /** Chromium's userAgentData API */
        userAgentData?: {
            mobile: boolean;
            brands: { brand: string; version: string }[];
            getHighEntropyValues: (hints: string[]) => Promise<Record<string, any>>;
        };
        /** Microsoft's legacy touch points */
        msMaxTouchPoints?: number;
        /** Safari's standalone mode */
        standalone?: boolean;
    }

    interface Window {
        /** IE/Edge legacy openDatabase (deprecated but used for detection) */
        openDatabase?: any;
        /** IE specific method */
        msSaveBlob?: (blob: Blob, defaultName?: string) => boolean;
    }

    // For older iOS Safari
    interface IDBRequest {
        onupgradeneeded: ((this: IDBRequest, ev: IDBVersionChangeEvent) => any) | null;
    }
}

/**
 * High-entropy values that can be requested from the User-Agent Client Hints API.
 */
export type UADataValues = {
    architecture?: string;
    bitness?: string;
    brands?: Array<{ brand: string; version: string }>;
    formFactor?: string;
    fullVersionList?: Array<{ brand: string; version: string }>;
    model?: string;
    mobile?: boolean;
    platform?: string;
    platformVersion?: string;
    wow64?: boolean;
};

/**
 * Interface for the navigator.userAgentData object (User-Agent Client Hints).
 */
export type NavigatorUAData = {
    brands: Array<{ brand: string; version: string }>;
    mobile: boolean;
    platform: string;
    getHighEntropyValues: (hints: string[]) => Promise<UADataValues>;
};

export type OSRule = {
    os: string;
    re: RegExp;
};

/**
 * Interface for Brave browser's custom navigator properties.
 */
export type BraveNavigator = {
    isBrave: () => Promise<boolean>;
};

export interface BrowserInfo {
    name: string;
    version: string;
}

export interface OSInfo {
    name: string;
    version: string;
}

export interface DeviceInfo {
    model: string;
    type: 'desktop' | 'tablet' | 'mobile';
}

export interface LocaleInfo {
    timeZone: string;
    languages: string[];
}

export interface EnvironmentInfo {
    browser: BrowserInfo;
    os: OSInfo;
    device: DeviceInfo;
    locale: LocaleInfo;
}

/**
 * Asynchronously harvests comprehensive environment, browser, device, and locale metrics.
 *
 * @param displayLocale Optional BCP 47 language tag to translate country and language names (e.g., "ru", "en").
 * @param customUserAgent Optional User-Agent string override for server-side execution.
 */
export function getEnvironment(
    displayLocale?: string,
    customUserAgent?: string
): Promise<EnvironmentInfo>;


/* From browser.d.ts */
/**
 * Asynchronously gets the browser name and version.
 *
 * @param {string} [userAgent=getSafeUserAgent()] The user agent string.
 * @returns {Promise<string>} A promise that resolves to the browser name and version, or "Unknown".
 */
export function getBrowser(userAgent?: string): Promise<string>;
/**
 * Asynchronously checks if the browser is running in a webview (embedded WebView).
 * Uses the OS detection from os.js to avoid duplication.
 *
 * @param {string} [userAgent=getSafeUserAgent().toLowerCase()] Optional user agent.
 * @returns {Promise<boolean>} True if running in a webview, false otherwise.
 */
export function isWebview(userAgent?: string): Promise<boolean>;
/**
 * Gets the human-readable name of the browser's primary language.
 *
 * @param {string} [localeName=window.navigator.language] The locale in which to return the language name.
 *                                                        Defaults to the browser's UI language.
 * @returns {string} Language name in the specified locale (e.g., "Russian" for locale 'en', "русский" for 'ru').
 */
export function getBrowserLanguage(localeName?: string): string;

/* From countries.d.ts */
/**
 * Gets the human-readable country/region name derived from the user's current locale settings.
 * Performance-optimized via a secure modern Map-based Memoization Cache.
 *
 * @param {string} [displayLocale] The locale to use for translating the country name. Defaults to the client's language.
 * @param {string} [targetLocale] Optional custom locale to extract the country from (crucial for SSR execution).
 * @returns {string} The localized country name (e.g., "United States"), a generic fallback, or an empty string.
 */
export function getCountryName(displayLocale?: string, targetLocale?: string): string;

/* From environment.d.ts */
/**
 * Asynchronously harvests comprehensive environment, browser, device, and locale metrics.
 * Fully safe for SSR (Server-Side Rendering) and performance-optimized.
 *
 * @param {string} [displayLocale] Optional BCP 47 language tag to translate country and language names (e.g., "ru", "en").
 * @param {string} [customUserAgent] Optional User-Agent string override (highly useful for SSR / backend execution).
 * @returns {Promise<EnvironmentInfo>} A promise that resolves to the unified structured environment report.
 */
export function getEnvironment(displayLocale?: string, customUserAgent?: string): Promise<EnvironmentInfo>;

/* From helpers.d.ts */
/**
 * Safely retrieves the User Agent string.
 * @returns {string} The user agent string or an empty string if not in browser.
 */
export function getSafeUserAgent(): string;
/**
 * Safely retrieves the NavigatorUAData object (User-Agent Client Hints).
 * @returns {NavigatorUAData | null} The userAgentData object or null if not supported/available.
 */
export function getSafeUserAgentData(): NavigatorUAData | null;
/**
 * Safely requests high-entropy values from User-Agent Client Hints.
 * @param {string[]} hints - Array of hint names to request (e.g., ['model', 'platformVersion']).
 * @returns {Promise<UADataValues | null>} A promise that resolves to the values or null if unsupported.
 */
export function getHighEntropyValues(hints: string[]): Promise<UADataValues | null>;
/**
 * Check if the code is executing in a client (browser) environment.
 * @type {boolean}
 */
export const isClient: boolean;
/**
 * Safe access to the navigator object.
 * @type {Navigator | null}
 */
export const safeNavigator: Navigator | null;

/* From locale-info.d.ts */
/**
 * Gets the user's current time zone.
 * Safely handles environments where Intl or TimeZone is unavailable (e.g., legacy browsers or SSR).
 *
 * @returns {string} The resolved time zone ID (e.g., "America/New_York") or "UTC" as a fallback.
 */
export function getTimeZone(): string;
/**
 * Gets the languages supported by the browser with human-readable names.
 * No duplicate region names – Intl.DisplayNames already includes region when appropriate.
 *
 * @param {string} [displayLocale] The locale to use for displaying names.
 * @param {readonly string[]} [fallbackLanguages] Optional array of language tags.
 * @returns {string[]} Array of formatted language strings.
 */
export function getLanguages(displayLocale?: string, fallbackLanguages?: readonly string[]): string[];

/* From os.d.ts */
/**
 * Gets the operating system name and version.
 *
 * @param {string} [userAgent=getSafeUserAgent()] The user agent string.
 * @returns {Promise<string>} The detected operating system name and version.
 */
export function getOS(userAgent?: string): Promise<string>;
/**
 * Asynchronously checks if the operating system is Windows 11.
 *
 * @returns {Promise<boolean>} A promise that resolves to true if the operating system is Windows 11, false otherwise.
 */
export function isWindows11(): Promise<boolean>;

/* From device\android.d.ts */
/**
 * Asynchronously gets the Android device marketing name or model.
 *
 * @param {string} [userAgent=getSafeUserAgent()] The user agent string.
 * @returns {Promise<string>} A promise that resolves to the device brand/model, or an empty string.
 */
export function getAndroidDeviceName(userAgent?: string): Promise<string>;

/* From device\apple.d.ts */
/**
 * Determines if the current device is an iPhone or iPod.
 *
 * @param {string} [userAgent=getSafeUserAgent()] The user agent string.
 * @returns {boolean} True if an iPhone is detected, false otherwise.
 */
export function isIPhone(userAgent?: string): boolean;
/**
 * Determines if the current device is an iPad.
 *
 * @param {string} [userAgent=getSafeUserAgent()] The user agent string.
 * @returns {boolean} True if an iPad is detected, false otherwise.
 */
export function isIPad(userAgent?: string): boolean;
/**
 * Determines if the current device is a desktop Apple computer (Mac).
 *
 * @param {string} [userAgent=getSafeUserAgent()] The user agent string.
 * @returns {boolean} True if a Mac is detected, false otherwise.
 */
export function isMac(userAgent?: string): boolean;
/**
 * Asynchronously gets the localized or family name of the Apple device.
 *
 * @param {string} [userAgent=getSafeUserAgent()] The user agent string.
 * @returns {Promise<string>} A promise that resolves to the Apple device name, or an empty string.
 */
export function getAppleDeviceModel(userAgent?: string): Promise<string>;

/* From device\index.d.ts */
/**
 * Gets the device type based on capabilities and User-Agent.
 *
 * @param {string} [userAgent=getSafeUserAgent()] The user agent string.
 * @returns {'tablet'|'mobile'|'desktop'} The detected device type.
 */
export function getDeviceType(userAgent?: string): "tablet" | "mobile" | "desktop";

/* From device\mobile.d.ts */
/**
 * Determines if the device is a mobile phone (excludes desktop and tablets).
 *
 * @param {string} [userAgent=getSafeUserAgent()] The user agent string.
 * @returns {boolean} True if a mobile phone is detected, false otherwise.
 */
export function isMobile(userAgent?: string): boolean;
/**
 * Determines if the device is a tablet.
 *
 * @param {string} [userAgent=getSafeUserAgent()] The user agent string.
 * @returns {boolean} True if a tablet is detected, false otherwise.
 */
export function isTablet(userAgent?: string): boolean;
/**
 * Determines if the device is either a mobile phone or a tablet.
 *
 * @param {string} [userAgent=getSafeUserAgent()] The user agent string.
 * @returns {boolean} True if mobile or tablet, false otherwise.
 */
export function isMobileOrTablet(userAgent?: string): boolean;

/* From device\model.d.ts */
/**
 * Asynchronously determines the specific device model name (e.g., "iPhone 14 Pro" or "SM-S911B").
 * Compatible with both modern Client Hints and traditional User-Agent parsing.
 *
 * @param {string} [userAgent=getSafeUserAgent()] The user agent string to parse.
 * @returns {Promise<string>} A promise that resolves to the device model name, 'Desktop', or 'Unknown'.
 */
export function getDeviceModel(userAgent?: string): Promise<string>;

/* From device\sensor-pointer.d.ts */
/**
 * Determines if the device is a sensor device with coarse pointing capabilities (touchscreen).
 * * @returns {boolean} True if the device has a touchscreen, false otherwise.
 */
export function isSensorDevice(): boolean;
/**
 * Determines if the device is a pointer device with fine pointing capabilities (mouse/stylus).
 * * @returns {boolean} True if a fine pointer is detected, false otherwise.
 */
export function isPointerDevice(): boolean;
