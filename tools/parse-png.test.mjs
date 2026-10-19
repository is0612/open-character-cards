import test from 'node:test'
import assert from 'node:assert/strict'
import { readPngTextChunks } from './parse-png.mjs'

const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])

function chunk(type, data = Buffer.alloc(0)) {
  const header = Buffer.alloc(8)
  header.writeUInt32BE(data.length, 0)
  header.write(type, 4, 4, 'ascii')
  return Buffer.concat([header, data, Buffer.alloc(4)])
}

function png(...chunks) {
  return Buffer.concat([signature, ...chunks])
}

test('reads PNG tEXt metadata', () => {
  const text = Buffer.from('chara\0eyJuYW1lIjoiVGVzdCJ9', 'latin1')
  assert.equal(readPngTextChunks(png(chunk('tEXt', text), chunk('IEND'))).chara, 'eyJuYW1lIjoiVGVzdCJ9')
})

test('rejects a file with an invalid PNG signature', () => {
  assert.throws(() => readPngTextChunks(Buffer.from('not a png')), /不是有效的 PNG/)
})

test('rejects a chunk whose declared length exceeds the file boundary', () => {
  const header = Buffer.alloc(8)
  header.writeUInt32BE(1024, 0)
  header.write('tEXt', 4, 4, 'ascii')
  assert.throws(() => readPngTextChunks(Buffer.concat([signature, header])), /超出文件范围/)
})

test('rejects PNG files without an IEND chunk', () => {
  assert.throws(() => readPngTextChunks(png(chunk('tEXt', Buffer.from('key\0value')))), /缺少 IEND/)
})
