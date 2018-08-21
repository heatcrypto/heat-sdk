import "./jasmine"
import * as utils from "../src/utils"

describe("utils.unformat test", () => {
  it("is a function", () => {
    expect(utils.unformat).toBeInstanceOf(Function)
  })
  it("accepts null", () => {
    expect(utils.unformat(null)).toBe("0")
  })
  it("works with single comma", () => {
    expect(utils.unformat("1,000.99")).toBe("1000.99")
  })
  it("works with multiple commas", () => {
    expect(utils.unformat("1,000,000.99")).toBe("1000000.99")
  })
})

describe("utils.commaFormat test", () => {
  it("is a function", () => {
    expect(utils.commaFormat).toBeInstanceOf(Function)
  })
  it("accepts undefined", () => {
    expect(utils.commaFormat(undefined)).toBe("0")
  })
  it("works with single comma", () => {
    expect(utils.commaFormat("1000.99")).toBe("1,000.99")
  })
  it("works with multiple commas", () => {
    expect(utils.commaFormat("1000000.99")).toBe("1,000,000.99")
  })
})

describe("utils.isNumber test", () => {
  it("is a function", () => {
    expect(utils.isNumber).toBeInstanceOf(Function)
  })
  it("works with comma formatted", () => {
    expect(utils.isNumber("1,000")).toBeTruthy()
  })
})

describe("utils.hasToManyDecimals test", () => {
  it("is a function", () => {
    expect(utils.hasToManyDecimals).toBeInstanceOf(Function)
  })
  // TODO write tests for utils.hasToManyDecimals
})

describe("utils.timestampToDate test", () => {
  it("is a function", () => {
    expect(utils.timestampToDate).toBeInstanceOf(Function)
  })
  // TODO write tests for utils.timestampToDate
})

describe("utils.formatQNT test", () => {
  it("is a function", () => {
    expect(utils.formatQNT).toBeInstanceOf(Function)
  })
  // TODO write tests utils.formatQNT
})

describe("utils.trimDecimals test", () => {
  it("is a function", () => {
    expect(utils.trimDecimals).toBeInstanceOf(Function)
  })
  // TODO write tests utils.trimDecimals
})

// etc..
