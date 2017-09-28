require("es6-promise").polyfill()
require("isomorphic-fetch")

export interface HeatApiConfig {
  baseURL?: string
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
