import {
  strip,
  strTimeToSeconds,
  secondsToDuration,
  secondsToStroke,
  evalExpr,
  replaceStrokes,
  replaceDurations,
  replaceIntervals,
  evalStr,
  isTimeStroke,
  durationToHMS,
  durationToOutput,
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

describe('strip', () => {
  test('should remove all whitespace from str', () => {
    expect(strip(' 1h + 2h ')).toBe('1h+2h')
  })
})

test('should work with all possible characters', () => {
  expect(evalExpr('1h30m20s + 01:00 > 02:30:40 - (1h30m-2h)')).toBe('3 hours 31 minutes')
})

describe('strTimeToSeconds', () => {
  test('should work properly', () => {
    expect(strTimeToSeconds(1, '1', '10')).toBe(3670)
  })
})

describe('secondsToDuration', () => {
  test('should return the proper time', () => {
    expect(secondsToDuration(3670)).toEqual({ h: 1, m: 1, s: 10 })
  })
})

describe('secondsToStroke', () => {
  test('HH:MM', () => {
    expect(secondsToStroke(3660)).toBe('01:01')
  })
  test('HH:MM:SS', () => {
    expect(secondsToStroke(3670)).toBe('01:01:10')
  })
})

describe('replaceIntervals', () => {
  test('replacing intervals properly', () => {
    expect(replaceIntervals(strip('01:00 > 02:00'))).toBe('3600')
  })
  test('interval complex', () => {
    expect(replaceIntervals(strip('00:00 > 01:00 + 01:00 > 03:00'))).toBe('3600+7200')
  })
})

describe('replaceStrokes', () => {
  test('simple', () => {
    expect(replaceStrokes('01:00:40')).toBe('3640')
  })
})

describe('replaceDurations', () => {
  test('simple', () => {
    expect(replaceDurations('1h30m20s')).toBe('5420')
  })
  test('simple addition', () => {
    expect(evalExpr('1h + 1h30m')).toBe('2 hours 30 minutes')
  })
  test('more complex', () => {
    expect(evalExpr('00:00 > 01:00 + 1h30m')).toBe('2 hours 30 minutes')
  })
})

describe('evalStr', () => {
  test('should evaluate mathematical expression', () => {
    expect(evalStr('3 + 5 - (7 - 11)')).toBe(12)
  })
})

describe('isTimeStroke', () => {
  test('no match only duration', () => {
    expect(isTimeStroke(strip('1h - 30m'))).toBe(false)
  })
  test('no match', () => {
    expect(isTimeStroke(strip('00:00 > 01:00 + 02:00 > 03:00'))).toBe(false)
  })
  test('no match complex', () => {
    expect(evalExpr(strip('00:00 > 01:00 + 1h'))).toBe('2 hours')
  })
  test('front match', () => {
    expect(isTimeStroke(strip('1h + 08:00'))).toBe(true)
  })
  test('back match', () => {
    expect(isTimeStroke(strip('08:00 + 1h30m'))).toBe(true)
  })
})

describe('durationToHMS', () => {
  test('should be proper string', () => {
    expect(durationToHMS({ h: 1, m: 0, s: 20 })).toBe('1h20s')
  })
})

describe('durationToOutput', () => {
  test('should be proper string', () => {
    expect(durationToOutput({ h: 1, m: 0, s: 20 })).toBe('1 hour 20 seconds')
  })
})

describe('the priority of operators', () => {
  test('priority without parentheses', () => {
    expect(evalExpr('01:00 > 02:00 + 02:00 > 03:00')).toBe('2 hours')
  })
  // test('priority with parentheses', () => {
  //   expect(evalExpr('(1h + 00:00) > (01:00 + 2h)')).toBe('3 hours')
  // })
})
