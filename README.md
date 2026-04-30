# @appdmg/macos-alias

macOS alias creation, encoding, decoding, and detection for appdmg packages.

This package is a deliberate native boundary. It can decode and encode alias
buffers on any platform, but creating aliases with real volume metadata requires
macOS.

## Requirements

- Node.js 24 or newer
- Python 3.13 or newer for native builds through `node-gyp`
- macOS 11 or newer for native volume-name lookup and full alias creation

On non-macOS systems, the native volume-name binding returns `null`. Tests and
callers that create aliases off macOS must provide `options.volumeName`.

## Installation

```sh
npm install @appdmg/macos-alias
```

## Usage

```javascript
const alias = require('@appdmg/macos-alias')

const buffer = alias.create('/Applications/My App.app')
const info = alias.decode(buffer)
```

## API

### `alias.create(target, options)`

Creates a new alias pointing to `target` and returns a buffer.

This function performs blocking filesystem interaction. On non-macOS systems,
pass `options.volumeName` because the native volume-name lookup returns `null`.

### `alias.decode(buffer)`

Decodes an alias buffer and returns an object with alias metadata.

### `alias.encode(info)`

Encodes an alias metadata object and returns a buffer.

### `alias.isAlias(path)`

Checks whether the file at `path` starts with the alias-file marker.

This function performs blocking filesystem interaction.

## Migration Notes

The supported runtime changed to Node.js 24 and newer.

The package remains CommonJS in this stage.

The test runner changed from Mocha and Standard to AVA.
