import bigInt from 'big-integer';

export class Rsa115 {
    private n: any;
    private e: any;

    constructor() {
        this.n = bigInt('8686980c0f5a24c4b9d43020cd2c22703ff3f450756529058b1cf88f09b8602136477198a6e2683149659bd122c33592fdb5ad47944ad1ea4d36c6b172aad6338c3bb6ac6227502d010993ac967d1aef00f0c8e038de2e4d3bc2ec368af2e9f10a6f1eda4f7262f136420c07c331b871bf139f74f3010e3c4fe57df3afb71683', 16)
        this.e = bigInt('10001', 16)
    }

    a2hex(byteArray: number[]): string {
        var hexString = ''
        var nextHexByte
        for (var i = 0; i < byteArray.length; i++) {
            nextHexByte = byteArray[i].toString(16)
            if (nextHexByte.length < 2) {
                nextHexByte = '0' + nextHexByte
            }
            hexString += nextHexByte
        }
        return hexString
    }

    hex2a(hex: string): string {
        var str = ''
        for (var i = 0; i < hex.length; i += 2) {
            str += String.fromCharCode(parseInt(hex.substr(i, 2), 16))
        }
        return str
    }

    pkcs1pad2(s: string, n: number): any {
        if (n < s.length + 11) {
            return null
        }
        var ba: number[] = []
        var i = s.length - 1
        while (i >= 0 && n > 0) {
            ba[--n] = s.charCodeAt(i--)
        }
        ba[--n] = 0
        while (n > 2) {
            ba[--n] = 0xff
        }
        ba[--n] = 2
        ba[--n] = 0
        var c = this.a2hex(ba)
        return bigInt(c, 16)
    }

    pkcs1unpad2(a: any): string {
        var b = a.toString(16)
        if (b.length % 2 !== 0) {
            b = '0' + b
        }
        var c = this.hex2a(b)
        var i = 1
        while (c.charCodeAt(i) !== 0) {
            i++
        }
        return c.slice(i + 1)
    }

    encrypt(text: string): string {
        var m = this.pkcs1pad2(text, 0x80)
        var c = m.modPow(this.e, this.n)
        var h = c.toString(16)
        while (h.length < 0x80 * 2) {
            h = '0' + h
        }
        return h
    }

    decrypt(text: string): string {
        var ba: number[] = []
        var i = 0
        while (i < text.length) {
            ba[i] = text.charCodeAt(i)
            i += 1
        }
        var a = bigInt(this.a2hex(ba), 16)
        var c = a.modPow(this.e, this.n)
        var d = this.pkcs1unpad2(c)
        return d
    }
}