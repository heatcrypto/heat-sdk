import * as crypto from "../src/crypto"

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
    expect(
      crypto.secretPhraseToPublicKey(
        "floor battle paper consider stranger blind alter blur bless wrote prove cloud"
      )
    ).toBe("ef9baf978860b56d6a0d15638c9af11be687f90230ec839fad762d085fc5651a")
  })
})

describe("crypto.getPrivateKey test", () => {
  it("is a function", () => {
    expect(crypto.getPrivateKey).toBeInstanceOf(Function)
  })
  it("returns private key", () => {
    expect(
      crypto.getPrivateKey(
        "floor battle paper consider stranger blind alter blur bless wrote prove cloud"
      )
    ).toBe("d0b857ee906717f40917f3a2c2c7e3fa0ffb3bc46edd1606b83f80bccf89065e")
  })
})

describe("crypto.getAccountId test", () => {
  it("is a function", () => {
    expect(crypto.getAccountId).toBeInstanceOf(Function)
  })
  it("returns account id", () => {
    expect(
      crypto.getAccountId(
        "floor battle paper consider stranger blind alter blur bless wrote prove cloud"
      )
    ).toBe("2068178321230336428")
  })
})

describe("crypto.getAccountIdFromPublicKey test", () => {
  it("is a function", () => {
    expect(crypto.getAccountIdFromPublicKey).toBeInstanceOf(Function)
  })
  it("returns account id", () => {
    expect(
      crypto.getAccountIdFromPublicKey(
        "b27b12f1982c6c57da981a4dcefe2ae75b00f0665b813e1b634c0b716e48524d"
      )
    ).toBe("4644748344150906433")
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
    expect(crypto.verifyBytes).toBeInstanceOf(Function)
  })
  it("returns encrypted note", () => {
    expect(
      crypto.encryptNote(
        "qwerty",
        {
          account: "4644748344150906433",
          publicKey: [
            67,
            118,
            33,
            151,
            136,
            231,
            209,
            148,
            106,
            211,
            119,
            25,
            111,
            215,
            16,
            57,
            88,
            211,
            214,
            214,
            97,
            141,
            201,
            61,
            45,
            13,
            107,
            79,
            113,
            123,
            100,
            29
          ],
          privateKey: [
            208,
            184,
            87,
            238,
            144,
            103,
            23,
            244,
            9,
            23,
            243,
            162,
            194,
            199,
            227,
            250,
            15,
            251,
            59,
            196,
            110,
            221,
            22,
            6,
            184,
            63,
            128,
            188,
            207,
            137,
            6,
            94
          ]
        },
        "floor battle paper consider stranger blind alter blur bless wrote prove cloud"
      )
    ).toBe({
      message:
        "1778e1ac06b2d0c90f64321970a1c54498d1463b4049d0f48adb7b13f28c2b089bfddda7b2d2f4720834c5ae8f6926b5",
      nonce: "4235e8fbc8e823a6123cbf19e4d6296f076ae269598449c07d6d6cf89407cbc7"
    })
  })
})

describe("crypto.encryptBinaryNote test", () => {
  it("is a function", () => {
    expect(crypto.encryptBinaryNote).toBeInstanceOf(Function)
  })
  it("encrypts binary note", () => {
    let options: crypto.IEncryptOptions = {
      account: "1522541402758811473",
      publicKey: [
        67,
        118,
        33,
        151,
        136,
        231,
        209,
        148,
        106,
        211,
        119,
        25,
        111,
        215,
        16,
        57,
        88,
        211,
        214,
        214,
        97,
        141,
        201,
        61,
        45,
        13,
        107,
        79,
        113,
        123,
        100,
        29
      ]
    }

    // let options : crypto.IEncryptOptions = {
    //   account: "1522541402758811473",
    //   nonce: Uint8Array(32) [217, 36, 147, 177, 9, 103, 5, 98, 113, 107, 59, 179, 43, 73, 105, 221, 161, 51, 241, 174, 32, 123, 159, 165, 71, 28, 160, 183, 175, 17, 30, 103],
    //   privateKey:(32) [208, 184, 87, 238, 144, 103, 23, 244, 9, 23, 243, 162, 194, 199, 227, 250, 15, 251, 59, 196, 110, 221, 22, 6, 184, 63, 128, 188, 207, 137, 6, 94],
    //   publicKey:(32) [67, 118, 33, 151, 136, 231, 209, 148, 106, 211, 119, 25, 111, 215, 16, 57, 88, 211, 214, 214, 97, 141, 201, 61, 45, 13, 107, 79, 113, 123, 100, 29],
    //   sharedKey:(32) [105, 176, 154, 187, 125, 110, 196, 174, 72, 81, 254, 173, 179, 214, 87, 83, 95, 233, 186, 56, 91, 30, 69, 63, 42, 14, 109, 193, 196, 139, 142, 20]
    // }

    expect(
      crypto.encryptBinaryNote(
        "qwerty",
        options,
        "floor battle paper consider stranger blind alter blur bless wrote prove cloud",
        true
      )
    ).toBe({
      message:
        "b7374e4cbed293ebebd604c2c4ebaa7e7041fa223d4658c4cff1f85d78ec796a",
      nonce: "d92493b109670562716b3bb32b4969dda133f1ae207b9fa5471ca0b7af111e67"
    })
  })
})

