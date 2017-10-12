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
import "es6-promise/auto"
import "isomorphic-fetch"

export interface HeatApiConfig {
  baseURL: string
}

export class HeatApi {
  private baseURL: string

  constructor(defaults: HeatApiConfig) {
    this.baseURL = defaults.baseURL
  }

  public get<T>(path: string): Promise<T> {
    return new Promise((resolve, reject) => {
      fetch(this.baseURL + path)
        .then(response => response.json())
        .then(data => {
          if (data["errorDescription"])
            reject(
              new HeatApiError(
                data["errorDescription"],
                data["errorCode"],
                path,
                {}
              )
            )
          else resolve(data)
        })
        .catch(reason => reject(reason))
    })
  }

  public post<T, Y>(path: string, params: Y): Promise<T> {
    let bodyParams: { [key: string]: string } = <any>params
    return new Promise((resolve, reject) => {
      fetch(this.baseURL + path, {
        method: "post",
        body: this.searchParams(bodyParams),
        headers: {
          Accept:
            "application/json, application/xml, text/plain, text/html, *.*",
          "Content-Type": "application/x-www-form-urlencoded; charset=utf-8"
        }
      })
        .then(response => response.json())
        .then(data => {
          if (data["errorDescription"])
            reject(
              new HeatApiError(
                data["errorDescription"],
                data["errorCode"],
                path,
                params
              )
            )
          else resolve(data)
        })
        .catch(reason => reject(reason))
    })
  }

  /* Encodes an one level deep object as URLSearchParams for use in 
     application/x-www-form-urlencoded POST body. */
  private searchParams(params: { [key: string]: string }): string {
    let result: string[] = []
    for (var key in params)
      if (params.hasOwnProperty(key))
        result.push(`${key}=${encodeURIComponent(params[key])}`)
    return result.join("&")
  }
}

export class HeatApiError {
  constructor(
    public errorDescription: string,
    public errorCode: number,
    public path: string,
    public params?: { [key: string]: any }
  ) {}
}
