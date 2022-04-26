import {
  trim,
  evalExpr,
  timeStrokesToSeconds,
  timeDurationsToSeconds,
  replaceIntervals,
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

describe('replaceIntervals', () => {
  test('replacing intervals properly', () => {
    expect(replaceIntervals('01:00>02:00')).toBe('3600')
  })
  test('interval complex', () => {
    expect(replaceIntervals(trim('00:00 > 01:00 + 02:00 > 03:00'))).toBe('3600+3600')
  })
})

test('should evaluate string of mathematical expressions', () => {
  expect(evalStr('3 + 5 - 7')).toBe(1)
})

describe('isTimeStroke', () => {
  test('no match only duration', () => {
    expect(isTimeStroke(trim('1h - 30m'))).toBe(false)
  })
  test('no match', () => {
    expect(isTimeStroke(trim('00:00 > 01:00 + 02:00 > 03:00'))).toBe(false)
  })
  test('no match complex', () => {
    expect(evalExpr(trim('00:00 > 01:00 + 1h'))).toBe('2 hours')
  })
  test('front match', () => {
    expect(isTimeStroke(trim('1h + 08:00'))).toBe(true)
  })
  test('back match', () => {
    expect(isTimeStroke(trim('08:00 + 1h30m'))).toBe(true)
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
  test('more complex', () => {
    expect(evalExpr('00:00 > 01:00 + 1h30m')).toBe('2 hours 30 minutes')
  })
})

test('should work with all possible characters', () => {
  expect(evalExpr('1h30m20s + 01:00 > 02:30:40 - (1h30m-2h)')).toBe('3 hours 31 minutes')
})
