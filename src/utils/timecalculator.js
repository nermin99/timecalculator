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
 * Convert total seconds (from midnight) to representable output string.
 * 3620 --> '1 hour 20 seconds'
 */
export const secondsToOutput = (seconds) => {
  const stroke = secondsToStroke(seconds)
  const [hour, minute, second = 0] = stroke.split(':').map(Number)

  let str = Object.entries({ hour, minute, second })
    .filter(([, val]) => val !== 0)
    .reduce((acc, [unit, val]) => `${acc} ${val} ${unit}${Math.abs(val) === 1 ? '' : 's'}`, '')
    .trim()
  if (seconds < 0) str = '-' + str
  return str === '' ? '0 hours 0 minutes 0 seconds' : str
}

/**
 * Converts total seconds (from midnight) to time duration on the form hms.
 * 3620 --> '1h20s'
 */
export const secondsToHMS = (seconds) => {
  const re = /(?<h>\d{2}):(?<m>\d{2}):?(?<s>\d{2})?/g
  const stroke = secondsToStroke(seconds)

  const match = re.exec(stroke)
  const str = Object.entries(match.groups)
    .filter(([, val]) => val && val !== '00')
    .reduce((acc, [unit, val]) => acc + Number(val) + unit, '')
  return seconds < 0 ? '-' + str : str
}

/**
 * Converts total seconds (from midnight) to time stroke on the form
 * HH:MM or HH:MM:SS.
 * 3660 --> '01:01'
 */
export const secondsToStroke = (seconds) => {
  seconds = Math.abs(Number(seconds)) // can only deal with positive numbers
  const hhmmss = new Date(seconds * 1000).toISOString().slice(11, 19)
  const hhmm = hhmmss.slice(0, -3)
  return hhmmss.slice(-2) === '00' ? hhmm : hhmmss
}

/**
 * Replaces time intervals with the time duration in seconds.
 * '01:00>02:00' --> '3600'
 */
export const replaceIntervals = (str) => {
  const reInterval = `(${reStroke})\\>(${reStroke})`

  const matches = str.matchAll(reInterval)
  for (const [match, stroke1, stroke2] of matches) {
    const t1 = replaceStrokes(stroke1)
    const t2 = replaceStrokes(stroke2)
    str = str.replace(match, Number(t2) - Number(t1))
  }
  return str
}

/**
 * Converts time strokes (from midnight) to seconds.
 * '01:30' --> '5400'
 */
export const replaceStrokes = (str) => {
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
export const replaceDurations = (str) => {
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
  const reFront = new RegExp(`\\d+[hms][+-]+${reStroke}`)
  const reBack = new RegExp(`${reStroke}[+-]+\\d+[hms]`)
  return reFront.test(str) || reBack.test(str)
}

/**
 * Evaluate mathematical expressions.
 * '3600+3600' --> 7200
 */
export const evalStr = (str) => {
  const reWhiteList = /[hms\d\+\-\>\:\(\)]/g
  if (str.length !== str.match(reWhiteList)?.length) return 0 // only allow characters from whitelist
  str = str.replaceAll('--', '- -') // don't interpret as decrement operator

  try {
    return Function(`'use strict'; return (${str})`)()
  } catch (error) {
    return 0
  }
}

export const evaluate = (str) => {
  const str1 = replaceIntervals(str)
  const str2 = replaceStrokes(str1)
  const str3 = replaceDurations(str2)
  const seconds = evalStr(str3)

  if (isTimeStroke(str1)) {
    return secondsToStroke(seconds)
  } else {
    return secondsToHMS(seconds)
  }
}

export const evaluateParentheses = (input) => {
  const re = /\([^(]*?\)/g

  const match = input.match(re)?.[0]
  if (!match) return input

  const res = evaluate(match)
  return evaluateParentheses(input.replace(match, res))
}

/**
 * Main function which takes the user input.
 */
export const evalExpr = (input) => {
  const strippedInput = strip(input)
  const preparedInput = evaluateParentheses(strippedInput)
  const str1 = replaceIntervals(preparedInput)
  const str2 = replaceStrokes(str1)
  const str3 = replaceDurations(str2)
  const seconds = evalStr(str3)

  if (isTimeStroke(str1)) {
    return secondsToStroke(seconds)
  } else {
    return secondsToOutput(seconds)
  }
}
