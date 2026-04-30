export const DENTAL_TYPES = [
  { key: 'exam', label: '例行檢查' },
  { key: 'fluoride', label: '塗氟' },
  { key: 'cavity_fix', label: '蛀牙治療' },
  { key: 'orthodontic', label: '矯正' },
  { key: 'tooth_loss', label: '乳牙脫落' },
  { key: 'other', label: '其他' },
]

export const dentalTypeLabel = (key) =>
  DENTAL_TYPES.find((t) => t.key === key)?.label || key

const inPastYear = (isoDate) => {
  if (!isoDate) return false
  const now = new Date()
  const cutoff = new Date(now)
  cutoff.setFullYear(cutoff.getFullYear() - 1)
  const d = new Date(isoDate)
  return d >= cutoff && d <= now
}

export const computeDentalStats = (records) => {
  const recent = records.filter((r) => inPastYear(r.date))
  let exams = 0
  let fluorides = 0
  let cavities = 0
  recent.forEach((r) => {
    const types = Array.isArray(r.types) ? r.types : []
    if (types.includes('exam')) exams += 1
    if (types.includes('fluoride')) fluorides += 1
    if (r.cavityCount != null && r.cavityCount > 0) {
      cavities += Number(r.cavityCount)
    }
  })
  return { exams, fluorides, cavities, total: recent.length }
}
