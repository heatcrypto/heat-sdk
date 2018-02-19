// Type definitions for avro-types
// Project: heat-sdk
// Definitions by: DM de Klerk | dennis@heatledger.com

type Schema = string | object // TODO object should be further specified

export class Type {
  clone(val: any, opts?: any): any
  compare(val1: any, val2: any): number
  compareBuffers(buf1: any, buf2: any): number
  constructor(schema: Schema, opts?: any)
  createResolver(type: any, opts?: any): any // TODO: opts not documented on wiki
  decode(buf: any, pos?: any, resolver?: any): any
  fingerprint(algorithm?: any): any
  fromBuffer(buffer: Buffer, resolver?: any, noCheck?: boolean): Type // TODO
  fromString(str: any): any
  inspect(): string
  isValid(val: any, opts?: any): any
  random(): Type
  schema(opts?: any): any
  toBuffer(value: object): Buffer
  toJSON(): string
  toString(val?: any): any
  wrap(val: any): any
  readonly aliases: string[] | undefined
  readonly doc: string | undefined
  readonly name: string | undefined
  readonly branchName: string | undefined
  readonly typeName: string
  static forSchema(schema: Schema, opts?: any): Type
  static forTypes(types: any, opts?: any): Type
  static forValue(value: object, opts?: any): Type
  static isType(arg: any, ...prefix: string[]): boolean
  static __reset(size: number): void
}

export namespace types {
  class ArrayType extends Type {
    constructor(schema: Schema, opts: any)
    readonly itemsType: Type
    random(): ArrayType
  }

  class BooleanType extends Type {
    // TODO: Document this on the wiki
    constructor()
    random(): BooleanType
  }

  class BytesType extends Type {
    // TODO: Document this on the wiki
    constructor()
    random(): BytesType
  }

  class DoubleType extends Type {
    // TODO: Document this on the wiki
    constructor()
    random(): DoubleType
  }

  class EnumType extends Type {
    constructor(schema: Schema, opts?: any)
    readonly symbols: string[]
    random(): EnumType
  }

  class FixedType extends Type {
    constructor(schema: Schema, opts?: any)
    readonly size: number
    random(): FixedType
  }

  class FloatType extends Type {
    constructor()
    random(): FloatType
  }

  class IntType extends Type {
    constructor()
    random(): IntType
  }

  class LogicalType extends Type {
    constructor(schema: Schema, opts?: any)
    readonly underlyingType: Type
    _export(schema: Schema): void
    _fromValue(val: any): any
    _resolve(type: Type): any
    _toValue(any: any): any
    random(): LogicalType
  }

  class LongType extends Type {
    constructor()
    random(): LongType
    static __with(methods: object, noUnpack?: boolean): void
  }

  class MapType extends Type {
    constructor(schema: Schema, opts?: any)
    readonly valuesType: any
    random(): MapType
  }

  class NullType extends Type {
    // TODO: Document this on the wiki
    constructor()
    random(): NullType
  }

  class RecordType extends Type {
    constructor(schema: Schema, opts?: any)
    readonly fields: Field[]
    readonly recordConstructor: any // TODO: typeof Record once Record interface/class exists
    field(name: string): Field
    random(): RecordType
  }

  class Field {
    aliases: string[]
    defaultValue(): any
    name: string
    order: string
    type: Type
  }

  class StringType extends Type {
    // TODO: Document this on the wiki
    constructor()
    random(): StringType
  }

  class UnwrappedUnionType extends Type {
    constructor(schema: Schema, opts: any)
    random(): UnwrappedUnionType
  }

  class WrappedUnionType extends Type {
    constructor(schema: Schema, opts: any)
    random(): WrappedUnionType
  }
}
