import { SecretGenerator } from "../src/secret-generator"

describe("SecretGenerator.generate test", () => {
  it("returns a secret phrase", () => {
    //check that the function is not broken, the quality of generation is not checked
    let generator = new SecretGenerator()
    for (let i = 0; i < 1000; i++) {
      expect(generator.generate("en").split(" ").length).toBeGreaterThanOrEqual(
        10
      )
      expect(generator.generate("en")).not.toBe(generator.generate("en"))
    }
  })
})
