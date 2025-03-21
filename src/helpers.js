// @ts-check

// parser for https://yesviz.com/iphones.php
function parseIphoneViewportData(tbody) {
    let rows = tbody.querySelectorAll("tr");
    let data = {};
    for (let i = 0; i < rows.length; i++) {
        let row = rows[i];
        let cells = row.querySelectorAll("td");
        let resolution = cells[1].textContent.trim().replace(/\s/g, "");
        let device = cells[0].textContent
            .trim()
            .replace(/Apple\s+Iphone\s+/i, "");
        if (!data[resolution]) {
            data[resolution] = "iPhone " + device;
        } else {
            data[resolution] += ", " + device;
        }
    }

    let result = [];
    for (let key in data) {
        result.push([key, data[key]]);
    }
    return result;
}

// parser for https://www.peeayecreative.com/docs/divi-responsive-helper/popular-device-viewport-sizes/
function parseIpadViewportData(tbody) {
    let rows = tbody.querySelectorAll("tr");
    let data = {};
    for (let i = 0; i < rows.length; i++) {
        let row = rows[i];
        let cells = row.querySelectorAll("td");
        let resolution = (
            cells[1].textContent.trim() +
            "x" +
            cells[2].textContent.trim()
        ).replace(/\s/g, "");
        let device = cells[0].textContent.trim();
        //.replace(/Apple\s+Ipad\s+/i, "");
        if (!data[resolution]) {
            data[resolution] = "iPad " + device;
        } else {
            data[resolution] += ", " + device;
        }
    }

    let result = [];
    for (let key in data) {
        result.push([key, data[key]]);
    }
    return result;
}
