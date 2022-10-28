import {
  strip,
  strTimeToSeconds,
  replaceIntervals,
  replaceStrokes,
  replaceDurations,
  evalStr,
  isTimeStroke,
  secondsToStroke,
  secondsToDuration,
  secondsToOutput,
  replaceParentheses,
  handleInput,
} from './timecalculator'

describe('strip', () => {
  test('should remove all whitespace from str', () => {
    expect(strip('  1h +   2h  ')).toBe('1h+2h')
  })
})

describe('handleInput', () => {
  test('testing >', () => {
    expect(handleInput('08:00 > 09:30')).toBe('1 hour 30 minutes')
  })

  test('testing +', () => {
    expect(handleInput('08:00 + 1h30m')).toBe('09:30')
  })

  test('testing -', () => {
    expect(handleInput('1h - 2h10m')).toBe('-1 hour 10 minutes')
  })

  test('testing - and seconds', () => {
    expect(handleInput('08:00 - 30m10s')).toBe('07:29:50')
  })

  test('should wrap around 24h', () => {
    expect(handleInput('23:00 + 2h')).toBe('01:00')
  })
})

describe('strTimeToSeconds', () => {
  test('should work properly', () => {
    expect(strTimeToSeconds(1, '1', '10')).toBe(3670)
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
    expect(handleInput('1h + 1h30m')).toBe('2 hours 30 minutes')
  })
  test('more complex', () => {
    expect(handleInput('00:00 > 01:00 + 1h30m')).toBe('2 hours 30 minutes')
  })
})

describe('evalStr', () => {
  test('should evaluate mathematical expression', () => {
    expect(evalStr(strip('3 + 5 - (7 - 11)'))).toBe(12)
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
    expect(handleInput(strip('00:00 > 01:00 + 1h'))).toBe('2 hours')
  })
  test('front match', () => {
    expect(isTimeStroke(strip('1h + 08:00'))).toBe(true)
  })
  test('back match', () => {
    expect(isTimeStroke(strip('08:00 + 1h30m'))).toBe(true)
  })
})

describe('secondsToStroke', () => {
  test('HH:MM', () => {
    expect(secondsToStroke(3660)).toBe('01:01')
  })
  test('HH:MM:SS', () => {
    expect(secondsToStroke(3670)).toBe('01:01:10')
  })
  test('negative seconds should be treated as positive', () => {
    expect(secondsToStroke(-3670)).toBe('01:01:10')
  })
})

describe('secondsToDuration', () => {
  test('should return the proper hms', () => {
    expect(secondsToDuration(3620)).toBe('1h20s')
  })
  test('negative seconds', () => {
    expect(secondsToDuration(-3670)).toBe('-1h1m10s')
  })
})

describe('secondsToOutput', () => {
  test('should return the proper output', () => {
    expect(secondsToOutput(3600)).toBe('1 hour')
  })
  test('negative seconds', () => {
    expect(secondsToOutput(-70)).toBe('-1 minute 10 seconds')
  })
})

describe('replaceParentheses', () => {
  test('simple', () => {
    expect(replaceParentheses(strip('(1h + 01:00) > (02:00 + 2h30s)'))).toBe('02:00>04:00:30')
  })
})

describe('the priority of operators', () => {
  test('priority without parentheses', () => {
    expect(handleInput('01:00 > 02:00 + 02:00 > 03:00')).toBe('2 hours')
  })
  test('priority with parentheses', () => {
    expect(handleInput('(1h + 01:00) > (02:00 + 2h)')).toBe('2 hours')
  })
  test('nested parentheses', () => {
    expect(handleInput('(00:00+ (01:00>02:00)) > (04:00+ (1h-2h30m))')).toBe(
      '1 hour 30 minutes'
    )
  })
})
