import * as crypto from "../src/crypto"
import { IEncryptOptions } from "../src/crypto"
import { hexStringToByteArray, stringToByteArray } from "../src/converters"

let bob = {
  secretPhrase:
    "floor battle paper consider stranger blind alter blur bless wrote prove cloud",
  publicKeyStr:
    "ef9baf978860b56d6a0d15638c9af11be687f90230ec839fad762d085fc5651a",
  privateKeyStr:
    "d0b857ee906717f40917f3a2c2c7e3fa0ffb3bc46edd1606b83f80bccf89065e",
  account: "2068178321230336428"
}

let alice = {
  secretPhrase: "user3",
  publicKeyStr:
    "4376219788e7d1946ad377196fd7103958d3d6d6618dc93d2d0d6b4f717b641d", //???
  privateKeyStr:
    "5860faf02b6bc6222ba5aca523560f0e364ccd8b67bee486fe8bf7c01d492c4b",
  account: "1522541402758811473"
}

describe("crypto.calculateStringHash test", () => {
  it("is a function", () => {
    expect(crypto.calculateStringHash).toBeInstanceOf(Function)
  })
  it("returns a hash", () => {
    expect(crypto.calculateStringHash("hello world")).toBe(
      "b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9"
    )
  })
})

describe("crypto.calculateFullHash test", () => {
  it("is a function", () => {
    expect(crypto.calculateFullHash).toBeInstanceOf(Function)
  })
  it("returns a full hash", () => {
    // testnet transaction: 4879568308965317604, TRANSFER HEAT From 4644748344150906433 to 4729421738299387565 amount 0.20000000 HEAT
    expect(
      crypto.calculateFullHash(
        "001015e33607a005b27b12f1982c6c57da981a4dcefe2ae75b00f0665b813e1b634c0b716e48524dad6e58700348a241002d31010000000040420f000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000040000004a800300397775e7050e6bd60001cfa1a9c50f968a5679afc1bf655a57c304303b0ebb8e1bb47ef9d466494ac117ffffffffffffff7f",
        "f011760e7223ebd198ab1f482e594136583e80ab77d431800379a4510019450cda62b822c637806283d192134650a43f96b81354b2d5f8a9c9b0463440be20dc"
      )
    ).toBe("e49b212186b5b743b48c215a99e35bfe0c676dd5eb93bcea52e8026de896ce30")
  })
})

describe("crypto.fullNameToHash test", () => {
  it("is a function", () => {
    expect(crypto.fullNameToHash).toBeInstanceOf(Function)
  })
  it("returns a full name hash", () => {
    expect(crypto.fullNameToHash("oskol@heatwallet.com")).toBe(
      "8932144534527668929"
    )
  })
})

describe("crypto.calculateTransactionId test", () => {
  it("is a function", () => {
    expect(crypto.calculateTransactionId).toBeInstanceOf(Function)
  })
  it("calculates transaction id", () => {
    expect(
      crypto.calculateTransactionId(
        "e48a89bc32b628815f0323bcf888b00ee5903baee5af0fe55600c8f0e59b0d97"
      )
    ).toBe("9306888958988880612")
  })
})

describe("crypto.secretPhraseToPublicKey test", () => {
  it("is a function", () => {
    expect(crypto.secretPhraseToPublicKey).toBeInstanceOf(Function)
  })
  it("returns public key of secret phrase", () => {
    expect(crypto.secretPhraseToPublicKey(bob.secretPhrase)).toBe(
      bob.publicKeyStr
    )
    expect(crypto.secretPhraseToPublicKey(alice.secretPhrase)).toBe(
      alice.publicKeyStr
    )
  })
})

describe("crypto.getPrivateKey test", () => {
  it("is a function", () => {
    expect(crypto.getPrivateKey).toBeInstanceOf(Function)
  })
  it("returns private key", () => {
    expect(crypto.getPrivateKey(bob.secretPhrase)).toBe(bob.privateKeyStr)
    expect(crypto.getPrivateKey(alice.secretPhrase)).toBe(alice.privateKeyStr)
  })
})

describe("crypto.getAccountId test", () => {
  it("is a function", () => {
    expect(crypto.getAccountId).toBeInstanceOf(Function)
  })
  it("returns account id", () => {
    expect(crypto.getAccountId(bob.secretPhrase)).toBe(bob.account)
    expect(crypto.getAccountId(alice.secretPhrase)).toBe(alice.account)
  })
})

describe("crypto.getAccountIdFromPublicKey test", () => {
  it("is a function", () => {
    expect(crypto.getAccountIdFromPublicKey).toBeInstanceOf(Function)
  })
  it("returns account id", () => {
    expect(crypto.getAccountIdFromPublicKey(bob.publicKeyStr)).toBe(bob.account)
    expect(crypto.getAccountIdFromPublicKey(alice.publicKeyStr)).toBe(
      alice.account
    )
  })
})

