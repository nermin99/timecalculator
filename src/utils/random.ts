const randomTime = () => {
  const h = String(Math.floor(Math.random() * 24)).padStart(2, '0')
  const m = String(Math.floor(Math.random() * 60)).padStart(2, '0')
  const s = String(Math.floor(Math.random() * 60)).padStart(2, '0')
  return Math.random() > 0.5 ? `${h}:${m}:${s}` : `${h}:${m}`
}

const randomDuration = () => {
  const h = Math.floor(Math.random() * 12)
  const m = Math.floor(Math.random() * 60)
  const s = Math.floor(Math.random() * 60)
  const parts = [
    ...(h > 0 ? [`${h}h`] : []),
    ...(m > 0 ? [`${m}m`] : []),
    ...(s > 0 && Math.random() > 0.5 ? [`${s}s`] : []),
  ]
  return parts.length ? parts.join('') : '1h'
}

export const randomInput = () => {
  const type = Math.floor(Math.random() * 3)
  if (type === 0) return `${randomTime()} > ${randomTime()}`
  if (type === 1) return `${randomDuration()} + ${randomDuration()}`
  return `${randomTime()} ${Math.random() > 0.5 ? '+' : '-'} ${randomDuration()}`
}
