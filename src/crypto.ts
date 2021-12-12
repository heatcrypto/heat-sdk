/*
 * The MIT License (MIT)
 * Copyright (c) 2017 Heat Ledger Ltd.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 * */
import {
  byteArrayToHexString,
  byteArrayToShortArray,
  byteArrayToString,
  byteArrayToWordArray,
  hexStringToByteArray,
  shortArrayToByteArray,
  shortArrayToHexString,
  stringToByteArray,
  stringToHexString,
  wordArrayToByteArray
} from "./converters"
import Big from "big.js"
import pako from "pako"
import Long from "long"
import { randomBytes } from "./random-bytes"

var _hash = {
  init: SHA256_init,
  update: SHA256_write,
  getBytes: SHA256_finalize
}

export var SHA256 = _hash

export function getPublicKeyFromPrivateKey(privateKeyHex: string) {
  var secretPhraseBytes = hexStringToByteArray(privateKeyHex)
  var digest = simpleHash(secretPhraseBytes)
  return byteArrayToHexString(curve25519.keygen(digest).p)
}

export function random8Values(len: number): Promise<Uint8Array> {
  return randomBytes(len)
}

export function random16Values(len: number): Promise<Uint16Array> {
  return randomBytes(len * 2).then(bytes => new Uint16Array(bytes.buffer))
}

export function random32Values(len: number): Promise<Uint32Array> {
  return randomBytes(len * 4).then(bytes => new Uint32Array(bytes.buffer))
}

function simpleHash(message: any) {
  _hash.init()
  _hash.update(message)
  return _hash.getBytes()
}

/**
 * Calculates a SHA256 hash from a string.
 *
 * @param inputString String (regular UTF-8 string)
 * @returns Hash as HEX String
 */
export function calculateStringHash(inputString: string) {
  var hexString = stringToHexString(inputString)
  var bytes = hexStringToByteArray(hexString)
  var hashBytes = simpleHash(bytes)
  return byteArrayToHexString(hashBytes)
}

export function calculateHashBytes(bytes: ArrayBuffer[]) {
  _hash.init()
  bytes.forEach(b => _hash.update(b))
  return _hash.getBytes()
}

/**
 * @param byteArray ByteArray
 * @param startIndex Int
 * @returns Big
 */
export function byteArrayToBigInteger(byteArray: any, startIndex?: number) {
  var value = new Big("0")
  var temp1, temp2
  for (var i = byteArray.length - 1; i >= 0; i--) {
    temp1 = value.times(new Big("256"))
    temp2 = temp1.plus(new Big(byteArray[i].toString(10)))
    value = temp2
  }
  return value
}

/**
 * @param unsignedTransaction hex-string
 * @param signature hex-string
 * @returns hex-string
 */
export function calculateFullHash(unsignedTransaction: string, signature: string): string {
  var unsignedTransactionBytes = hexStringToByteArray(unsignedTransaction)
  var signatureBytes = hexStringToByteArray(signature)
  var signatureHash = simpleHash(signatureBytes)

  _hash.init()
  _hash.update(unsignedTransactionBytes)
  _hash.update(signatureHash)
  var fullHash = _hash.getBytes()
  return byteArrayToHexString(fullHash)
}

/**
 * @param fullnameUTF8 UTF-8 user name
 * @returns hex-string
 */
export function fullNameToHash(fullNameUTF8: string): string {
  return _fullNameToBigInteger(stringToByteArray(fullNameUTF8))
}

export function fullNameToLong(fullName: number[]): Long {
  return Long.fromString(_fullNameToBigInteger(fullName).toString())
}

function _fullNameToBigInteger(fullName: number[]): string {
  _hash.init()
  _hash.update(fullName)
  var slice = hexStringToByteArray(byteArrayToHexString(_hash.getBytes())).slice(0, 8)
  return byteArrayToBigInteger(slice).toString()
}

/**
 * @param fullHashHex hex-string
 * @returns string
 */
export function calculateTransactionId(fullHashHex: string): string {
  var slice = hexStringToByteArray(fullHashHex).slice(0, 8)
  var transactionId = byteArrayToBigInteger(slice).toString()
  return transactionId
}

/**
 * Turns a secretphrase into a public key
 * @param secretPhrase String
 * @returns HEX string
 */
export function secretPhraseToPublicKey(secretPhrase: string): string {
  var secretHex = stringToHexString(secretPhrase)
  var secretPhraseBytes = hexStringToByteArray(secretHex)
  var digest = simpleHash(secretPhraseBytes)
  return byteArrayToHexString(curve25519.keygen(digest).p)
}

/**
 * ..
 * @param secretPhrase Ascii String
 * @returns hex-string
 */
export function getPrivateKey(secretPhrase: string) {
  SHA256_init()
  SHA256_write(stringToByteArray(secretPhrase))
  return shortArrayToHexString(curve25519_clamp(byteArrayToShortArray(SHA256_finalize())))
}

/**
 * @param secretPhrase Ascii String
 * @returns String
 */
export function getAccountId(secretPhrase: string) {
  var publicKey = this.secretPhraseToPublicKey(secretPhrase)
  return this.getAccountIdFromPublicKey(publicKey)
}

/**
 * @param secretPhrase Hex String
 * @returns String
 */
export function getAccountIdFromPublicKey(publicKey: string) {
  _hash.init()
  _hash.update(hexStringToByteArray(publicKey))

  var account = _hash.getBytes()
  var slice = hexStringToByteArray(byteArrayToHexString(account)).slice(0, 8)
  return byteArrayToBigInteger(slice).toString()
}

/**
 * TODO pass secretphrase as string instead of HEX string, convert to
 * hex string ourselves.
 *
 * @param message HEX String
 * @param secretPhrase Hex String
 * @returns Hex String
 */
export function signBytes(message: string, secretPhrase: string) {
  var messageBytes = hexStringToByteArray(message)
  var secretPhraseBytes = hexStringToByteArray(secretPhrase)

  var digest = simpleHash(secretPhraseBytes)
  var s = curve25519.keygen(digest).s
  var m = simpleHash(messageBytes)

  _hash.init()
  _hash.update(m)
  _hash.update(s)
  var x = _hash.getBytes()

  var y = curve25519.keygen(x).p

  _hash.init()
  _hash.update(m)
  _hash.update(y)
  var h = _hash.getBytes()

  var v = curve25519.sign(h, x, s)
  if (v) return byteArrayToHexString(v.concat(h))
}

/**
 * ...
 * @param signature     Hex String
 * @param message       Hex String
 * @param publicKey     Hex String
 * @returns Boolean
 */
export function verifyBytes(signature: string, message: string, publicKey: string): boolean {
  var signatureBytes = hexStringToByteArray(signature)
  var messageBytes = hexStringToByteArray(message)
  var publicKeyBytes = hexStringToByteArray(publicKey)
  var v = signatureBytes.slice(0, 32)
  var h = signatureBytes.slice(32)
  var y = curve25519.verify(v, h, publicKeyBytes)

  var m = simpleHash(messageBytes)

  _hash.init()
  _hash.update(m)
  _hash.update(y)
  var h2 = _hash.getBytes()

  return areByteArraysEqual(h, h2)
}

function areByteArraysEqual(bytes1: Array<number>, bytes2: Array<number>): boolean {
  if (bytes1.length !== bytes2.length) {
    return false
  }
  for (var i = 0; i < bytes1.length; ++i) {
    if (bytes1[i] !== bytes2[i]) return false
  }
  return true
}

export interface IEncryptOptions {
  /* Recipient account id */
  account?: string

  /* Recipient public key */
  publicKey?: Array<number>

  /* Private key to decrypt messages to self */
  privateKey?: Array<number>

  /* Shared key to encrypt messages to other account */
  sharedKey?: Array<number>

  /* Uint8Array */
  nonce?: any
}

/**
 * @param message String
 * @param options Object {
 *    account: String,    // recipient account id
 *    publicKey: String,  // recipient public key
 * }
 * @param secretPhrase String
 * @returns { message: String, nonce: String }
 */
export function encryptNote(
  message: string,
  options: IEncryptOptions,
  secretPhrase: string,
  uncompressed?: boolean
): Promise<{ message: string; nonce: string }> {
  if (!options.sharedKey) {
    if (!options.privateKey) {
      options.privateKey = hexStringToByteArray(getPrivateKey(secretPhrase))
    }
    if (!options.publicKey) {
      throw new Error("Missing publicKey argument")
    }
  }
  return encryptData(stringToByteArray(message), options, uncompressed).then(encrypted => {
    return {
      message: byteArrayToHexString(encrypted.data),
      nonce: byteArrayToHexString(<any>encrypted.nonce)
    }
  })
}

/**
 * @param message Byte Array
 * @param options Object {
 *    account: String,    // recipient account id
 *    publicKey: String,  // recipient public key
 * }
 * @param secretPhrase String
 * @returns { message: String, nonce: String }
 */
export function encryptBinaryNote(
  message: Array<number>,
  options: IEncryptOptions,
  secretPhrase: string,
  uncompressed?: boolean
): Promise<{ nonce: string; message: string }> {
  if (!options.sharedKey) {
    if (!options.privateKey) {
      options.privateKey = hexStringToByteArray(getPrivateKey(secretPhrase))
    }
    if (!options.publicKey) {
      throw new Error("Missing publicKey argument")
    }
  }
  return encryptData(message, options, uncompressed).then(encrypted => {
    return {
      message: byteArrayToHexString(encrypted.data),
      nonce: byteArrayToHexString(<any>encrypted.nonce)
    }
  })
}

/**
 * @param key1 ByteArray
 * @param key2 ByteArray
 * @returns ByteArray
 */
function getSharedKey(key1: any, key2: any) {
  return shortArrayToByteArray(
    curve25519_(byteArrayToShortArray(key1), byteArrayToShortArray(key2), null)
  )
}

function encryptData(
  plaintext: Array<number>,
  options: IEncryptOptions,
  uncompressed?: boolean
): Promise<{ nonce: Uint8Array; data: any[] }> {
  return randomBytes(32)
    .then(bytes => {
      if (!options.sharedKey) {
        options.sharedKey = getSharedKey(options.privateKey, options.publicKey)
      }
      options.nonce = bytes

      var compressedPlaintext = uncompressed
        ? new Uint8Array(plaintext)
        : pako.gzip(new Uint8Array(plaintext))

      return aesEncrypt(<any>compressedPlaintext, options)
    })
    .then(data => {
      return {
        nonce: options.nonce,
        data: data
      }
    })
}

function aesEncrypt(plaintext: Array<number>, options: IEncryptOptions): Promise<number[]> {
  return randomBytes(16).then(bytes => {
    var text = byteArrayToWordArray(plaintext)
    var sharedKey = options.sharedKey
      ? options.sharedKey.slice(0)
      : getSharedKey(options.privateKey, options.publicKey)

    for (var i = 0; i < 32; i++) {
      sharedKey[i] ^= options.nonce[i]
    }

    var tmp: any = bytes
    var key = CryptoJS.SHA256(byteArrayToWordArray(sharedKey))
    var iv = byteArrayToWordArray(tmp)
    var encrypted = CryptoJS.AES.encrypt(text, key, {
      iv: iv
    })

    var ivOut = wordArrayToByteArray(encrypted.iv)
    var ciphertextOut = wordArrayToByteArray(encrypted.ciphertext)
    return ivOut.concat(ciphertextOut)
  })
}

export interface IEncryptedMessage {
  isText: boolean
  data: string // hex string
  nonce: string // hex string
}

export function encryptMessage(
  message: string,
  publicKey: string,
  secretPhrase: string,
  uncompressed?: boolean
): Promise<IEncryptedMessage> {
  var options: IEncryptOptions = {
    account: getAccountIdFromPublicKey(publicKey),
    publicKey: hexStringToByteArray(publicKey)
  }
  return encryptNote(message, options, secretPhrase, uncompressed).then(encrypted => {
    return {
      isText: true,
      data: encrypted.message,
      nonce: encrypted.nonce
    }
  })
}

export function decryptMessage(
  data: string,
  nonce: string,
  publicKey: string,
  secretPhrase: string,
  uncompressed?: boolean
): string {
  var privateKey = hexStringToByteArray(getPrivateKey(secretPhrase))
  var publicKeyBytes = hexStringToByteArray(publicKey)
  var sharedKey = getSharedKey(privateKey, publicKeyBytes)
  var dataBytes = hexStringToByteArray(data)
  var nonceBytes = hexStringToByteArray(nonce)
  try {
    return decryptData(
      dataBytes,
      {
        privateKey: privateKey,
        publicKey: publicKeyBytes,
        nonce: nonceBytes,
        sharedKey: sharedKey
      },
      uncompressed
    )
  } catch (e) {
    if (e instanceof RangeError || e == "incorrect header check") {
      console.error("Managed Exception: " + e)

      return decryptData(
        dataBytes,
        {
          privateKey: privateKey,
          publicKey: publicKeyBytes,
          nonce: nonceBytes,
          sharedKey: sharedKey
        },
        !uncompressed
      )
    }
    throw e
  }
}

function decryptData(data: any, options: any, uncompressed?: boolean) {
  var compressedPlaintext = aesDecrypt(data, options)
  var binData = new Uint8Array(compressedPlaintext)
  var data_ = uncompressed ? binData : pako.inflate(binData)
  return byteArrayToString(<any>data_)
}

function aesDecrypt(ivCiphertext: any, options: any) {
  if (ivCiphertext.length < 16 || ivCiphertext.length % 16 != 0) {
    throw { name: "invalid ciphertext" }
  }

  var iv = byteArrayToWordArray(ivCiphertext.slice(0, 16))
  var ciphertext = byteArrayToWordArray(ivCiphertext.slice(16))
  var sharedKey = options.sharedKey.slice(0) //clone
  for (var i = 0; i < 32; i++) {
    sharedKey[i] ^= options.nonce[i]
  }

  var key = CryptoJS.SHA256(byteArrayToWordArray(sharedKey))
  var encrypted = CryptoJS.lib.CipherParams.create({
    ciphertext: ciphertext,
    iv: iv,
    key: key
  })
  var decrypted = CryptoJS.AES.decrypt(encrypted, key, {
    iv: iv
  })
  var plaintext = wordArrayToByteArray(decrypted)
  return plaintext
}

export class PassphraseEncryptedMessage {
  ciphertext: string
  salt: string
  iv: string
  HMAC: string

  constructor(ciphertext: string, salt: string, iv: string, HMAC: string) {
    this.ciphertext = ciphertext
    this.salt = salt
    this.iv = iv
    this.HMAC = HMAC
  }

  static decode(encoded: string): PassphraseEncryptedMessage {
    var json = JSON.parse(encoded)
    return new PassphraseEncryptedMessage(json[0], json[1], json[2], json[3])
  }

  encode(): string {
    return JSON.stringify([this.ciphertext, this.salt, this.iv, this.HMAC])
  }
}

export function passphraseEncrypt(message: string, passphrase: string): PassphraseEncryptedMessage {
  var salt = CryptoJS.lib.WordArray.random(256 / 8)
  var key = CryptoJS.PBKDF2(passphrase, salt, {
    iterations: 10,
    hasher: CryptoJS.algo.SHA256
  })
  var iv = CryptoJS.lib.WordArray.random(128 / 8)

  var encrypted = CryptoJS.AES.encrypt(message, key, { iv: iv })

  var ciphertext = CryptoJS.enc.Base64.stringify(encrypted.ciphertext)
  var salt_str = CryptoJS.enc.Hex.stringify(salt)
  var iv_str = CryptoJS.enc.Hex.stringify(iv)

  var key_str = CryptoJS.enc.Hex.stringify(key)
  var HMAC = CryptoJS.HmacSHA256(ciphertext + iv_str, key_str)
  var HMAC_str = CryptoJS.enc.Hex.stringify(HMAC)

  return new PassphraseEncryptedMessage(ciphertext, salt_str, iv_str, HMAC_str)
}

export function passphraseDecrypt(
  cp: PassphraseEncryptedMessage,
  passphrase: string
): string | null {
  var iv = CryptoJS.enc.Hex.parse(cp.iv)
  var salt = CryptoJS.enc.Hex.parse(cp.salt)
  var key = CryptoJS.PBKDF2(passphrase, salt, {
    iterations: 10,
    hasher: CryptoJS.algo.SHA256
  })
  var ciphertext = CryptoJS.enc.Base64.parse(cp.ciphertext)
  var key_str = CryptoJS.enc.Hex.stringify(key)
  var HMAC = CryptoJS.HmacSHA256(cp.ciphertext + cp.iv, key_str)
  var HMAC_str = CryptoJS.enc.Hex.stringify(HMAC)

  // compare HMACs
  if (HMAC_str != cp.HMAC) {
    return null
  }
  var _cp = CryptoJS.lib.CipherParams.create({
    ciphertext: ciphertext
  })

  var decrypted = CryptoJS.AES.decrypt(_cp, key, { iv: iv })
  return decrypted.toString(CryptoJS.enc.Utf8)
}

// ==================================================================================================
// START INCLUDE FILE curve25519_.js
// ==================================================================================================

// Copyright (c) 2007 Michele Bini
// Konstantin Welke, 2008:
// - moved into .js file, renamed all c255lname to curve25519_name
// - added curve25519_clamp()
// - functions to read from/to 8bit string
// - removed base32/hex functions (cleanup)
// - removed setbit function (cleanup, had a bug anyway)
// BloodyRookie 2014:
// - ported part of the java implementation by Dmitry Skiba to js and merged into this file
// - profiled for higher speed
//
// This program is free software; you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation; either version 2 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License along
// with this program; if not, write to the Free Software Foundation, Inc.,
// 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA. */
//
// The original curve25519 library was released into the public domain
// by Daniel J. Bernstein

