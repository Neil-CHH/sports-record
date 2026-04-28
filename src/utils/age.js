export const monthsBetween = (fromISO, toISO) => {
  if (!fromISO || !toISO) return 0
  const from = new Date(fromISO)
  const to = new Date(toISO)
  const years = to.getFullYear() - from.getFullYear()
  const months = to.getMonth() - from.getMonth()
  const days = to.getDate() - from.getDate()
  return Math.max(0, years * 12 + months + days / 30)
}

export const formatAge = (birthdayISO, dateISO = new Date().toISOString().slice(0, 10)) => {
  const months = monthsBetween(birthdayISO, dateISO)
  if (months < 1) return '新生'
  if (months < 12) return `${Math.floor(months)} 個月`
  const years = Math.floor(months / 12)
  const restMonths = Math.floor(months % 12)
  return restMonths === 0 ? `${years} 歲` : `${years} 歲 ${restMonths} 個月`
}

export const formatDate = (iso) => {
  if (!iso) return ''
  const d = new Date(iso)
  return `${d.getFullYear()} 年 ${d.getMonth() + 1} 月 ${d.getDate()} 日`
}

export const todayISO = () => {
  const d = new Date()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}
