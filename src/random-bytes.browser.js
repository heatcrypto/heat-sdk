import * as utils from "./utils"
var randomSource /* RandomUint8ArrayProvider */

export function randomBytes(length) {
  if (utils.isDefined(randomSource))
    return randomSource.generate(length)

  // Relies on https://developer.mozilla.org/en-US/docs/Web/API/RandomSource
  // https://www.w3.org/TR/WebCryptoAPI/#RandomSource-method-getRandomValues
  return new Promise((resolve, reject) => {
    let array = new Uint8Array(length)
    resolve(window.crypto.getRandomValues(array))
  })
}

export function setRandomSource(source /* RandomUint8ArrayProvider */) {
  randomSource = source
}