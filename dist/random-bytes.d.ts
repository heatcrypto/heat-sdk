export declare function randomBytes(length: number): Promise<Uint8Array>;
export interface RandomUint8ArrayProvider {
    generate(length: number): Promise<Uint8Array>;
}
export declare function setRandomSource(source: RandomUint8ArrayProvider): void;
