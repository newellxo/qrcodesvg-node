/* eslint class-methods-use-this: ["error", { "exceptMethods": ["_clone"] }] */

const qrEncoder = require('qr-encoder')
const svgBuilder = require('svg-builder')
const Square = require('./square')

class Qrcodesvg {

  constructor(input, svgSize, options) {
    if (!input) throw new Error('no input set')
    if (!svgSize) throw new Error('no size set')

    this.options = options || {}
    this.svgSize = svgSize
    this.svgFrameSize = 0
    this.bitMatrix = qrEncoder.encode(input, this.options.ecclevel || 1)

    this.svg = svgBuilder.reset().width(svgSize).height(svgSize)

    // clone the bitMatrix as a working copy
    // it'll be used to attach each adjacent bits together
    // and thus creating patterns
    this.workingCopyMatrix = this._clone(this.bitMatrix)

    this.patterns = []

    this._detectPatterns()
  }

  /**
     * Getters/Setters
     */

  get options() { return this._options }
  get svgSize() { return this._svgSize }
  get svgFrameSize() { return this._svgFrameSize }
  get bitMatrix() { return this._bitMatrix }
  get workingCopyMatrix() { return this._workingCopyMatrix }
  get svg() { return this._svg }
  get patterns() { return this._patterns }
  get patternInConstruction() { return this._patternInConstruction }
  get drawMethod() { return this._drawMethod }

  set options(newOption) { this._options = newOption }
  set svgSize(newSvgSize) { this._svgSize = newSvgSize }
  set svgFrameSize(newSvgFrameSize) { this._svgFrameSize = newSvgFrameSize }
  set bitMatrix(newbitMatrix) { this._bitMatrix = newbitMatrix }
  set workingCopyMatrix(newWorkingCopyMatrix) { this._workingCopyMatrix = newWorkingCopyMatrix }
  set svg(newSvg) { this._svg = newSvg }
  set patterns(newPatterns) { this._patterns = newPatterns }
  set patternInConstruction(newPatternInConstruction) {
    this._patternInConstruction = newPatternInConstruction
  }
  set drawMethod(newDrawMethod) { this._drawMethod = newDrawMethod }


  _clone(obj) {
    return JSON.parse(JSON.stringify(obj))
  }

  /**
     * check if a square will be drawn at this coords
     * @param int x
     * @param int y
     */
  _squareExists(x, y) {
    try {
      return (this.bitMatrix[y][x] === 1)
    } catch (err) {
      return false
    }
  }

  /**
     * group squares with common sides and add them to patterns array
     */
  _detectPatterns() {
    // loop on Map
    for (let i = 0; i < this.workingCopyMatrix.length; i += 1) {
      for (let j = 0; j < this.workingCopyMatrix[i].length; j += 1) {
        // if a square is found, start detecting a pattern
        if (this.workingCopyMatrix[i][j] === 1) {
          if (this.options.eye === 'circle') {
            this.patternInConstruction = [new Square(j, i)]
          } else {
            this.patternInConstruction = []
            this._detectX(i, j)
          }
          this.patterns.push(this.patternInConstruction)
        }
      }
    }
  }

  /**
     * detect adjacent square on Y-axis
     * @param int   i
     * @param int   j
     */
  _detectY(i, j) {
    let y1 = -1

    while (y1 < 2) {

      if ((i + y1) >= 0 && this.workingCopyMatrix[i + y1] !== undefined) {
        if (this.workingCopyMatrix[i + y1][j] === 1) {

          this.patternInConstruction.push(new Square(j, i + y1))

          // this bit 1 is now part of a pattern
          // remove trace of its trace into the matrix
          this.workingCopyMatrix[i + y1][j] = 0

          if ((i + y1) !== i) {
            this._detectY(i + y1, j)
          }
          this._detectX(i + y1, j)
        }
      }
      y1 += 1
    }
  }

  /**
     * detect adjacent square on x-axis
     * @param int   i
     * @param int   j
     */
  _detectX(i, j) {
    let x1 = -1

    while (x1 < 2) {
      if ((j + x1) >= 0 && this.workingCopyMatrix[i][j + x1] !== undefined) {
        if (this.workingCopyMatrix[i][j + x1] === 1) {
          this.patternInConstruction.push(new Square(j + x1, i))

          // this bit 1 is now part of a pattern
          // remove trace of its trace into the matrix
          this.workingCopyMatrix[i][j + x1] = 0

          if ((j + x1) !== j) {
            this._detectX(i, j + x1)
          }
          this._detectY(i, j + x1)
        }
      }
      x1 += 1
    }
  }


  static _defaultPathAttributes() {
    // by default stroke && fill of a path
    // are black
    return {
      fill: '#000000',
      'stroke-width': 1,
      stroke: '#000000'
    }
  }

  _calculateSquareSize() {
    // square size equals (final svg size - frame border size) divide
    // by the number of squares on one line
    return (this.svgSize - (this.svgFrameSize * 2)) / (this.bitMatrix.length)
  }

