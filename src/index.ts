import {BiteDescriptor} from "./BiteDescriptor";
import {GeneratorCb} from "./types";

export class BitPacker {
    static pack(biteDescriptors: Array<BiteDescriptor>): Uint8Array {
        let size = 0

        for (const biteDesc of biteDescriptors) {
            size += biteDesc.bits
        }
        size = (size + 7) >>> 3

        const buffer = new Uint8Array(size)

        BitPacker.packIntoBuffer(biteDescriptors, buffer)

        return buffer
    }

    static packIntoBuffer(biteDescriptors: Array<BiteDescriptor>, buffer: Uint8Array): void {
        let index = 0
        let biteIndex = 7

        for (const bitDesc of biteDescriptors) {
            let value = bitDesc.value
            let vLength = bitDesc.bits

            while (vLength > 0) {
                if (index >= buffer.byteLength) return
                const bitsToPack = biteIndex + 1

                if (vLength <= bitsToPack) {
                    const mask = ((1 << vLength) - 1)
                    buffer[index] |= (value & mask) << (bitsToPack - vLength)

                    biteIndex -= vLength
                    if (biteIndex === -1) {
                        biteIndex = 7
                        index += 1
                    }

                    vLength = 0
                } else {
                    const mask = ((1 << bitsToPack) - 1) << (vLength - bitsToPack)
                    buffer[index] |= (value & mask)  >>> (vLength - bitsToPack)

                    biteIndex = 7
                    index++
                    vLength -= bitsToPack
                }
            }
        }
    }

    static unPack = function*<T>(buffer: Uint8Array, callback: GeneratorCb<T>) {
        let index = 0, bitIndex = 7

        let pattern = ''

        while (index < buffer.byteLength) {
            pattern += (buffer[index] & (1 << bitIndex)) >>> bitIndex
            bitIndex--

            const transformedPatternValue = callback(pattern)

            if (transformedPatternValue !== null) {
                yield transformedPatternValue
                pattern = ''
            }

            if (bitIndex < 0) {
                index++
                bitIndex = 7
            }
        }
    }
}

const packed = BitPacker.pack([
    BiteDescriptor.fromString('101'),
    BiteDescriptor.fromString('0001000'),
    BiteDescriptor.fromString('11111111111'),
    BiteDescriptor.fromString('0'),
    BiteDescriptor.fromString('111'),
] )

const iterator = BitPacker.unPack(packed, (pattern) => pattern)

// console.log([...iterator].join(''), [...packed].map(num => (num).toString(2)).join(''))

// 10100010001111111111101110000000
// 101000101111111111101110000000
