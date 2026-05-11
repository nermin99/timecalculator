import React, { useState, useRef, ChangeEvent } from 'react'
import { handleInput } from '../../utils/timecalculator'
import { randomInput } from '../../utils/random'
import { debounce } from '../../utils/helpers'

import './index.css'

const DEBOUNCE_DELAY = 500

const Calculator = () => {
  const [result, setResult] = useState('')
  const [resultIsTime, setResultIsTime] = useState(false)
  const [dayOffset, setDayOffset] = useState(0)
  const [midnightCrossing, setMidnightCrossing] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const processInput = (input: string) => {
    if (input === '') {
      setResult('')
      setResultIsTime(false)
      setDayOffset(0)
      setMidnightCrossing(false)
    } else {
      const { result, resultIsTime, dayOffset, midnightCrossing } = handleInput(input)
      setResult(result)
      setResultIsTime(resultIsTime)
      setDayOffset(dayOffset)
      setMidnightCrossing(midnightCrossing)
    }
  }

  const handleEvent = debounce((e: ChangeEvent<HTMLInputElement>) => {
    processInput(e.target.value)
  }, DEBOUNCE_DELAY)

  const handleRandom = () => {
    const random = randomInput()
    if (inputRef.current) inputRef.current.value = random
    processInput(random)
  }

  const renderResult = (result: string) => {
    if (resultIsTime) {
      const parts = result.split(':')
      return (
        <>
          {parts.map((part, i) => (
            <React.Fragment key={i}>
              {i > 0 && <span className="result-colon" aria-hidden="true">:</span>}
              {part}
            </React.Fragment>
          ))}
        </>
      )
    }
    return (
      <>
        {result}
        <span className="result-dot" aria-hidden="true">.</span>
      </>
    )
  }

  const dayOffsetLabel =
    dayOffset !== 0
      ? `(${dayOffset > 0 ? '+' : '-'} ${Math.abs(dayOffset)} ${Math.abs(dayOffset) === 1 ? 'day' : 'days'})`
      : midnightCrossing
        ? '(next day)'
        : null

  return (
    <div className="calculator">
      <div className="result-container monospace">
        <div className="result">
          {result ? renderResult(result) : (
            <span className="result-caret" aria-hidden="true">
              |
            </span>
          )}
        </div>
        <div className="day-offset">{dayOffsetLabel}</div>
      </div>
      <form className="calculator-form" onSubmit={(e) => e.preventDefault()}>
        <input
          id="calculator-input"
          ref={inputRef}
          onChange={handleEvent}
          className="input monospace"
          type="text"
          autoComplete="off"
          placeholder="08:00 > 17:30"
          autoFocus
        />
      </form>
      <button className="random-button" onClick={handleRandom}>
        random
      </button>
      <div className="hints-container">
        <div className="hints">
          <h3 className="hints-heading">Usage</h3>
          <table className="hints-table">
            <tbody>
              <tr>
                <td className="hints-example monospace">08:00 &gt; 17:30</td>
                <td className="hints-arrow">→</td>
                <td className="hints-desc">calculate duration between two times</td>
              </tr>
              <tr>
                <td className="hints-example monospace">1h30m + 45m</td>
                <td className="hints-arrow">→</td>
                <td className="hints-desc">add or subtract durations</td>
              </tr>
              <tr>
                <td className="hints-example monospace">08:00 - 1h30m</td>
                <td className="hints-arrow">→</td>
                <td className="hints-desc">add or subtract duration to a time</td>
              </tr>
              <tr>
                <td className="hints-example monospace">(1h + 08:00) &gt; 12:00</td>
                <td className="hints-arrow">→</td>
                <td className="hints-desc">use ( ) to group</td>
              </tr>
            </tbody>
          </table>
          <div className="hints-footer">
            <p>
              Durations use <span className="hints-code">h</span>{' '}
              <span className="hints-code">m</span> <span className="hints-code">s</span>
            </p>
            <p>
              Times use <span className="hints-code">HH:MM</span> or{' '}
              <span className="hints-code">HH:MM:SS</span>
            </p>
            <p>
              <span className="hints-code">&gt;</span> finds the gap between two times
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Calculator
