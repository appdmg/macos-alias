const UINT32_SIZE = 0x100000000
const UINT32_MAX = UINT32_SIZE - 1

module.exports = exports = function normalizeFileId (value) {
  if (Number.isInteger(value) && value > UINT32_MAX) {
    return value % UINT32_SIZE
  }

  return value
}
