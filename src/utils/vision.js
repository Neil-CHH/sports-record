export const ACUITY_VALUES = [
  '0.05', '0.1', '0.2', '0.3', '0.4', '0.5', '0.6', '0.7',
  '0.8', '0.9', '1.0', '1.2', '1.5', '2.0',
]

export const ACUITY_SPECIAL = [
  { value: 'NC', label: '無法配合' },
  { value: 'UTT', label: '未測' },
]

export const CHECK_TYPES = [
  { key: 'school', label: '學校' },
  { key: 'clinic', label: '診所' },
  { key: 'hospital', label: '醫院' },
  { key: 'self', label: '自測' },
]

export const checkTypeLabel = (key) =>
  CHECK_TYPES.find((t) => t.key === key)?.label || null

export const isNumericAcuity = (v) => v != null && v !== '' && !Number.isNaN(Number(v))

export const acuityToNumber = (v) => (isNumericAcuity(v) ? Number(v) : null)

export const formatAcuity = (v) => {
  if (!v) return '—'
  const special = ACUITY_SPECIAL.find((s) => s.value === v)
  if (special) return special.label
  return v
}

export const formatSph = (deg) => {
  if (deg == null || deg === '') return null
  const n = Number(deg)
  if (!Number.isFinite(n) || n === 0) return null
  const abs = Math.abs(n)
  return `${n < 0 ? '近視' : '遠視'} ${abs} 度`
}

export const formatCyl = (deg) => {
  if (deg == null || deg === '') return null
  const n = Number(deg)
  if (!Number.isFinite(n) || n === 0) return null
  return `散光 ${Math.abs(n)} 度`
}
