import evalExpr from './timecalculator'

test('testing >', () => {
  expect(evalExpr('08:00 > 09:30')).toBe('1 hour 30 minutes')
})

test('should wrap around 24h', () => {
  expect(evalExpr('23:00 + 2h')).toBe('01:00')
})
