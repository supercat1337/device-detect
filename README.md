# **device-detect**

## **Overview**

This library, `device-detect`, provides a comprehensive set of functions to determine various aspects of a user's device and environment. It can identify device types such as mobile, tablet, or desktop, and provides specific information about the device model, operating system, and browser. Additionally, it can detect the presence of touchscreens, pointer devices, and whether the browser is in incognito mode. This makes it a versatile tool for developers who need to tailor their applications based on the user's device and browser capabilities.

## **Features**

Here are the features of this library:

**Device Detection**

-   Detects whether the device is a mobile device, tablet, or desktop computer
-   Identifies the device type (e.g. iPhone, iPad, Android device)
-   Determines whether the device has a touchscreen or pointer device (e.g. mouse, trackpad)

**Browser Detection**

-   Detects the browser type (e.g. Chrome, Firefox, Safari)
-   Identifies the browser version
-   Determines whether the browser is running in incognito mode

**Operating System Detection**

-   Detects the operating system (e.g. Windows, macOS, Linux)
-   Identifies the operating system version
-   Determines whether the operating system is Windows 11

**Language and Time Zone Detection**

-   Detects the user's language preferences
-   Identifies the user's time zone

**User Agent Parsing**

-   Parses the user agent string to extract device and browser information
-   Provides a convenient API for accessing device and browser properties

**Utility Functions**

-   Provides utility functions for working with user agent strings and device detection
-   Includes functions for detecting specific devices, browsers, and operating systems

**ESM Support**

-   Supports ES6 modules (ESM) for easy integration with modern web applications

## **Live Demo**

