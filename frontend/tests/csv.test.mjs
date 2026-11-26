import { test } from 'node:test'
import assert from 'node:assert/strict'
import { serializeCsv } from '../src/lib/csv.ts'
test('CSV contains BOM, CRLF and quotes Unicode, commas, quotes and newlines', () => {
  const result = serializeCsv([{ company: 'ООО "Компания", Минск', note: 'line1\nline2' }])
  assert.equal(result.charCodeAt(0), 0xfeff)
  assert.equal(result, '\ufeff"company","note"\r\n"ООО ""Компания"", Минск","line1\nline2"')
})
test('CSV prevents spreadsheet formulas and handles empty data', () => {
  assert.equal(serializeCsv([]), '')
  for (const value of ['=1+1', '+cmd', '-2', '@SUM(A1)', '\t=1', '\r=1']) {
    assert.ok(serializeCsv([{ value }]).endsWith('"' + "'" + value + '"'))
  }
})
