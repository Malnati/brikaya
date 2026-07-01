// src/assets/manifestIcons.test.ts
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { inflateSync } from 'node:zlib';

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const PNG_HEADER_SIZE = 8;
const CHUNK_CRC_SIZE = 4;
const CHUNK_TYPE_START_OFFSET = 4;
const CHUNK_DATA_START_OFFSET = 8;
const CHUNK_SIZE_FIELD_BYTES = 4;
const IHDR_CHUNK_TYPE = 'IHDR';
const IDAT_CHUNK_TYPE = 'IDAT';
const IEND_CHUNK_TYPE = 'IEND';
const ICONS = [
  { path: 'public/icons/icon-192.png', width: 192, height: 192 },
  { path: 'public/icons/icon-512.png', width: 512, height: 512 },
];

function parsePng(buffer: Buffer) {
  let offset = PNG_HEADER_SIZE;
  const chunks: Array<{ type: string; data: Buffer }> = [];

  expect(buffer.subarray(0, PNG_HEADER_SIZE)).toEqual(PNG_SIGNATURE);

  while (offset < buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer
      .subarray(offset + CHUNK_TYPE_START_OFFSET, offset + CHUNK_DATA_START_OFFSET)
      .toString('ascii');
    const dataStart = offset + CHUNK_DATA_START_OFFSET;
    const dataEnd = dataStart + length;
    chunks.push({ type, data: buffer.subarray(dataStart, dataEnd) });
    offset = dataEnd + CHUNK_CRC_SIZE;
  }

  return chunks;
}

describe('manifest icons', () => {
  it.each(ICONS)('mantém $path como PNG válido de $width x $height', ({ path, width, height }) => {
    const buffer = readFileSync(resolve(process.cwd(), path));
    const chunks = parsePng(buffer);
    const ihdr = chunks.find(chunk => chunk.type === IHDR_CHUNK_TYPE);
    const idat = Buffer.concat(chunks.filter(chunk => chunk.type === IDAT_CHUNK_TYPE).map(chunk => chunk.data));

    expect(ihdr).toBeDefined();
    expect(chunks.at(-1)?.type).toBe(IEND_CHUNK_TYPE);
    expect(ihdr?.data.readUInt32BE(0)).toBe(width);
    expect(ihdr?.data.readUInt32BE(CHUNK_SIZE_FIELD_BYTES)).toBe(height);
    expect(() => inflateSync(idat)).not.toThrow();
  });
});