  _generateCircle(settings, attributes) {

    const fillColors = settings['fill-colors']

    // pixel size of a square
    const squareSize = this._calculateSquareSize()
    const radius = (squareSize / 20) * settings.radius
    let color

    for (let i = 0; i < this.patterns.length; i += 1) {

      // choose a color here if a list is set and scope is pattern
      if (fillColors && settings['fill-colors-scope'] !== 'square') {
        // use modulo for applying a color
        color = fillColors[i % fillColors.length]
      }

      // loop on squares inside a pattern
      for (let j = 0; j < this.patterns[i].length; j += 1) {
        const square = this.patterns[i][j]

        const topLeftPointX = (square.matrixX * squareSize) + this.svgFrameSize
        const topLeftPointY = (square.matrixY * squareSize) + this.svgFrameSize
        const cx = topLeftPointX + (squareSize / 2)
        const cy = topLeftPointY + (squareSize / 2)

        const circleAttributes = {
          r: radius,
          fill: '#000000',
          'stroke-width': 1,
          stroke: '#000000',
          cx,
          cy
        }

        if (fillColors && settings['fill-colors-scope'] === 'square') {
          color = fillColors[j % fillColors.length]
        }

        if (color) {
          circleAttributes.fill = color

          if (circleAttributes.stroke === undefined && circleAttributes['stroke-width']) {
            circleAttributes.stroke = color
          }

        }

        this.svg.circle(circleAttributes)
      }
    }
    return this.svg.render()
  }

  /**
     * Generate an svg image
     * @param object settings
     * @param object attributes of svg element
     * @return string svg
     */
  generate(settings, attributes) {

    if (settings.method === 'circle') {
      return this._generateCircle(settings, attributes)
    }

    let color // color in use
    let square

    if (!settings) settings = {}

    if (!attributes) attributes = this._defaultPathAttributes()

    // array of colors use to fill pattern or square
    const fillColors = settings['fill-colors']
    // pixel size of a square
    const squareSize = this._calculateSquareSize()

    // loop on patterns
    for (let i = 0; i < this.patterns.length; i += 1) {

      // choose a color here if a list is set and scope is pattern
      if (fillColors && settings['fill-colors-scope'] !== 'square') {
        // use modulo for applying a color
        color = fillColors[i % fillColors.length]
      }

      // loop on squares inside a pattern
      for (let j = 0; j < this.patterns[i].length; j += 1) {
        const pathAttributes = this._clone(attributes)

        if (fillColors && settings['fill-colors-scope'] === 'square') {
          color = fillColors[j % fillColors.length]
        }

        square = this.patterns[i][j]

        square.hasSquareAbove = this._squareExists(square.matrixX, square.matrixY - 1)
        square.hasSquareOnRight = this._squareExists(square.matrixX + 1, square.matrixY)
        square.hasSquareBelow = this._squareExists(square.matrixX, square.matrixY + 1)
        square.hasSquareOnLeft = this._squareExists(square.matrixX - 1, square.matrixY)

        square.size = squareSize

        if (color) {
          pathAttributes.fill = color

          if (pathAttributes.stroke === undefined && pathAttributes['stroke-width']) {
            pathAttributes.stroke = color
          }

        }

        pathAttributes.d = this.generatePathData(square, settings)

        this.svg.path(pathAttributes)
      }
    }
    return this.svg.render()
  }

  /**
     * returns data string of a square represetation
     * using path syntax
     */
  generatePathData(square, settings) {
    const drawingMethod = settings.method || 'classic'

    switch (drawingMethod) {
      case 'classic':
        return this._generateSquarePath(square, settings)
      case 'round':
        return this._generateRoundedSquarePath(square, settings)
      case 'bevel':
        return this._generateBeveledSquarePath(square, settings)
      default:
        throw new Error('Drawing method not found')
    }
  }


  _generateSquarePath(square, settings) {
    settings.radius = 0

    return this._generateRoundedSquarePath(square, settings)
  }