describe("crypto.encryptMessage test", () => {
  it("is a function", () => {
    expect(crypto.encryptMessage).toBeInstanceOf(Function)
  })
  it("encrypts binary note", () => {
    expect(
      crypto.encryptMessage(
        "qwerty",
        "b27b12f1982c6c57da981a4dcefe2ae75b00f0665b813e1b634c0b716e48524d",
        "floor battle paper consider stranger blind alter blur bless wrote prove cloud",
        true
      )
    ).toBe("todo")
  })
})

describe("crypto.decryptMessage test", () => {
  it("is a function", () => {
    expect(crypto.decryptMessage).toBeInstanceOf(Function)
  })
  it("decrypt message", () => {
    expect(
      crypto.decryptMessage(
        "db3c0152eb1e88fdac5aeb4c8bd13e3417ed121a0718a42f55b71ddd60e9fa336970f484e3ad0471e6a08276188d4963",
        "7619172406098fcc9fedd17a40bc40985683eb29dd0e3717eb2c89c9cc592d31",
        "4376219788e7d1946ad377196fd7103958d3d6d6618dc93d2d0d6b4f717b641d",
        "floor battle paper consider stranger blind alter blur bless wrote prove cloud"
      )
    ).toBe("qwerty1")
    /* todo with uncomressed
    expect(crypto.decryptMessage(
      "db3c0152eb1e88fdac5aeb4c8bd13e3417ed121a0718a42f55b71ddd60e9fa336970f484e3ad0471e6a08276188d4963",
      "7619172406098fcc9fedd17a40bc40985683eb29dd0e3717eb2c89c9cc592d31",
      "4376219788e7d1946ad377196fd7103958d3d6d6618dc93d2d0d6b4f717b641d",
      "floor battle paper consider stranger blind alter blur bless wrote prove cloud",
      true
    )).toBe(
      "qwerty1"
    )*/
  })
})

describe("crypto.passphraseEncrypt test", () => {
  it("is a function", () => {
    expect(crypto.passphraseEncrypt).toBeInstanceOf(Function)
  })
  it("encrypts binary note", () => {
    expect(crypto.passphraseEncrypt("qwerty", "1111")).toBe({
      ciphertext: "4fXdcuWaxDcMRDUZSXTzew==",
      salt: "6601be0931e44895239e5950f80a9e6f2772fd69175a6c57200e08982ab4463d",
      iv: "2a0abc442e69c04fbbe4a535b09e404c",
      HMAC: "085073bf18fe1799c13bf0a968510dfa7a574a1743210a080dcfd7b6be014e2f"
    })
  })
})

describe("crypto.passphraseDecrypt test", () => {
  it("is a function", () => {
    expect(crypto.passphraseDecrypt).toBeInstanceOf(Function)
  })
  it("returns account secret by passphrase", () => {
    let pem: crypto.PassphraseEncryptedMessage = new crypto.PassphraseEncryptedMessage(
      "8wr4f58Ke7wpAwnaOwY2ybMqjWURlSvBJ+XRP2ieXIJdsAFrm+y+Xf2mEk7FJ5iZQug2UDO+HQIOOWC3t6Bq480tpLBGv3mjQ95iCee6970uJuzFLhvnB8J7qkyK/ZzHdm9RTOPzS3NG6qebpjXvzdE9Hkz8I0fJokVXgWf3zvBU08XbUpfyUWPefl6YGTlGqMlzN3u0Vd4Z/mOPUG2g3g==",
      "32da75fc0ca00fec706d7ccf90458c68bdd9fcc1929e8540c7fe55ccf05d6f66",
      "9a9820d77f14206ed325083744a04fe2",
      "58322654337ab3795abc185acd8f9d8bfc69955fee7f83c4eaf39ce17c2542a5"
    )
    expect(crypto.passphraseDecrypt(pem, "1111")).toBe({
      account: "2068178321230336428",
      secretPhrase:
        "floor battle paper consider stranger blind alter blur bless wrote prove cloud",
      pincode: "1111",
      name: ""
    })
  })
})
