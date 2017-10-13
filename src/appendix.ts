/// <reference path='bytebuffer.d.ts' />
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
import ByteBuffer from "./bytebuffer"
import { Fee } from "./fee"
import { EncryptedData } from "./encrypted-data"
import Long from "long"

export interface Appendix {
  getSize(): number
  putBytes(buffer: ByteBuffer): void
  getJSONObject(): Object
  getVersion(): number
  getFee(): string
}

export abstract class AbstractAppendix implements Appendix {
  protected version: number = 1

  public parse(buffer: ByteBuffer) {
    this.version = buffer.readByte()
  }

  public parseJSON(json: { [key: string]: any }) {
    this.version = json["version." + this.getAppendixName()]
  }

  abstract getAppendixName(): string

  public getSize(): number {
    return this.getMySize() + 1
  }
  abstract getMySize(): number

  public putBytes(buffer: ByteBuffer) {
    buffer.writeByte(this.version)
    this.putMyBytes(buffer)
  }
  abstract putMyBytes(buffer: ByteBuffer): void

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
  public create(message: Array<number>, isText: boolean) {
    this.message = message
    this.isText = isText
  }
  getFee(): string {
    return Fee.MESSAGE_APPENDIX_FEE
  }
  public parse(buffer: ByteBuffer) {
    super.parse(buffer)
    let messageLength = buffer.readInt()
    this.isText = messageLength < 0
    if (messageLength < 0) messageLength &= 0x7fffffff
    this.message = []
    for (let i = 0; i < messageLength; i++) this.message.push(buffer.readByte())
  }
  public getAppendixName() {
    return "Message"
  }
  public getMySize() {
    return 4 + this.message.length
  }
  public putMyBytes(buffer: ByteBuffer) {
    buffer.writeInt(
      this.isText ? this.message.length | 0x80000000 : this.message.length
    )
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
  private _encryptedData: EncryptedData
  private _isText: boolean

  getFee(): string {
    return Fee.ENCRYPTED_MESSAGE_APPENDIX_FEE
  }

  public getMySize() {
    return 4 + this._encryptedData.getSize()
  }

  public putMyBytes(buffer: ByteBuffer) {}

  public putMyJSON(json: { [key: string]: any }) {}

  getEncryptedData(): EncryptedData {
    return this._encryptedData
  }

  isText(): boolean {
    return this._isText
  }
}

export class AppendixEncryptedMessage extends AbstractAppendixEncryptedMessage {
  public getAppendixName() {
    return "EncryptedMessage"
  }

  public putMyBytes(buffer: ByteBuffer) {}

  public putMyJSON(json: { [key: string]: any }) {}
}

export class AppendixEncryptToSelfMessage extends AbstractAppendixEncryptedMessage {
  public getAppendixName() {
    return "EncryptToSelfMessage"
  }

  public putMyBytes(buffer: ByteBuffer) {}

  public putMyJSON(json: { [key: string]: any }) {}
}

export class AppendixPublicKeyAnnouncement extends AbstractAppendix {
  private publicKey: Array<number>

  public create(publicKey: Array<number>) {
    this.publicKey = publicKey
  }

  public parse(buffer: ByteBuffer) {
    super.parse(buffer)
    this.publicKey = []
    for (let i = 0; i < 32; i++) this.publicKey.push(buffer.readByte())
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
    this.publicKey.forEach(byte => {
      buffer.writeByte(byte)
    })
  }

  public parseJSON(json: { [key: string]: any }) {
    super.parseJSON(json)
    this.publicKey = converters.hexStringToByteArray(json["recipientPublicKey"])
  }

  public putMyJSON(json: { [key: string]: any }) {
    json["recipientPublicKey"] = converters.byteArrayToHexString(this.publicKey)
  }
}

export class AppendixPrivateNameAnnouncement extends AbstractAppendix {
  private privateNameAnnouncement: Long

  getFee(): string {
    return Fee.PUBLICKEY_ANNOUNCEMENT_APPENDIX_FEE
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
  private signature: Int8Array

  getFee(): string {
    return Fee.PRIVATE_NAME_ASSIGNEMENT_APPENDIX_FEE
  }

  public getAppendixName() {
    return "PrivateNameAssignment"
  }

  public getMySize() {
    return 8 + 64
  }

  public putMyBytes(buffer: ByteBuffer) {}

  public putMyJSON(json: { [key: string]: any }) {}

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
  private publicNameAssignment: Int8Array
  private signature: Int8Array
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

  public putMyBytes(buffer: ByteBuffer) {}

  public putMyJSON(json: { [key: string]: any }) {}

  public getFullName() {
    return this.publicNameAssignment
  }

  public getNameHash() {
    return this.nameHash
  }
}
