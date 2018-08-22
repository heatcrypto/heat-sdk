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
import * as converters from "./converters"
import * as utils from "./utils"
import * as ByteBuffer from "bytebuffer"
import { Fee } from "./fee"
import Long from "long"
import * as constants from "./constants"
import * as crypto from "./crypto"
import { fullNameToLong } from "./crypto"

export interface Appendix {
  getSize(): number
  putBytes(buffer: ByteBuffer): void
  getJSONObject(): Object
  getVersion(): number
  getFee(): string
}

export abstract class AbstractAppendix implements Appendix {
  constructor(buffer?: ByteBuffer) {
    if (buffer) this.parse(buffer)
  }

  protected version: number = 1

  abstract getAppendixName(): string

  public getSize(): number {
    return this.getMySize() + 1
  }
  abstract getMySize(): number

  public putBytes(buffer: ByteBuffer) {
    buffer.writeByte(this.version)
    this.putMyBytes(buffer)
  }

  public parse(buffer: ByteBuffer) {
    this.version = buffer.readByte()
    return this
  }

  abstract putMyBytes(buffer: ByteBuffer): void

  public parseJSON(json: { [key: string]: any }) {
    this.version = json["version." + this.getAppendixName()]
    return this
  }

  public getJSONObject() {
    let json: { [key: string]: any } = {}
    json["version." + this.getAppendixName()] = this.version
    this.putMyJSON(json)
    return json
  }
  abstract putMyJSON(json: Object): void

  public getVersion() {
    return this.version
  }

  abstract getFee(): string
}

export class AppendixMessage extends AbstractAppendix {
  private message: Array<number>
  private isText: boolean

  init(message: Array<number>, isText: boolean) {
    this.message = message
    this.isText = isText
    return this
  }

  getFee(): string {
    return Fee.MESSAGE_APPENDIX_FEE
  }

  public getAppendixName() {
    return "Message"
  }

  public getMySize() {
    return 4 + this.message.length
  }

  public parse(buffer: ByteBuffer) {
    super.parse(buffer)
    let messageLength = buffer.readInt()
    this.isText = messageLength < 0
    if (messageLength < 0) messageLength &= constants.MAX_INT32
    this.message = []
    for (let i = 0; i < messageLength; i++) this.message.push(buffer.readByte())
    return this
  }

  public putMyBytes(buffer: ByteBuffer) {
    buffer.writeInt(this.isText ? this.message.length | constants.MIN_INT32 : this.message.length)
    this.message.forEach(byte => {
      buffer.writeByte(byte)
    })
  }

  public parseJSON(json: { [key: string]: any }) {
    super.parseJSON(json)
    this.isText = json["messageIsText"]
    this.message = this.isText
      ? converters.stringToByteArray(json["message"])
      : converters.hexStringToByteArray(json["message"])
    return this
  }

  public putMyJSON(json: { [key: string]: any }) {
    json["message"] = this.isText
      ? converters.byteArrayToString(this.message)
      : converters.byteArrayToHexString(this.message)
    json["messageIsText"] = this.isText
  }

  public getMessage() {
    return this.message
  }

  public getIsText() {
    return this.isText
  }
}

export abstract class AbstractAppendixEncryptedMessage extends AbstractAppendix {
  private encryptedMessage: crypto.IEncryptedMessage
  private isText_: boolean

  init(message: crypto.IEncryptedMessage, isText: boolean) {
    this.encryptedMessage = message
    this.isText_ = isText
    return this
  }

  getFee(): string {
    return Fee.ENCRYPTED_MESSAGE_APPENDIX_FEE
  }

  public getMySize() {
    return 4 + this.encryptedMessage.data.length + this.encryptedMessage.nonce.length
  }

