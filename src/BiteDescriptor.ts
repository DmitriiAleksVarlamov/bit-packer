export class BiteDescriptor {
    value: number
    bits: number

    constructor(value: number, bits: number) {
        if (!(value > -1 && Number.isInteger(value))) {
            throw new Error('Value must be an Integer > -1')
        }

        if (!(bits > 0 && Number.isInteger(bits))) {
            throw new Error('Bits must be an Integer > 0')
        }

        this.value = value
        this.bits = bits
    }

    static fromString(value: string) {
        const base = 2;
        const binaryRegExp = /^(0|1)+$/;
        if (binaryRegExp.test(value)) {
            return new BiteDescriptor(parseInt(value, base), value.length)
        }

        throw new Error('Value must be a valid binary string')

    }
}
