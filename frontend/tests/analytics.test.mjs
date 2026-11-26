import { test } from 'node:test'
import assert from 'node:assert/strict'
import { summarize } from '../src/lib/analytics.ts'
test('empty CRM has finite zero values', () => {
  const m = summarize([], [], [], [], 'USD')
  assert.equal(m.score, 0)
  assert.equal(m.paid, 0)
  assert.equal(m.forecast, 0)
})
test('paid revenue, outstanding, currencies, cancellation and decimal precision', () => {
  const m = summarize(
    [],
    [{ id: '1', status: 'CANCELLED' }],
    [],
    [
      { id: '1', status: 'PAID', currency: 'USD', amount: '0.10' },
      { id: '2', status: 'PAID', currency: 'USD', amount: '0.20' },
      { id: '3', status: 'SENT', currency: 'USD', amount: '15' },
      { id: '4', status: 'CANCELLED', currency: 'USD', amount: '900' },
      { id: '5', status: 'PAID', currency: 'EUR', amount: '1000' },
      { id: '6', status: 'DRAFT', currency: 'USD', amount: '500' },
    ],
    'USD',
  )
  assert.equal(m.paid, 0.3)
  assert.equal(m.outstanding, 15)
  assert.equal(m.score, 0)
})
test('period revenue uses payment time rather than creation time', () => {
  const m = summarize(
    [],
    [],
    [],
    [
      {
        id: '1',
        status: 'PAID',
        currency: 'USD',
        amount: 25,
        createdAt: '2020-01-01',
        paidAt: '2026-11-23T00:00:00Z',
      },
    ],
    'USD',
    '2026-11-01',
  )
  assert.equal(m.paid, 25)
})