  _generateRoundedSquarePath(square, settings) {
    const isCircle = (this.options.eye === 'circle')

    let topLeftPointX = (square.matrixX * square.size) + this.svgFrameSize
    let topLeftPointY = (square.matrixY * square.size) + this.svgFrameSize
    const radius = (settings.radius !== undefined) ? settings.radius : 5
    let path = ' M '
    const isSquareScope = (settings.scope === 'square')
    const addEffectOnTopLeftPoint = isCircle || (isSquareScope || square.didNotShareTopLeftPoint())
    const addEffectOnTopRightPoint = isCircle || (isSquareScope || square.didNotShareTopRightPoint())
    const addEffectOnBottomRightPoint = isCircle || (isSquareScope || square.didNotShareBottomRightPoint())
    const addEffectOnBottomLeftPoint = isCircle || (isSquareScope || square.didNotShareBottomLeftPoint())

    let squareSize = square.size
    if (isCircle) {
      squareSize = square.size / 1.5
      const diff = square.size - squareSize
      topLeftPointX += (diff / 2)
      topLeftPointY += (diff / 2)
    }

    /* top left */
    path += `${(addEffectOnTopLeftPoint) ? topLeftPointX + radius : topLeftPointX},${topLeftPointY} L `

    /* top right */
    path += `${(addEffectOnTopRightPoint) ? (topLeftPointX + squareSize) - radius : topLeftPointX + squareSize},${topLeftPointY}`
    path += (!addEffectOnTopRightPoint) ? ' L ' : ` Q ${topLeftPointX + squareSize},${topLeftPointY} ${topLeftPointX + squareSize},${topLeftPointY + radius} L `


    /* bottom right */
    path += `${topLeftPointX + squareSize},${(addEffectOnBottomRightPoint) ? (topLeftPointY + squareSize) - radius : topLeftPointY + squareSize}`
    path += (!addEffectOnBottomRightPoint) ? ' L ' : ` Q ${topLeftPointX + squareSize},${topLeftPointY + squareSize} ${(topLeftPointX + squareSize) - radius},${topLeftPointY + squareSize} L `


    /* bottom left */
    path += `${(addEffectOnBottomLeftPoint) ? topLeftPointX + radius : topLeftPointX},${topLeftPointY + squareSize}`
    path += (!addEffectOnBottomLeftPoint) ? ' L ' : ` Q ${topLeftPointX},${topLeftPointY + squareSize} ${topLeftPointX},${(topLeftPointY + squareSize) - radius} L `


    /* top left */
    path += `${topLeftPointX},${(addEffectOnTopLeftPoint) ? topLeftPointY + radius : topLeftPointY}`

    path += (!addEffectOnTopLeftPoint) ? '' : ` Q ${topLeftPointX},${topLeftPointY} ${topLeftPointX + radius},${topLeftPointY}`

    path += ' Z'

    return path
  }

  _generateBeveledSquarePath(square, settings) {
    const topLeftPointX = (square.matrixX * square.size) + this.svgFrameSize
    const topLeftPointY = (square.matrixY * square.size) + this.svgFrameSize
    const radius = settings.radius || 5
    let path = ' M '
    const isSquareScope = (settings.scope === 'square')
    const addEffectOnTopLeftPoint = (isSquareScope || square.didNotShareTopLeftPoint())
    const addEffectOnTopRightPoint = (isSquareScope || square.didNotShareTopRightPoint())
    const addEffectOnBottomRightPoint = (isSquareScope || square.didNotShareBottomRightPoint())
    const addEffectOnBottomLeftPoint = (isSquareScope || square.didNotShareBottomLeftPoint())
    const coords = []

    coords.push([(addEffectOnTopLeftPoint) ? topLeftPointX + radius : topLeftPointX, topLeftPointY])
    coords.push([(addEffectOnTopRightPoint) ? (topLeftPointX + square.size) - radius : topLeftPointX + square.size, topLeftPointY])

    if (addEffectOnTopRightPoint) {
      coords.push([topLeftPointX + square.size, topLeftPointY + radius])
    }

    coords.push([topLeftPointX + square.size, (addEffectOnBottomRightPoint) ? (topLeftPointY + square.size) - radius : topLeftPointY + square.size])

    if (addEffectOnBottomRightPoint) {
      coords.push([(topLeftPointX + square.size) - radius, topLeftPointY + square.size])
    }

    coords.push([(addEffectOnBottomLeftPoint) ? topLeftPointX + radius : topLeftPointX, topLeftPointY + square.size])

    if (addEffectOnBottomLeftPoint) {
      coords.push([topLeftPointX, topLeftPointY + square.size - radius])
    }

    coords.push([topLeftPointX, (addEffectOnTopLeftPoint) ? topLeftPointY + radius : topLeftPointY])

    if (addEffectOnTopLeftPoint) {
      coords.push([topLeftPointX + radius, topLeftPointY])
    }

    for (let i = 0; i < coords.length; i += 1) {
      path += `${coords[i][0]} ${coords[i][1]} `

      path += (i !== coords.length - 1) ? 'L' : 'Z'
    }

    return path
  }


  /**
     * set the background of the qrCode
     * @param object settings for customized element
     * @param object attributes of the svg element
     */
  background(pSettings, pAttributes) {

    if (!pSettings && !pAttributes) {
      throw new Error('background method needs at least settings or attributes')
    }

    let msize = this.svgSize
    const settings = pSettings || {}
    const attributes = pAttributes || {}
    const stroke = attributes['stroke-width'] || 0
    const padding = settings.padding || 0
    const margin = settings.margin || 0

    this.svgFrameSize = stroke + padding + margin

    if (stroke) msize -= stroke
    if (margin) msize -= margin * 2

    const x = (stroke) ? stroke / 2 : 0
    const y = (stroke) ? stroke / 2 : 0

    attributes.x = x + margin
    attributes.y = y + margin
    attributes.width = msize
    attributes.height = msize

    this.svg.rect(attributes)

    return this
  }
}

module.exports = Qrcodesvg
