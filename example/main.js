// @ts-check

import {
    getEnvironment,
    isPointerDevice,
    isSensorDevice,
    isWebview,
    getBrowserLanguage,
} from '@supercat1337/device-detect';

/**
 * Converts an HTML string to a DocumentFragment.
 * @param {string} html
 */
export function createFromHTML(html) {
    if (typeof html !== 'string') throw new Error('html must be a string');
    const template = document.createElement('template');
    template.innerHTML = html;
    return template.content;
}

async function main() {
    const env = await getEnvironment();
    const webview = await isWebview();
    const browserLanguage = getBrowserLanguage();

    const html = `
        <h1 class="display-6 text-center">Device</h1>
        <table class="table table-striped">
            <thead><tr><th>Name</th><th>Value</th></tr></thead>
            <tbody>
                <tr><td>Device Type</td><td>${env.device.type}</td></tr>
                <tr><td>Device Model</td><td>${env.device.model}</td></tr>
                <tr><td>OS</td><td>${env.os.name} ${env.os.version}</td></tr>
                <tr><td>Screen Resolution</td><td>${screen.width}x${screen.height}</td></tr>
                <tr><td>Pointer Device</td><td>${isPointerDevice() ? 'Yes' : 'No'}</td></tr>
                <tr><td>Sensor Device</td><td>${isSensorDevice() ? 'Yes' : 'No'}</td></tr>
            </tbody>
        </table>

        <h1 class="display-6 text-center">Browser</h1>
        <table class="table table-striped">
            <thead><tr><th>Name</th><th>Value</th></tr></thead>
            <tbody>
                <tr><td>User Agent</td><td>${navigator.userAgent}</td></tr>
                <tr><td>Browser</td><td>${env.browser.name} ${env.browser.version}</td></tr>
                <tr><td>Browser language</td><td>${browserLanguage}</td></tr>
                <tr><td>Webview</td><td>${webview ? 'Yes' : 'No'}</td></tr>
            </tbody>
        </table>

        <h1 class="display-6 text-center">Locale information</h1>
        <table class="table table-striped mb-5">
            <thead><tr><th>Name</th><th>Value</th></tr></thead>
            <tbody>
                <tr><td>Languages</td><td>${env.locale.languages.join(', ')}</td></tr>
                <tr><td>Time Zone</td><td>${env.locale.timeZone}</td></tr>
            </tbody>
        </table>
    `;

    document.body.appendChild(createFromHTML(html));
}

await main();