Check out the [live demo](https://supercat1337.github.io/device-detect/example/index.html) to see `device-detect` in action!

## **Usage**

```javascript
import {
    getAndroidDeviceNameFromUserAgent,
    getBrowser,
    getDeviceModel,
    getIosDeviceName,
    getLanguages,
    getOS,
    getTimeZone,
    isIPad,
    isIPhone,
    isMac,
    isIncognitoMode,
    isMobile,
    isPointerDevice,
    isSensorDevice,
    isWebview,
    isWindows11,
    getDeviceType,
} from "@supercat1337/device-detect";

async function main() {
    console.log("User Agent", window.navigator.userAgent);

    console.log("Device Type", getDeviceType());
    console.log("Android Device Name", getAndroidDeviceNameFromUserAgent());
    console.log("Browser", getBrowser());
    console.log("Device Model", await getDeviceModel());
    console.log("Ios Device Name", getIosDeviceName());
    console.log("Languages", JSON.stringify(getLanguages()));
    console.log("OS", await getOS());
    console.log("Time Zone", getTimeZone());
    console.log("Incognito Mode", await isIncognitoMode());
    console.log("Mobile", isMobile());
    console.log("Pointer Device", isPointerDevice());
    console.log("Sensor Device", isSensorDevice());
    console.log("Webview", isWebview());
    console.log("Windows 11", await isWindows11());
    console.log("IPad", isIPad());
    console.log("IPhone", isIPhone());
    console.log("Mac", isMac());
}

await main();
```

# **API Documentation**

Here is the API documentation for the exported functions:

## **getAndroidDeviceNameFromUserAgent**

### Description

Gets the device name from the user agent string.

### Parameters

-   `userAgent` (string): The user agent string. Defaults to `window.navigator.userAgent`.

### Returns

-   `string`: The device name, or an empty string if it could not be determined.

## **getBrowser**

### Description

Gets the browser name and version.

### Parameters

-   `userAgent` (string): The user agent string. Defaults to `window.navigator.userAgent`.

### Returns

-   `string`: The browser name and version, or "Unknown" if it could not be determined.

### Example

```javascript
const browser = getBrowser();
console.log(browser); // e.g. "Chrome 90.0.4430.212"
```

## **getDeviceModel**

### Description

Asynchronously determines the device model name.

### Returns

-   `Promise<string>`: A promise that resolves to the device model name, or "-" if it could not be determined.

### Example

```javascript
getDeviceModel().then((deviceModel) => {
    console.log(deviceModel); // e.g. "iPhone 13 Pro"
});
```

## **getDeviceType**

### Description

Gets the device type (Tablet, Mobile, Desktop) of the current device.

### Returns

-   `string`: The device type (e.g. "Tablet", "Mobile", "Desktop").

### Example

```javascript
const deviceType = getDeviceType();
console.log(deviceType); // e.g. "Mobile"
```

# **getIosDeviceName**

### Description

Gets the device name from the screen resolution.

### Returns

-   `string`: The device name, or an empty string if it could not be determined.

### Example

```javascript
const deviceName = getIosDeviceName();
console.log(deviceName); // e.g. "iPhone 12 Pro"
```

## **getLanguages**

### Description

Gets the languages supported by the browser.

### Returns

-   `string[]`: Gets the languages supported by the browser.

### Example

```javascript
const languages = getLanguages();
console.log(languages); // e.g. ["English (United States of America)", "Russian (Russian Federation)"]
```

## **getOS**

### Description

Async function that gets the operating system and version.

### Returns

-   `Promise<string>`: The operating system and version.

### Example

```javascript
const os = await getOS();
console.log(os); // e.g. "Windows 10"
```

## **getTimeZone**

### Description

Gets the user's current time zone.

### Returns

-   `string`: The user's current time zone, or "Unknown" if it could not be determined.

### Example

```javascript
const timeZone = getTimeZone();
console.log(timeZone); // e.g. "America/New_York"
```

## **isIncognitoMode**

### Description

Asynchronously checks if the browser is in incognito mode.

### Returns

-   `Promise<boolean>`: A promise that resolves to `true` if the browser is in incognito mode, `false` otherwise.

### Example

```javascript
isIncognitoMode().then((isIncognito) => {
    console.log(isIncognito); // e.g. true
});
```

## **isMac**

### Description

Determines if the current device is a Mac.

### Returns

-   `boolean`: `true` if the device is a Mac, `false` otherwise.

### Example

```javascript
const isAppleDesktop = isMac();
console.log(isAppleDesktop); // e.g. true
```

## **isIPad**

### Description

Determines if the current device is an iPad.

### Returns

-   `boolean`: `true` if the device is an iPad, `false` otherwise.

### Example

```javascript
const is_IPad = isIPad();
console.log(is_IPad); // e.g. true
```

## **isIPhone**

### Description

Determines if the current device is an iPhone.

### Returns

-   `boolean`: `true` if the device is an iPhone, `false` otherwise.

### Example

```javascript
const is_IPhone = isIPhone();
console.log(is_IPhone); // e.g. true
```

## **isMobile**

### Description

Checks if the browser is running on a mobile device.

### Returns

-   `boolean`: `true` if the browser is running on a mobile device, `false` otherwise.

### Example

```javascript
const isMobile = isMobile();
console.log(isMobile); // e.g. true
```

## **isPointerDevice**

### Description

Determines if the device is a pointer device with fine pointing capabilities.

### Returns

-   `boolean`: `true` if the device is a pointer device, `false` otherwise.

### Example

```javascript
console.log(isPointerDevice()); // e.g. true
```

## **isSensorDevice**

### Description

Determines if the device is a sensor device.

### Returns

-   `boolean`: `true` if the device is a sensor device, `false` otherwise.

### Example

```javascript
console.log(isSensorDevice()); // e.g. true
```

## **isWebview**

### Description

Checks if the browser is running in a webview.

### Returns

-   `boolean`: `true` if the browser is running in a webview, `false` otherwise.

### Example

```javascript
console.log(isWebview()); // e.g. true
```

## **isWindows11**

### Description

Asynchronously checks if the operating system is Windows 11.

### Returns

-   `Promise<boolean>`: A promise that resolves to `true` if the operating system is Windows 11, `false` otherwise.

### Example

```javascript
isWindows11().then((isWin11) => {
    console.log(isWin11); // e.g. true
});
```

## **getBrowserLanguage**

### Description

Gets the language of the browser.

### Returns

-   `string`: Returns the language of the browser.

### Example

```javascript
console.log(getBrowserLanguage()); // e.g. "English"
```

## License

MIT
