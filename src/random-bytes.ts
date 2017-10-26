const crypto = require("crypto")

export function randomBytes(length: number): any {
  return crypto.randomBytes(length)
}

export function setRandomSource(source: RandomSource) {
  // do nothing, only supported when run as UMD and in react-native
}
