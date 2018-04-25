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

// Defines attributes of objects in Testnet. The attributes using in the tests.
// If these values are not actual then need to create the objects in the testnet and to update values here.

export const testnet = {
  ACCOUNT_1: { ID: "8543107612364942736", SECRET_PHRASE: "test secret phrase 1" },
  ACCOUNT_2: { ID: "17778953465000958343", SECRET_PHRASE: "test secret phrase 2" },
  ACCOUNT_3: { ID: "14298121729768488135", SECRET_PHRASE: "test secret phrase 3" },
  ACCOUNT_21: { ID: "17160836487693957086", SECRET_PHRASE: "stresstest21" },
  ACCOUNT_22: { ID: "8072356497785662904", SECRET_PHRASE: "stresstest22" },
  ASSET_1: undefined,
  ASSET_2: undefined,
  ASSET_3: undefined
}

// Asset ENE Energy q=1_000_000 decimals=6 dillutable=false
testnet.ASSET_1 = { ID: "9827585868724319515", ISSUER: testnet.ACCOUNT_1 }

// Asset POW Power q=100_500 decimals=0 dillutable=true
testnet.ASSET_2 = { ID: "3722848536705943191", ISSUER: testnet.ACCOUNT_2 }
