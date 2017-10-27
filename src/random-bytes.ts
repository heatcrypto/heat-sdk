const crypto = require("crypto")

export function randomBytes(length: number): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    // Buffers are Uint8Arrays, so you just need to access its ArrayBuffer. This is O(1):
    crypto.randomBytes(length, (err: any, buffer: any) => {
      if (err) reject(err)
      else resolve(Uint8Array.from(buffer))
    })
  })
}

export interface RandomUint8ArrayProvider {
  generate(length: number): Promise<Uint8Array>
}

export function setRandomSource(source: RandomUint8ArrayProvider) {
  // do nothing, only supported when run as UMD and in react-native
}
