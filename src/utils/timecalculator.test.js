import {
  evalExpr,
  replaceDurations,
  evalStr,
  isTimeStroke,
} from './timecalculator'

test('testing >', () => {
  expect(evalExpr('08:00 > 09:30')).toBe('1 hour 30 minutes')
})

test('testing +', () => {
  expect(evalExpr('08:00 + 1h30m')).toBe('09:30')
})

test('testing - and seconds', () => {
  expect(evalExpr('08:00 - 30m10s')).toBe('07:29:50')
})

test('should wrap around 24h', () => {
  expect(evalExpr('23:00 + 2h')).toBe('01:00')
})

test('the priority of operators', () => {
  expect(evalExpr('01:00 > 02:00 + 02:00 > 03:00')).toBe('2 hours')
})

test('replacing durations properly', () => {
  expect(replaceDurations('3600 > 7200 + 7200 > 10800')).toBe('3600 + 3600')
})

test('should evaluate string of mathematical expressions', () => {
  expect(evalStr('3 + 5 - 7')).toBe(1)
})

describe('isTimeStroke', () => {
  test('no match', () => {
    expect(isTimeStroke('00:00 > 01:00 + 02:00 > 03:00')).toBe(false)
  })
  test('front match', () => {
    expect(isTimeStroke('1h + 08:00')).toBe(true)
  })
  test('back match', () => {
    expect(isTimeStroke('08:00 + 1h30m')).toBe(true)
  })
})
