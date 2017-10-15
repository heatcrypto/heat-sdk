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
import fetch, { Headers, Request, Response } from "node-fetch"

/**
 * To access `fetch` in your tests and nodejs modules include 
 * require('es6-promise').polyfill();require('isomorphic-fetch') at the top
 * of your module. 
 * To access `fetch` in a browser simply refer to the global `fetch` method.
 * 
 * Links:
 * 
 *    About async tests
 *    https://facebook.github.io/jest/docs/en/tutorial-async.html
 * 
 *    About using fetch
 *    https://developers.google.com/web/updates/2015/03/introduction-to-fetch
 *    https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
 * 
 *    About fetch
 *    Fetch is natively supported in both latest firefox and chrome and is meant 
 *    as a native standardized follow up to XMLHttpRequest.
 */

/* Encodes an one level deep object as URLSearchParams for use in 
   application/x-www-form-urlencoded POST body. */
function searchParams(params: { [key: string]: string }): string {
  let result: string[] = []
  for (var key in params) {
    if (params.hasOwnProperty(key))
      result.push(`${key}=${encodeURIComponent(params[key])}`)
  }
  return result.join("&")
}

describe("Global fetch", () => {
  it("can fetch stuff", () => {
    let url = "https://heatwallet.com:7734/api/v1/blockchain/status"
    return fetch(url)
      .then(response => response.json())
      .then(data => {
        expect(data.application).toBe("HEAT")
      })
  })
  it("can use fetch related Body,Request,Headers,Response etc..", () => {
    expect(new Headers()).toBeInstanceOf(Headers)
    expect(new Request("foo")).toBeInstanceOf(Request)
    expect(new Response()).toBeInstanceOf(Response)
  })
  it("can post to application/x-www-form-urlencoded", () => {
    let url = "https://heatwallet.com:7734/api/v1/tx/lease"
    let config: RequestInit = {
      method: "post",
      body: searchParams({
        period: "1440",
        fee: "1000000",
        deadline: "1440",
        secretPhrase: "test works as long as no one uses this secretphrase"
      }),
      headers: {
        Accept: "application/json, application/xml, text/plain, text/html, *.*",
        "Content-Type": "application/x-www-form-urlencoded; charset=utf-8"
      }
    }
    return fetch(url, config)
      .then(response => response.json())
      .then(data => {
        expect(data.errorDescription).toBe("Unknown account")
        expect(data.errorCode).toBe(3)
      })
  })
})
