/* eslint-env mocha */

import { decode, encode, create, isAlias } from '../index.js'

import { unlinkSync } from 'fs'
import { join } from 'path'
import { writeFileSync } from 'fs-temp'
import { equal, deepEqual } from 'assert'

const __dirname = import.meta.dirname

const rawData = Buffer.from(
  'AAAAAAEqAAIAAApUZXN0IFRpdGxlAAAAAAAAAAAAAAAAAAAAAADO615USCsA' +
  'BQAAABMMVGVzdEJrZy50aWZmAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' +
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFM7rXlgAAAAAAAAAAP////8A' +
  'AA0CAAAAAAAAAAAAAAAAAAAACy5iYWNrZ3JvdW5kAAABAAQAAAATAAIAJFRl' +
  'c3QgVGl0bGU6LmJhY2tncm91bmQ6AFRlc3RCa2cudGlmZgAPABYACgBUAGUA' +
  'cwB0ACAAVABpAHQAbABlABIAGS8uYmFja2dyb3VuZC9UZXN0QmtnLnRpZmYA' +
  'ABMAEy9Wb2x1bWVzL1Rlc3QgVGl0bGUA//8AAA==', 'base64'
)

describe('decode', function () {
  it('should parse a simple alias', function () {
    const info = decode(rawData)

    equal(info.version, 2)

    deepEqual(info.volume, {
      name: 'Test Title',
      created: new Date('2014-01-02T18:20:04.000Z'),
      signature: 'H+',
      type: 'other',
      abspath: '/Volumes/Test Title'
    })

    deepEqual(info.parent, {
      id: 19,
      name: '.background'
    })

    deepEqual(info.target, {
      type: 'file',
      filename: 'TestBkg.tiff',
      id: 20,
      created: new Date('2014-01-02T18:20:08.000Z'),
      path: 'Test Title:.background:',
      abspath: '/.background/TestBkg.tiff'
    })
  })
})

describe('encode', function () {
  it('should encode a simple alias', function () {
    const info = decode(rawData)
    const buf = encode(info)

    deepEqual(rawData, buf)
  })
})

describe('create', function () {
  it('should create a simple alias', function () {
    const rootDir = process.env.ROOT_VOLUME || __dirname
    const volumeName = process.platform === 'darwin' ? undefined : 'Test Volume'
    const buf = create(join(rootDir, 'basics.js'), { volumeName })
    const info = decode(buf)

    equal('file', info.target.type)
    equal('basics.js', info.target.filename)
  })
})

describe('isAlias', function () {
  let aliasFile, garbageFile

  before(function () {
    aliasFile = writeFileSync(Buffer.from('626f6f6b000000006d61726b00000000', 'hex'))
    garbageFile = writeFileSync(Buffer.from('Hello my name is Linus!'))
  })

  after(function () {
    unlinkSync(aliasFile)
    unlinkSync(garbageFile)
  })

  it('should identify alias', function () {
    equal(isAlias(aliasFile), true)
  })

  it('should identify non-alias', function () {
    equal(isAlias(garbageFile), false)
  })
})
