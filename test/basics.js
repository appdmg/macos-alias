'use strict'

const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const test = require('ava').default
const alias = require('../')

const UINT32_SIZE = 0x100000000

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

test('encode normalizes large file IDs to alias UInt32 fields', (t) => {
  const info = alias.decode(rawData)
  const parentId = 8_589_934_599
  const targetId = 12_888_353_118

  info.parent.id = parentId
  info.target.id = targetId
  info.extra = info.extra.filter((part) => part.type !== 1)

  const buf = alias.encode(info)

  t.is(buf.readUInt32BE(46), parentId % UINT32_SIZE)
  t.is(buf.readUInt32BE(114), targetId % UINT32_SIZE)
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

test('create normalizes large file IDs to alias UInt32 fields', (t) => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'macos-alias-large-id-'))
  const target = path.join(tmpDir, 'target.txt')
  fs.writeFileSync(target, 'target')

  const originalStatSync = fs.statSync
  const parentOfTmpDir = path.resolve(tmpDir, '..')
  const targetIno = 12_888_353_118
  const parentIno = 8_589_934_599

  const createStat = function (ino, type) {
    return {
      dev: 1,
      ino,
      ctime: new Date('2026-01-02T03:04:05.000Z'),
      isFile: () => type === 'file',
      isDirectory: () => type === 'directory'
    }
  }

  const targetStat = createStat(targetIno, 'file')
  const parentStat = createStat(parentIno, 'directory')

  fs.statSync = function (currentPath) {
    const resolvedPath = path.resolve(currentPath)

    if (resolvedPath === target) {
      return targetStat
    }

    if (resolvedPath === tmpDir || resolvedPath === parentOfTmpDir) {
      return parentStat
    }

    return originalStatSync.apply(this, arguments)
  }

  try {
    const buf = alias.create(target, { volumeName: 'Test Volume' })
    const info = alias.decode(buf)

    const expectedParentId = parentIno % UINT32_SIZE
    const expectedTargetId = targetIno % UINT32_SIZE
    const parentIdExtra = info.extra.find((part) => part.type === 1)

    t.is(info.parent.id, expectedParentId)
    t.is(info.target.id, expectedTargetId)
    t.truthy(parentIdExtra)
    t.is(parentIdExtra.data.readUInt32BE(0), expectedParentId)
  } finally {
    fs.statSync = originalStatSync
    fs.rmSync(tmpDir, { recursive: true, force: true })
  }
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