  public parse(buffer: ByteBuffer) {
    super.parse(buffer)
    let length = buffer.readInt32()
    this.isText_ = length < 0
    if (length < 0) length &= constants.MAX_INT32
    if (length == 0) {
      this.encryptedMessage = {
        isText: this.isText_,
        data: "",
        nonce: ""
      }
      return this
    }
    if (length > constants.MAX_ENCRYPTED_MESSAGE_LENGTH)
      throw new Error("Max encrypted data length exceeded: " + length)
    let messageBytes: number[] = new Array(length)
    for (let i = 0; i < length; i++) messageBytes[i] = buffer.readByte()
    let nonceBytes: number[] = new Array(32)
    for (let i = 0; i < 32; i++) nonceBytes[i] = buffer.readByte()
    this.encryptedMessage = {
      isText: this.isText_,
      data: converters.byteArrayToHexString(messageBytes),
      nonce: converters.byteArrayToHexString(nonceBytes)
    }
    return this
  }

  public putMyBytes(buffer: ByteBuffer) {
    let messageBytes = converters.hexStringToByteArray(this.encryptedMessage.data)
    let length = messageBytes.length
    buffer.writeInt32(this.isText_ ? length | constants.MIN_INT32 : length)
    messageBytes.forEach(byte => {
      buffer.writeByte(byte)
    })
    converters.hexStringToByteArray(this.encryptedMessage.nonce).forEach(byte => {
      buffer.writeByte(byte)
    })
  }

  public parseJSON(json: { [key: string]: any }) {
    super.parseJSON(json)
    this.isText_ = json["isText"]
    this.encryptedMessage = {
      isText: this.isText_,
      data: json["data"],
      nonce: json["nonce"]
    }
    return this
  }

  public putMyJSON(json: { [key: string]: any }) {
    json["data"] = this.encryptedMessage.data
    json["nonce"] = this.encryptedMessage.nonce
    json["isText"] = this.isText
  }

  isText(): boolean {
    return this.isText_
  }
}

export class AppendixEncryptedMessage extends AbstractAppendixEncryptedMessage {
  public getAppendixName() {
    return "EncryptedMessage"
  }

  public parseJSON(json: { [key: string]: any }) {
    super.parseJSON(json["encryptedMessage"])
    return this
  }

  public putMyJSON(json: { [key: string]: any }) {
    super.putMyJSON(json)
    json["encryptedMessage"] = json
  }
}

export class AppendixEncryptToSelfMessage extends AbstractAppendixEncryptedMessage {
  public getAppendixName() {
    return "EncryptToSelfMessage"
  }

  public parseJSON(json: { [key: string]: any }) {
    super.parseJSON(json["encryptToSelfMessage"])
    return this
  }

  public putMyJSON(json: { [key: string]: any }) {
    super.putMyJSON(json)
    json["encryptToSelfMessage"] = json
  }
}

export class AppendixPublicKeyAnnouncement extends AbstractAppendix {
  private publicKey: Array<number>

  public init(publicKey: Array<number>) {
    this.publicKey = publicKey
    return this
  }

  public parse(buffer: ByteBuffer) {
    super.parse(buffer)
    this.publicKey = utils.readBytes(buffer, 32)
    return this
  }

  getFee(): string {
    return Fee.PUBLICKEY_ANNOUNCEMENT_APPENDIX_FEE
  }

  public getAppendixName() {
    return "PublicKeyAnnouncement"
  }

  public getMySize() {
    return 32
  }

  public putMyBytes(buffer: ByteBuffer) {
    utils.writeBytes(buffer, this.publicKey)
  }

  public parseJSON(json: { [key: string]: any }) {
    super.parseJSON(json)
    this.publicKey = converters.hexStringToByteArray(json["recipientPublicKey"])
    return this
  }

  public putMyJSON(json: { [key: string]: any }) {
    json["recipientPublicKey"] = converters.byteArrayToHexString(this.publicKey)
  }
}

export class AppendixPrivateNameAnnouncement extends AbstractAppendix {
  private privateNameAnnouncement: Long

  getFee(): string {
    return Fee.PRIVATE_NAME_ANNOUNCEMENT_APPENDIX_FEE
  }

