// @ts-check

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
    isIncognitoMode,
    isMobile,
    isPointerDevice,
    isSensorDevice,
    isWebview,
    isWindows11,
    getDeviceType,
    getBrowserLanguage,
    isMac,
} from "../dist/device-detect.esm.min.js";

/**
 * Converts an HTML string to an DocumentFragment.
 *
 * @param {string} html - The HTML string
 * @returns {DocumentFragment} - The DocumentFragment created from the HTML string
 * @throws {Error} - If no element or multiple elements are found in the HTML string
 */
export function createFromHTML(html) {
    if (typeof html !== "string") {
        throw new Error("html must be a string");
    }

    const template = document.createElement("template");
    template.innerHTML = html;
    return template.content;
}

async function main() {
    let fragment = createFromHTML(/* html */ `


<h1 class="display-6 text-center">Device</h1>
<table class="table table-striped">
    <thead>
        <tr>
            <th class="col-3">Name</th>
            <th>Value</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>Device Type</td>
            <td>${getDeviceType()}</td>
        </tr>
        <tr>
            <td>Device Model</td>
            <td>${await getDeviceModel()}</td>
        </tr>
        <tr>
            <td>OS</td>
            <td>${await getOS()}</td>
        </tr>
        <tr>
            <td>Screen Resolution</td>
            <td>${screen.width}x${screen.height}</td>
        </tr>
        <tr>
            <td>Pointer Device</td>
            <td>${isPointerDevice() ? "Yes" : "No"}</td>
        </tr>
        <tr>
            <td>Sensor Device</td>
            <td>${isSensorDevice() ? "Yes" : "No"}</td>
        </tr>
    </tbody>
</table>

<h1 class="display-6 text-center">Browser</h1>
<table class="table table-striped">
    <thead>
        <tr>
            <th class="col-3">Name</th>
            <th>Value</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>User Agent</td>
            <td>${window.navigator.userAgent}</td>
        </tr>
        <tr>
            <td>Browser</td>
            <td>${getBrowser()}</td>
        </tr>
        <tr>
            <td>Browser language</td>
            <td>${getBrowserLanguage()}</td>
        </tr>
        <tr>
            <td>Incognito Mode</td>
            <td>${(await isIncognitoMode()) ? "Yes" : "No"}</td>
        </tr>
        <tr>
            <td>Webview</td>
            <td>${isWebview() ? "Yes" : "No"}</td>
        </tr>
    </tbody>
</table>


<h1 class="display-6 text-center">Locale information</h1>
<table class="table table-striped">
    <thead>
        <tr>
            <th class="col-3">Name</th>
            <th>Value</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>Languages</td>
            <td>${getLanguages().join(", ")}</td>
        </tr>
        <tr>
            <td>Time Zone</td>
            <td>${getTimeZone()}</td>
        </tr>
    </tbody>
</table>

<h2 class="display-6 text-center">Device Specific</h2>
<table class="table table-striped mb-5">
    <thead>
        <tr>
            <th class="col-3">Name</th>
            <th>Value</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>Android Device Name</td>
            <td>${getAndroidDeviceNameFromUserAgent()}</td>
        </tr>
        <tr>
            <td>Ios Device Name (by screen size)</td>
            <td>${getIosDeviceName()}</td>
        </tr>
        <tr>
            <td>Mobile</td>
            <td>${isMobile() ? "Yes" : "No"}</td>
        </tr>
        <tr>
            <td>Windows 11</td>
            <td>${(await isWindows11()) ? "Yes" : "No"}</td>
        </tr>
        <tr>
            <td>IPad</td>
            <td>${isIPad() ? "Yes" : "No"}</td>
        </tr>
        <tr>
            <td>IPhone</td>
            <td>${isIPhone() ? "Yes" : "No"}</td>
        </tr>
        <tr>
        <td>Mac</td>
        <td>${isMac() ? "Yes" : "No"}</td>
    </tr>
    </tbody>
</table>
`);

    document.body.appendChild(fragment);
}

await main();
