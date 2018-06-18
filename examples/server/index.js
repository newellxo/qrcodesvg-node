const fs = require('fs')
const Qrcodesvg = require('../../lib/index.js')

const qrcode = new Qrcodesvg('Hello', 400, { ecclevel: 2, eye: 'circle' })

// Generate SVG
const svgData = qrcode.generate(
  {
    method: 'circle',
    'fill-colors': ['#00000'],
    radius: 5
  },
  {
    'stroke-width': 0.00001
  }
)

fs.writeFile('./output.svg', svgData, function (err) {
  if (err) {
    return console.log(err)
  }
  console.log('The file was saved!')
})

// // Generate png
const PngData = qrcode.generatePNG(
  {
    method: 'circle',
    'fill-colors': ['#00000'],
    radius: 5
  },
  {
    'stroke-width': 0.00001
  }, {
    width: 400,
    height: 400
  }
)
fs.writeFile('./output.png', PngData, function (err) {
  if (err) {
    return console.log(err)
  }
  console.log('The file was saved!')
})

// Generate PNG with callback
qrcode.generatePNG(
  {
    method: 'circle',
    'fill-colors': ['#00000'],
    radius: 5
  },
  {
    'stroke-width': 0.00001
  }, {
    width: 400,
    height: 400
  }, (err, data) => {
    console.log(err, data)
  }
)
