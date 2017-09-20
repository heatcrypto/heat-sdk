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

export interface Appendix {
  getSize(): number
  putBytes(buffer: ByteBuffer): void
  getJSONObject(): Object
  getVersion(): number
}

export abstract class AbstractAppendix implements Appendix {
  private version: number = 0

  public parse(buffer: ByteBuffer) {
    this.version = buffer.readByte()
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
}

export class AppendixMessage extends AbstractAppendix {
  private message: Array<number>
  private isText: boolean
  public create(message: Array<number>, isText: boolean) {
    this.message = message
    this.isText = false
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
  public putMyJSON(json: { [key: string]: any }) {
    json.put(
      "message",
      this.isText
        ? converters.byteArrayToString(this.message)
        : converters.byteArrayToHexString(this.message)
    )
    json.put("messageIsText", this.isText)
  }
  public getMessage() {
    return this.message
  }
  public getIsText() {
    return this.isText
  }
}

export class AppendixEncryptedMessage extends AbstractAppendix {
  public getAppendixName() {
    return ""
  }
  public getMySize() {
    return 0
  }
  public putMyBytes(buffer: ByteBuffer) {}
  public putMyJSON(json: { [key: string]: any }) {}
}

export class AppendixEncryptToSelfMessage extends AbstractAppendix {
  public getAppendixName() {
    return ""
  }
  public getMySize() {
    return 0
  }
  public putMyBytes(buffer: ByteBuffer) {}
  public putMyJSON(json: { [key: string]: any }) {}
}

export class AppendixPublicKeyAnnouncement extends AbstractAppendix {
  public getAppendixName() {
    return ""
  }
  public getMySize() {
    return 0
  }
  public putMyBytes(buffer: ByteBuffer) {}
  public putMyJSON(json: { [key: string]: any }) {}
}

export class AppendixPrivateNameAnnouncement extends AbstractAppendix {
  public getAppendixName() {
    return ""
  }
  public getMySize() {
    return 0
  }
  public putMyBytes(buffer: ByteBuffer) {}
  public putMyJSON(json: { [key: string]: any }) {}
}

export class AppendixPrivateNameAssignment extends AbstractAppendix {
  public getAppendixName() {
    return ""
  }
  public getMySize() {
    return 0
  }
  public putMyBytes(buffer: ByteBuffer) {}
  public putMyJSON(json: { [key: string]: any }) {}
}

export class AppendixPublicNameAnnouncement extends AbstractAppendix {
  public getAppendixName() {
    return ""
  }
  public getMySize() {
    return 0
  }
  public putMyBytes(buffer: ByteBuffer) {}
  public putMyJSON(json: { [key: string]: any }) {}
}

export class AppendixPublicNameAssignment extends AbstractAppendix {
  public getAppendixName() {
    return ""
  }
  public getMySize() {
    return 0
  }
  public putMyBytes(buffer: ByteBuffer) {}
  public putMyJSON(json: { [key: string]: any }) {}
}
