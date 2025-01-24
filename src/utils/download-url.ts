import axios from 'axios';
import md5 from 'blueimp-md5';
import bigInt from 'big-integer';
import { GM_xmlhttpRequest } from '$';

axios.defaults.withCredentials = true

interface DownloadResult {
    url: string;
    fileToken?: string;
}

interface M115EncodeResult {
    data: string;
    key: number[];
}

class MyRsa {
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

class Crypto115 {
    private rsa: MyRsa;
    private kts: number[];
    private keyS: number[];
    private keyL: number[];

    constructor() {
        this.rsa = new MyRsa();
        this.kts = [240, 229, 105, 174, 191, 220, 191, 138, 26, 69, 232, 190, 125, 166, 115, 184, 222, 143, 231, 196, 69, 218, 134, 196, 155, 100, 139, 20, 106, 180, 241, 170, 56, 1, 53, 158, 38, 105, 44, 134, 0, 107, 79, 165, 54, 52, 98, 166, 42, 150, 104, 24, 242, 74, 253, 189, 107, 151, 143, 77, 143, 137, 19, 183, 108, 142, 147, 237, 14, 13, 72, 62, 215, 47, 136, 216, 254, 254, 126, 134, 80, 149, 79, 209, 235, 131, 38, 52, 219, 102, 123, 156, 126, 157, 122, 129, 50, 234, 182, 51, 222, 58, 169, 89, 52, 102, 59, 170, 186, 129, 96, 72, 185, 213, 129, 156, 248, 108, 132, 119, 255, 84, 120, 38, 95, 190, 232, 30, 54, 159, 52, 128, 92, 69, 44, 155, 118, 213, 27, 143, 204, 195, 184, 245];
        this.keyS = [0x29, 0x23, 0x21, 0x5E];
        this.keyL = [120, 6, 173, 76, 51, 134, 93, 24, 76, 1, 63, 70];
    }

    xor115Enc(src: number[], srclen: number, key: number[], keylen: number): number[] {
        const mod4 = srclen % 4;
        const ret: number[] = [];

        for (let i = 0; i < mod4; i++) {
            ret.push(src[i] ^ key[i % keylen]);
        }

        for (let i = mod4; i < srclen; i++) {
            ret.push(src[i] ^ key[(i - mod4) % keylen]);
        }

        return ret;
    }

    getkey(length: number, key?: number[]): number[] {
        if (key) {
            const results: number[] = [];
            for (let i = 0; i < length; i++) {
                const v1 = ((key[i] + this.kts[length * i]) & 0xff);
                const v2 = this.kts[length * (length - 1 - i)];
                results.push(v1 ^ v2);
            }
            return results;
        }
        return length === 12 ? this.keyL.slice(0) : this.keyS.slice(0);
    }

    asymEncode(src: number[], srclen: number): string {
        const m = 128 - 11;
        let ret = '';
        for (let i = 0; i < Math.floor((srclen + m - 1) / m); i++) {
            ret += this.rsa.encrypt(this.bytesToString(src.slice(i * m, Math.min((i + 1) * m, srclen))));
        }
        return btoa(this.rsa.hex2a(ret));
    }

    asymDecode(src: number[], srclen: number): number[] {
        const m = 128;
        let ret = '';
        for (let i = 0; i < Math.floor((srclen + m - 1) / m); i++) {
            ret += this.rsa.decrypt(this.bytesToString(src.slice(i * m, Math.min((i + 1) * m, srclen))));
        }
        return this.stringToBytes(ret);
    }

    symEncode(src: number[], srclen: number, key1: number[], key2?: number[]): number[] {
        const k1 = this.getkey(4, key1);
        const k2 = this.getkey(12, key2);
        let ret = this.xor115Enc(src, srclen, k1, 4);
        ret.reverse();
        ret = this.xor115Enc(ret, srclen, k2, 12);
        return ret;
    }

