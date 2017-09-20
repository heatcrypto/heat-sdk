import HeatClass from "../src/heat-sdk"

/**
 * Dummy test
 */
describe("Dummy test", () => {
  it("works if true is truthy", () => {
    expect(true).toBeTruthy()
  })

  it("DummyClass is instantiable", () => {
    expect(new HeatClass()).toBeInstanceOf(HeatClass)
  })
})
