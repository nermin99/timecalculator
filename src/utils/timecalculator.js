// Matches time strokes on the form HH:MM and HH:MM:SS
const reStroke = '\\d{2}:\\d{2}(?::\\d{2})?'

/* Remove all whitespace from string */
export const strip = (str) => str.replace(/\s+/g, '')

export const strTimeToSeconds = (hours, minutes, seconds) => {
  return Number(hours) * 3600 + Number(minutes) * 60 + Number(seconds)
}

/**
 * Replaces time intervals with the time duration in seconds.
 * '01:00>02:00' --> '3600'
 */
export const replaceIntervals = (str) => {
  const reInterval = `(${reStroke})\\>(${reStroke})`

  const matches = str.matchAll(reInterval)
  for (const [match, stroke1, stroke2] of matches) {
    const t1 = strokesToSeconds(stroke1)
    const t2 = strokesToSeconds(stroke2)
    str = str.replace(match, Number(t2) - Number(t1))
  }
  return str
}

/**
 * Converts time strokes (from midnight) to seconds.
 * '01:30:40' --> '5440'
 */
export const strokesToSeconds = (str) => {
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
export const durationsToSeconds = (str) => {
  // https://stackoverflow.com/questions/72016685/matching-hour-minute-second-hms-duration-string
  const re = /\b(?=\w)(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?\b(?!\w)/g

  const matches = str.matchAll(re)
  for (const [match, hours = 0, minutes = 0, seconds = 0] of matches) {
    str = str.replace(match, strTimeToSeconds(hours, minutes, seconds))
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
  const reFront = new RegExp(`\\d+[hms][+-]${reStroke}`)
  const reBack = new RegExp(`${reStroke}[+-]\\d+[hms]`)
  return reFront.test(str) || reBack.test(str)
}

/**
 * Main function which takes the user input.
 */
export const evalExpr = (input) => {
  const strippedInput = strip(input)

  const parsedInput = replaceIntervals(strippedInput)
  let str = strokesToSeconds(parsedInput)
  str = durationsToSeconds(str)
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
