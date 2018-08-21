import "./jasmine"
import { SecretGenerator } from "../src/secret-generator"

describe("SecretGenerator.generate test", () => {
  it("returns a secret phrase", () => {
    //check that the function is not broken, the quality of generation is not checked
    let generator = new SecretGenerator()
    return generator.generate().then(secret => {
      let words = secret.split(" ")
      expect(words.length).toBe(12)

      let duplicates = {}
      words.forEach(word => {
        expect(duplicates[word]).toBeUndefined()
        duplicates[word] = 1
      })
      return expect(true).toBe(true)
    })
  })
  it("returns unique secret phrases", () => {
    let generator = new SecretGenerator()
    return Promise.all([generator.generate(), generator.generate(), generator.generate()]).then(
      values => {
        expect(values[0]).not.toEqual(values[1])
        expect(values[1]).not.toEqual(values[2])
        return expect(values[0]).not.toEqual(values[2])
      }
    )
  })
})
