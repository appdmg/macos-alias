'use strict'

const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const test = require('ava').default
const alias = require('../')

const rawData = Buffer.from(
  'AAAAAAEqAAIAAApUZXN0IFRpdGxlAAAAAAAAAAAAAAAAAAAAAADO615USCsA' +
  'BQAAABMMVGVzdEJrZy50aWZmAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' +
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFM7rXlgAAAAAAAAAAP////8A' +
  'AA0CAAAAAAAAAAAAAAAAAAAACy5iYWNrZ3JvdW5kAAABAAQAAAATAAIAJFRl' +
  'c3QgVGl0bGU6LmJhY2tncm91bmQ6AFRlc3RCa2cudGlmZgAPABYACgBUAGUA' +
  'cwB0ACAAVABpAHQAbABlABIAGS8uYmFja2dyb3VuZC9UZXN0QmtnLnRpZmYA' +
  'ABMAEy9Wb2x1bWVzL1Rlc3QgVGl0bGUA//8AAA==', 'base64'
)

test('decode parses a simple alias', (t) => {
  const info = alias.decode(rawData)

  t.is(info.version, 2)

  t.deepEqual(info.volume, {
    name: 'Test Title',
    created: new Date('2014-01-02T18:20:04.000Z'),
    signature: 'H+',
    type: 'other',
    abspath: '/Volumes/Test Title'
  })

  t.deepEqual(info.parent, {
    id: 19,
    name: '.background'
  })

  t.deepEqual(info.target, {
    type: 'file',
    filename: 'TestBkg.tiff',
    id: 20,
    created: new Date('2014-01-02T18:20:08.000Z'),
    path: 'Test Title:.background:',
    abspath: '/.background/TestBkg.tiff'
  })
})

test('encode creates byte-identical alias data', (t) => {
  const info = alias.decode(rawData)
  const buf = alias.encode(info)

  t.deepEqual(buf, rawData)
})

test('create builds an alias for a file', (t) => {
  const rootDir = process.env.ROOT_VOLUME || __dirname
  const volumeName = process.platform === 'darwin' ? undefined : 'Test Volume'
  const target = path.join(rootDir, 'basics.js')
  const buf = alias.create(target, { volumeName })
  const info = alias.decode(buf)

  t.is(info.target.type, 'file')
  t.is(info.target.filename, 'basics.js')
})

test('isAlias identifies alias files', (t) => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'macos-alias-'))

  try {
    const aliasFile = path.join(tmpDir, 'alias')
    const garbageFile = path.join(tmpDir, 'garbage')

    fs.writeFileSync(aliasFile, Buffer.from('626f6f6b000000006d61726b00000000', 'hex'))
    fs.writeFileSync(garbageFile, Buffer.from('Hello my name is Linus!'))

    t.true(alias.isAlias(aliasFile))
    t.false(alias.isAlias(garbageFile))
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true })
  }
})
