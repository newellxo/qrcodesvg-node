const Qrcodesvg = require('../../lib/index.js')
// Generate a Qrcode with a correction level of 2
// and affect randomly one of the colors defined to patterns
const qrcode = new Qrcodesvg('https://xosl.io/2zc3vhq?check=true', 400, { ecclevel: 2 })

const data = qrcode.generate(
  {
    method: 'round',
    'fill-colors': ['#000000'],
    radius: 6
  },
  {
    'stroke-width': 0.00001
  }
)

console.log(data)