    symDecode(src: number[], srclen: number, key1: number[], key2: number[]): number[] {
        const k1 = this.getkey(4, key1);
        const k2 = this.getkey(12, key2);
        let ret = this.xor115Enc(src, srclen, k2, 12);
        ret.reverse();
        ret = this.xor115Enc(ret, srclen, k1, 4);
        return ret;
    }

    bytesToString(buf: number[]): string {
        return buf.map(b => String.fromCharCode(b)).join('');
    }

    stringToBytes(str: string): number[] {
        return Array.from(str).map(c => c.charCodeAt(0));
    }

    m115_encode(str: string, timestamp: string): M115EncodeResult {
        const key = this.stringToBytes(md5(`!@###@#${timestamp}DFDR@#@#`));
        let temp = this.stringToBytes(str);
        temp = this.symEncode(temp, temp.length, key);
        temp = key.slice(0, 16).concat(temp);
        return {
            data: this.asymEncode(temp, temp.length),
            key
        };
    }

    m115_decode(str: string, key: number[]): string {
        let temp = this.stringToBytes(atob(str));
        temp = this.asymDecode(temp, temp.length);
        return this.bytesToString(this.symDecode(temp.slice(16), temp.length - 16, key, temp.slice(0, 16)));
    }
}

class Drive115 {
    private crypto115: Crypto115;

    constructor() {
        this.crypto115 = new Crypto115();
    }

    async getFileDownloadUrl(pickcode: string): Promise<DownloadResult> {
        try {
            const res = await this.getDownloadUrlByNormal(pickcode);
            return res;
        } catch (error) {
            console.error('获取下载链接失败:', error);
            return await this.getDownloadUrlByPro(pickcode);
        }
    }

    private getDownloadUrlByNormal(pickcode: string): Promise<DownloadResult> {
        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                method: 'GET',
                url: `https://webapi.115.com/files/download?pickcode=${pickcode}`,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                onload: (response) => {
                    if (response.status === 200) {
                        const data = JSON.parse(response.responseText);
                        console.log('普通方式获取响应:', data);

                        if (!data.state || !data.file_url) {
                            reject(new Error('服务器返回数据格式错误: ' + JSON.stringify(data)));
                            return;
                        }

                        resolve({
                            url: data.file_url,
                        });
                    } else {
                        reject(new Error(`请求失败: ${response.status}`));
                    }
                },
                onerror: (error) => {
                    reject(error);
                }
            });
        });
    }

    private getDownloadUrlByPro(pickcode: string): Promise<DownloadResult> {
        return new Promise((resolve, reject) => {
            const tm = Math.floor(Date.now() / 1000).toString();
            const src = JSON.stringify({ pickcode });
            const encoded = this.crypto115.m115_encode(src, tm);

            const data = `data=${encodeURIComponent(encoded.data)}`;
            console.log('发送加密数据:', data);

            GM_xmlhttpRequest({
                method: 'POST',
                url: `https://proapi.115.com/app/chrome/downurl?t=${tm}`,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    // 一定要带上 user-agent，否则不返回 set-cookie
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36 115Browser/27.0.6.3'
                },
                data: data,
                onload: (response) => {
                    if (response.status === 200) {
                        const data = JSON.parse(response.responseText);
                        console.log('Pro方式响应:', data);

                        if (!data.state) {
                            reject(new Error('获取下载地址失败: ' + JSON.stringify(data)));
                            return;
                        }

                        const result = JSON.parse(this.crypto115.m115_decode(data.data, encoded.key));
                        const downloadInfo = Object.values(result)[0] as { url: { url: string } };

                        // 从响应头中获取 fileToken
                        const setCookieHeader = response.responseHeaders.split('\n')
                            .find(header => header.toLowerCase().startsWith('set-cookie:'));
                        const fileToken = setCookieHeader?.split(';')[0].split(':')[1]?.trim();


                        resolve({
                            url: downloadInfo.url.url,
                            fileToken: fileToken
                        });
                    } else {
                        reject(new Error(`请求失败: ${response.status}`));
                    }
                },
                onerror: (error) => {
                    reject(error);
                }
            });
        });
    }
}

export default new Drive115();