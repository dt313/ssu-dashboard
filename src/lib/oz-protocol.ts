// lib/oz-protocol.ts

class WritablePacketStream {
    private buffer: Buffer;
    private offset = 0;

    constructor(size: number) {
        this.buffer = Buffer.alloc(size);
    }

    writeUInt8(v: number) {
        this.buffer.writeUInt8(v, this.offset++);
    }

    writeUInt16(v: number) {
        this.buffer.writeUInt16BE(v, this.offset);
        this.offset += 2;
    }

    writeUInt32(v: number) {
        this.buffer.writeUInt32BE(v, this.offset);
        this.offset += 4;
    }

    // Dart writeString: length as UInt32 + each char as 2 bytes UTF-16 BE
    writeString(v: string) {
        this.writeUInt32(v.length);
        for (let i = 0; i < v.length; i++) {
            const code = v.charCodeAt(i);
            this.writeUInt8(code >> 8);
            this.writeUInt8(code & 0xff);
        }
    }

    writeBoolean(v: boolean) {
        this.writeUInt8(v ? 0xff : 0x00);
    }

    toBuffer(): Buffer {
        return this.buffer.subarray(0, this.offset);
    }
}

class ReadablePacketStream {
    private buf: Buffer;
    private _offset = 0;

    constructor(buf: Buffer) {
        this.buf = buf;
    }

    get offset() {
        return this._offset;
    }

    readUInt8() {
        return this.buf.readUInt8(this._offset++);
    }
    readUInt16() {
        const v = this.buf.readUInt16BE(this._offset);
        this._offset += 2;
        return v;
    }
    readUInt32() {
        const v = this.buf.readUInt32BE(this._offset);
        this._offset += 4;
        return v;
    }
    readInt32() {
        const v = this.buf.readInt32BE(this._offset);
        this._offset += 4;
        return v;
    }

    readString(): string {
        const len = this.readUInt32();
        let s = '';
        for (let i = 0; i < len; i++) {
            const code = (this.readUInt8() << 8) + this.readUInt8();
            if (code > 0) s += String.fromCharCode(code);
        }
        return s;
    }

    readUTF(): string {
        let len = this.readUInt16();
        if (len === 0xffff) len = this.readUInt32();
        const bytes = this.buf.subarray(this._offset, this._offset + len);
        this._offset += len;
        return bytes.toString('utf8');
    }

    readBoolean(): boolean {
        return this.readUInt8() === 0xff;
    }
}

export function ozEncode(path: string, args: Record<string, string>): Buffer {
    const data = new WritablePacketStream(9545);

    data.writeUInt32(10001);
    data.writeString('oz.framework.cp.message.FrameworkRequestDataModule');

    const headers: Record<string, string> = {
        un: 'guest',
        p: 'guest',
        s: Math.floor(Date.now() / 1000).toString(),
        cv: '20140527',
        t: '',
        i: '',
        o: '',
        z: '',
        j: '',
        d: '-1',
        r: '1',
        rv: '268435456',
        xi: '',
        xm: '',
        xh: '',
        pi: '',
    };

    const hEntries = Object.entries(headers);
    data.writeUInt32(hEntries.length);
    for (const [k, v] of hEntries) {
        data.writeString(k);
        data.writeString(v);
    }

    data.writeUInt32(380);
    data.writeString(path);
    data.writeUInt32(10000);
    data.writeString('/CM');
    data.writeBoolean(false);
    data.writeBoolean(false);
    data.writeString('');

    const aEntries = Object.entries(args);
    data.writeUInt32(aEntries.length);
    for (const [k, v] of aEntries) {
        data.writeString(k);
        data.writeString(v);
    }

    data.writeUInt32(2);
    data.writeUInt32(32);
    data.writeUInt32(17);
    data.writeUInt32(0);
    data.writeUInt32(0);

    return data.toBuffer();
}

export function ozDecode(raw: Buffer): Record<string, Array<Array<Record<string, string>>>> {
    const r = new ReadablePacketStream(raw);

    if (r.readUInt32() !== 10001) throw new Error('Invalid OZ version');
    r.readString(); // packet type

    const hCount = r.readUInt32();
    for (let i = 0; i < hCount; i++) {
        r.readString();
        r.readString();
    }

    if (r.readUInt32() !== 380) throw new Error('Invalid type');
    if (r.readBoolean()) throw new Error('Compressed not supported');

    r.readUInt32();
    if (r.readUInt32() !== 17) throw new Error('Invalid unknown value');

    r.readUTF();
    r.readUInt32();
    r.readUTF();
    r.readUInt32();

    const dataCount = r.readInt32();
    const headers: any[] = [];

    for (let i = 0; i < dataCount; i++) {
        const a = r.readUTF(),
            b = r.readUTF(),
            c = r.readUTF();

        const data1: any[] = [];
        const d1 = r.readInt32();
        for (let j = 0; j < d1; j++) {
            const e = r.readInt32(),
                f = r.readInt32(),
                g = r.readUTF(),
                h = r.readBoolean();
            const k = e === 2 ? r.readUTF() : '';
            data1.push([e, f, g, h, k]);
        }

        const data2: any[] = [];
        if (r.readInt32() !== 0) {
            const e = r.readInt32(),
                f = r.readInt32(),
                g = r.readUTF(),
                h = r.readBoolean();
            const k = e === 2 ? r.readUTF() : '';
            data2.push(...[e, f, g, h, k]);
        }

        const data3: any[] = [];
        const d3 = r.readInt32();
        for (let j = 0; j < d3; j++) {
            data3.push([r.readInt32(), r.readInt32(), r.readUTF()]);
        }

        headers.push([[a, b, c], data1, data2, data3]);
    }

    r.readInt32(); // 4747 separator

    for (let i = 0; i < headers.length; i++) {
        const offsets: any[] = [];
        for (let j = 0; j < headers[i][3].length; j++) {
            const cur: any[] = [];
            for (let k = 0; k < headers[i][3][j][1]; k++) {
                cur.push([r.readInt32(), r.readInt32()]);
            }
            offsets.push(cur);
        }
        headers[i].push(offsets);
    }

    const body = new ReadablePacketStream(raw.subarray(r.offset));
    const parsed: Record<string, Array<Array<Record<string, string>>>> = {};

    for (const header of headers) {
        const results: Array<Array<Record<string, string>>> = [];

        for (let i = 0; i < (header[3] as any[]).length; i++) {
            const result: Array<Record<string, string>> = [];

            for (let j = 0; j < (header[3][i][1] as number); j++) {
                const current: Record<string, string> = {};

                for (const def of header[1] as any[]) {
                    const dtype: number = def[1];
                    const dname: string = def[2];
                    let value: string;

                    if (dtype === 12 || dtype === 1) {
                        body.readUInt8();
                        value = body.readUTF();
                    } else if (dtype === 91 || dtype === 92) {
                        let big = BigInt(0);
                        for (let x = 0; x < 2; x++) big = (big << BigInt(32)) + BigInt(body.readUInt32());
                        value = big.toString();
                    } else if (dtype === 3) {
                        value = String(parseFloat(body.readUTF()));
                    } else if (dtype === 2) {
                        value = body.readUTF();
                    } else if (dtype === 4) {
                        body.readUInt8();
                        value = body.readUInt32().toString();
                    } else {
                        throw new Error(`Unknown dtype: ${dtype}`);
                    }

                    current[dname] = value;
                }
                result.push(current);
            }
            results.push(result);
        }

        parsed[header[0][0]] = results;
    }

    return parsed;
}
