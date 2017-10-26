import * as utils from "./utils"
let randomSource = null

export function randomBytes(length) {
  var array = new Uint32Array(length);
  var source = getRandomSource()
  source.getRandomValues(array)
  return array
}

function getRandomSource() {
  if (utils.isObject(window) && utils.isObject(window.crypto)) 
    return window.crypto
  return randomSource
}

export function setRandomSource(source) {
  randomSource = source
}