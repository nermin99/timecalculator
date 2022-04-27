// Matches time strokes on the form HH:MM and HH:MM:SS
const reStroke = '\\d{2}:\\d{2}(?::\\d{2})?'

/* Remove all whitespace from string */
export const strip = (str) => str.replace(/\s+/g, '')

/**
 * Get total number of seconds from hours, minutes, and seconds.
 * ('1', '1', 0) --> 3660
 */
export const strTimeToSeconds = (hours, minutes, seconds) => {
  return Number(hours) * 3600 + Number(minutes) * 60 + Number(seconds)
}

/**
 * Get the number of hours, minutes and seconds from the total seconds.
 * 3670 --> { h: 1, m: 1, s: 10 }
 */
export const secondsToDuration = (seconds = 0) => ({
  h: Math.floor(seconds / 3600) % 24,
  m: Math.floor(seconds / 60) % 60,
  s: seconds % 60,
})

/**
 * Converts total seconds (from midnight) to time stroke on the form
 * HH:MM or HH:MM:SS.
 * 3660 --> '01:01'
 */
export const secondsToStroke = (seconds) => {
  const hhmmss = new Date(seconds * 1000).toISOString().slice(11, 19)
  const hhmm = hhmmss.slice(0, -3)
  return hhmmss.slice(-2) === '00' ? hhmm : hhmmss
}

/**
 * Replaces time intervals with the time duration in seconds.
 * '01:00>02:00' --> '3600'
 */
export const intervalsToStrSeconds = (str) => {
  const reInterval = `(${reStroke})\\>(${reStroke})`

  const matches = str.matchAll(reInterval)
  for (const [match, stroke1, stroke2] of matches) {
    const t1 = strokesToStrSeconds(stroke1)
    const t2 = strokesToStrSeconds(stroke2)
    str = str.replace(match, Number(t2) - Number(t1))
  }
  return str
}

/**
 * Converts time strokes (from midnight) to seconds.
 * '01:30' --> '5400'
 */
export const strokesToStrSeconds = (str) => {
  const re = /(\d{2}):(\d{2}):?(\d{2})?/g

  const matches = str.matchAll(re)
  for (const [match, hours, minutes, seconds = 0] of matches) {
    str = str.replace(match, strTimeToSeconds(hours, minutes, seconds))
  }
  return str
}

/**
 * Converts explicit time durations to seconds.
 * '1h30m20s' --> '5420'
 */
export const durationToStrSeconds = (str) => {
  // https://stackoverflow.com/questions/72016685/matching-hour-minute-second-hms-duration-string
  const re = /\b(?=\w)(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?\b(?!\w)/g

  const matches = str.matchAll(re)
  for (const [match, hours = 0, minutes = 0, seconds = 0] of matches) {
    str = str.replace(match, strTimeToSeconds(hours, minutes, seconds))
  }
  return str
}

/**
 * Check whether time stroke or elapsed time is calculated.
 * Is a time stroke if any time duration is added/subtracted to any time stroke.
 * Regex matches e.g '18:30+1h' but not e.g '1h-30m' or '12:00>13:00'.
 */
export const isTimeStroke = (str) => {
  const reFront = new RegExp(`\\d+[hms][+-]${reStroke}`)
  const reBack = new RegExp(`${reStroke}[+-]\\d+[hms]`)
  return reFront.test(str) || reBack.test(str)
}

// '3600+3600' --> 7200
// /[hms\d\+\-\>\:\(\)]/g
export const evalStr = (str) => Function(`'use strict'; return (${str})`)()

/* export const evaluate = (str) => {
  const strippedInput = strip(str)
  const parsedInput = intervalsToStrSeconds(strippedInput)
  str = strokesToStrSeconds(parsedInput)
  str = durationToStrSeconds(str)
}

const evaluateParentheses = (input) => {
  const re = /\([^(]*?\)/g

  const match = input.match(re)?.[0]
  if (!match) return input

  const res = evaluate(durationToStrSeconds(strokesToStrSeconds(match)))
  return evaluateParentheses(input.replace(match, res))
} */

/**
 * Convert time duration to string on format hms.
 * { h: 1, m: 0, s: 20 } --> '1h20s'
 */
export const durationToHMS = (durationObj) => {
  const res = Object.entries(durationObj)
    .filter(([, val]) => val !== 0)
    .reduce((acc, [unit, val]) => `${acc}${val}${unit}`, '')
  return res
}

/**
 * Convert time duration to representable output string.
 * { h: 1, m: 0, s: 20 } --> '1 hour 20 seconds'
 */
export const durationToOutput = (durationObj) => {
  const units = {
    h: 'hour',
    m: 'minute',
    s: 'second',
  }
  const str = Object.entries(durationObj)
    .filter(([, val]) => val !== 0)
    .reduce((acc, [unit, val]) => `${acc} ${val} ${units[unit]}${val === 1 ? '' : 's'}`, '')
    .trim()
  return str === '' ? '0 hours 0 minutes 0 seconds' : str
}

/**
 * Main function which takes the user input.
 */
export const evalExpr = (input) => {
  const strippedInput = strip(input)
  // console.log(strippedInput)
  const parsedInput = intervalsToStrSeconds(strippedInput)
  // console.log('intervalsToStrSeconds', parsedInput)
  let str = strokesToStrSeconds(parsedInput)
  // console.log('strokesToStrSeconds', str)
  str = durationToStrSeconds(str)
  // console.log('durationToStrSeconds', str)
  let seconds
  try {
    seconds = evalStr(str)
    // console.log('evalStr', str)
  } catch (error) {
    // console.error(error)
    seconds = 0
  }

  if (isTimeStroke(parsedInput)) {
    return secondsToStroke(seconds)
  } else {
    return durationToOutput(secondsToDuration(seconds))
  }
}
