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

