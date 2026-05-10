import React, { useState, ChangeEvent } from 'react'
import { handleInput } from '../../utils/timecalculator'
import { debounce } from '../../utils/helpers'

import './index.css'

const DEBOUNCE_DELAY = 500

const Calculator = () => {
  const [result, setResult] = useState('')
  const [dayOffset, setDayOffset] = useState(0)

  const handleEvent = debounce((e: ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value

    if (input === '') {
      setResult('')
      setDayOffset(0)
    } else {
      const { result, dayOffset } = handleInput(input)
      setResult(result)
      setDayOffset(dayOffset)
    }
  }, DEBOUNCE_DELAY)

  const dayOffsetLabel =
    dayOffset !== 0
      ? `(${dayOffset > 0 ? '+' : '-'} ${Math.abs(dayOffset)} ${Math.abs(dayOffset) === 1 ? 'day' : 'days'})`
      : null

  return (
    <div className="calculator">
      <div className="result-area monospace">
        <div className="result">{result}</div>
        <div className="day-offset">{dayOffsetLabel}</div>
      </div>
      <form className="calculator-form" onSubmit={(e) => e.preventDefault()}>
        <input
          onChange={handleEvent}
          className="input monospace"
          type="text"
          autoComplete="off"
          placeholder="08:00 > 17:00"
          autoFocus
        />
      </form>
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
