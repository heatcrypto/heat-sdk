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
import Long from "long"
import { Buffer } from "buffer"
import avro from "./avro-types/avro-types"
// import a_ from './avro-types'
// const avro:any = a_

export const Type = {
  forSchema(schema: any) {
    return avro.Type.forSchema(schema, { registry: { long: longType } })
  }
}

const longType = avro.types.LongType.__with({
  fromBuffer: (buf: any) => {
    return new Long(buf.readInt32LE(0), buf.readInt32LE(4))
  },
  toBuffer: (n: any) => {
    //const buf: any = Buffer.alloc(8)
    const buf: any = new Buffer(8)
    buf.writeInt32LE(n.getLowBits(), 0)
    buf.writeInt32LE(n.getHighBits(), 4)
    return buf
  },
  fromJSON: Long.fromValue,
  toJSON: (n: any) => {
    return +n
  },
  isValid: Long.isLong,
  compare: (n1: any, n2: any) => {
    return n1.compare(n2)
  }
})
