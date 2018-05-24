/* global beforeEach, it, describe */

const chai = require('chai')
const Qrcodesvg = require('../lib/index.js')

chai.should()

const { expect } = chai
let qrCodeSize

beforeEach(function () {
  qrCodeSize = 100

})

describe('Qrcodesvg', function () {

  describe('constructor()', function () {

    it('needs an input', function () {
      (function () {
        Qrcodesvg()
      }).should.Throw('no input set')
    })

    it('needs a QR code size', function () {

      (function () {
        Qrcodesvg('Hello')
      }).should.Throw('no size set')
    })

  })


  describe('generate()', function () {

    it('returns a string', function () {
      const data = new Qrcodesvg('Hello', qrCodeSize).generate()

      expect(data).to.be.a('string')
      expect(data).not.to.be.empty
    })


    it('applies size', function () {
      const data = new Qrcodesvg('Hello', qrCodeSize).generate()

      const widthRegExp = new RegExp(`<svg[^>]* width=['\"]?${qrCodeSize}`, 'i')
      const heightRegExp = new RegExp(`<svg[^>]* height=['\"]?${qrCodeSize}`, 'i')

      const matchWidth = data.match(widthRegExp)
      const matchHeight = data.match(heightRegExp)

      expect(matchWidth).not.to.be.null
      expect(matchHeight).not.to.be.null

    })


    it('applies attribute', function () {
      const fillName = 'fill'
      const fillValue = '#00FF00'
      const attributes = {}

      attributes[fillName] = fillValue

      const qrcode = new Qrcodesvg('Hello', qrCodeSize)

      const data = qrcode.generate({}, attributes)

      const fillRegExp = new RegExp(`${fillName}=['\"]?${fillValue}`, 'ig')

      const matchAttribute = data.match(fillRegExp)

      expect(matchAttribute).to.be.a('array')
      expect(matchAttribute).to.have.length.above(1)

    })

    it('returns an error when drawing method doesn\'t exist', function () {
      const drawingMethod = 'make-it-like-andy-warhol-would'
      const qrcode = new Qrcodesvg('Hello', qrCodeSize);

      (function () {
        qrcode.generate({ method: drawingMethod })
      }).should.Throw('Drawing method not found')
    })


  })

  describe('background()', function () {
    it('needs settings or attributes', function () {
      const qrcode = new Qrcodesvg('Hello', qrCodeSize);

      (function () {
        qrcode.background()
      }).should.Throw('background method needs at least settings or attributes')
    })
  })

})
