# device-detect

**A modern, SSR‑ready JavaScript library for detecting browser, device, OS, locale, and privacy features.**

[![npm version](https://img.shields.io/npm/v/@supercat1337/device-detect)](https://www.npmjs.com/package/@supercat1337/device-detect)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## Overview

`device-detect` gives you reliable information about your user’s environment using a combination of **User‑Agent parsing**, **Client Hints**, and **modern browser APIs**. It works in the browser and is safe for **server‑side rendering (SSR)**.

Key capabilities:

- **Device**: model name (e.g., "iPhone 14 Pro", "SM‑S911B"), type (mobile/tablet/desktop), touch/pointer support.
- **OS**: name and version (Windows 11, macOS 14, Android 13, iOS 17…).
- **Browser**: name, version, webview detection (Instagram, Facebook, Telegram, etc.).
- **Locale**: time zone, list of preferred languages with human‑readable names.
- **Async & Sync APIs**: most detection functions are asynchronous (use `await`) for accuracy, some are synchronous.

---

## Live Demo

[See it in action →](https://supercat1337.github.io/device-detect/example/index.html)

---

## Installation

```bash
npm install @supercat1337/device-detect
```

---

## Quick Start

The easiest way to get all information at once is `getEnvironment()`:

```javascript
import { getEnvironment } from '@supercat1337/device-detect';

async function showEnvironment() {
    const env = await getEnvironment();
    console.log(env);
    /*
    {
      browser: { name: "Chrome", version: "122.0.0.0" },
      os: { name: "Windows", version: "11" },
      device: { model: "Desktop", type: "desktop" },
      locale: {
        timeZone: "Europe/London",
        languages: ["English", "Russian (Russia)"]
      }
    }
    */
}
```

You can also use individual functions:

```javascript
import {
    getBrowser,
    getOS,
    getDeviceModel,
    isMobile,
    getTimeZone,
    getLanguages,
} from '@supercat1337/device-detect';

async function example() {
    const browser = await getBrowser(); // "Chrome 122.0.0.0"
    const os = await getOS(); // "Windows 11"
    const model = await getDeviceModel(); // "SM-S911B" or "iPhone 14 Pro"
    const mobile = isMobile(); // true/false (synchronous)
    const tz = getTimeZone(); // "America/New_York"
    const langs = getLanguages(); // ["English", "French (France)"]
}
```

---

## API Reference

### Main function

#### `getEnvironment(displayLocale?, customUserAgent?): Promise<EnvironmentInfo>`

Returns a structured object with all detected information.

- `displayLocale` – optional BCP47 tag (e.g. `"ru"`) to localise language/country names.
- `customUserAgent` – override User‑Agent string (useful for SSR).

```typescript
interface EnvironmentInfo {
    browser: { name: string; version: string };
    os: { name: string; version: string };
    device: { model: string; type: 'desktop' | 'tablet' | 'mobile' };
    locale: { timeZone: string; languages: string[] };
}
```

### Individual functions (asynchronous)

| Function                     | Returns            | Description                                            |
| ---------------------------- | ------------------ | ------------------------------------------------------ |
| `getBrowser(userAgent?)`     | `Promise<string>`  | Browser name + version (e.g., `"Chrome 122"`)          |
| `getOS(userAgent?)`          | `Promise<string>`  | OS name + version (e.g., `"Windows 11"`, `"iOS 17.4"`) |
| `getDeviceModel(userAgent?)` | `Promise<string>`  | Specific device model or `"Desktop"` / `"Unknown"`     |
| `isWebview(userAgent?)`      | `Promise<boolean>` | Running inside a webview (Instagram, Telegram, etc.)   |
| `isWindows11()`              | `Promise<boolean>` | Windows 11 detection using Client Hints                |

### Synchronous functions

| Function                                           | Returns                             | Description                                                            |
| -------------------------------------------------- | ----------------------------------- | ---------------------------------------------------------------------- |
| `getDeviceType(userAgent?)`                        | `"desktop" \| "tablet" \| "mobile"` | Device category                                                        |
| `isMobile(userAgent?)`                             | `boolean`                           | Mobile phone (excluding tablets)                                       |
| `isTablet(userAgent?)`                             | `boolean`                           | Tablet detection                                                       |
| `isIPhone(userAgent?)`                             | `boolean`                           | iPhone or iPod                                                         |
| `isIPad(userAgent?)`                               | `boolean`                           | iPad (including modern iPads masking as Mac)                           |
| `isMac(userAgent?)`                                | `boolean`                           | Apple desktop computer                                                 |
| `isPointerDevice()`                                | `boolean`                           | Fine pointer (mouse/stylus) available                                  |
| `isSensorDevice()`                                 | `boolean`                           | Touchscreen available                                                  |
| `getTimeZone()`                                    | `string`                            | IANA time zone (e.g., `"Europe/Moscow"`)                               |
| `getLanguages(displayLocale?, fallbackLanguages?)` | `string[]`                          | Human‑readable language list (e.g., `["English", "Russian (Russia)"]`) |
| `getBrowserLanguage(localeName?)`                  | `string`                            | Browser’s primary language name (e.g., `"English"`)                    |
| `getAndroidDeviceName(userAgent?)`                 | `Promise<string>`                   | Android marketing name (e.g., `"SM-S911B"`)                            |
| `getAppleDeviceModel(userAgent?)`                  | `Promise<string>`                   | Apple device model (e.g., `"iPhone 15 Pro"`)                           |

> **Note:** `getCountryName` is not included in `getEnvironment` – use it separately if needed.

---

## SSR (Server‑Side Rendering)

All functions gracefully handle environments without `window` or `navigator`.  
When used on the server, they return safe default values (e.g., `"Unknown"`, `false`, `"UTC"`).  
For accurate results, pass a `customUserAgent` string (from your server request) to the relevant functions.

```javascript
// Next.js / Nuxt example
const ua = req.headers['user-agent'];
const env = await getEnvironment(undefined, ua);
```

---

## Browser Support

Works in all modern browsers (Chrome, Firefox, Safari, Edge, Opera).  
Some advanced features require newer APIs:

- **Client Hints** – Chromium‑based browsers, Safari (partial), Firefox (planned).
- **Intl.DisplayNames** – required for human‑readable language names (polyfill available for very old browsers).

Legacy Internet Explorer is **not supported**.

---

## License

MIT
