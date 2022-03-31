import evalExpr from './timecalculator'

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

// TODO: returns '0 hours 0 minutes 0 seconds' atm
// test('should test > priority', () => {
//   expect(evalExpr('08:00 > 09:00 + 10:00 > 11:00')).toBe('2 hours')
// })
