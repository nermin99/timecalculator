import {
  evalExpr,
  timeStrokesToSeconds,
  timeDurationsToSeconds,
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
  // test('no match complex', () => {
  //   expect(isTimeStroke('1h + 00:00 > 01:00')).toBe(false) // FIXME: Received: true
  // })
  test('front match', () => {
    expect(isTimeStroke('1h + 08:00')).toBe(true)
  })
  test('back match', () => {
    expect(isTimeStroke('08:00 + 1h30m')).toBe(true)
  })
})

describe('timeStrokesToSeconds', () => {
  test('simple', () => {
    expect(timeStrokesToSeconds('01:30:40')).toBe('5440')
  })
})

describe('timeDurationsToSeconds', () => {
  test('simple', () => {
    expect(timeDurationsToSeconds('1h30m20s')).toBe('5420')
  })
  test('simple addition', () => {
    expect(evalExpr('1h + 1h30m')).toBe('2 hours 30 minutes')
  })
  // test('more complex', () => {
  //   expect(evalExpr('1h30m + 00:00 > 01:30 - (3h - 2h)')).toBe(
  //     '2 hours 30 seconds'
  //   )
  // })
})

// test('should work with all possible characters', () => {
//   expect(evalExpr('1h30m20s + 00:00 > 01:00:30 - (1h-2h40s)')).toBe('idk')
// })
