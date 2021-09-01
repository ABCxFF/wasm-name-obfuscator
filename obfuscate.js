class DataBranch {
  constructor(bufferResolvable, offset = 0) {
    this.buffer = new Uint8Array(bufferResolvable);
    this.pos = offset;
  }
  inBuffer() {
    return this.pos < this.buffer.byteLength;
  }
  byte() {
    return this.buffer[this.pos++]
  }
  vu32() {
    let val = this.buffer[this.pos] & 0x7F;

    if ((this.buffer[this.pos++] & 0x80) === 0) return val;
    val |= (this.buffer[this.pos] & 0x7F) << 7;

    if ((this.buffer[this.pos++] & 0x80) === 0) return val;
    val |= (this.buffer[this.pos] & 0x7F) << 14;

    if ((this.buffer[this.pos++] & 0x80) === 0) return val;

    return val | (this.buffer[this.pos++] & 0x7F) << 21;
  }
  byteArray(size = this.vu32()) {
    return this.buffer.subarray(this.pos, this.pos += size);
  }
  delete(offset, deletionCount) {
    const buffer = Array.from(this.buffer)
    buffer.splice(offset, deletionCount);
    this.buffer = new Uint8Array(buffer);
  }
}

const Encoder = new TextEncoder();
const Decoder = new TextDecoder();

const VarUint32ToArray = (num) => {
  const out = [];

  do {
    let byte = num;

    num >>>= 7;
    if (num !== 0) byte |= 0x80;

    out.push(byte);
  } while (num !== 0);

  return out;
}

const StringToArray = (str) => {
  const bytes = Encoder.encode(str);
  return [...VarUint32ToArray(bytes.length), ...bytes];
}

const generateHexName = () => (Math.random() * 0xFFFFFFFF >>> 0).toString(16).padStart(8, "0") + (Math.random() * 0xFFFFFFFF >>> 0).toString(16).padStart(8, "0");
const generateAlternatingName = () => {
  const type = Math.random() < .5 ? 1 : 0;
  let out = "";

  let i = 32;
  while (i-- > 0) {
    const rand = Math.random();

    if (type === 0) out += rand < .25 ? "u" : rand < .5 ? "ú" : rand < .75 ? "ü" : "û";
    else out += rand < .25 ? "ø" : rand < .5 ? "ó" : rand < .75 ? "ö" : "ô";
  }

  return out;
}
const generateAlphanumeralName = () => Math.floor(Math.random() * 2821109907456).toString(36).padStart(8, "0") + Math.floor(Math.random() * 2821109907456).toString(36).padStart(8, "0") + Math.floor(Math.random() * 2821109907456).toString(36).padStart(8, "0");

/**
  @param {Buffer|Uint8Array} wasm WASM input file
  @param {"hex" | "alternating" | "alphanumeral" | function} nameStyle Type of naming conventions for the obfuscation, can be a function too
  @result {Uint8Array} Visually obfuscated WASM output file
*/
function obfuscate(wasm, nameStyle = "hex") {
  wasm = new Uint8Array(wasm);

  const paramSignatures = []
  const functionParams = [];
  const functionLocals = [];

  if (new Uint32Array(wasm.slice(0, 4).buffer)[0] !== 0x6D736100) throw new SyntaxError("Invalid WASM File");

  const branch = new DataBranch(wasm, 8);

  while (branch.inBuffer()) {
    const startPos = branch.pos;

    const id = branch.byte();
    const size = branch.vu32();

    const endPos = branch.pos + size;
    switch (id) {
      case 0: {
        const name = Decoder.decode(branch.byteArray());
        if (name === "name") {
          branch.delete(startPos, endPos - startPos);

          return obfuscate(branch.buffer)
        }

        branch.pos = endPos;
        break;
      }
      case 1: {
        const len = paramSignatures.length = branch.vu32();

        for (let index = 0; index < len; ++index) {
          paramSignatures[index] = Array.from({
            length: branch.vu32()
          }).map(() => branch.byte());

          branch.pos += branch.vu32();
        }
        break;
      }
      case 2: {
        let len = branch.vu32();
        while (len-- > 0) {
          branch.pos += branch.vu32();
          branch.pos += branch.vu32();

          switch (branch.byte()) {
            case 0:
              branch.vu32();
              functionParams.push(0);
              functionLocals.push(0);
              break;
            case 1:
            case 2:
              branch.pos += 1
              if (branch.vu32() & 1) branch.vu32();
              branch.vu32()
              break;
            case 3:
              branch.pos += 1
              branch.vu32()
              break;
          }
        }
        break;
      }
      case 3: {
        let len = branch.vu32();
        while (len-- > 0) {
          functionParams.push(paramSignatures[branch.vu32()].length);
        }
        break;
      }
      case 10: {
        const len = branch.vu32();

        for (let index = 0; index < len; ++index) {
          const endPos = branch.vu32() + branch.pos;
          let locals = 0;

          let i = branch.vu32();
          while (i-- > 0) {
            locals += branch.vu32();
            branch.pos += 1;
          }

          functionLocals.push(locals);
          branch.pos = endPos;
        }
        break;
      }
    }

    branch.pos = endPos;
  }

  const generateName = typeof nameStyle === "function" ? nameStyle : nameStyle === "hex" ? generateHexName : nameStyle === "alphanumeral" ? generateAlphanumeralName : generateAlternatingName;

  const functionSection = [];

  functionSection.push(...VarUint32ToArray(functionParams.length));
  for (let i = 0; i < functionParams.length; ++i) {
    functionSection.push(...VarUint32ToArray(i), ...StringToArray(generateName()));
  }

  functionSection.unshift(0x01, ...VarUint32ToArray(functionSection.length));


  const localSection = [];
  localSection.push(...VarUint32ToArray(functionLocals.reduce((a, cnt, i) => a + (((cnt + functionParams[i]) === 0) ? 0 : 1), 0)));
  for (let index = 0; index < functionLocals.length; ++index) {
    const count = functionLocals[index] + functionParams[index];

    if (count === 0) continue;

    localSection.push(...VarUint32ToArray(index), ...VarUint32ToArray(count));

    for (let i = 0; i < count; ++i) localSection.push(...VarUint32ToArray(i), ...StringToArray(generateName()));
  }
  localSection.unshift(0x02, ...VarUint32ToArray(localSection.length));


  const nameSection = [...StringToArray("name"), ...functionSection, ...localSection];
  nameSection.unshift(0x00, ...VarUint32ToArray(nameSection.length));

  return new Uint8Array([...wasm, ...nameSection]);
}

module.exports = obfuscate;
