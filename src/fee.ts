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

export class Fee {
  static ONE_HEAT = 100000000 //todo move to global CONSTANTS

  public static DEFAULT = (Fee.ONE_HEAT / 100).toString()
  public static ASSET_ISSUANCE_FEE = (Fee.ONE_HEAT * 500).toString()
  public static ASSET_ISSUE_MORE_FEE = Fee.DEFAULT
  public static ASSET_TRANSFER_FEE = Fee.DEFAULT
  public static ORDER_PLACEMENT_FEE = Fee.DEFAULT
  public static ORDER_CANCELLATION_FEE = Fee.DEFAULT
  public static WHITELIST_ACCOUNT_FEE = Fee.DEFAULT
  public static WHITELIST_MARKET_FEE = (Fee.ONE_HEAT * 10).toString()
  public static EFFECTIVE_BALANCE_LEASING_FEE = Fee.DEFAULT
}
