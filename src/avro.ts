const avro = require("./avro-types.js")
const Long = require("long")

export const Type = {
  forSchema(schema: any) {
    return avro.Type.forSchema(schema, { registry: { long: longType } })
  }
}

const longType = avro.builtins.LongType.__with({
  fromBuffer: (buf: any) => {
    return new Long(buf.readInt32LE(), buf.readInt32LE(4))
  },
  toBuffer: (n: any) => {
    const buf: any = Buffer.alloc(8)
    buf.writeInt32LE(n.getLowBits())
    buf.writeInt32LE(n.getHighBits(), 4)
    return buf
  },
  fromJSON: Long.fromValue,
  toJSON: (n: any) => {
    return +n
  },
  isValid: Long.isLong,
  compare: (n1: any, n2: any) => {
    return n1.compare(n2)
  }
})
