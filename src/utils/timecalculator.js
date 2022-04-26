const operations = new Map([
  ['+', (op1, op2) => op1 + op2],
  ['-', (op1, op2) => op1 - op2],
  ['>', (op1, op2) => op2 - op1],
])

/**
 * Converts time strokes (from midnight) to seconds.
 * '01:30:40' ---> '5440'
 */
export const timeStrokesToSeconds = (str) => {
  const re = /(\d{2}):(\d{2}):?(\d{2})?/g

  const matches = str.matchAll(re)
  for (const [match, hours, minutes, seconds = 0] of matches) {
    str = str.replace(match, Number(hours) * 3600 + Number(minutes) * 60 + Number(seconds))
  }
  return str
}

/**
 * Converts explicit time durations to seconds.
 * '1h30m20s' ---> '5420'
 */
export const timeDurationsToSeconds = (str) => {
  const rx = /(\d+h)?(\d+m)?(\d+s)?/g
  const matches = str.matchAll(rx)

  for (const [match, hours = 0, minutes = 0, seconds = 0] of matches) {
    if (match === '') continue

    str = str.replace(
      match,
      parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseInt(seconds)
    )
  }
  return str
}

// '01:00>02:00' --> '3600'
export const replaceIntervals = (str) => {
  const reStroke = '(\\d{2}:\\d{2}(?::\\d{2})?)'
  const reInterval = `${reStroke}\\>${reStroke}`

  const matches = str.matchAll(reInterval)
  for (const [match, stroke1, stroke2] of matches) {
    const t1 = timeStrokesToSeconds(stroke1)
    const t2 = timeStrokesToSeconds(stroke2)
    str = str.replace(match, Number(t2) - Number(t1))
  }
  return str
}

// '3600+3600' --> 7200
// /[hms\d\+\-\>\:\(\)]/g
export const evalStr = (str) => Function(`'use strict'; return (${str})`)()

/**
 * Get the number of hours, minutes and seconds
 * from the total seconds.
 */
const secondsToTime = (seconds) => {
  const time = seconds
  let rem = time

  const times = {
    hour: Math.floor(rem / (60 * 60)) % 24,
    minute: Math.floor(time / 60) % 60,
    second: time % 60,
  }
  return times
}

/**
 * Check whether time stroke or elapsed time is calculated.
 * Is a time stroke if any time duration is added/subtracted to any time stroke.
 * Regex matches e.g '18:30+1h' but not e.g '1h-30m' or '12:00>13:00'.
 */
export const isTimeStroke = (str) => {
  const reBase = '(\\d{2}):(\\d{2}):?(\\d{2})?'
  const reFront = new RegExp(`\\d+[hms][+-]${reBase}`)
  const reBack = new RegExp(`${reBase}[+-]\\d+[hms]`)
  return reFront.test(str) || reBack.test(str)
}

/* Remove all whitespace from string */
export const strip = (str) => str.replace(/\s+/g, '')

/**
 * Main function which takes the user input.
 */
export const evalExpr = (input) => {
  const trimInput = strip(input)

  const parsedInput = replaceIntervals(trimInput)
  let str = timeStrokesToSeconds(parsedInput)
  str = timeDurationsToSeconds(str)
  try {
    str = evalStr(str)
  } catch (error) {
    str = 0
  }

  const seconds = str
  const times = secondsToTime(seconds)

  if (isTimeStroke(parsedInput)) {
    const [h, m, s] = Object.values(times).map((t) => (t < 10 ? `0${t}` : t))
    return `${h}:${m}` + (s === '00' ? '' : `:${s}`)
  } else {
    const [h, m, s] = Object.entries(times).map(([unit, val]) =>
      val === 0 ? '' : `${val} ${unit}${val === 1 ? '' : 's'}`
    )
    const result = [h, m, s].filter((str) => str !== '').join(' ')
    return result === '' ? '0 hours 0 minutes 0 seconds' : result
  }
}
