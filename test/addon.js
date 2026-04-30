'use strict'

const test = require('ava').default
const addon = require('../build/Release/volume.node')

const macOSTest = process.platform === 'darwin' ? test : test.skip
const nonMacOSTest = process.platform === 'darwin' ? test.skip : test

macOSTest('addon finds the root volume name on macOS', (t) => {
  t.is(addon.getVolumeName('/'), 'Macintosh HD')
})

nonMacOSTest('addon native functions return null off macOS', (t) => {
  t.is(addon.getVolumeName('/'), null)
})