describe("crypto.signBytes test", () => {
  it("is a function", () => {
    expect(crypto.signBytes).toBeInstanceOf(Function)
  })
  it("sign bytes", () => {
    expect(
      crypto.signBytes(
        "0010a0ed3607a005b27b12f1982c6c57da981a4dcefe2ae75b00f0665b813e1b634c0b716e48524dac1119b939a5b31c00e1f5050000000040420f00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a7800300e01292c7e82a773f00ffffffffffffff7f",
        "7573657231" /*from API: TODO pass secretphrase as string instead of HEX string, convert to hex string ourselves.*/
      )
    ).toBe(
      "8846c5e5e5ebd31a1bea3b8dd9b2a336830c262906faf21f9ca8c3a75813790ab9e0886ce865c209f8df73ce44445fcf4c7115d099335dd2c404ae3a248162de"
    )
  })
})

describe("crypto.verifyBytes test", () => {
  it("is a function", () => {
    expect(crypto.verifyBytes).toBeInstanceOf(Function)
  })
  it("verify bytes", () => {
    expect(
      crypto.verifyBytes(
        "04ddc8ca22d67bb8e65226add5a3857a64cc0d1851ea60f118a7f52968e690049bcb0ab367b2aa313a0eedcf89ca0579f9c1ff1ba7c74085227ff82d92b1daac",
        "001075ea3607a005b27b12f1982c6c57da981a4dcefe2ae75b00f0665b813e1b634c0b716e48524dac1119b939a5b31c0065cd1d0000000040420f0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000086800300dd2fc17fe7ccdd5c00ffffffffffffff7f",
        "b27b12f1982c6c57da981a4dcefe2ae75b00f0665b813e1b634c0b716e48524d"
      )
    ).toBe(true)
  })
})

describe("crypto.encryptNote test", () => {
  it("is a function", () => {
    expect(crypto.encryptNote).toBeInstanceOf(Function)
  })
  it("returns encrypted note", () => {
    let text = "qwerty1 näkökenttäsi лыжи 政府信息公开发布平台"
    let options: IEncryptOptions = {
      account: bob.account,
      privateKey: hexStringToByteArray(bob.privateKeyStr),
      publicKey: hexStringToByteArray(bob.publicKeyStr)
    }
    let encrypted = crypto.encryptNote(text, options, bob.secretPhrase)
    let decrypted = crypto.decryptMessage(
      encrypted.message,
      encrypted.nonce,
      bob.publicKeyStr,
      bob.secretPhrase
    )

    expect(decrypted).toBe(text)
  })
})

describe("crypto.encryptBinaryNote test", () => {
  it("is a function", () => {
    expect(crypto.encryptBinaryNote).toBeInstanceOf(Function)
  })
  it("encrypts binary note", () => {
    let text = "qwerty1"
    let options: crypto.IEncryptOptions = {
      account: bob.account,
      privateKey: hexStringToByteArray(bob.privateKeyStr),
      publicKey: hexStringToByteArray(bob.publicKeyStr)
    }

    let encrypted = crypto.encryptBinaryNote(
      stringToByteArray(text),
      options,
      bob.secretPhrase /*todo with true*/
    )

    let decrypted = crypto.decryptMessage(
      encrypted.message,
      encrypted.nonce,
      bob.publicKeyStr,
      bob.secretPhrase
    )

    expect(decrypted).toBe(text)
  })
})

describe("crypto.encryptMessage, crypto.decryptMessage test", () => {
  it("is a function", () => {
    expect(crypto.encryptMessage).toBeInstanceOf(Function)
    expect(crypto.decryptMessage).toBeInstanceOf(Function)
  })
  it("encrypts, decrypts message", () => {
    let text = "qwerty ♠═~☺"
    let encrypted = crypto.encryptMessage(
      text,
      bob.publicKeyStr,
      bob.secretPhrase
    )
    let decrypted = crypto.decryptMessage(
      encrypted.data,
      encrypted.nonce,
      bob.publicKeyStr,
      bob.secretPhrase
    )

    expect(encrypted.isText).toBe(true)
    expect(decrypted).toBe(text)
  })
})

describe("crypto.passphraseEncrypt, crypto.passphraseDecrypt test", () => {
  it("is a function", () => {
    expect(crypto.passphraseEncrypt).toBeInstanceOf(Function)
    expect(crypto.passphraseDecrypt).toBeInstanceOf(Function)
  })
  it("encrypts, decrypts text using passprase", () => {
    let text = "qwerty !@#$%^ 12345"
    let passphrase = "qaz plm [].,/"
    let encrypted = crypto.passphraseEncrypt(text, passphrase)
    let decrypted = crypto.passphraseDecrypt(encrypted, passphrase)

    expect(decrypted).toBe(text)
  })
})
