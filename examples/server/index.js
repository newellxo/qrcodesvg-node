const fs = require('fs')
const Qrcodesvg = require('../../lib/index.js')

const qrcode = new Qrcodesvg('Hello', 400, { ecclevel: 2, eye: 'circle' })
const data = qrcode.generate(
  {
    method: 'circle',
    'fill-colors': ['#00000'],
    radius: 5
  },
  {
    'stroke-width': 0.00001
  }
)

fs.writeFile('./output.svg', data, function (err) {
  if (err) {
    return console.log(err)
  }
  console.log('The file was saved!')
})
