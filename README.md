# @appdmg/macos-alias

Mac OS X aliases creation and reading from NodeJS.

## Attention

This library does currently not handle the `book\0\0\0\0mark\0\0\0\0`-header. It only does manipulation on the raw alias data.

I intend to add something like `alias.write(buf, path)` and `alias.read(path)`.


## Requirements

To install and run the `macos-alias` package you need:

* Mac OS X 10.15 or newer
* macOS 11 or newer
* NodeJS 18 or newer
* Python 3.10 or newer


## Installation

```sh
npm install @appdmg/macos-alias
```

## Usage

```javascript
var alias = require('@appdmg/macos-alias');
```

## API

### alias.create(target)

Create a new alias pointing to `target`, returns a buffer.

(This function performs blocking fs interaction)

### alias.decode(buf)

Decodes buffer `buf` and returns an object with info about the alias.

### alias.encode(info)

Encodes the `info`-object into an alias, returns a buffer.

### alias.isAlias(path)

Check if the file at `path` is an alias, returns a boolean.

(This function performs blocking fs interaction)

## Hacking

Clone the repo and start making changes, run `node-gyp` to build the project.

```sh
node-gyp rebuild
```

## Tests

```sh
npm test
```