  public getAppendixName() {
    return "PrivateNameAnnouncement"
  }

  public getMySize() {
    return 8
  }

  public putMyBytes(buffer: ByteBuffer) {}

  public putMyJSON(json: { [key: string]: any }) {}

  public getName() {
    return this.privateNameAnnouncement
  }
}

export class AppendixPrivateNameAssignment extends AbstractAppendix {
  private privateNameAssignment: Long
  private signature: number[]

  getFee(): string {
    return Fee.PRIVATE_NAME_ASSIGNEMENT_APPENDIX_FEE
  }

  public getAppendixName() {
    return "PrivateNameAssignment"
  }

  public getMySize() {
    return 8 + 64
  }

  public parse(buffer: ByteBuffer) {
    super.parse(buffer)
    this.privateNameAssignment = buffer.readInt64()
    this.signature = utils.readBytes(buffer, 64)
    return this
  }

  public putMyBytes(buffer: ByteBuffer) {
    buffer.writeInt64(this.privateNameAssignment)
    utils.writeBytes(buffer, this.signature)
  }

  public parseJSON(json: { [key: string]: any }) {
    super.parseJSON(json)
    this.privateNameAssignment = Long.fromString(json["privateNameAssignment"], true)
    this.signature = converters.hexStringToByteArray(json["signature"])
    return this
  }

  public putMyJSON(json: { [key: string]: any }) {
    json["privateNameAssignment"] = this.privateNameAssignment.toUnsigned().toString()
    json["signature"] = converters.byteArrayToHexString(this.signature)
  }

  public getName() {
    return this.privateNameAssignment
  }
}

export class AppendixPublicNameAnnouncement extends AbstractAppendix {
  private nameHash: Long
  private publicNameAnnouncement: Int8Array

  getFee(): string {
    return Fee.PUBLIC_NAME_ANNOUNCEMENT_APPENDIX_FEE
  }

  public getAppendixName() {
    return "PublicNameAnnouncement"
  }

  public getMySize() {
    return 1 + this.publicNameAnnouncement.length
  }

  public putMyBytes(buffer: ByteBuffer) {}

  public putMyJSON(json: { [key: string]: any }) {}

  public getFullName() {
    return this.publicNameAnnouncement
  }

  public getNameHash() {
    return this.nameHash
  }
}

export class AppendixPublicNameAssignment extends AbstractAppendix {
  private publicNameAssignment: number[]
  private signature: number[]
  private nameHash: Long

  getFee(): string {
    return Fee.PUBLIC_NAME_ASSIGNEMENT_APPENDIX_FEE
  }

  public getAppendixName() {
    return "PublicAccountNameAssignment"
  }

  public getMySize() {
    return 1 + this.publicNameAssignment.length + 64
  }

  public parse(buffer: ByteBuffer) {
    super.parse(buffer)
    this.publicNameAssignment = utils.readBytes(buffer, buffer.readByte())
    this.signature = utils.readBytes(buffer, 64)
    this.nameHash = crypto.fullNameToLong(this.publicNameAssignment)
    return this
  }

  public putMyBytes(buffer: ByteBuffer) {
    buffer.writeByte(this.publicNameAssignment.length)
    utils.writeBytes(buffer, this.publicNameAssignment)
    utils.writeBytes(buffer, this.signature)
  }

  public parseJSON(json: { [key: string]: any }) {
    super.parseJSON(json)
    this.publicNameAssignment = converters.hexStringToByteArray(json["publicNameAssignment"])
    this.signature = converters.hexStringToByteArray(json["signature"])
    this.nameHash = crypto.fullNameToLong(this.publicNameAssignment)
    return this
  }

  public putMyJSON(json: { [key: string]: any }) {
    json["publicNameAssignment"] = converters.byteArrayToHexString(this.publicNameAssignment)
    json["signature"] = converters.byteArrayToHexString(this.signature)
  }

  public getFullName() {
    return this.publicNameAssignment
  }

  public getNameHash() {
    return this.nameHash
  }
}
