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
import { randomBytes } from "../src/random-bytes"

describe("randomBytes", () => {
  it("is a function", () => {
    expect(randomBytes).toBeInstanceOf(Function)
  })
  it("returns a Uint8Array", () => {
    return randomBytes(1).then(bytes => {
      return expect(bytes).toBeInstanceOf(Uint8Array)
    })
  })
  it("return array of correct length", () => {
    return Promise.all([
      randomBytes(1).then(bytes => expect(bytes.length).toBe(1)),
      randomBytes(10).then(bytes => expect(bytes.length).toBe(10)),
      randomBytes(100).then(bytes => expect(bytes.length).toBe(100))
    ])
  })
  it("never returns the same bytes", () => {
    return Promise.all([
      randomBytes(10),
      randomBytes(10),
      randomBytes(10)
    ]).then(values => {
      expect(values[0]).not.toEqual(values[1])
      expect(values[1]).not.toEqual(values[2])
      return expect(values[0]).not.toEqual(values[2])
    })
  })
})