var curve25519_zero = function() {
  return [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
}

var curve25519_one = function() {
  return [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
}

var curve25519_nine = function() {
  return [9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
}

var curve25519_486671 = function() {
  return [27919, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
}

var curve25519_39420360 = function() {
  return [33224, 601, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
}

var curve25519_r2y = function() {
  return [
    0x1670,
    0x4000,
    0xf219,
    0xd369,
    0x2248,
    0x4845,
    0x679a,
    0x884d,
    0x5d19,
    0x16bf,
    0xda74,
    0xe57d,
    0x5e53,
    0x3705,
    0x3526,
    0x17c0
  ]
}

var curve25519_clamp = function(curve: any) {
  curve[0] &= 0xfff8
  curve[15] &= 0x7fff
  curve[15] |= 0x4000
  return curve
}

var curve25519_getbit = function(curve: any, c: any) {
  return ~~(curve[~~(c / 16)] / Math.pow(2, c % 16)) % 2
}

/* group order (a prime near 2^252+2^124) */
var curve25519_order = [
  237,
  211,
  245,
  92,
  26,
  99,
  18,
  88,
  214,
  156,
  247,
  162,
  222,
  249,
  222,
  20,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  16
]

var curve25519_order_times_8 = [
  104,
  159,
  174,
  231,
  210,
  24,
  147,
  192,
  178,
  230,
  188,
  23,
  245,
  206,
  247,
  166,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  128
]

var curve25519_convertToByteArray = function(a: any) {
  var b = new Int8Array(32)
  var i
  for (i = 0; i < 16; i++) {
    b[2 * i] = a[i] & 0xff
    b[2 * i + 1] = a[i] >> 8
  }

  return b
}

var curve25519_convertToShortArray = function(a: any) {
  var b = new Array(16)
  var i, val1, val2
  for (i = 0; i < 16; i++) {
    val1 = a[i * 2]
    if (val1 < 0) {
      val1 += 256
    }
    val2 = a[i * 2 + 1]
    if (val2 < 0) {
      val2 += 256
    }
    b[i] = val1 + val2 * 256
  }
  return b
}

var curve25519_fillShortArray = function(src: any, dest: any) {
  var i
  for (i = 0; i < 16; i++) {
    dest[i] = src[i]
  }
}

var curve25519_cpy32 = function(a: any) {
  var b = new Int8Array(32)
  for (var i = 0; i < 32; i++) {
    b[i] = a[i]
  }
  return b
}

var curve25519_mula_small = function(p: any, q: any, m: any, x: any, n: any, z: any) {
  var v = 0
  for (var j = 0; j < n; ++j) {
    v += (q[j + m] & 0xff) + z * (x[j] & 0xff)
    p[j + m] = v & 0xff
    v >>= 8
  }
  return v
}

var curve25519_mula32 = function(p: any, x: any, y: any, t: any, z: any) {
  var n = 31
  var w = 0
  for (var i = 0; i < t; i++) {
    var zy = z * (y[i] & 0xff)
    w += curve25519_mula_small(p, p, i, x, n, zy) + (p[i + n] & 0xff) + zy * (x[n] & 0xff)
    p[i + n] = w & 0xff
    w >>= 8
  }
  p[i + n] = (w + (p[i + n] & 0xff)) & 0xff
  return w >> 8
}

var curve25519_divmod = function(q: any, r: any, n: any, d: any, t: any) {
  var rn = 0,
    z = 0
  var dt = (d[t - 1] & 0xff) << 8
  if (t > 1) {
    dt |= d[t - 2] & 0xff
  }
  while (n-- >= t) {
    z = (rn << 16) | ((r[n] & 0xff) << 8)
    if (n > 0) {
      z |= r[n - 1] & 0xff
    }
    z = parseInt("" + z / dt)
    rn += curve25519_mula_small(r, r, n - t + 1, d, t, -z)
    q[n - t + 1] = (z + rn) & 0xff // rn is 0 or -1 (underflow)
    curve25519_mula_small(r, r, n - t + 1, d, t, -rn)
    rn = r[n] & 0xff
    r[n] = 0
  }
  r[t - 1] = rn & 0xff
}

var curve25519_numsize = function(x: any, n: any) {
  while (n-- != 0 && x[n] == 0);
  return n + 1
}

var curve25519_egcd32 = function(x: any, y: any, a: any, b: any) {
  var an = 0,
    bn = 32,
    qn = 0,
    i = 0
  for (i = 0; i < 32; i++) {
    x[i] = y[i] = 0
  }
  x[0] = 1
  an = curve25519_numsize(a, 32)
  if (an == 0) {
    return y // division by zero
  }
  var temp = new Int8Array(32)
  while (true) {
    qn = bn - an + 1
    curve25519_divmod(temp, b, bn, a, an)
    bn = curve25519_numsize(b, bn)
    if (bn == 0) {
      return x
    }
    curve25519_mula32(y, x, temp, qn, -1)

    qn = an - bn + 1
    curve25519_divmod(temp, a, an, b, bn)
    an = curve25519_numsize(a, an)
    if (an == 0) {
      return y
    }
    curve25519_mula32(x, y, temp, qn, -1)
  }
}

var curve25519_cpy16 = function(a: any) {
  var r = new Array(16)
  var i
  for (i = 0; i < 16; i++) {
    r[i] = a[i]
  }
  return r
}

/***
 * BloodyRookie: odd numbers are negativ
 */
var curve25519_isNegative = function(x: any) {
  return x[0] & 1
}

var curve25519_sqr8h = function(
  r: any,
  a7: any,
  a6: any,
  a5: any,
  a4: any,
  a3: any,
  a2: any,
  a1: any,
  a0: any
) {
  var v = 0
  r[0] = (v = a0 * a0) & 0xffff
  r[1] = (v = ~~(v / 0x10000) + 2 * a0 * a1) & 0xffff
  r[2] = (v = ~~(v / 0x10000) + 2 * a0 * a2 + a1 * a1) & 0xffff
  r[3] = (v = ~~(v / 0x10000) + 2 * a0 * a3 + 2 * a1 * a2) & 0xffff
  r[4] = (v = ~~(v / 0x10000) + 2 * a0 * a4 + 2 * a1 * a3 + a2 * a2) & 0xffff
  r[5] = (v = ~~(v / 0x10000) + 2 * a0 * a5 + 2 * a1 * a4 + 2 * a2 * a3) & 0xffff
  r[6] = (v = ~~(v / 0x10000) + 2 * a0 * a6 + 2 * a1 * a5 + 2 * a2 * a4 + a3 * a3) & 0xffff
  r[7] = (v = ~~(v / 0x10000) + 2 * a0 * a7 + 2 * a1 * a6 + 2 * a2 * a5 + 2 * a3 * a4) & 0xffff
  r[8] = (v = ~~(v / 0x10000) + 2 * a1 * a7 + 2 * a2 * a6 + 2 * a3 * a5 + a4 * a4) & 0xffff
  r[9] = (v = ~~(v / 0x10000) + 2 * a2 * a7 + 2 * a3 * a6 + 2 * a4 * a5) & 0xffff
  r[10] = (v = ~~(v / 0x10000) + 2 * a3 * a7 + 2 * a4 * a6 + a5 * a5) & 0xffff
  r[11] = (v = ~~(v / 0x10000) + 2 * a4 * a7 + 2 * a5 * a6) & 0xffff
  r[12] = (v = ~~(v / 0x10000) + 2 * a5 * a7 + a6 * a6) & 0xffff
  r[13] = (v = ~~(v / 0x10000) + 2 * a6 * a7) & 0xffff
  r[14] = (v = ~~(v / 0x10000) + a7 * a7) & 0xffff
  r[15] = ~~(v / 0x10000)
}

var curve25519_sqrmodp = function(r: any, a: any) {
  var x = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  var y = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  var z = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  curve25519_sqr8h(x, a[15], a[14], a[13], a[12], a[11], a[10], a[9], a[8])
  curve25519_sqr8h(z, a[7], a[6], a[5], a[4], a[3], a[2], a[1], a[0])
  curve25519_sqr8h(
    y,
    a[15] + a[7],
    a[14] + a[6],
    a[13] + a[5],
    a[12] + a[4],
    a[11] + a[3],
    a[10] + a[2],
    a[9] + a[1],
    a[8] + a[0]
  )
  var v = 0
  r[0] = (v = 0x800000 + z[0] + (y[8] - x[8] - z[8] + x[0] - 0x80) * 38) & 0xffff
  r[1] = (v = 0x7fff80 + ~~(v / 0x10000) + z[1] + (y[9] - x[9] - z[9] + x[1]) * 38) & 0xffff
  r[2] = (v = 0x7fff80 + ~~(v / 0x10000) + z[2] + (y[10] - x[10] - z[10] + x[2]) * 38) & 0xffff
  r[3] = (v = 0x7fff80 + ~~(v / 0x10000) + z[3] + (y[11] - x[11] - z[11] + x[3]) * 38) & 0xffff
  r[4] = (v = 0x7fff80 + ~~(v / 0x10000) + z[4] + (y[12] - x[12] - z[12] + x[4]) * 38) & 0xffff
  r[5] = (v = 0x7fff80 + ~~(v / 0x10000) + z[5] + (y[13] - x[13] - z[13] + x[5]) * 38) & 0xffff
  r[6] = (v = 0x7fff80 + ~~(v / 0x10000) + z[6] + (y[14] - x[14] - z[14] + x[6]) * 38) & 0xffff
  r[7] = (v = 0x7fff80 + ~~(v / 0x10000) + z[7] + (y[15] - x[15] - z[15] + x[7]) * 38) & 0xffff
  r[8] = (v = 0x7fff80 + ~~(v / 0x10000) + z[8] + y[0] - x[0] - z[0] + x[8] * 38) & 0xffff
  r[9] = (v = 0x7fff80 + ~~(v / 0x10000) + z[9] + y[1] - x[1] - z[1] + x[9] * 38) & 0xffff
  r[10] = (v = 0x7fff80 + ~~(v / 0x10000) + z[10] + y[2] - x[2] - z[2] + x[10] * 38) & 0xffff
  r[11] = (v = 0x7fff80 + ~~(v / 0x10000) + z[11] + y[3] - x[3] - z[3] + x[11] * 38) & 0xffff
  r[12] = (v = 0x7fff80 + ~~(v / 0x10000) + z[12] + y[4] - x[4] - z[4] + x[12] * 38) & 0xffff
  r[13] = (v = 0x7fff80 + ~~(v / 0x10000) + z[13] + y[5] - x[5] - z[5] + x[13] * 38) & 0xffff
  r[14] = (v = 0x7fff80 + ~~(v / 0x10000) + z[14] + y[6] - x[6] - z[6] + x[14] * 38) & 0xffff
  r[15] = 0x7fff80 + ~~(v / 0x10000) + z[15] + y[7] - x[7] - z[7] + x[15] * 38
  curve25519_reduce(r)
}

var curve25519_mul8h = function(
  r: any,
  a7: any,
  a6: any,
  a5: any,
  a4: any,
  a3: any,
  a2: any,
  a1: any,
  a0: any,
  b7: any,
  b6: any,
  b5: any,
  b4: any,
  b3: any,
  b2: any,
  b1: any,
  b0: any
) {
  var v = 0
  r[0] = (v = a0 * b0) & 0xffff
  r[1] = (v = ~~(v / 0x10000) + a0 * b1 + a1 * b0) & 0xffff
  r[2] = (v = ~~(v / 0x10000) + a0 * b2 + a1 * b1 + a2 * b0) & 0xffff
  r[3] = (v = ~~(v / 0x10000) + a0 * b3 + a1 * b2 + a2 * b1 + a3 * b0) & 0xffff
  r[4] = (v = ~~(v / 0x10000) + a0 * b4 + a1 * b3 + a2 * b2 + a3 * b1 + a4 * b0) & 0xffff
  r[5] = (v = ~~(v / 0x10000) + a0 * b5 + a1 * b4 + a2 * b3 + a3 * b2 + a4 * b1 + a5 * b0) & 0xffff
  r[6] =
    (v = ~~(v / 0x10000) + a0 * b6 + a1 * b5 + a2 * b4 + a3 * b3 + a4 * b2 + a5 * b1 + a6 * b0) &
    0xffff
  r[7] =
    (v =
      ~~(v / 0x10000) +
      a0 * b7 +
      a1 * b6 +
      a2 * b5 +
      a3 * b4 +
      a4 * b3 +
      a5 * b2 +
      a6 * b1 +
      a7 * b0) & 0xffff
  r[8] =
    (v = ~~(v / 0x10000) + a1 * b7 + a2 * b6 + a3 * b5 + a4 * b4 + a5 * b3 + a6 * b2 + a7 * b1) &
    0xffff
  r[9] = (v = ~~(v / 0x10000) + a2 * b7 + a3 * b6 + a4 * b5 + a5 * b4 + a6 * b3 + a7 * b2) & 0xffff
  r[10] = (v = ~~(v / 0x10000) + a3 * b7 + a4 * b6 + a5 * b5 + a6 * b4 + a7 * b3) & 0xffff
  r[11] = (v = ~~(v / 0x10000) + a4 * b7 + a5 * b6 + a6 * b5 + a7 * b4) & 0xffff
  r[12] = (v = ~~(v / 0x10000) + a5 * b7 + a6 * b6 + a7 * b5) & 0xffff
  r[13] = (v = ~~(v / 0x10000) + a6 * b7 + a7 * b6) & 0xffff
  r[14] = (v = ~~(v / 0x10000) + a7 * b7) & 0xffff
  r[15] = ~~(v / 0x10000)
}

var curve25519_mulmodp = function(r: any, a: any, b: any) {
  var x = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  var y = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  var z = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  curve25519_mul8h(
    x,
    a[15],
    a[14],
    a[13],
    a[12],
    a[11],
    a[10],
    a[9],
    a[8],
    b[15],
    b[14],
    b[13],
    b[12],
    b[11],
    b[10],
    b[9],
    b[8]
  )
  curve25519_mul8h(
    z,
    a[7],
    a[6],
    a[5],
    a[4],
    a[3],
    a[2],
    a[1],
    a[0],
    b[7],
    b[6],
    b[5],
    b[4],
    b[3],
    b[2],
    b[1],
    b[0]
  )
  curve25519_mul8h(
    y,
    a[15] + a[7],
    a[14] + a[6],
    a[13] + a[5],
    a[12] + a[4],
    a[11] + a[3],
    a[10] + a[2],
    a[9] + a[1],
    a[8] + a[0],
    b[15] + b[7],
    b[14] + b[6],
    b[13] + b[5],
    b[12] + b[4],
    b[11] + b[3],
    b[10] + b[2],
    b[9] + b[1],
    b[8] + b[0]
  )
  var v = 0
  r[0] = (v = 0x800000 + z[0] + (y[8] - x[8] - z[8] + x[0] - 0x80) * 38) & 0xffff
  r[1] = (v = 0x7fff80 + ~~(v / 0x10000) + z[1] + (y[9] - x[9] - z[9] + x[1]) * 38) & 0xffff
  r[2] = (v = 0x7fff80 + ~~(v / 0x10000) + z[2] + (y[10] - x[10] - z[10] + x[2]) * 38) & 0xffff
  r[3] = (v = 0x7fff80 + ~~(v / 0x10000) + z[3] + (y[11] - x[11] - z[11] + x[3]) * 38) & 0xffff
  r[4] = (v = 0x7fff80 + ~~(v / 0x10000) + z[4] + (y[12] - x[12] - z[12] + x[4]) * 38) & 0xffff
  r[5] = (v = 0x7fff80 + ~~(v / 0x10000) + z[5] + (y[13] - x[13] - z[13] + x[5]) * 38) & 0xffff
  r[6] = (v = 0x7fff80 + ~~(v / 0x10000) + z[6] + (y[14] - x[14] - z[14] + x[6]) * 38) & 0xffff
  r[7] = (v = 0x7fff80 + ~~(v / 0x10000) + z[7] + (y[15] - x[15] - z[15] + x[7]) * 38) & 0xffff
  r[8] = (v = 0x7fff80 + ~~(v / 0x10000) + z[8] + y[0] - x[0] - z[0] + x[8] * 38) & 0xffff
  r[9] = (v = 0x7fff80 + ~~(v / 0x10000) + z[9] + y[1] - x[1] - z[1] + x[9] * 38) & 0xffff
  r[10] = (v = 0x7fff80 + ~~(v / 0x10000) + z[10] + y[2] - x[2] - z[2] + x[10] * 38) & 0xffff
  r[11] = (v = 0x7fff80 + ~~(v / 0x10000) + z[11] + y[3] - x[3] - z[3] + x[11] * 38) & 0xffff
  r[12] = (v = 0x7fff80 + ~~(v / 0x10000) + z[12] + y[4] - x[4] - z[4] + x[12] * 38) & 0xffff
  r[13] = (v = 0x7fff80 + ~~(v / 0x10000) + z[13] + y[5] - x[5] - z[5] + x[13] * 38) & 0xffff
  r[14] = (v = 0x7fff80 + ~~(v / 0x10000) + z[14] + y[6] - x[6] - z[6] + x[14] * 38) & 0xffff
  r[15] = 0x7fff80 + ~~(v / 0x10000) + z[15] + y[7] - x[7] - z[7] + x[15] * 38
  curve25519_reduce(r)
}

var curve25519_mulasmall = function(r: any, a: any, m: any) {
  var v = 0
  r[0] = (v = a[0] * m) & 0xffff
  r[1] = (v = ~~(v / 0x10000) + a[1] * m) & 0xffff
  r[2] = (v = ~~(v / 0x10000) + a[2] * m) & 0xffff
  r[3] = (v = ~~(v / 0x10000) + a[3] * m) & 0xffff
  r[4] = (v = ~~(v / 0x10000) + a[4] * m) & 0xffff
  r[5] = (v = ~~(v / 0x10000) + a[5] * m) & 0xffff
  r[6] = (v = ~~(v / 0x10000) + a[6] * m) & 0xffff
  r[7] = (v = ~~(v / 0x10000) + a[7] * m) & 0xffff
  r[8] = (v = ~~(v / 0x10000) + a[8] * m) & 0xffff
  r[9] = (v = ~~(v / 0x10000) + a[9] * m) & 0xffff
  r[10] = (v = ~~(v / 0x10000) + a[10] * m) & 0xffff
  r[11] = (v = ~~(v / 0x10000) + a[11] * m) & 0xffff
  r[12] = (v = ~~(v / 0x10000) + a[12] * m) & 0xffff
  r[13] = (v = ~~(v / 0x10000) + a[13] * m) & 0xffff
  r[14] = (v = ~~(v / 0x10000) + a[14] * m) & 0xffff
  r[15] = ~~(v / 0x10000) + a[15] * m
  curve25519_reduce(r)
}

var curve25519_addmodp = function(r: any, a: any, b: any) {
  var v = 0
  r[0] = (v = (~~(a[15] / 0x8000) + ~~(b[15] / 0x8000)) * 19 + a[0] + b[0]) & 0xffff
  r[1] = (v = ~~(v / 0x10000) + a[1] + b[1]) & 0xffff
  r[2] = (v = ~~(v / 0x10000) + a[2] + b[2]) & 0xffff
  r[3] = (v = ~~(v / 0x10000) + a[3] + b[3]) & 0xffff
  r[4] = (v = ~~(v / 0x10000) + a[4] + b[4]) & 0xffff
  r[5] = (v = ~~(v / 0x10000) + a[5] + b[5]) & 0xffff
  r[6] = (v = ~~(v / 0x10000) + a[6] + b[6]) & 0xffff
  r[7] = (v = ~~(v / 0x10000) + a[7] + b[7]) & 0xffff
  r[8] = (v = ~~(v / 0x10000) + a[8] + b[8]) & 0xffff
  r[9] = (v = ~~(v / 0x10000) + a[9] + b[9]) & 0xffff
  r[10] = (v = ~~(v / 0x10000) + a[10] + b[10]) & 0xffff
  r[11] = (v = ~~(v / 0x10000) + a[11] + b[11]) & 0xffff
  r[12] = (v = ~~(v / 0x10000) + a[12] + b[12]) & 0xffff
  r[13] = (v = ~~(v / 0x10000) + a[13] + b[13]) & 0xffff
  r[14] = (v = ~~(v / 0x10000) + a[14] + b[14]) & 0xffff
  r[15] = ~~(v / 0x10000) + a[15] % 0x8000 + b[15] % 0x8000
}

var curve25519_submodp = function(r: any, a: any, b: any) {
  var v = 0
  r[0] = (v = 0x80000 + (~~(a[15] / 0x8000) - ~~(b[15] / 0x8000) - 1) * 19 + a[0] - b[0]) & 0xffff
  r[1] = (v = ~~(v / 0x10000) + 0x7fff8 + a[1] - b[1]) & 0xffff
  r[2] = (v = ~~(v / 0x10000) + 0x7fff8 + a[2] - b[2]) & 0xffff
  r[3] = (v = ~~(v / 0x10000) + 0x7fff8 + a[3] - b[3]) & 0xffff
  r[4] = (v = ~~(v / 0x10000) + 0x7fff8 + a[4] - b[4]) & 0xffff
  r[5] = (v = ~~(v / 0x10000) + 0x7fff8 + a[5] - b[5]) & 0xffff
  r[6] = (v = ~~(v / 0x10000) + 0x7fff8 + a[6] - b[6]) & 0xffff
  r[7] = (v = ~~(v / 0x10000) + 0x7fff8 + a[7] - b[7]) & 0xffff
  r[8] = (v = ~~(v / 0x10000) + 0x7fff8 + a[8] - b[8]) & 0xffff
  r[9] = (v = ~~(v / 0x10000) + 0x7fff8 + a[9] - b[9]) & 0xffff
  r[10] = (v = ~~(v / 0x10000) + 0x7fff8 + a[10] - b[10]) & 0xffff
  r[11] = (v = ~~(v / 0x10000) + 0x7fff8 + a[11] - b[11]) & 0xffff
  r[12] = (v = ~~(v / 0x10000) + 0x7fff8 + a[12] - b[12]) & 0xffff
  r[13] = (v = ~~(v / 0x10000) + 0x7fff8 + a[13] - b[13]) & 0xffff
  r[14] = (v = ~~(v / 0x10000) + 0x7fff8 + a[14] - b[14]) & 0xffff
  r[15] = ~~(v / 0x10000) + 0x7ff8 + a[15] % 0x8000 - b[15] % 0x8000
}
/****
 * BloodyRookie: a^-1 is found via Fermats little theorem:
 * a^p congruent a mod p and therefore a^(p-2) congruent a^-1 mod p
 */
var curve25519_invmodp = function(r: any, a: any, sqrtassist: any) {
  var r1 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  var r2 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  var r3 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  var r4 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  var r5 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  var i = 0
  curve25519_sqrmodp(r2, a) //  2 == 2 * 1
  curve25519_sqrmodp(r3, r2) //  4 == 2 * 2
  curve25519_sqrmodp(r1, r3) //  8 == 2 * 4
  curve25519_mulmodp(r3, r1, a) //  9 == 8 + 1
  curve25519_mulmodp(r1, r3, r2) // 11 == 9 + 2
  curve25519_sqrmodp(r2, r1) // 22 == 2 * 11
  curve25519_mulmodp(r4, r2, r3) // 31 == 22 + 9
  //	== 2^5   - 2^0
  curve25519_sqrmodp(r2, r4) // 2^6   - 2^1
  curve25519_sqrmodp(r3, r2) // 2^7   - 2^2
  curve25519_sqrmodp(r2, r3) // 2^8   - 2^3
  curve25519_sqrmodp(r3, r2) // 2^9   - 2^4
  curve25519_sqrmodp(r2, r3) // 2^10  - 2^5
  curve25519_mulmodp(r3, r2, r4) // 2^10  - 2^0
  curve25519_sqrmodp(r2, r3) // 2^11  - 2^1
  curve25519_sqrmodp(r4, r2) // 2^12  - 2^2
  for (i = 1; i < 5; i++) {
    curve25519_sqrmodp(r2, r4)
    curve25519_sqrmodp(r4, r2)
  } // 2^20  - 2^10
  curve25519_mulmodp(r2, r4, r3) // 2^20  - 2^0
  curve25519_sqrmodp(r4, r2) // 2^21  - 2^1
  curve25519_sqrmodp(r5, r4) // 2^22  - 2^2
  for (i = 1; i < 10; i++) {
    curve25519_sqrmodp(r4, r5)
    curve25519_sqrmodp(r5, r4)
  } // 2^40  - 2^20
  curve25519_mulmodp(r4, r5, r2) // 2^40  - 2^0
  for (i = 0; i < 5; i++) {
    curve25519_sqrmodp(r2, r4)
    curve25519_sqrmodp(r4, r2)
  } // 2^50  - 2^10
  curve25519_mulmodp(r2, r4, r3) // 2^50  - 2^0
  curve25519_sqrmodp(r3, r2) // 2^51  - 2^1
  curve25519_sqrmodp(r4, r3) // 2^52  - 2^2
  for (i = 1; i < 25; i++) {
    curve25519_sqrmodp(r3, r4)
    curve25519_sqrmodp(r4, r3)
  } // 2^100 - 2^50
  curve25519_mulmodp(r3, r4, r2) // 2^100 - 2^0
  curve25519_sqrmodp(r4, r3) // 2^101 - 2^1
  curve25519_sqrmodp(r5, r4) // 2^102 - 2^2
  for (i = 1; i < 50; i++) {
    curve25519_sqrmodp(r4, r5)
    curve25519_sqrmodp(r5, r4)
  } // 2^200 - 2^100
  curve25519_mulmodp(r4, r5, r3) // 2^200 - 2^0
  for (i = 0; i < 25; i++) {
    curve25519_sqrmodp(r5, r4)
    curve25519_sqrmodp(r4, r5)
  } // 2^250 - 2^50
  curve25519_mulmodp(r3, r4, r2) // 2^250 - 2^0
  curve25519_sqrmodp(r2, r3) // 2^251 - 2^1
  curve25519_sqrmodp(r3, r2) // 2^252 - 2^2
  if (sqrtassist == 1) {
    curve25519_mulmodp(r, a, r3) // 2^252 - 3
  } else {
    curve25519_sqrmodp(r2, r3) // 2^253 - 2^3
    curve25519_sqrmodp(r3, r2) // 2^254 - 2^4
    curve25519_sqrmodp(r2, r3) // 2^255 - 2^5
    curve25519_mulmodp(r, r2, r1) // 2^255 - 21
  }
}

var curve25519_reduce = function(a: any) {
  curve25519_reduce2(a)

  /**
   * BloodyRookie: special case for p <= a < 2^255
   */
  if (
    a[15] != 0x7fff ||
    a[14] != 0xffff ||
    a[13] != 0xffff ||
    a[12] != 0xffff ||
    a[11] != 0xffff ||
    a[10] != 0xffff ||
    a[9] != 0xffff ||
    a[8] != 0xffff ||
    a[7] != 0xffff ||
    a[6] != 0xffff ||
    a[5] != 0xffff ||
    a[4] != 0xffff ||
    a[3] != 0xffff ||
    a[2] != 0xffff ||
    a[1] != 0xffff ||
    a[0] < 0xffed
  ) {
    return
  }

  var i
  for (i = 1; i < 16; i++) {
    a[i] = 0
  }
  a[0] = a[0] - 0xffed
}
var curve25519_reduce2 = function(a: any) {
  var v = a[15]
  if (v < 0x8000) return
  a[15] = v % 0x8000
  v = ~~(v / 0x8000) * 19
  a[0] = (v += a[0]) & 0xffff
  if ((v = ~~(v / 0x10000)) < 1) return
  a[1] = (v += a[1]) & 0xffff
  if ((v = ~~(v / 0x10000)) < 1) return
  a[2] = (v += a[2]) & 0xffff
  if ((v = ~~(v / 0x10000)) < 1) return
  a[3] = (v += a[3]) & 0xffff
  if ((v = ~~(v / 0x10000)) < 1) return
  a[4] = (v += a[4]) & 0xffff
  if ((v = ~~(v / 0x10000)) < 1) return
  a[5] = (v += a[5]) & 0xffff
  if ((v = ~~(v / 0x10000)) < 1) return
  a[6] = (v += a[6]) & 0xffff
  if ((v = ~~(v / 0x10000)) < 1) return
  a[7] = (v += a[7]) & 0xffff
  if ((v = ~~(v / 0x10000)) < 1) return
  a[8] = (v += a[8]) & 0xffff
  if ((v = ~~(v / 0x10000)) < 1) return
  a[9] = (v += a[9]) & 0xffff
  if ((v = ~~(v / 0x10000)) < 1) return
  a[10] = (v += a[10]) & 0xffff
  if ((v = ~~(v / 0x10000)) < 1) return
  a[11] = (v += a[11]) & 0xffff
  if ((v = ~~(v / 0x10000)) < 1) return
  a[12] = (v += a[12]) & 0xffff
  if ((v = ~~(v / 0x10000)) < 1) return
  a[13] = (v += a[13]) & 0xffff
  if ((v = ~~(v / 0x10000)) < 1) return
  a[14] = (v += a[14]) & 0xffff
  if ((v = ~~(v / 0x10000)) < 1) return
  a[15] += v
}

/**
 * Montgomery curve with A=486662 and B=1
 */
var curve25519_x_to_y2 = function(r: any, x: any) {
  var r1 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  var r2 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  curve25519_sqrmodp(r1, x) // r1 = x^2
  curve25519_mulasmall(r2, x, 486662) // r2 = Ax
  curve25519_addmodp(r, r1, r2) //  r = x^2 + Ax
  curve25519_addmodp(r1, r, curve25519_one()) // r1 = x^2 + Ax + 1
  curve25519_mulmodp(r, r1, x) //  r = x^3 + Ax^2 + x
}

var curve25519_prep = function(r: any, s: any, a: any, b: any) {
  curve25519_addmodp(r, a, b)
  curve25519_submodp(s, a, b)
}

/****
 * BloodyRookie: Doubling a point on a Montgomery curve:
 * Point is given in projective coordinates p=x/z
 * 2*P = r/s,
 * r = (x+z)^2 * (x-z)^2
 * s = ((((x+z)^2 - (x-z)^2) * 121665) + (x+z)^2) * ((x+z)^2 - (x-z)^2)
 *   = 4*x*z * (x^2 + 486662*x*z + z^2)
 *   = 4*x*z * ((x-z)^2 + ((486662+2)/4)(4*x*z))
 */
var curve25519_dbl = function(r: any, s: any, t1: any, t2: any) {
  var r1 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  var r2 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  var r3 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  var r4 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  curve25519_sqrmodp(r1, t1) // r1 = t1^2
  curve25519_sqrmodp(r2, t2) // r2 = t2^2
  curve25519_submodp(r3, r1, r2) // r3 = t1^2 - t2^2
  curve25519_mulmodp(r, r2, r1) //  r = t1^2 * t2^2
  curve25519_mulasmall(r2, r3, 121665) // r2 = (t1^2 - t2^2) * 121665
  curve25519_addmodp(r4, r2, r1) // r4 = (t1^2 - t2^2) * 121665 + t1^2
  curve25519_mulmodp(s, r4, r3) //  s = ((t1^2 - t2^2) * 121665 + t1^2) * (t1^2 - t2^2)
}

/****
 * BloodyRookie: Adding 2 points on a Montgomery curve:
 * R = Q + P = r/s when given
 * Q = x/z, P = x_p/z_p, P-Q = x_1/1
 * r = ((x-z)*(x_p+z_p) + (x+z)*(x_p-z_p))^2
 * s = x_1*((x-z)*(x_p+z_p) - (x+z)*(x_p-z_p))^2
 */
function curve25519_sum(r: any, s: any, t1: any, t2: any, t3: any, t4: any, x_1: any) {
  var r1 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  var r2 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  var r3 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  var r4 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  curve25519_mulmodp(r1, t2, t3) // r1 = t2 * t3
  curve25519_mulmodp(r2, t1, t4) // r2 = t1 * t4
  curve25519_addmodp(r3, r1, r2) // r3 = t2 * t3 + t1 * t4
  curve25519_submodp(r4, r1, r2) // r4 = t2 * t3 - t1 * t4
  curve25519_sqrmodp(r, r3) //  r = (t2 * t3 + t1 * t4)^2
  curve25519_sqrmodp(r1, r4) // r1 = (t2 * t3 - t1 * t4)^2
  curve25519_mulmodp(s, r1, x_1) //  s = (t2 * t3 - t1 * t4)^2 * x_1
}

function curve25519_(f: any, c: any, s: any) {
  var j,
    a,
    x_1,
    q,
    fb,
    counter = 0
  var t = new Array(16) //, t1 = new Array(16), t2 = new Array(16), t3 = new Array(16), t4 = new Array(16);
  var sb = new Int8Array(32)
  var temp1 = new Int8Array(32)
  var temp2 = new Int8Array(64)
  var temp3 = new Int8Array(64)

  x_1 = c
  q = [curve25519_one(), curve25519_zero()]
  a = [x_1, curve25519_one()]

  var n = 255

  /**********************************************************************
   * BloodyRookie:                                                      *
   * Given f = f0*2^0 + f1*2^1 + ... + f255*2^255 and Basepoint a=9/1   *
   * calculate f*a by applying the Montgomery ladder (const time algo): *
   * r0 := 0 (point at infinity)                                        *
   * r1 := a                                                            *
   * for i from 255 to 0 do                                             *
   *   if fi = 0 then                                                   *
   *      r1 := r0 + r1                                                 *
   *      r0 := 2r0                                                     *
   *   else                                                             *
   *      r0 := r0 + r1                                                 *
   *      r1 := 2r1                                                     *
   *                                                                    *
   * Result: r0 = x-coordinate of f*a                                   *
   **********************************************************************/
  var r0 = new Array(new Array(16), new Array(16))
  var r1 = new Array(new Array(16), new Array(16))
  var t1 = new Array(16),
    t2 = new Array(16)
  var t3 = new Array(16),
    t4 = new Array(16)
  var fi
  while (n >= 0) {
    fi = curve25519_getbit(f, n)
    if (fi == 0) {
      curve25519_prep(t1, t2, a[0], a[1])
      curve25519_prep(t3, t4, q[0], q[1])
      curve25519_sum(r1[0], r1[1], t1, t2, t3, t4, x_1)
      curve25519_dbl(r0[0], r0[1], t3, t4)
    } else {
      curve25519_prep(t1, t2, q[0], q[1])
      curve25519_prep(t3, t4, a[0], a[1])
      curve25519_sum(r0[0], r0[1], t1, t2, t3, t4, x_1)
      curve25519_dbl(r1[0], r1[1], t3, t4)
    }
    q = r0
    a = r1
    n--
  }
  curve25519_invmodp(t, q[1], 0)
  curve25519_mulmodp(t1, q[0], t)
  q[0] = curve25519_cpy16(t1)

  // q[0]=x-coordinate of k*G=:Px
  // q[1]=z-coordinate of k*G=:Pz
  // a = q + G = P + G
  if (s != null) {
    /*************************************************************************
     * BloodyRookie: Recovery of the y-coordinate of point P:                *
     *                                                                       *
     * If P=(x,y), P1=(x1, y1), P2=(x2,y2) and P2 = P1 + P then              *
     *                                                                       *
     * y1 = ((x1 * x + 1)(x1 + x + 2A) - 2A - (x1 - x)^2 * x2)/2y            *
     *                                                                       *
     * Setting P2=Q, P1=P and P=G in the above formula we get                *
     *                                                                       *
     * Py =  ((Px * Gx + 1) * (Px + Gx + 2A) - 2A - (Px - Gx)^2 * Qx)/(2*Gy) *
     *    = -((Qx + Px + Gx + A) * (Px - Gx)^2 - Py^2 - Gy^2)/(2*Gy)         *
     *************************************************************************/
    t = curve25519_cpy16(q[0])
    curve25519_x_to_y2(t1, t) // t1 = Py^2
    curve25519_invmodp(t3, a[1], 0)
    curve25519_mulmodp(t2, a[0], t3) // t2 = (P+G)x = Qx
    curve25519_addmodp(t4, t2, t) // t4 =  Qx + Px
    curve25519_addmodp(t2, t4, curve25519_486671()) // t2 = Qx + Px + Gx + A
    curve25519_submodp(t4, t, curve25519_nine()) // t4 = Px - Gx
    curve25519_sqrmodp(t3, t4) // t3 = (Px - Gx)^2
    curve25519_mulmodp(t4, t2, t3) // t4 = (Qx + Px + Gx + A) * (Px - Gx)^2
    curve25519_submodp(t, t4, t1) //  t = (Qx + Px + Gx + A) * (Px - Gx)^2 - Py^2
    curve25519_submodp(t4, t, curve25519_39420360()) // t4 = (Qx + Px + Gx + A) * (Px - Gx)^2 - Py^2 - Gy^2
    curve25519_mulmodp(t1, t4, curve25519_r2y()) // t1 = ((Qx + Px + Gx + A) * (Px - Gx)^2 - Py^2 - Gy^2)/(2Gy) = -Py
    fb = curve25519_convertToByteArray(f)
    j = curve25519_isNegative(t1)
    if (j != 0) {
      /***
       * Py is positiv, so just copy
       */
      sb = curve25519_cpy32(fb)
    } else {
      /***
       * Py is negative:
       * We will take s = -f^-1 mod q instead of s=f^-1 mod q
       */
      curve25519_mula_small(sb, curve25519_order_times_8, 0, fb, 32, -1)
    }

    temp1 = curve25519_cpy32(curve25519_order)
    temp1 = curve25519_egcd32(temp2, temp3, sb, temp1)
    sb = curve25519_cpy32(temp1)
    if ((sb[31] & 0x80) != 0) {
      curve25519_mula_small(sb, sb, 0, curve25519_order, 32, 1)
    }
    var stmp = curve25519_convertToShortArray(sb)
    curve25519_fillShortArray(stmp, s)
  }

  return q[0]
}

// ==================================================================================================
// END INCLUDE FILE curve25519_.js
// ==================================================================================================

// ==================================================================================================
// START INCLUDE FILE curve25519.js
// ==================================================================================================

/* Ported to JavaScript from Java 07/01/14.
*
* Ported from C to Java by Dmitry Skiba [sahn0], 23/02/08.
* Original: http://cds.xs4all.nl:8081/ecdh/
*/
/* Generic 64-bit integer implementation of Curve25519 ECDH
* Written by Matthijs van Duin, 200608242056
* Public domain.
*
* Based on work by Daniel J Bernstein, http://cr.yp.to/ecdh.html
*/

var curve25519 = (function() {
  //region Constants

  var KEY_SIZE = 32

  /* array length */
  var UNPACKED_SIZE = 16

  /* group order (a prime near 2^252+2^124) */
  var ORDER = [
    237,
    211,
    245,
    92,
    26,
    99,
    18,
    88,
    214,
    156,
    247,
    162,
    222,
    249,
    222,
    20,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    16
  ]

  /* smallest multiple of the order that's >= 2^255 */
  var ORDER_TIMES_8 = [
    104,
    159,
    174,
    231,
    210,
    24,
    147,
    192,
    178,
    230,
    188,
    23,
    245,
    206,
    247,
    166,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    128
  ]

  /* constants 2Gy and 1/(2Gy) */
  var BASE_2Y = [
    22587,
    610,
    29883,
    44076,
    15515,
    9479,
    25859,
    56197,
    23910,
    4462,
    17831,
    16322,
    62102,
    36542,
    52412,
    16035
  ]

  var BASE_R2Y = [
    5744,
    16384,
    61977,
    54121,
    8776,
    18501,
    26522,
    34893,
    23833,
    5823,
    55924,
    58749,
    24147,
    14085,
    13606,
    6080
  ]

  var C1 = [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  var C9 = [9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  var C486671 = [0x6d0f, 0x0007, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  var C39420360 = [0x81c8, 0x0259, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]

  var P25 = 33554431 /* (1 << 25) - 1 */
  var P26 = 67108863 /* (1 << 26) - 1 */

  //#endregion

  //region Key Agreement

  /* Private key clamping
  *   k [out] your private key for key agreement
  *   k  [in]  32 random bytes
  */
  function clamp(k: any) {
    k[31] &= 0x7f
    k[31] |= 0x40
    k[0] &= 0xf8
  }

  //endregion

  //region radix 2^8 math

  function cpy32(d: any, s: any) {
    for (var i = 0; i < 32; i++) d[i] = s[i]
  }

  /* p[m..n+m-1] = q[m..n+m-1] + z * x */
  /* n is the size of x */
  /* n+m is the size of p and q */
  function mula_small(p: any, q: any, m: any, x: any, n: any, z: any) {
    m = m | 0
    n = n | 0
    z = z | 0

    var v = 0
    for (var i = 0; i < n; ++i) {
      v += (q[i + m] & 0xff) + z * (x[i] & 0xff)
      p[i + m] = v & 0xff
      v >>= 8
    }

    return v
  }

  /* p += x * y * z  where z is a small integer
  * x is size 32, y is size t, p is size 32+t
  * y is allowed to overlap with p+32 if you don't care about the upper half  */
  function mula32(p: any, x: any, y: any, t: any, z: any) {
    t = t | 0
    z = z | 0

    var n = 31
    var w = 0
    var i = 0
    for (; i < t; i++) {
      var zy = z * (y[i] & 0xff)
      w += mula_small(p, p, i, x, n, zy) + (p[i + n] & 0xff) + zy * (x[n] & 0xff)
      p[i + n] = w & 0xff
      w >>= 8
    }
    p[i + n] = (w + (p[i + n] & 0xff)) & 0xff
    return w >> 8
  }

  /* divide r (size n) by d (size t), returning quotient q and remainder r
  * quotient is size n-t+1, remainder is size t
  * requires t > 0 && d[t-1] !== 0
  * requires that r[-1] and d[-1] are valid memory locations
  * q may overlap with r+t */
  function divmod(q: any, r: any, n: any, d: any, t: any) {
    n = n | 0
    t = t | 0

    var rn = 0
    var dt = (d[t - 1] & 0xff) << 8
    if (t > 1) dt |= d[t - 2] & 0xff

    while (n-- >= t) {
      var z = (rn << 16) | ((r[n] & 0xff) << 8)
      if (n > 0) z |= r[n - 1] & 0xff

      var i = n - t + 1
      z /= dt
      rn += mula_small(r, r, i, d, t, -z)
      q[i] = (z + rn) & 0xff
      /* rn is 0 or -1 (underflow) */
      mula_small(r, r, i, d, t, -rn)
      rn = r[n] & 0xff
      r[n] = 0
    }

    r[t - 1] = rn & 0xff
  }

  function numsize(x: any, n: any) {
    while (n-- !== 0 && x[n] === 0) {}
    return n + 1
  }

  /* Returns x if a contains the gcd, y if b.
  * Also, the returned buffer contains the inverse of a mod b,
  * as 32-byte signed.
  * x and y must have 64 bytes space for temporary use.
  * requires that a[-1] and b[-1] are valid memory locations  */
  function egcd32(x: any, y: any, a: any, b: any) {
    var an,
      bn = 32,
      qn,
      i
    for (i = 0; i < 32; i++) x[i] = y[i] = 0
    x[0] = 1
    an = numsize(a, 32)
    if (an === 0) return y /* division by zero */
    var temp = new Array(32)
    while (true) {
      qn = bn - an + 1
      divmod(temp, b, bn, a, an)
      bn = numsize(b, bn)
      if (bn === 0) return x
      mula32(y, x, temp, qn, -1)

      qn = an - bn + 1
      divmod(temp, a, an, b, bn)
      an = numsize(a, an)
      if (an === 0) return y
      mula32(x, y, temp, qn, -1)
    }
  }

  //endregion

  //region radix 2^25.5 GF(2^255-19) math

  //region pack / unpack

  /* Convert to internal format from little-endian byte format */
  function unpack(x: any, m: any) {
    for (var i = 0; i < KEY_SIZE; i += 2) x[i / 2] = (m[i] & 0xff) | ((m[i + 1] & 0xff) << 8)
  }

  /* Check if reduced-form input >= 2^255-19 */
  function is_overflow(x: any) {
    return (
      (x[0] > P26 - 19 &&
        (x[1] & x[3] & x[5] & x[7] & x[9]) === P25 &&
        (x[2] & x[4] & x[6] & x[8]) === P26) ||
      x[9] > P25
    )
  }

  /* Convert from internal format to little-endian byte format.  The
  * number must be in a reduced form which is output by the following ops:
  *     unpack, mul, sqr
  *     set --  if input in range 0 .. P25
  * If you're unsure if the number is reduced, first multiply it by 1.  */
  function pack(x: any, m: any) {
    for (var i = 0; i < UNPACKED_SIZE; ++i) {
      m[2 * i] = x[i] & 0x00ff
      m[2 * i + 1] = (x[i] & 0xff00) >> 8
    }
  }

  //endregion

  function createUnpackedArray() {
    return new Uint16Array(UNPACKED_SIZE)
  }

  /* Copy a number */
  function cpy(d: any, s: any) {
    for (var i = 0; i < UNPACKED_SIZE; ++i) d[i] = s[i]
  }

  /* Set a number to value, which must be in range -185861411 .. 185861411 */
  function set(d: any, s: any) {
    d[0] = s
    for (var i = 1; i < UNPACKED_SIZE; ++i) d[i] = 0
  }

  /* Add/subtract two numbers.  The inputs must be in reduced form, and the
  * output isn't, so to do another addition or subtraction on the output,
  * first multiply it by one to reduce it. */
  var add = c255laddmodp
  var sub = c255lsubmodp

  /* Multiply a number by a small integer in range -185861411 .. 185861411.
  * The output is in reduced form, the input x need not be.  x and xy may point
  * to the same buffer. */
  var mul_small = c255lmulasmall

  /* Multiply two numbers.  The output is in reduced form, the inputs need not be. */
  var mul = c255lmulmodp

  /* Square a number.  Optimization of  mul25519(x2, x, x)  */
  var sqr = c255lsqrmodp

  /* Calculates a reciprocal.  The output is in reduced form, the inputs need not
  * be.  Simply calculates  y = x^(p-2)  so it's not too fast. */
  /* When sqrtassist is true, it instead calculates y = x^((p-5)/8) */
  function recip(y: any, x: any, sqrtassist: any) {
    var t0 = createUnpackedArray()
    var t1 = createUnpackedArray()
    var t2 = createUnpackedArray()
    var t3 = createUnpackedArray()
    var t4 = createUnpackedArray()

    /* the chain for x^(2^255-21) is straight from djb's implementation */
    var i
    sqr(t1, x) /*  2 === 2 * 1	*/
    sqr(t2, t1) /*  4 === 2 * 2	*/
    sqr(t0, t2) /*  8 === 2 * 4	*/
    mul(t2, t0, x) /*  9 === 8 + 1	*/
    mul(t0, t2, t1) /* 11 === 9 + 2	*/
    sqr(t1, t0) /* 22 === 2 * 11	*/
    mul(t3, t1, t2) /* 31 === 22 + 9 === 2^5   - 2^0	*/
    sqr(t1, t3) /* 2^6   - 2^1	*/
    sqr(t2, t1) /* 2^7   - 2^2	*/
    sqr(t1, t2) /* 2^8   - 2^3	*/
    sqr(t2, t1) /* 2^9   - 2^4	*/
    sqr(t1, t2) /* 2^10  - 2^5	*/
    mul(t2, t1, t3) /* 2^10  - 2^0	*/
    sqr(t1, t2) /* 2^11  - 2^1	*/
    sqr(t3, t1) /* 2^12  - 2^2	*/
    for (i = 1; i < 5; i++) {
      sqr(t1, t3)
      sqr(t3, t1)
    } /* t3 */ /* 2^20  - 2^10	*/
    mul(t1, t3, t2) /* 2^20  - 2^0	*/
    sqr(t3, t1) /* 2^21  - 2^1	*/
    sqr(t4, t3) /* 2^22  - 2^2	*/
    for (i = 1; i < 10; i++) {
      sqr(t3, t4)
      sqr(t4, t3)
    } /* t4 */ /* 2^40  - 2^20	*/
    mul(t3, t4, t1) /* 2^40  - 2^0	*/
    for (i = 0; i < 5; i++) {
      sqr(t1, t3)
      sqr(t3, t1)
    } /* t3 */ /* 2^50  - 2^10	*/
    mul(t1, t3, t2) /* 2^50  - 2^0	*/
    sqr(t2, t1) /* 2^51  - 2^1	*/
    sqr(t3, t2) /* 2^52  - 2^2	*/
    for (i = 1; i < 25; i++) {
      sqr(t2, t3)
      sqr(t3, t2)
    } /* t3 */ /* 2^100 - 2^50 */
    mul(t2, t3, t1) /* 2^100 - 2^0	*/
    sqr(t3, t2) /* 2^101 - 2^1	*/
    sqr(t4, t3) /* 2^102 - 2^2	*/
    for (i = 1; i < 50; i++) {
      sqr(t3, t4)
      sqr(t4, t3)
    } /* t4 */ /* 2^200 - 2^100 */
    mul(t3, t4, t2) /* 2^200 - 2^0	*/
    for (i = 0; i < 25; i++) {
      sqr(t4, t3)
      sqr(t3, t4)
    } /* t3 */ /* 2^250 - 2^50	*/
    mul(t2, t3, t1) /* 2^250 - 2^0	*/
    sqr(t1, t2) /* 2^251 - 2^1	*/
    sqr(t2, t1) /* 2^252 - 2^2	*/
    if (sqrtassist !== 0) {
      mul(y, x, t2) /* 2^252 - 3 */
    } else {
      sqr(t1, t2) /* 2^253 - 2^3	*/
      sqr(t2, t1) /* 2^254 - 2^4	*/
      sqr(t1, t2) /* 2^255 - 2^5	*/
      mul(y, t1, t0) /* 2^255 - 21	*/
    }
  }

  /* checks if x is "negative", requires reduced input */
  function is_negative(x: any) {
    var isOverflowOrNegative = is_overflow(x) || x[9] < 0
    var leastSignificantBit = x[0] & 1
    return ((isOverflowOrNegative ? 1 : 0) ^ leastSignificantBit) & 0xffffffff
  }

  /* a square root */
  function sqrt(x: any, u: any) {
    var v = createUnpackedArray()
    var t1 = createUnpackedArray()
    var t2 = createUnpackedArray()

    add(t1, u, u) /* t1 = 2u		*/
    recip(v, t1, 1) /* v = (2u)^((p-5)/8)	*/
    sqr(x, v) /* x = v^2		*/
    mul(t2, t1, x) /* t2 = 2uv^2		*/
    sub(t2, t2, C1) /* t2 = 2uv^2-1		*/
    mul(t1, v, t2) /* t1 = v(2uv^2-1)	*/
    mul(x, u, t1) /* x = uv(2uv^2-1)	*/
  }

  //endregion

  //region JavaScript Fast Math

  function c255lsqr8h(a7: any, a6: any, a5: any, a4: any, a3: any, a2: any, a1: any, a0: any) {
    var r = []
    var v
    r[0] = (v = a0 * a0) & 0xffff
    r[1] = (v = ((v / 0x10000) | 0) + 2 * a0 * a1) & 0xffff
    r[2] = (v = ((v / 0x10000) | 0) + 2 * a0 * a2 + a1 * a1) & 0xffff
    r[3] = (v = ((v / 0x10000) | 0) + 2 * a0 * a3 + 2 * a1 * a2) & 0xffff
    r[4] = (v = ((v / 0x10000) | 0) + 2 * a0 * a4 + 2 * a1 * a3 + a2 * a2) & 0xffff
    r[5] = (v = ((v / 0x10000) | 0) + 2 * a0 * a5 + 2 * a1 * a4 + 2 * a2 * a3) & 0xffff
    r[6] = (v = ((v / 0x10000) | 0) + 2 * a0 * a6 + 2 * a1 * a5 + 2 * a2 * a4 + a3 * a3) & 0xffff
    r[7] =
      (v = ((v / 0x10000) | 0) + 2 * a0 * a7 + 2 * a1 * a6 + 2 * a2 * a5 + 2 * a3 * a4) & 0xffff
    r[8] = (v = ((v / 0x10000) | 0) + 2 * a1 * a7 + 2 * a2 * a6 + 2 * a3 * a5 + a4 * a4) & 0xffff
    r[9] = (v = ((v / 0x10000) | 0) + 2 * a2 * a7 + 2 * a3 * a6 + 2 * a4 * a5) & 0xffff
    r[10] = (v = ((v / 0x10000) | 0) + 2 * a3 * a7 + 2 * a4 * a6 + a5 * a5) & 0xffff
    r[11] = (v = ((v / 0x10000) | 0) + 2 * a4 * a7 + 2 * a5 * a6) & 0xffff
    r[12] = (v = ((v / 0x10000) | 0) + 2 * a5 * a7 + a6 * a6) & 0xffff
    r[13] = (v = ((v / 0x10000) | 0) + 2 * a6 * a7) & 0xffff
    r[14] = (v = ((v / 0x10000) | 0) + a7 * a7) & 0xffff
    r[15] = (v / 0x10000) | 0
    return r
  }

  function c255lsqrmodp(r: any, a: any) {
    var x = c255lsqr8h(a[15], a[14], a[13], a[12], a[11], a[10], a[9], a[8])
    var z = c255lsqr8h(a[7], a[6], a[5], a[4], a[3], a[2], a[1], a[0])
    var y = c255lsqr8h(
      a[15] + a[7],
      a[14] + a[6],
      a[13] + a[5],
      a[12] + a[4],
      a[11] + a[3],
      a[10] + a[2],
      a[9] + a[1],
      a[8] + a[0]
    )

    var v
    r[0] = (v = 0x800000 + z[0] + (y[8] - x[8] - z[8] + x[0] - 0x80) * 38) & 0xffff
    r[1] = (v = 0x7fff80 + ((v / 0x10000) | 0) + z[1] + (y[9] - x[9] - z[9] + x[1]) * 38) & 0xffff
    r[2] =
      (v = 0x7fff80 + ((v / 0x10000) | 0) + z[2] + (y[10] - x[10] - z[10] + x[2]) * 38) & 0xffff
    r[3] =
      (v = 0x7fff80 + ((v / 0x10000) | 0) + z[3] + (y[11] - x[11] - z[11] + x[3]) * 38) & 0xffff
    r[4] =
      (v = 0x7fff80 + ((v / 0x10000) | 0) + z[4] + (y[12] - x[12] - z[12] + x[4]) * 38) & 0xffff
    r[5] =
      (v = 0x7fff80 + ((v / 0x10000) | 0) + z[5] + (y[13] - x[13] - z[13] + x[5]) * 38) & 0xffff
    r[6] =
      (v = 0x7fff80 + ((v / 0x10000) | 0) + z[6] + (y[14] - x[14] - z[14] + x[6]) * 38) & 0xffff
    r[7] =
      (v = 0x7fff80 + ((v / 0x10000) | 0) + z[7] + (y[15] - x[15] - z[15] + x[7]) * 38) & 0xffff
    r[8] = (v = 0x7fff80 + ((v / 0x10000) | 0) + z[8] + y[0] - x[0] - z[0] + x[8] * 38) & 0xffff
    r[9] = (v = 0x7fff80 + ((v / 0x10000) | 0) + z[9] + y[1] - x[1] - z[1] + x[9] * 38) & 0xffff
    r[10] = (v = 0x7fff80 + ((v / 0x10000) | 0) + z[10] + y[2] - x[2] - z[2] + x[10] * 38) & 0xffff
    r[11] = (v = 0x7fff80 + ((v / 0x10000) | 0) + z[11] + y[3] - x[3] - z[3] + x[11] * 38) & 0xffff
    r[12] = (v = 0x7fff80 + ((v / 0x10000) | 0) + z[12] + y[4] - x[4] - z[4] + x[12] * 38) & 0xffff
    r[13] = (v = 0x7fff80 + ((v / 0x10000) | 0) + z[13] + y[5] - x[5] - z[5] + x[13] * 38) & 0xffff
    r[14] = (v = 0x7fff80 + ((v / 0x10000) | 0) + z[14] + y[6] - x[6] - z[6] + x[14] * 38) & 0xffff
    var r15 = 0x7fff80 + ((v / 0x10000) | 0) + z[15] + y[7] - x[7] - z[7] + x[15] * 38
    c255lreduce(r, r15)
  }

  function c255lmul8h(
    a7: any,
    a6: any,
    a5: any,
    a4: any,
    a3: any,
    a2: any,
    a1: any,
    a0: any,
    b7: any,
    b6: any,
    b5: any,
    b4: any,
    b3: any,
    b2: any,
    b1: any,
    b0: any
  ) {
    var r = []
    var v
    r[0] = (v = a0 * b0) & 0xffff
    r[1] = (v = ((v / 0x10000) | 0) + a0 * b1 + a1 * b0) & 0xffff
    r[2] = (v = ((v / 0x10000) | 0) + a0 * b2 + a1 * b1 + a2 * b0) & 0xffff
    r[3] = (v = ((v / 0x10000) | 0) + a0 * b3 + a1 * b2 + a2 * b1 + a3 * b0) & 0xffff
    r[4] = (v = ((v / 0x10000) | 0) + a0 * b4 + a1 * b3 + a2 * b2 + a3 * b1 + a4 * b0) & 0xffff
    r[5] =
      (v = ((v / 0x10000) | 0) + a0 * b5 + a1 * b4 + a2 * b3 + a3 * b2 + a4 * b1 + a5 * b0) & 0xffff
    r[6] =
      (v =
        ((v / 0x10000) | 0) + a0 * b6 + a1 * b5 + a2 * b4 + a3 * b3 + a4 * b2 + a5 * b1 + a6 * b0) &
      0xffff
    r[7] =
      (v =
        ((v / 0x10000) | 0) +
        a0 * b7 +
        a1 * b6 +
        a2 * b5 +
        a3 * b4 +
        a4 * b3 +
        a5 * b2 +
        a6 * b1 +
        a7 * b0) & 0xffff
    r[8] =
      (v =
        ((v / 0x10000) | 0) + a1 * b7 + a2 * b6 + a3 * b5 + a4 * b4 + a5 * b3 + a6 * b2 + a7 * b1) &
      0xffff
    r[9] =
      (v = ((v / 0x10000) | 0) + a2 * b7 + a3 * b6 + a4 * b5 + a5 * b4 + a6 * b3 + a7 * b2) & 0xffff
    r[10] = (v = ((v / 0x10000) | 0) + a3 * b7 + a4 * b6 + a5 * b5 + a6 * b4 + a7 * b3) & 0xffff
    r[11] = (v = ((v / 0x10000) | 0) + a4 * b7 + a5 * b6 + a6 * b5 + a7 * b4) & 0xffff
    r[12] = (v = ((v / 0x10000) | 0) + a5 * b7 + a6 * b6 + a7 * b5) & 0xffff
    r[13] = (v = ((v / 0x10000) | 0) + a6 * b7 + a7 * b6) & 0xffff
    r[14] = (v = ((v / 0x10000) | 0) + a7 * b7) & 0xffff
    r[15] = (v / 0x10000) | 0
    return r
  }

  function c255lmulmodp(r: any, a: any, b: any) {
    // Karatsuba multiplication scheme: x*y = (b^2+b)*x1*y1 - b*(x1-x0)*(y1-y0) + (b+1)*x0*y0
    var x = c255lmul8h(
      a[15],
      a[14],
      a[13],
      a[12],
      a[11],
      a[10],
      a[9],
      a[8],
      b[15],
      b[14],
      b[13],
      b[12],
      b[11],
      b[10],
      b[9],
      b[8]
    )
    var z = c255lmul8h(
      a[7],
      a[6],
      a[5],
      a[4],
      a[3],
      a[2],
      a[1],
      a[0],
      b[7],
      b[6],
      b[5],
      b[4],
      b[3],
      b[2],
      b[1],
      b[0]
    )
    var y = c255lmul8h(
      a[15] + a[7],
      a[14] + a[6],
      a[13] + a[5],
      a[12] + a[4],
      a[11] + a[3],
      a[10] + a[2],
      a[9] + a[1],
      a[8] + a[0],
      b[15] + b[7],
      b[14] + b[6],
      b[13] + b[5],
      b[12] + b[4],
      b[11] + b[3],
      b[10] + b[2],
      b[9] + b[1],
      b[8] + b[0]
    )

    var v
    r[0] = (v = 0x800000 + z[0] + (y[8] - x[8] - z[8] + x[0] - 0x80) * 38) & 0xffff
    r[1] = (v = 0x7fff80 + ((v / 0x10000) | 0) + z[1] + (y[9] - x[9] - z[9] + x[1]) * 38) & 0xffff
    r[2] =
      (v = 0x7fff80 + ((v / 0x10000) | 0) + z[2] + (y[10] - x[10] - z[10] + x[2]) * 38) & 0xffff
    r[3] =
      (v = 0x7fff80 + ((v / 0x10000) | 0) + z[3] + (y[11] - x[11] - z[11] + x[3]) * 38) & 0xffff
    r[4] =
      (v = 0x7fff80 + ((v / 0x10000) | 0) + z[4] + (y[12] - x[12] - z[12] + x[4]) * 38) & 0xffff
    r[5] =
      (v = 0x7fff80 + ((v / 0x10000) | 0) + z[5] + (y[13] - x[13] - z[13] + x[5]) * 38) & 0xffff
    r[6] =
      (v = 0x7fff80 + ((v / 0x10000) | 0) + z[6] + (y[14] - x[14] - z[14] + x[6]) * 38) & 0xffff
    r[7] =
      (v = 0x7fff80 + ((v / 0x10000) | 0) + z[7] + (y[15] - x[15] - z[15] + x[7]) * 38) & 0xffff
    r[8] = (v = 0x7fff80 + ((v / 0x10000) | 0) + z[8] + y[0] - x[0] - z[0] + x[8] * 38) & 0xffff
    r[9] = (v = 0x7fff80 + ((v / 0x10000) | 0) + z[9] + y[1] - x[1] - z[1] + x[9] * 38) & 0xffff
    r[10] = (v = 0x7fff80 + ((v / 0x10000) | 0) + z[10] + y[2] - x[2] - z[2] + x[10] * 38) & 0xffff
    r[11] = (v = 0x7fff80 + ((v / 0x10000) | 0) + z[11] + y[3] - x[3] - z[3] + x[11] * 38) & 0xffff
    r[12] = (v = 0x7fff80 + ((v / 0x10000) | 0) + z[12] + y[4] - x[4] - z[4] + x[12] * 38) & 0xffff
    r[13] = (v = 0x7fff80 + ((v / 0x10000) | 0) + z[13] + y[5] - x[5] - z[5] + x[13] * 38) & 0xffff
    r[14] = (v = 0x7fff80 + ((v / 0x10000) | 0) + z[14] + y[6] - x[6] - z[6] + x[14] * 38) & 0xffff
    var r15 = 0x7fff80 + ((v / 0x10000) | 0) + z[15] + y[7] - x[7] - z[7] + x[15] * 38
    c255lreduce(r, r15)
  }

  function c255lreduce(a: any, a15: any) {
    var v = a15
    a[15] = v & 0x7fff
    v = ((v / 0x8000) | 0) * 19
    for (var i = 0; i <= 14; ++i) {
      a[i] = (v += a[i]) & 0xffff
      v = (v / 0x10000) | 0
    }

    a[15] += v
  }

  function c255laddmodp(r: any, a: any, b: any) {
    var v
    r[0] = (v = (((a[15] / 0x8000) | 0) + ((b[15] / 0x8000) | 0)) * 19 + a[0] + b[0]) & 0xffff
    for (var i = 1; i <= 14; ++i) r[i] = (v = ((v / 0x10000) | 0) + a[i] + b[i]) & 0xffff

    r[15] = ((v / 0x10000) | 0) + (a[15] & 0x7fff) + (b[15] & 0x7fff)
  }

  function c255lsubmodp(r: any, a: any, b: any) {
    var v
    r[0] =
      (v = 0x80000 + (((a[15] / 0x8000) | 0) - ((b[15] / 0x8000) | 0) - 1) * 19 + a[0] - b[0]) &
      0xffff
    for (var i = 1; i <= 14; ++i) r[i] = (v = ((v / 0x10000) | 0) + 0x7fff8 + a[i] - b[i]) & 0xffff

    r[15] = ((v / 0x10000) | 0) + 0x7ff8 + (a[15] & 0x7fff) - (b[15] & 0x7fff)
  }

  function c255lmulasmall(r: any, a: any, m: any) {
    var v
    r[0] = (v = a[0] * m) & 0xffff
    for (var i = 1; i <= 14; ++i) r[i] = (v = ((v / 0x10000) | 0) + a[i] * m) & 0xffff

    var r15 = ((v / 0x10000) | 0) + a[15] * m
    c255lreduce(r, r15)
  }

  //endregion

  /********************* Elliptic curve *********************/

  /* y^2 = x^3 + 486662 x^2 + x  over GF(2^255-19) */

  /* t1 = ax + az
  * t2 = ax - az  */
  function mont_prep(t1: any, t2: any, ax: any, az: any) {
    add(t1, ax, az)
    sub(t2, ax, az)
  }

  /* A = P + Q   where
  *  X(A) = ax/az
  *  X(P) = (t1+t2)/(t1-t2)
  *  X(Q) = (t3+t4)/(t3-t4)
  *  X(P-Q) = dx
  * clobbers t1 and t2, preserves t3 and t4  */
  function mont_add(t1: any, t2: any, t3: any, t4: any, ax: any, az: any, dx: any) {
    mul(ax, t2, t3)
    mul(az, t1, t4)
    add(t1, ax, az)
    sub(t2, ax, az)
    sqr(ax, t1)
    sqr(t1, t2)
    mul(az, t1, dx)
  }

  /* B = 2 * Q   where
  *  X(B) = bx/bz
  *  X(Q) = (t3+t4)/(t3-t4)
  * clobbers t1 and t2, preserves t3 and t4  */
  function mont_dbl(t1: any, t2: any, t3: any, t4: any, bx: any, bz: any) {
    sqr(t1, t3)
    sqr(t2, t4)
    mul(bx, t1, t2)
    sub(t2, t1, t2)
    mul_small(bz, t2, 121665)
    add(t1, t1, bz)
    mul(bz, t1, t2)
  }

  /* Y^2 = X^3 + 486662 X^2 + X
  * t is a temporary  */
  function x_to_y2(t: any, y2: any, x: any) {
    sqr(t, x)
    mul_small(y2, x, 486662)
    add(t, t, y2)
    add(t, t, C1)
    mul(y2, t, x)
  }

  /* P = kG   and  s = sign(P)/k  */
  function core(Px: any, s: any, k: any, Gx: any) {
    var dx = createUnpackedArray()
    var t1 = createUnpackedArray()
    var t2 = createUnpackedArray()
    var t3 = createUnpackedArray()
    var t4 = createUnpackedArray()
    var x = [createUnpackedArray(), createUnpackedArray()]
    var z = [createUnpackedArray(), createUnpackedArray()]
    var i, j

    /* unpack the base */
    if (Gx !== null) unpack(dx, Gx)
    else set(dx, 9)

    /* 0G = point-at-infinity */
    set(x[0], 1)
    set(z[0], 0)

    /* 1G = G */
    cpy(x[1], dx)
    set(z[1], 1)

    for (i = 32; i-- !== 0; ) {
      for (j = 8; j-- !== 0; ) {
        /* swap arguments depending on bit */
        var bit1 = ((k[i] & 0xff) >> j) & 1
        var bit0 = (~(k[i] & 0xff) >> j) & 1
        var ax = x[bit0]
        var az = z[bit0]
        var bx = x[bit1]
        var bz = z[bit1]

        /* a' = a + b	*/
        /* b' = 2 b	*/
        mont_prep(t1, t2, ax, az)
        mont_prep(t3, t4, bx, bz)
        mont_add(t1, t2, t3, t4, ax, az, dx)
        mont_dbl(t1, t2, t3, t4, bx, bz)
      }
    }

    recip(t1, z[0], 0)
    mul(dx, x[0], t1)

    pack(dx, Px)

    /* calculate s such that s abs(P) = G  .. assumes G is std base point */
    if (s !== null) {
      x_to_y2(t2, t1, dx) /* t1 = Py^2  */
      recip(t3, z[1], 0) /* where Q=P+G ... */
      mul(t2, x[1], t3) /* t2 = Qx  */
      add(t2, t2, dx) /* t2 = Qx + Px  */
      add(t2, t2, C486671) /* t2 = Qx + Px + Gx + 486662  */
      sub(dx, dx, C9) /* dx = Px - Gx  */
      sqr(t3, dx) /* t3 = (Px - Gx)^2  */
      mul(dx, t2, t3) /* dx = t2 (Px - Gx)^2  */
      sub(dx, dx, t1) /* dx = t2 (Px - Gx)^2 - Py^2  */
      sub(dx, dx, C39420360) /* dx = t2 (Px - Gx)^2 - Py^2 - Gy^2  */
      mul(t1, dx, BASE_R2Y) /* t1 = -Py  */

      if (is_negative(t1) !== 0)
        /* sign is 1, so just copy  */
        cpy32(s, k)
      /* sign is -1, so negate  */ else mula_small(s, ORDER_TIMES_8, 0, k, 32, -1)

      /* reduce s mod q
       * (is this needed?  do it just in case, it's fast anyway) */
      //divmod((dstptr) t1, s, 32, order25519, 32);

      /* take reciprocal of s mod q */
      var temp1 = new Array(32)
      var temp2 = new Array(64)
      var temp3 = new Array(64)
      cpy32(temp1, ORDER)
      cpy32(s, egcd32(temp2, temp3, s, temp1))
      if ((s[31] & 0x80) !== 0) mula_small(s, s, 0, ORDER, 32, 1)
    }
  }

  /********* DIGITAL SIGNATURES *********/

  /* deterministic EC-KCDSA
  *
  *    s is the private key for signing
  *    P is the corresponding public key
  *    Z is the context data (signer public key or certificate, etc)
  *
  * signing:
  *
  *    m = hash(Z, message)
  *    x = hash(m, s)
  *    keygen25519(Y, NULL, x);
  *    r = hash(Y);
  *    h = m XOR r
  *    sign25519(v, h, x, s);
  *
  *    output (v,r) as the signature
  *
  * verification:
  *
  *    m = hash(Z, message);
  *    h = m XOR r
  *    verify25519(Y, v, h, P)
  *
  *    confirm  r === hash(Y)
  *
  * It would seem to me that it would be simpler to have the signer directly do
  * h = hash(m, Y) and send that to the recipient instead of r, who can verify
  * the signature by checking h === hash(m, Y).  If there are any problems with
  * such a scheme, please let me know.
  *
  * Also, EC-KCDSA (like most DS algorithms) picks x random, which is a waste of
  * perfectly good entropy, but does allow Y to be calculated in advance of (or
  * parallel to) hashing the message.
  */

  /* Signature generation primitive, calculates (x-h)s mod q
  *   h  [in]  signature hash (of message, signature pub key, and context data)
  *   x  [in]  signature private key
  *   s  [in]  private key for signing
  * returns signature value on success, undefined on failure (use different x or h)
  */

  function sign(h: any, x: any, s: any) {
    // v = (x - h) s  mod q
    var w, i
    var h1 = new Array(32)
    var x1 = new Array(32)
    var tmp1 = new Array(64)
    var tmp2 = new Array(64)

    // Don't clobber the arguments, be nice!
    cpy32(h1, h)
    cpy32(x1, x)

    // Reduce modulo group order
    var tmp3 = new Array(32)
    divmod(tmp3, h1, 32, ORDER, 32)
    divmod(tmp3, x1, 32, ORDER, 32)

    // v = x1 - h1
    // If v is negative, add the group order to it to become positive.
    // If v was already positive we don't have to worry about overflow
    // when adding the order because v < ORDER and 2*ORDER < 2^256
    var v = new Array(32)
    mula_small(v, x1, 0, h1, 32, -1)
    mula_small(v, v, 0, ORDER, 32, 1)

    // tmp1 = (x-h)*s mod q
    mula32(tmp1, v, s, 32, 1)
    divmod(tmp2, tmp1, 64, ORDER, 32)

    for (w = 0, i = 0; i < 32; i++) w |= v[i] = tmp1[i]

    return w !== 0 ? v : undefined
  }

  /* Signature verification primitive, calculates Y = vP + hG
  *   v  [in]  signature value
  *   h  [in]  signature hash
  *   P  [in]  public key
  *   Returns signature public key
  */
  function verify(v: any, h: any, P: any) {
    /* Y = v abs(P) + h G  */
    var d = new Array(32)
    var p = [createUnpackedArray(), createUnpackedArray()]
    var s = [createUnpackedArray(), createUnpackedArray()]
    var yx = [createUnpackedArray(), createUnpackedArray(), createUnpackedArray()]
    var yz = [createUnpackedArray(), createUnpackedArray(), createUnpackedArray()]
    var t1 = [createUnpackedArray(), createUnpackedArray(), createUnpackedArray()]
    var t2 = [createUnpackedArray(), createUnpackedArray(), createUnpackedArray()]

    var vi = 0,
      hi = 0,
      di = 0,
      nvh = 0,
      i,
      j,
      k

    /* set p[0] to G and p[1] to P  */

    set(p[0], 9)
    unpack(p[1], P)

    /* set s[0] to P+G and s[1] to P-G  */

    /* s[0] = (Py^2 + Gy^2 - 2 Py Gy)/(Px - Gx)^2 - Px - Gx - 486662  */
    /* s[1] = (Py^2 + Gy^2 + 2 Py Gy)/(Px - Gx)^2 - Px - Gx - 486662  */

    x_to_y2(t1[0], t2[0], p[1]) /* t2[0] = Py^2  */
    sqrt(t1[0], t2[0]) /* t1[0] = Py or -Py  */
    j = is_negative(t1[0]) /*      ... check which  */
    add(t2[0], t2[0], C39420360) /* t2[0] = Py^2 + Gy^2  */
    mul(t2[1], BASE_2Y, t1[0]) /* t2[1] = 2 Py Gy or -2 Py Gy  */
    sub(t1[j], t2[0], t2[1]) /* t1[0] = Py^2 + Gy^2 - 2 Py Gy  */
    add(t1[1 - j], t2[0], t2[1]) /* t1[1] = Py^2 + Gy^2 + 2 Py Gy  */
    cpy(t2[0], p[1]) /* t2[0] = Px  */
    sub(t2[0], t2[0], C9) /* t2[0] = Px - Gx  */
    sqr(t2[1], t2[0]) /* t2[1] = (Px - Gx)^2  */
    recip(t2[0], t2[1], 0) /* t2[0] = 1/(Px - Gx)^2  */
    mul(s[0], t1[0], t2[0]) /* s[0] = t1[0]/(Px - Gx)^2  */
    sub(s[0], s[0], p[1]) /* s[0] = t1[0]/(Px - Gx)^2 - Px  */
    sub(s[0], s[0], C486671) /* s[0] = X(P+G)  */
    mul(s[1], t1[1], t2[0]) /* s[1] = t1[1]/(Px - Gx)^2  */
    sub(s[1], s[1], p[1]) /* s[1] = t1[1]/(Px - Gx)^2 - Px  */
    sub(s[1], s[1], C486671) /* s[1] = X(P-G)  */
    mul_small(s[0], s[0], 1) /* reduce s[0] */
    mul_small(s[1], s[1], 1) /* reduce s[1] */

    /* prepare the chain  */
    for (i = 0; i < 32; i++) {
      vi = (vi >> 8) ^ (v[i] & 0xff) ^ ((v[i] & 0xff) << 1)
      hi = (hi >> 8) ^ (h[i] & 0xff) ^ ((h[i] & 0xff) << 1)
      nvh = ~(vi ^ hi)
      di = (nvh & ((di & 0x80) >> 7)) ^ vi
      di ^= nvh & ((di & 0x01) << 1)
      di ^= nvh & ((di & 0x02) << 1)
      di ^= nvh & ((di & 0x04) << 1)
      di ^= nvh & ((di & 0x08) << 1)
      di ^= nvh & ((di & 0x10) << 1)
      di ^= nvh & ((di & 0x20) << 1)
      di ^= nvh & ((di & 0x40) << 1)
      d[i] = di & 0xff
    }

    di = ((nvh & ((di & 0x80) << 1)) ^ vi) >> 8

    /* initialize state */
    set(yx[0], 1)
    cpy(yx[1], p[di])
    cpy(yx[2], s[0])
    set(yz[0], 0)
    set(yz[1], 1)
    set(yz[2], 1)

    /* y[0] is (even)P + (even)G
     * y[1] is (even)P + (odd)G  if current d-bit is 0
     * y[1] is (odd)P + (even)G  if current d-bit is 1
     * y[2] is (odd)P + (odd)G
     */

    vi = 0
    hi = 0

    /* and go for it! */
    for (i = 32; i-- !== 0; ) {
      vi = (vi << 8) | (v[i] & 0xff)
      hi = (hi << 8) | (h[i] & 0xff)
      di = (di << 8) | (d[i] & 0xff)

      for (j = 8; j-- !== 0; ) {
        mont_prep(t1[0], t2[0], yx[0], yz[0])
        mont_prep(t1[1], t2[1], yx[1], yz[1])
        mont_prep(t1[2], t2[2], yx[2], yz[2])

        k = (((vi ^ (vi >> 1)) >> j) & 1) + (((hi ^ (hi >> 1)) >> j) & 1)
        mont_dbl(yx[2], yz[2], t1[k], t2[k], yx[0], yz[0])

        k = ((di >> j) & 2) ^ (((di >> j) & 1) << 1)
        mont_add(t1[1], t2[1], t1[k], t2[k], yx[1], yz[1], p[(di >> j) & 1])

        mont_add(t1[2], t2[2], t1[0], t2[0], yx[2], yz[2], s[(((vi ^ hi) >> j) & 2) >> 1])
      }
    }

    k = (vi & 1) + (hi & 1)
    recip(t1[0], yz[k], 0)
    mul(t1[1], yx[k], t1[0])

    var Y: any[] = []
    pack(t1[1], Y)
    return Y
  }

  /* Key-pair generation
  *   P  [out] your public key
  *   s  [out] your private key for signing
  *   k  [out] your private key for key agreement
  *   k  [in]  32 random bytes
  * s may be NULL if you don't care
  *
  * WARNING: if s is not NULL, this function has data-dependent timing */
  function keygen(k: any) {
    var P: any[] = []
    var s: any[] = []
    k = k || []
    clamp(k)
    core(P, s, k, null)

    return { p: P, s: s, k: k }
  }

  return {
    sign: sign,
    verify: verify,
    keygen: keygen
  }
})()

// ==================================================================================================
// END INCLUDE FILE curve25519.js
// ==================================================================================================

// ==================================================================================================
// START INCLUDE FILE jssha256.js
// ==================================================================================================

/*
*  jssha256 version 0.1  -  Copyright 2006 B. Poettering
*
*  This program is free software; you can redistribute it and/or
*  modify it under the terms of the GNU General Public License as
*  published by the Free Software Foundation; either version 2 of the
*  License, or (at your option) any later version.
*
*  This program is distributed in the hope that it will be useful,
*  but WITHOUT ANY WARRANTY; without even the implied warranty of
*  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
*  General Public License for more details.
*
*  You should have received a copy of the GNU General Public License
*  along with this program; if not, write to the Free Software
*  Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA
*  02111-1307 USA
*/

/*
* http://point-at-infinity.org/jssha256/
*
* This is a JavaScript implementation of the SHA256 secure hash function
* and the HMAC-SHA256 message authentication code (MAC).
*
* The routines' well-functioning has been verified with the test vectors
* given in FIPS-180-2, Appendix B and IETF RFC 4231. The HMAC algorithm
* conforms to IETF RFC 2104.
*
* The following code example computes the hash value of the string "abc".
*
*    SHA256_init();
*    SHA256_write("abc");
*    digest = SHA256_finalize();
*    digest_hex = array_to_hex_string(digest);
*
* Get the same result by calling the shortcut function SHA256_hash:
*
*    digest_hex = SHA256_hash("abc");
*
* In the following example the calculation of the HMAC of the string "abc"
* using the key "secret key" is shown:
*
*    HMAC_SHA256_init("secret key");
*    HMAC_SHA256_write("abc");
*    mac = HMAC_SHA256_finalize();
*    mac_hex = array_to_hex_string(mac);
*
* Again, the same can be done more conveniently:
*
*    mac_hex = HMAC_SHA256_MAC("secret key", "abc");
*
* Note that the internal state of the hash function is held in global
* variables. Therefore one hash value calculation has to be completed
* before the next is begun. The same applies the the HMAC routines.
*
* Report bugs to: jssha256 AT point-at-infinity.org
*
*/

/******************************************************************************/

/* Two all purpose helper functions follow */

/* string_to_array: convert a string to a character (byte) array */

function string_to_array(str: any) {
  var len = str.length
  var res = new Array(len)
  for (var i = 0; i < len; i++) res[i] = str.charCodeAt(i)
  return res
}

/******************************************************************************/

/* The following are the SHA256 routines */

/*
SHA256_init: initialize the internal state of the hash function. Call this
function before calling the SHA256_write function.
*/

var SHA256_buf = new Array()
var SHA256_len = 0
var SHA256_H = new Array()

function SHA256_init() {
  SHA256_H = new Array(
    0x6a09e667,
    0xbb67ae85,
    0x3c6ef372,
    0xa54ff53a,
    0x510e527f,
    0x9b05688c,
    0x1f83d9ab,
    0x5be0cd19
  )

  SHA256_buf = new Array()
  SHA256_len = 0
}

/*
SHA256_write: add a message fragment to the hash function's internal state.
'msg' may be given as string or as byte array and may have arbitrary length.

*/

function SHA256_write(msg: any) {
  if (typeof msg == "string") SHA256_buf = SHA256_buf.concat(string_to_array(msg))
  else SHA256_buf = SHA256_buf.concat(msg)

  for (var i = 0; i + 64 <= SHA256_buf.length; i += 64)
    SHA256_Hash_Byte_Block(SHA256_H, SHA256_buf.slice(i, i + 64))

  SHA256_buf = SHA256_buf.slice(i)

  SHA256_len += msg.length
}

/*
SHA256_finalize: finalize the hash value calculation. Call this function
after the last call to SHA256_write. An array of 32 bytes (= 256 bits)
is returned.
*/

function SHA256_finalize() {
  SHA256_buf[SHA256_buf.length] = 0x80

  if (SHA256_buf.length > 64 - 8) {
    for (var i = SHA256_buf.length; i < 64; i++) SHA256_buf[i] = 0
    SHA256_Hash_Byte_Block(SHA256_H, SHA256_buf)
    SHA256_buf.length = 0
  }

  for (var i = SHA256_buf.length; i < 64 - 5; i++) SHA256_buf[i] = 0
  SHA256_buf[59] = (SHA256_len >>> 29) & 0xff
  SHA256_buf[60] = (SHA256_len >>> 21) & 0xff
  SHA256_buf[61] = (SHA256_len >>> 13) & 0xff
  SHA256_buf[62] = (SHA256_len >>> 5) & 0xff
  SHA256_buf[63] = (SHA256_len << 3) & 0xff
  SHA256_Hash_Byte_Block(SHA256_H, SHA256_buf)

  var res = new Array(32)
  for (var i = 0; i < 8; i++) {
    res[4 * i + 0] = SHA256_H[i] >>> 24
    res[4 * i + 1] = (SHA256_H[i] >> 16) & 0xff
    res[4 * i + 2] = (SHA256_H[i] >> 8) & 0xff
    res[4 * i + 3] = SHA256_H[i] & 0xff
  }

  SHA256_H = <any>undefined
  SHA256_buf = <any>undefined
  SHA256_len = <any>undefined

  return res
}

/******************************************************************************/

/* The following are the HMAC-SHA256 routines */

/*
HMAC_SHA256_init: initialize the MAC's internal state. The MAC key 'key'
may be given as string or as byte array and may have arbitrary length.
*/

var HMAC_SHA256_key: any

function HMAC_SHA256_init(key: any) {
  if (typeof key == "string") HMAC_SHA256_key = string_to_array(key)
  else HMAC_SHA256_key = new Array().concat(key)

  if (HMAC_SHA256_key.length > 64) {
    SHA256_init()
    SHA256_write(HMAC_SHA256_key)
    HMAC_SHA256_key = SHA256_finalize()
  }

  for (let i = HMAC_SHA256_key.length; i < 64; i++) HMAC_SHA256_key[i] = 0
  for (let i = 0; i < 64; i++) HMAC_SHA256_key[i] ^= 0x36
  SHA256_init()
  SHA256_write(HMAC_SHA256_key)
}

/*
HMAC_SHA256_write: process a message fragment. 'msg' may be given as
string or as byte array and may have arbitrary length.
*/

function HMAC_SHA256_write(msg: any) {
  SHA256_write(msg)
}

/*
HMAC_SHA256_finalize: finalize the HMAC calculation. An array of 32 bytes
(= 256 bits) is returned.
*/

function HMAC_SHA256_finalize() {
  var md = SHA256_finalize()
  for (var i = 0; i < 64; i++) HMAC_SHA256_key[i] ^= 0x36 ^ 0x5c
  SHA256_init()
  SHA256_write(HMAC_SHA256_key)
  SHA256_write(md)
  for (var i = 0; i < 64; i++) HMAC_SHA256_key[i] = 0
  HMAC_SHA256_key = undefined
  return SHA256_finalize()
}

/******************************************************************************/

/* The following lookup tables and functions are for internal use only! */

var SHA256_hexchars = new Array(
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "a",
  "b",
  "c",
  "d",
  "e",
  "f"
)

var SHA256_K = new Array(
  0x428a2f98,
  0x71374491,
  0xb5c0fbcf,
  0xe9b5dba5,
  0x3956c25b,
  0x59f111f1,
  0x923f82a4,
  0xab1c5ed5,
  0xd807aa98,
  0x12835b01,
  0x243185be,
  0x550c7dc3,
  0x72be5d74,
  0x80deb1fe,
  0x9bdc06a7,
  0xc19bf174,
  0xe49b69c1,
  0xefbe4786,
  0x0fc19dc6,
  0x240ca1cc,
  0x2de92c6f,
  0x4a7484aa,
  0x5cb0a9dc,
  0x76f988da,
  0x983e5152,
  0xa831c66d,
  0xb00327c8,
  0xbf597fc7,
  0xc6e00bf3,
  0xd5a79147,
  0x06ca6351,
  0x14292967,
  0x27b70a85,
  0x2e1b2138,
  0x4d2c6dfc,
  0x53380d13,
  0x650a7354,
  0x766a0abb,
  0x81c2c92e,
  0x92722c85,
  0xa2bfe8a1,
  0xa81a664b,
  0xc24b8b70,
  0xc76c51a3,
  0xd192e819,
  0xd6990624,
  0xf40e3585,
  0x106aa070,
  0x19a4c116,
  0x1e376c08,
  0x2748774c,
  0x34b0bcb5,
  0x391c0cb3,
  0x4ed8aa4a,
  0x5b9cca4f,
  0x682e6ff3,
  0x748f82ee,
  0x78a5636f,
  0x84c87814,
  0x8cc70208,
  0x90befffa,
  0xa4506ceb,
  0xbef9a3f7,
  0xc67178f2
)

function SHA256_sigma0(x: any) {
  return ((x >>> 7) | (x << 25)) ^ ((x >>> 18) | (x << 14)) ^ (x >>> 3)
}

function SHA256_sigma1(x: any) {
  return ((x >>> 17) | (x << 15)) ^ ((x >>> 19) | (x << 13)) ^ (x >>> 10)
}

function SHA256_Sigma0(x: any) {
  return ((x >>> 2) | (x << 30)) ^ ((x >>> 13) | (x << 19)) ^ ((x >>> 22) | (x << 10))
}

function SHA256_Sigma1(x: any) {
  return ((x >>> 6) | (x << 26)) ^ ((x >>> 11) | (x << 21)) ^ ((x >>> 25) | (x << 7))
}

function SHA256_Ch(x: any, y: any, z: any) {
  return z ^ (x & (y ^ z))
}

function SHA256_Maj(x: any, y: any, z: any) {
  return (x & y) ^ (z & (x ^ y))
}

function SHA256_Hash_Word_Block(H: any, W: any) {
  for (var i = 16; i < 64; i++)
    W[i] = (SHA256_sigma1(W[i - 2]) + W[i - 7] + SHA256_sigma0(W[i - 15]) + W[i - 16]) & 0xffffffff
  var state = new Array().concat(H)

  for (var i = 0; i < 64; i++) {
    var T1 =
      state[7] +
      SHA256_Sigma1(state[4]) +
      SHA256_Ch(state[4], state[5], state[6]) +
      SHA256_K[i] +
      W[i]
    var T2 = SHA256_Sigma0(state[0]) + SHA256_Maj(state[0], state[1], state[2])
    state.pop()
    state.unshift((T1 + T2) & 0xffffffff)
    state[4] = (state[4] + T1) & 0xffffffff
  }

  for (var i = 0; i < 8; i++) H[i] = (H[i] + state[i]) & 0xffffffff
}

function SHA256_Hash_Byte_Block(H: any, w: any) {
  var W = new Array(16)
  for (var i = 0; i < 16; i++)
    W[i] = (w[4 * i + 0] << 24) | (w[4 * i + 1] << 16) | (w[4 * i + 2] << 8) | w[4 * i + 3]

  SHA256_Hash_Word_Block(H, W)
}

// ==================================================================================================
// END INCLUDE FILE jssha256.js
// ==================================================================================================

// ==================================================================================================
// START INCLUDE FILE cryptojs/aes.js
// ==================================================================================================

declare function escape(s: string): string
declare function unescape(s: string): string

/*
CryptoJS v3.1.2
code.google.com/p/crypto-js
(c) 2009-2013 by Jeff Mott. All rights reserved.
code.google.com/p/crypto-js/wiki/License
*/
var CryptoJS = (function(u?: any, p?: any) {
  var d: any = {},
    l: any = (d.lib = {}),
    s = class {},
    t = (l.Base = <any>{
      extend: function(a: any) {
        s.prototype = this
        var c: any = new s()
        a && c.mixIn(a)
        c.hasOwnProperty("init") ||
          (c.init = function() {
            c.$super.init.apply(this, arguments)
          })
        c.init.prototype = c
        c.$super = this
        return c
      },
      create: function() {
        var a = this.extend()
        a.init.apply(a, arguments)
        return a
      },
      init: function() {},
      mixIn: function(a: any) {
        for (var c in a) a.hasOwnProperty(c) && (this[c] = a[c])
        a.hasOwnProperty("toString") && (this.toString = a.toString)
      },
      clone: function() {
        return this.init.prototype.extend(this)
      }
    }),
    r = (l.WordArray = t.extend({
      init: function(a: any, c: any) {
        a = this.words = a || []
        this.sigBytes = c != p ? c : 4 * a.length
      },
      toString: function(a: any) {
        return (a || v).stringify(this)
      },
      concat: function(a: any) {
        var c = this.words,
          e = a.words,
          j = this.sigBytes
        a = a.sigBytes
        this.clamp()
        if (j % 4)
          for (var k = 0; k < a; k++)
            c[(j + k) >>> 2] |=
              ((e[k >>> 2] >>> (24 - 8 * (k % 4))) & 255) << (24 - 8 * ((j + k) % 4))
        else if (65535 < e.length) for (k = 0; k < a; k += 4) c[(j + k) >>> 2] = e[k >>> 2]
        else c.push.apply(c, e)
        this.sigBytes += a
        return this
      },
      clamp: function() {
        var a = this.words,
          c = this.sigBytes
        a[c >>> 2] &= 4294967295 << (32 - 8 * (c % 4))
        a.length = u.ceil(c / 4)
      },
      clone: function() {
        var a = t.clone.call(this)
        a.words = this.words.slice(0)
        return a
      },
      random: function(a: any) {
        for (var c = [], e = 0; e < a; e += 4) c.push((4294967296 * u.random()) | 0)
        return new r.init(c, a)
      }
    })),
    w: any = (d.enc = {}),
    v = (w.Hex = {
      stringify: function(a: any) {
        var c = a.words
        a = a.sigBytes
        for (var e = [], j = 0; j < a; j++) {
          var k = (c[j >>> 2] >>> (24 - 8 * (j % 4))) & 255
          e.push((k >>> 4).toString(16))
          e.push((k & 15).toString(16))
        }
        return e.join("")
      },
      parse: function(a: any) {
        for (var c = a.length, e: any[] = [], j = 0; j < c; j += 2)
          e[j >>> 3] |= parseInt(a.substr(j, 2), 16) << (24 - 4 * (j % 8))
        return new r.init(e, c / 2)
      }
    }),
    b = (w.Latin1 = {
      stringify: function(a: any) {
        var c = a.words
        a = a.sigBytes
        for (var e = [], j = 0; j < a; j++)
          e.push(String.fromCharCode((c[j >>> 2] >>> (24 - 8 * (j % 4))) & 255))
        return e.join("")
      },
      parse: function(a: any) {
        for (var c = a.length, e: any[] = [], j = 0; j < c; j++)
          e[j >>> 2] |= (a.charCodeAt(j) & 255) << (24 - 8 * (j % 4))
        return new r.init(e, c)
      }
    }),
    x = (w.Utf8 = {
      stringify: function(a: any) {
        try {
          return decodeURIComponent(escape(b.stringify(a)))
        } catch (c) {
          throw Error("Malformed UTF-8 data")
        }
      },
      parse: function(a: any) {
        return b.parse(unescape(encodeURIComponent(a)))
      }
    }),
    q = (l.BufferedBlockAlgorithm = t.extend({
      reset: function() {
        this._data = new r.init()
        this._nDataBytes = 0
      },
      _append: function(a: any) {
        "string" == typeof a && (a = x.parse(a))
        this._data.concat(a)
        this._nDataBytes += a.sigBytes
      },
      _process: function(a: any) {
        var c = this._data,
          e = c.words,
          j = c.sigBytes,
          k = this.blockSize,
          b: any = j / (4 * k),
          b: any = a ? u.ceil(b) : u.max((b | 0) - this._minBufferSize, 0)
        a = b * k
        j = u.min(4 * a, j)
        var q
        if (a) {
          for (q = 0; q < a; q += k) this._doProcessBlock(e, q)
          q = e.splice(0, a)
          c.sigBytes -= j
        }
        return new r.init(q, j)
      },
      clone: function() {
        var a = t.clone.call(this)
        a._data = this._data.clone()
        return a
      },
      _minBufferSize: 0
    }))
  l.Hasher = q.extend({
    cfg: t.extend(),
    init: function(a: any) {
      this.cfg = this.cfg.extend(a)
      this.reset()
    },
    reset: function() {
      q.reset.call(this)
      this._doReset()
    },
    update: function(a: any) {
      this._append(a)
      this._process()
      return this
    },
    finalize: function(a: any) {
      a && this._append(a)
      return this._doFinalize()
    },
    blockSize: 16,
    _createHelper: function(a: any) {
      return function(b: any, e: any) {
        return new a.init(e).finalize(b)
      }
    },
    _createHmacHelper: function(a: any) {
      return function(b: any, e: any) {
        return new n.HMAC.init(a, e).finalize(b)
      }
    }
  })
  var n: any = (d.algo = {})
  return d
})(Math)
;(function() {
  var u = CryptoJS,
    p = u.lib.WordArray
  u.enc.Base64 = {
    stringify: function(d: any) {
      var l = d.words,
        p = d.sigBytes,
        t = this._map
      d.clamp()
      d = []
      for (var r = 0; r < p; r += 3)
        for (
          var w =
              (((l[r >>> 2] >>> (24 - 8 * (r % 4))) & 255) << 16) |
              (((l[(r + 1) >>> 2] >>> (24 - 8 * ((r + 1) % 4))) & 255) << 8) |
              ((l[(r + 2) >>> 2] >>> (24 - 8 * ((r + 2) % 4))) & 255),
            v = 0;
          4 > v && r + 0.75 * v < p;
          v++
        )
          d.push(t.charAt((w >>> (6 * (3 - v))) & 63))
      if ((l = t.charAt(64))) for (; d.length % 4; ) d.push(l)
      return d.join("")
    },
    parse: function(d: any) {
      var l = d.length,
        s = this._map,
        t = s.charAt(64)
      t && ((t = d.indexOf(t)), -1 != t && (l = t))
      t = []
      var r = 0,
        w = 0
      for (; w < l; w++)
        if (w % 4) {
          var v = s.indexOf(d.charAt(w - 1)) << (2 * (w % 4)),
            b = s.indexOf(d.charAt(w)) >>> (6 - 2 * (w % 4))
          t[r >>> 2] |= (v | b) << (24 - 8 * (r % 4))
          r++
        }
      return p.create(t, r)
    },
    _map: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="
  }
})()
;(function(u) {
  function p(b: any, n: any, a: any, c: any, e: any, j: any, k: any) {
    b = b + ((n & a) | (~n & c)) + e + k
    return ((b << j) | (b >>> (32 - j))) + n
  }

  function d(b: any, n: any, a: any, c: any, e: any, j: any, k: any) {
    b = b + ((n & c) | (a & ~c)) + e + k
    return ((b << j) | (b >>> (32 - j))) + n
  }

  function l(b: any, n: any, a: any, c: any, e: any, j: any, k: any) {
    b = b + (n ^ a ^ c) + e + k
    return ((b << j) | (b >>> (32 - j))) + n
  }

  function s(b: any, n: any, a: any, c: any, e: any, j: any, k: any) {
    b = b + (a ^ (n | ~c)) + e + k
    return ((b << j) | (b >>> (32 - j))) + n
  }
  for (
    var t = CryptoJS, r = t.lib, w = r.WordArray, v = r.Hasher, r = t.algo, b: any[] = [], x = 0;
    64 > x;
    x++
  )
    b[x] = (4294967296 * u.abs(u.sin(x + 1))) | 0
  r = r.MD5 = v.extend({
    _doReset: function() {
      this._hash = new w.init([1732584193, 4023233417, 2562383102, 271733878])
    },
    _doProcessBlock: function(q: any, n: any) {
      for (let a = 0; 16 > a; a++) {
        var c = n + a,
          e = q[c]
        q[c] = (((e << 8) | (e >>> 24)) & 16711935) | (((e << 24) | (e >>> 8)) & 4278255360)
      }
      var a = this._hash.words,
        c = q[n + 0],
        e = q[n + 1],
        j = q[n + 2],
        k = q[n + 3],
        z = q[n + 4],
        r = q[n + 5],
        t = q[n + 6],
        w = q[n + 7],
        v = q[n + 8],
        A = q[n + 9],
        B = q[n + 10],
        C = q[n + 11],
        u = q[n + 12],
        D = q[n + 13],
        E = q[n + 14],
        x = q[n + 15],
        f = a[0],
        m = a[1],
        g = a[2],
        h = a[3],
        f = p(f, m, g, h, c, 7, b[0]),
        h = p(h, f, m, g, e, 12, b[1]),
        g = p(g, h, f, m, j, 17, b[2]),
        m = p(m, g, h, f, k, 22, b[3]),
        f = p(f, m, g, h, z, 7, b[4]),
        h = p(h, f, m, g, r, 12, b[5]),
        g = p(g, h, f, m, t, 17, b[6]),
        m = p(m, g, h, f, w, 22, b[7]),
        f = p(f, m, g, h, v, 7, b[8]),
        h = p(h, f, m, g, A, 12, b[9]),
        g = p(g, h, f, m, B, 17, b[10]),
        m = p(m, g, h, f, C, 22, b[11]),
        f = p(f, m, g, h, u, 7, b[12]),
        h = p(h, f, m, g, D, 12, b[13]),
        g = p(g, h, f, m, E, 17, b[14]),
        m = p(m, g, h, f, x, 22, b[15]),
        f = d(f, m, g, h, e, 5, b[16]),
        h = d(h, f, m, g, t, 9, b[17]),
        g = d(g, h, f, m, C, 14, b[18]),
        m = d(m, g, h, f, c, 20, b[19]),
        f = d(f, m, g, h, r, 5, b[20]),
        h = d(h, f, m, g, B, 9, b[21]),
        g = d(g, h, f, m, x, 14, b[22]),
        m = d(m, g, h, f, z, 20, b[23]),
        f = d(f, m, g, h, A, 5, b[24]),
        h = d(h, f, m, g, E, 9, b[25]),
        g = d(g, h, f, m, k, 14, b[26]),
        m = d(m, g, h, f, v, 20, b[27]),
        f = d(f, m, g, h, D, 5, b[28]),
        h = d(h, f, m, g, j, 9, b[29]),
        g = d(g, h, f, m, w, 14, b[30]),
        m = d(m, g, h, f, u, 20, b[31]),
        f = l(f, m, g, h, r, 4, b[32]),
        h = l(h, f, m, g, v, 11, b[33]),
        g = l(g, h, f, m, C, 16, b[34]),
        m = l(m, g, h, f, E, 23, b[35]),
        f = l(f, m, g, h, e, 4, b[36]),
        h = l(h, f, m, g, z, 11, b[37]),
        g = l(g, h, f, m, w, 16, b[38]),
        m = l(m, g, h, f, B, 23, b[39]),
        f = l(f, m, g, h, D, 4, b[40]),
        h = l(h, f, m, g, c, 11, b[41]),
        g = l(g, h, f, m, k, 16, b[42]),
        m = l(m, g, h, f, t, 23, b[43]),
        f = l(f, m, g, h, A, 4, b[44]),
        h = l(h, f, m, g, u, 11, b[45]),
        g = l(g, h, f, m, x, 16, b[46]),
        m = l(m, g, h, f, j, 23, b[47]),
        f = s(f, m, g, h, c, 6, b[48]),
        h = s(h, f, m, g, w, 10, b[49]),
        g = s(g, h, f, m, E, 15, b[50]),
        m = s(m, g, h, f, r, 21, b[51]),
        f = s(f, m, g, h, u, 6, b[52]),
        h = s(h, f, m, g, k, 10, b[53]),
        g = s(g, h, f, m, B, 15, b[54]),
        m = s(m, g, h, f, e, 21, b[55]),
        f = s(f, m, g, h, v, 6, b[56]),
        h = s(h, f, m, g, x, 10, b[57]),
        g = s(g, h, f, m, t, 15, b[58]),
        m = s(m, g, h, f, D, 21, b[59]),
        f = s(f, m, g, h, z, 6, b[60]),
        h = s(h, f, m, g, C, 10, b[61]),
        g = s(g, h, f, m, j, 15, b[62]),
        m = s(m, g, h, f, A, 21, b[63])
      a[0] = (a[0] + f) | 0
      a[1] = (a[1] + m) | 0
      a[2] = (a[2] + g) | 0
      a[3] = (a[3] + h) | 0
    },
    _doFinalize: function() {
      var b = this._data,
        n = b.words,
        a = 8 * this._nDataBytes,
        c = 8 * b.sigBytes
      n[c >>> 5] |= 128 << (24 - c % 32)
      var e = u.floor(a / 4294967296)
      n[(((c + 64) >>> 9) << 4) + 15] =
        (((e << 8) | (e >>> 24)) & 16711935) | (((e << 24) | (e >>> 8)) & 4278255360)
      n[(((c + 64) >>> 9) << 4) + 14] =
        (((a << 8) | (a >>> 24)) & 16711935) | (((a << 24) | (a >>> 8)) & 4278255360)
      b.sigBytes = 4 * (n.length + 1)
      this._process()
      b = this._hash
      n = b.words
      for (a = 0; 4 > a; a++)
        (c = n[a]),
          (n[a] = (((c << 8) | (c >>> 24)) & 16711935) | (((c << 24) | (c >>> 8)) & 4278255360))
      return b
    },
    clone: function() {
      var b = v.clone.call(this)
      b._hash = this._hash.clone()
      return b
    }
  })
  t.MD5 = v._createHelper(r)
  t.HmacMD5 = v._createHmacHelper(r)
})(Math)
;(function() {
  var u = CryptoJS,
    p = u.lib,
    d = p.Base,
    l = p.WordArray,
    p = u.algo,
    s = (p.EvpKDF = d.extend({
      cfg: d.extend({
        keySize: 4,
        hasher: p.MD5,
        iterations: 1
      }),
      init: function(d: any) {
        this.cfg = this.cfg.extend(d)
      },
      compute: function(d: any, r: any) {
        for (
          var p = this.cfg,
            s = p.hasher.create(),
            b = l.create(),
            u = b.words,
            q = p.keySize,
            p = p.iterations;
          u.length < q;

        ) {
          n && s.update(n)
          var n = s.update(d).finalize(r)
          s.reset()
          for (var a = 1; a < p; a++) (n = s.finalize(n)), s.reset()
          b.concat(n)
        }
        b.sigBytes = 4 * q
        return b
      }
    }))
  u.EvpKDF = function(d: any, l: any, p: any) {
    return s.create(p).compute(d, l)
  }
})()
CryptoJS.lib.Cipher ||
  (function(u?: any) {
    var p = CryptoJS,
      d = p.lib,
      l = d.Base,
      s = d.WordArray,
      t = d.BufferedBlockAlgorithm,
      r = p.enc.Base64,
      w = p.algo.EvpKDF,
      v = (d.Cipher = t.extend({
        cfg: l.extend(),
        createEncryptor: function(e: any, a: any) {
          return this.create(this._ENC_XFORM_MODE, e, a)
        },
        createDecryptor: function(e: any, a: any) {
          return this.create(this._DEC_XFORM_MODE, e, a)
        },
        init: function(e: any, a: any, b: any) {
          this.cfg = this.cfg.extend(b)
          this._xformMode = e
          this._key = a
          this.reset()
        },
        reset: function() {
          t.reset.call(this)
          this._doReset()
        },
        process: function(e: any) {
          this._append(e)
          return this._process()
        },
        finalize: function(e: any) {
          e && this._append(e)
          return this._doFinalize()
        },
        keySize: 4,
        ivSize: 4,
        _ENC_XFORM_MODE: 1,
        _DEC_XFORM_MODE: 2,
        _createHelper: function(e: any) {
          return {
            encrypt: function(b: any, k: any, d: any) {
              return ("string" == typeof k ? c : a).encrypt(e, b, k, d)
            },
            decrypt: function(b: any, k: any, d: any) {
              return ("string" == typeof k ? c : a).decrypt(e, b, k, d)
            }
          }
        }
      }))
    d.StreamCipher = v.extend({
      _doFinalize: function() {
        return this._process(!0)
      },
      blockSize: 1
    })
    var b: any = (p.mode = {}),
      x = function(e: any, a: any, b: any) {
        var c = this._iv
        c ? (this._iv = u) : (c = this._prevBlock)
        for (var d = 0; d < b; d++) e[a + d] ^= c[d]
      },
      q = (d.BlockCipherMode = l.extend({
        createEncryptor: function(e: any, a: any) {
          return this.Encryptor.create(e, a)
        },
        createDecryptor: function(e: any, a: any) {
          return this.Decryptor.create(e, a)
        },
        init: function(e: any, a: any) {
          this._cipher = e
          this._iv = a
        }
      })).extend()
    q.Encryptor = q.extend({
      processBlock: function(e: any, a: any) {
        var b = this._cipher,
          c = b.blockSize
        x.call(this, e, a, c)
        b.encryptBlock(e, a)
        this._prevBlock = e.slice(a, a + c)
      }
    })
    q.Decryptor = q.extend({
      processBlock: function(e: any, a: any) {
        var b = this._cipher,
          c = b.blockSize,
          d = e.slice(a, a + c)
        b.decryptBlock(e, a)
        x.call(this, e, a, c)
        this._prevBlock = d
      }
    })
    b = b.CBC = q
    q = (p.pad = <any>{}).Pkcs7 = {
      pad: function(a: any, b: any) {
        for (
          var c = 4 * b,
            c = c - a.sigBytes % c,
            d = (c << 24) | (c << 16) | (c << 8) | c,
            l = [],
            n = 0;
          n < c;
          n += 4
        )
          l.push(d)
        c = s.create(l, c)
        a.concat(c)
      },
      unpad: function(a: any) {
        a.sigBytes -= a.words[(a.sigBytes - 1) >>> 2] & 255
      }
    }
    d.BlockCipher = v.extend({
      cfg: v.cfg.extend({
        mode: b,
        padding: q
      }),
      reset: function() {
        v.reset.call(this)
        var a = this.cfg,
          b = a.iv,
          a = a.mode
        if (this._xformMode == this._ENC_XFORM_MODE) var c = a.createEncryptor
        else (c = a.createDecryptor), (this._minBufferSize = 1)
        this._mode = c.call(a, this, b && b.words)
      },
      _doProcessBlock: function(a: any, b: any) {
        this._mode.processBlock(a, b)
      },
      _doFinalize: function() {
        var a = this.cfg.padding
        if (this._xformMode == this._ENC_XFORM_MODE) {
          a.pad(this._data, this.blockSize)
          var b = this._process(!0)
        } else (b = this._process(!0)), a.unpad(b)
        return b
      },
      blockSize: 4
    })
    var n = (d.CipherParams = l.extend({
        init: function(a: any) {
          this.mixIn(a)
        },
        toString: function(a: any) {
          return (a || this.formatter).stringify(this)
        }
      })),
      b = ((p.format = <any>{}).OpenSSL = <any>{
        stringify: function(a: any) {
          var b = a.ciphertext
          a = a.salt
          return (a
            ? s
                .create([1398893684, 1701076831])
                .concat(a)
                .concat(b)
            : b
          ).toString(r)
        },
        parse: function(a: any) {
          a = r.parse(a)
          var b = a.words
          if (1398893684 == b[0] && 1701076831 == b[1]) {
            var c = s.create(b.slice(2, 4))
            b.splice(0, 4)
            a.sigBytes -= 16
          }
          return n.create({
            ciphertext: a,
            salt: c
          })
        }
      }),
      a = (d.SerializableCipher = l.extend({
        cfg: l.extend({
          format: b
        }),
        encrypt: function(a: any, b: any, c: any, d: any) {
          d = this.cfg.extend(d)
          var l = a.createEncryptor(c, d)
          b = l.finalize(b)
          l = l.cfg
          return n.create({
            ciphertext: b,
            key: c,
            iv: l.iv,
            algorithm: a,
            mode: l.mode,
            padding: l.padding,
            blockSize: a.blockSize,
            formatter: d.format
          })
        },
        decrypt: function(a: any, b: any, c: any, d: any) {
          d = this.cfg.extend(d)
          b = this._parse(b, d.format)
          return a.createDecryptor(c, d).finalize(b.ciphertext)
        },
        _parse: function(a: any, b: any) {
          return "string" == typeof a ? b.parse(a, this) : a
        }
      })),
      p = ((p.kdf = <any>{}).OpenSSL = <any>{
        execute: function(a: any, b: any, c: any, d: any) {
          d || (d = s.random(8))
          a = w
            .create({
              keySize: b + c
            })
            .compute(a, d)
          c = s.create(a.words.slice(b), 4 * c)
          a.sigBytes = 4 * b
          return n.create({
            key: a,
            iv: c,
            salt: d
          })
        }
      }),
      c = (d.PasswordBasedCipher = a.extend({
        cfg: a.cfg.extend({
          kdf: p
        }),
        encrypt: function(b: any, c: any, d: any, l: any) {
          l = this.cfg.extend(l)
          d = l.kdf.execute(d, b.keySize, b.ivSize)
          l.iv = d.iv
          b = a.encrypt.call(this, b, c, d.key, l)
          b.mixIn(d)
          return b
        },
        decrypt: function(b: any, c: any, d: any, l: any) {
          l = this.cfg.extend(l)
          c = this._parse(c, l.format)
          d = l.kdf.execute(d, b.keySize, b.ivSize, c.salt)
          l.iv = d.iv
          return a.decrypt.call(this, b, c, d.key, l)
        }
      }))
  })()
;(function() {
  for (
    var u = CryptoJS,
      p = u.lib.BlockCipher,
      d = u.algo,
      l: any[] = [],
      s: any[] = [],
      t: any[] = [],
      r: any[] = [],
      w: any[] = [],
      v: any[] = [],
      b: any[] = [],
      x: any[] = [],
      q: any[] = [],
      n: any[] = [],
      a = [],
      c = 0;
    256 > c;
    c++
  )
    a[c] = 128 > c ? c << 1 : (c << 1) ^ 283
  for (var e = 0, j = 0, c = 0; 256 > c; c++) {
    var k = j ^ (j << 1) ^ (j << 2) ^ (j << 3) ^ (j << 4),
      k = (k >>> 8) ^ (k & 255) ^ 99
    l[e] = k
    s[k] = e
    var z = a[e],
      F = a[z],
      G = a[F],
      y = (257 * a[k]) ^ (16843008 * k)
    t[e] = (y << 24) | (y >>> 8)
    r[e] = (y << 16) | (y >>> 16)
    w[e] = (y << 8) | (y >>> 24)
    v[e] = y
    y = (16843009 * G) ^ (65537 * F) ^ (257 * z) ^ (16843008 * e)
    b[k] = (y << 24) | (y >>> 8)
    x[k] = (y << 16) | (y >>> 16)
    q[k] = (y << 8) | (y >>> 24)
    n[k] = y
    e ? ((e = z ^ a[a[a[G ^ z]]]), (j ^= a[a[j]])) : (e = j = 1)
  }
  var H = [0, 1, 2, 4, 8, 16, 32, 64, 128, 27, 54],
    d = (d.AES = p.extend({
      _doReset: function() {
        for (
          var a = this._key,
            c = a.words,
            d = a.sigBytes / 4,
            a = <any>(4 * ((this._nRounds = d + 6) + 1)),
            e: any[] = (this._keySchedule = []),
            j = 0;
          j < a;
          j++
        )
          if (j < d) e[j] = c[j]
          else {
            var k = e[j - 1]
            j % d
              ? 6 < d &&
                4 == j % d &&
                (k =
                  (l[k >>> 24] << 24) |
                  (l[(k >>> 16) & 255] << 16) |
                  (l[(k >>> 8) & 255] << 8) |
                  l[k & 255])
              : ((k = (k << 8) | (k >>> 24)),
                (k =
                  (l[k >>> 24] << 24) |
                  (l[(k >>> 16) & 255] << 16) |
                  (l[(k >>> 8) & 255] << 8) |
                  l[k & 255]),
                (k ^= H[(j / d) | 0] << 24))
            e[j] = e[j - d] ^ k
          }
        c = this._invKeySchedule = []
        for (d = 0; d < a; d++)
          (j = a - d),
            (k = d % 4 ? e[j] : e[j - 4]),
            (c[d] =
              4 > d || 4 >= j
                ? k
                : b[l[k >>> 24]] ^ x[l[(k >>> 16) & 255]] ^ q[l[(k >>> 8) & 255]] ^ n[l[k & 255]])
      },
      encryptBlock: function(a: any, b: any) {
        this._doCryptBlock(a, b, this._keySchedule, t, r, w, v, l)
      },
      decryptBlock: function(a: any, c: any) {
        var d = a[c + 1]
        a[c + 1] = a[c + 3]
        a[c + 3] = d
        this._doCryptBlock(a, c, this._invKeySchedule, b, x, q, n, s)
        d = a[c + 1]
        a[c + 1] = a[c + 3]
        a[c + 3] = d
      },
      _doCryptBlock: function(a: any, b: any, c: any, d: any, e: any, j: any, l: any, f: any) {
        for (
          var m = this._nRounds,
            g = a[b] ^ c[0],
            h = a[b + 1] ^ c[1],
            k = a[b + 2] ^ c[2],
            n = a[b + 3] ^ c[3],
            p = 4,
            r = 1;
          r < m;
          r++
        )
          var q = d[g >>> 24] ^ e[(h >>> 16) & 255] ^ j[(k >>> 8) & 255] ^ l[n & 255] ^ c[p++],
            s = d[h >>> 24] ^ e[(k >>> 16) & 255] ^ j[(n >>> 8) & 255] ^ l[g & 255] ^ c[p++],
            t = d[k >>> 24] ^ e[(n >>> 16) & 255] ^ j[(g >>> 8) & 255] ^ l[h & 255] ^ c[p++],
            n = d[n >>> 24] ^ e[(g >>> 16) & 255] ^ j[(h >>> 8) & 255] ^ l[k & 255] ^ c[p++],
            g = q,
            h = s,
            k = t
        q =
          ((f[g >>> 24] << 24) |
            (f[(h >>> 16) & 255] << 16) |
            (f[(k >>> 8) & 255] << 8) |
            f[n & 255]) ^
          c[p++]
        s =
          ((f[h >>> 24] << 24) |
            (f[(k >>> 16) & 255] << 16) |
            (f[(n >>> 8) & 255] << 8) |
            f[g & 255]) ^
          c[p++]
        t =
          ((f[k >>> 24] << 24) |
            (f[(n >>> 16) & 255] << 16) |
            (f[(g >>> 8) & 255] << 8) |
            f[h & 255]) ^
          c[p++]
        n =
          ((f[n >>> 24] << 24) |
            (f[(g >>> 16) & 255] << 16) |
            (f[(h >>> 8) & 255] << 8) |
            f[k & 255]) ^
          c[p++]
        a[b] = q
        a[b + 1] = s
        a[b + 2] = t
        a[b + 3] = n
      },
      keySize: 8
    }))
  u.AES = p._createHelper(d)
})()

// ==================================================================================================
// END INCLUDE FILE cryptojs/aes.js
// ==================================================================================================

// ==================================================================================================
// START INCLUDE FILE cryptojs/hmac.js
// ==================================================================================================
;(function() {
  // Shortcuts
  var C = CryptoJS
  var C_lib = C.lib
  var Base = C_lib.Base
  var C_enc = C.enc
  var Utf8 = C_enc.Utf8
  var C_algo = C.algo

  /**
   * HMAC algorithm.
   */
  var HMAC = (C_algo.HMAC = Base.extend({
    /**
     * Initializes a newly created HMAC.
     *
     * @param {Hasher} hasher The hash algorithm to use.
     * @param {WordArray|string} key The secret key.
     *
     * @example
     *
     *     var hmacHasher = CryptoJS.algo.HMAC.create(CryptoJS.algo.SHA256, key)
     */
    init: function(hasher: any, key: any) {
      // Init hasher
      hasher = this._hasher = new hasher.init()

      // Convert string to WordArray, else assume WordArray already
      if (typeof key == "string") {
        key = Utf8.parse(key)
      }

      // Shortcuts
      var hasherBlockSize = hasher.blockSize
      var hasherBlockSizeBytes = hasherBlockSize * 4

      // Allow arbitrary length keys
      if (key.sigBytes > hasherBlockSizeBytes) {
        key = hasher.finalize(key)
      }

      // Clamp excess bits
      key.clamp()

      // Clone key for inner and outer pads
      var oKey = (this._oKey = key.clone())
      var iKey = (this._iKey = key.clone())

      // Shortcuts
      var oKeyWords = oKey.words
      var iKeyWords = iKey.words

      // XOR keys with pad constants
      for (var i = 0; i < hasherBlockSize; i++) {
        oKeyWords[i] ^= 0x5c5c5c5c
        iKeyWords[i] ^= 0x36363636
      }
      oKey.sigBytes = iKey.sigBytes = hasherBlockSizeBytes

      // Set initial values
      this.reset()
    },

    /**
     * Resets this HMAC to its initial state.
     *
     * @example
     *
     *     hmacHasher.reset()
     */
    reset: function() {
      // Shortcut
      var hasher = this._hasher

      // Reset
      hasher.reset()
      hasher.update(this._iKey)
    },

    /**
     * Updates this HMAC with a message.
     *
     * @param {WordArray|string} messageUpdate The message to append.
     *
     * @return {HMAC} This HMAC instance.
     *
     * @example
     *
     *     hmacHasher.update('message')
     *     hmacHasher.update(wordArray)
     */
    update: function(messageUpdate: any) {
      this._hasher.update(messageUpdate)

      // Chainable
      return this
    },

    /**
     * Finalizes the HMAC computation.
     * Note that the finalize operation is effectively a destructive, read-once operation.
     *
     * @param {WordArray|string} messageUpdate (Optional) A final message update.
     *
     * @return {WordArray} The HMAC.
     *
     * @example
     *
     *     var hmac = hmacHasher.finalize()
     *     var hmac = hmacHasher.finalize('message')
     *     var hmac = hmacHasher.finalize(wordArray)
     */
    finalize: function(messageUpdate: any) {
      // Shortcut
      var hasher = this._hasher

      // Compute HMAC
      var innerHash = hasher.finalize(messageUpdate)
      hasher.reset()
      var hmac = hasher.finalize(this._oKey.clone().concat(innerHash))

      return hmac
    }
  }))
})()

// ==================================================================================================
// END INCLUDE FILE cryptojs/hmac.js
// ==================================================================================================

// ==================================================================================================
// START INCLUDE FILE cryptojs/pbkdf2.js
// ==================================================================================================

/*
CryptoJS v3.1.2
code.google.com/p/crypto-js
(c) 2009-2013 by Jeff Mott. All rights reserved.
code.google.com/p/crypto-js/wiki/License
*/
;(function() {
  // Shortcuts
  var C = CryptoJS
  var C_lib = C.lib
  var Base = C_lib.Base
  var WordArray = C_lib.WordArray
  var C_algo = C.algo
  var SHA1 = C_algo.SHA1
  var HMAC = C_algo.HMAC

  /**
   * Password-Based Key Derivation Function 2 algorithm.
   */
  var PBKDF2 = (C_algo.PBKDF2 = Base.extend({
    /**
     * Configuration options.
     *
     * @property {number} keySize The key size in words to generate. Default: 4 (128 bits)
     * @property {Hasher} hasher The hasher to use. Default: SHA1
     * @property {number} iterations The number of iterations to perform. Default: 1
     */
    cfg: Base.extend({
      keySize: 128 / 32,
      hasher: SHA1,
      iterations: 1
    }),

    /**
     * Initializes a newly created key derivation function.
     *
     * @param {Object} cfg (Optional) The configuration options to use for the derivation.
     *
     * @example
     *
     *     var kdf = CryptoJS.algo.PBKDF2.create();
     *     var kdf = CryptoJS.algo.PBKDF2.create({ keySize: 8 });
     *     var kdf = CryptoJS.algo.PBKDF2.create({ keySize: 8, iterations: 1000 });
     */
    init: function(cfg: any) {
      this.cfg = this.cfg.extend(cfg)
    },

    /**
     * Computes the Password-Based Key Derivation Function 2.
     *
     * @param {WordArray|string} password The password.
     * @param {WordArray|string} salt A salt.
     *
     * @return {WordArray} The derived key.
     *
     * @example
     *
     *     var key = kdf.compute(password, salt);
     */
    compute: function(password: any, salt: any) {
      // Shortcut
      var cfg = this.cfg

      // Init HMAC
      var hmac = HMAC.create(cfg.hasher, password)

      // Initial values
      var derivedKey = WordArray.create()
      var blockIndex = WordArray.create([0x00000001])

      // Shortcuts
      var derivedKeyWords = derivedKey.words
      var blockIndexWords = blockIndex.words
      var keySize = cfg.keySize
      var iterations = cfg.iterations

      // Generate key
      while (derivedKeyWords.length < keySize) {
        var block = hmac.update(salt).finalize(blockIndex)
        hmac.reset()

        // Shortcuts
        var blockWords = block.words
        var blockWordsLength = blockWords.length

        // Iterations
        var intermediate = block
        for (var i = 1; i < iterations; i++) {
          intermediate = hmac.finalize(intermediate)
          hmac.reset()

          // Shortcut
          var intermediateWords = intermediate.words

          // XOR intermediate with block
          for (var j = 0; j < blockWordsLength; j++) {
            blockWords[j] ^= intermediateWords[j]
          }
        }

        derivedKey.concat(block)
        blockIndexWords[0]++
      }
      derivedKey.sigBytes = keySize * 4

      return derivedKey
    }
  }))

  /**
   * Computes the Password-Based Key Derivation Function 2.
   *
   * @param {WordArray|string} password The password.
   * @param {WordArray|string} salt A salt.
   * @param {Object} cfg (Optional) The configuration options to use for this computation.
   *
   * @return {WordArray} The derived key.
   *
   * @static
   *
   * @example
   *
   *     var key = CryptoJS.PBKDF2(password, salt);
   *     var key = CryptoJS.PBKDF2(password, salt, { keySize: 8 });
   *     var key = CryptoJS.PBKDF2(password, salt, { keySize: 8, iterations: 1000 });
   */
  C.PBKDF2 = function(password: any, salt: any, cfg: any) {
    return PBKDF2.create(cfg).compute(password, salt)
  }
})()

// ==================================================================================================
// END INCLUDE FILE cryptojs/pbkdf2.js
// ==================================================================================================

// ==================================================================================================
// START INCLUDE FILE cryptojs/sha256.js
// ==================================================================================================
;(function(h) {
  for (
    var s = CryptoJS,
      f = s.lib,
      t = f.WordArray,
      g = f.Hasher,
      f = s.algo,
      j: any[] = [],
      q: any[] = [],
      v = function(a: any) {
        return (4294967296 * (a - (a | 0))) | 0
      },
      u = 2,
      k = 0;
    64 > k;

  ) {
    var l
    a: {
      l = u
      for (var x = h.sqrt(l), w = 2; w <= x; w++)
        if (!(l % w)) {
          l = !1
          break a
        }
      l = !0
    }
    l && (8 > k && (j[k] = v(h.pow(u, 0.5))), (q[k] = v(h.pow(u, 1 / 3))), k++)
    u++
  }
  var a: any[] = [],
    f = (f.SHA256 = g.extend({
      _doReset: function() {
        this._hash = new t.init(j.slice(0))
      },
      _doProcessBlock: function(c: any, d: any) {
        for (
          var b = this._hash.words,
            e = b[0],
            f = b[1],
            m = b[2],
            h = b[3],
            p = b[4],
            j = b[5],
            k = b[6],
            l = b[7],
            n = 0;
          64 > n;
          n++
        ) {
          if (16 > n) a[n] = c[d + n] | 0
          else {
            var r = a[n - 15],
              g = a[n - 2]
            a[n] =
              (((r << 25) | (r >>> 7)) ^ ((r << 14) | (r >>> 18)) ^ (r >>> 3)) +
              a[n - 7] +
              (((g << 15) | (g >>> 17)) ^ ((g << 13) | (g >>> 19)) ^ (g >>> 10)) +
              a[n - 16]
          }
          r =
            l +
            (((p << 26) | (p >>> 6)) ^ ((p << 21) | (p >>> 11)) ^ ((p << 7) | (p >>> 25))) +
            ((p & j) ^ (~p & k)) +
            q[n] +
            a[n]
          g =
            (((e << 30) | (e >>> 2)) ^ ((e << 19) | (e >>> 13)) ^ ((e << 10) | (e >>> 22))) +
            ((e & f) ^ (e & m) ^ (f & m))
          l = k
          k = j
          j = p
          p = (h + r) | 0
          h = m
          m = f
          f = e
          e = (r + g) | 0
        }
        b[0] = (b[0] + e) | 0
        b[1] = (b[1] + f) | 0
        b[2] = (b[2] + m) | 0
        b[3] = (b[3] + h) | 0
        b[4] = (b[4] + p) | 0
        b[5] = (b[5] + j) | 0
        b[6] = (b[6] + k) | 0
        b[7] = (b[7] + l) | 0
      },
      _doFinalize: function() {
        var a = this._data,
          d = a.words,
          b = 8 * this._nDataBytes,
          e = 8 * a.sigBytes
        d[e >>> 5] |= 128 << (24 - e % 32)
        d[(((e + 64) >>> 9) << 4) + 14] = h.floor(b / 4294967296)
        d[(((e + 64) >>> 9) << 4) + 15] = b
        a.sigBytes = 4 * d.length
        this._process()
        return this._hash
      },
      clone: function() {
        var a = g.clone.call(this)
        a._hash = this._hash.clone()
        return a
      }
    }))
  s.SHA256 = g._createHelper(f)
  s.HmacSHA256 = g._createHmacHelper(f)
})(Math)

// ==================================================================================================
// END INCLUDE FILE cryptojs/sha256.js
// ==================================================================================================
