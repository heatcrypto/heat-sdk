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

// export function calculateFullHash(unsignedTransaction: string, signature: string): string {

// export function fullNameToHash(fullNameUTF8: string): string {

// export function calculateTransactionId(fullHashHex: string): string {

// export function secretPhraseToPublicKey(secretPhrase: string): string {

// export function getPrivateKey(secretPhrase: string) {

// export function getAccountId(secretPhrase: string) {

// export function getAccountIdFromPublicKey(publicKey: string) {

// export function signBytes(message: string, secretPhrase: string) {

// export function verifyBytes(signature: string, message: string, publicKey: string): boolean {

// export function encryptNote(message: string, options: IEncryptOptions, secretPhrase: string, uncompressed?: boolean) {

// export function encryptBinaryNote(message: Array<number>, options: IEncryptOptions, secretPhrase: string, uncompressed?: boolean) {

// export function encryptMessage(message: string, publicKey: string, secretPhrase: string, uncompressed?: boolean): IEncryptedMessage {

// export function decryptMessage(data: string, nonce: string, publicKey: string, secretPhrase: string, uncompressed?: boolean): string {

// export function passphraseEncrypt(message: string, passphrase: string): PassphraseEncryptedMessage {

// export function passphraseDecrypt(cp: PassphraseEncryptedMessage, passphrase: string): string|null {
