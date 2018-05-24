const Qrcodesvg = require('../../lib/index.js')

const svg = new Qrcodesvg('Hello!', 400, { ecclevel: 1 }).generate()

document.getElementById('qrcode').innerHTML = svg
