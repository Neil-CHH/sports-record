import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { genId } from '../utils/storage.js'
import { removeFromStorage, removeFromStorageBatch } from '../utils/mediaUpload.js'
import {
  loadCachedMembers,
  saveCachedMembers,
  loadCachedMatches,
  saveCachedMatches,
  loadCachedTrainingSessions,
  saveCachedTrainingSessions,
  loadCachedTrainingItems,
  saveCachedTrainingItems,
  loadCachedMedia,
  saveCachedMedia,
  loadCachedGrowthRecords,
  saveCachedGrowthRecords,
  loadCachedVisionRecords,
  saveCachedVisionRecords,
  loadCachedDentalRecords,
  saveCachedDentalRecords,
  loadQueue,
  saveQueue
} from '../lib/cache.js'

const ACTIVE_KEY = 'sports-record:activeMember'
const RECORDER_KEY = 'sports-record:recorder'

const defaultMembers = [
  { id: 'm1', name: '小孩 A', birthday: '2020-01-01', avatar: null, color: 'coral' },
  { id: 'm2', name: '小孩 B', birthday: '2022-01-01', avatar: null, color: 'sky' }
]

const fromDbMember = (m) => ({
  id: m.id,
  name: m.name,
  birthday: m.birthday,
  avatar: m.avatar,
  color: m.color || 'coral'
})

const memberDbPatch = (patch) => {
  const dbPatch = { updated_at: new Date().toISOString() }
  if ('name' in patch) dbPatch.name = patch.name
  if ('birthday' in patch) dbPatch.birthday = patch.birthday
  if ('avatar' in patch) dbPatch.avatar = patch.avatar
  if ('color' in patch) dbPatch.color = patch.color
  return dbPatch
}

const fromDbGrowthRecord = (r) => ({
  id: r.id,
  memberId: r.member_id,
  date: r.date,
  heightCm: r.height_cm != null ? Number(r.height_cm) : null,
  weightKg: r.weight_kg != null ? Number(r.weight_kg) : null,
  note: r.note || '',
  photo: r.photo || null,
  recordedBy: r.recorded_by || null
})

const toDbGrowthRecord = (r) => ({
  id: r.id,
  member_id: r.memberId,
  date: r.date,
  height_cm: r.heightCm,
  weight_kg: r.weightKg ?? null,
  note: r.note || '',
  photo: r.photo || null,
  recorded_by: r.recordedBy || null
})

const numOrNull = (v) => (v === '' || v == null ? null : Number(v))

const fromDbVisionRecord = (r) => ({
  id: r.id,
  memberId: r.member_id,
  date: r.date,
  checkType: r.check_type || null,
  wearsGlasses: !!r.wears_glasses,
  leftAcuity: r.left_acuity || '',
  rightAcuity: r.right_acuity || '',
  leftAcuityCorrected: r.left_acuity_corrected || '',
  rightAcuityCorrected: r.right_acuity_corrected || '',
  leftSph: r.left_sph ?? null,
  rightSph: r.right_sph ?? null,
  leftCyl: r.left_cyl ?? null,
  rightCyl: r.right_cyl ?? null,
  leftAxis: r.left_axis ?? null,
  rightAxis: r.right_axis ?? null,
  leftAxialLength: r.left_axial_length != null ? Number(r.left_axial_length) : null,
  rightAxialLength: r.right_axial_length != null ? Number(r.right_axial_length) : null,
  nextVisit: r.next_visit || null,
  note: r.note || '',
  photo: r.photo || null,
  recordedBy: r.recorded_by || null
})

const toDbVisionRecord = (r) => ({
  id: r.id,
  member_id: r.memberId,
  date: r.date,
  check_type: r.checkType || null,
  wears_glasses: !!r.wearsGlasses,
  left_acuity: r.leftAcuity || null,
  right_acuity: r.rightAcuity || null,
  left_acuity_corrected: r.leftAcuityCorrected || null,
  right_acuity_corrected: r.rightAcuityCorrected || null,
  left_sph: numOrNull(r.leftSph),
  right_sph: numOrNull(r.rightSph),
  left_cyl: numOrNull(r.leftCyl),
  right_cyl: numOrNull(r.rightCyl),
  left_axis: numOrNull(r.leftAxis),
  right_axis: numOrNull(r.rightAxis),
  left_axial_length: numOrNull(r.leftAxialLength),
  right_axial_length: numOrNull(r.rightAxialLength),
  next_visit: r.nextVisit || null,
  note: r.note || '',
  photo: r.photo || null,
  recorded_by: r.recordedBy || null
})

const fromDbDentalRecord = (r) => ({
  id: r.id,
  memberId: r.member_id,
  date: r.date,
  types: Array.isArray(r.types) ? r.types : [],
  cavityCount: r.cavity_count ?? null,
  toothArea: r.tooth_area || '',
  nextVisit: r.next_visit || null,
  note: r.note || '',
  photo: r.photo || null,
  recordedBy: r.recorded_by || null
})

const toDbDentalRecord = (r) => ({
  id: r.id,
  member_id: r.memberId,
  date: r.date,
  types: Array.isArray(r.types) ? r.types : [],
  cavity_count: r.cavityCount === '' || r.cavityCount == null ? null : Number(r.cavityCount),
  tooth_area: r.toothArea || null,
  next_visit: r.nextVisit || null,
  note: r.note || '',
  photo: r.photo || null,
  recorded_by: r.recordedBy || null
})

const fromDbMatch = (r) => ({
  id: r.id,
  memberId: r.member_id,
  date: r.date,
  eventName: r.event_name || '',
  round: r.round || '',
  opponentSchool: r.opponent_school || '',
  opponentName: r.opponent_name || '',
  opponentHand: r.opponent_hand || '',
  format: r.format || '',
  partnerName: r.partner_name || '',
  scores: Array.isArray(r.scores) ? r.scores : [],
  result: r.result || null,
  tags: Array.isArray(r.tags) ? r.tags : [],
  note: r.note || '',
  recordedBy: r.recorded_by || null
})

const toDbMatch = (r) => ({
  id: r.id,
  member_id: r.memberId,
  date: r.date,
  event_name: r.eventName || null,
  round: r.round || null,
  opponent_school: r.opponentSchool || null,
  opponent_name: r.opponentName || null,
  opponent_hand: r.opponentHand || null,
  format: r.format || null,
  partner_name: r.partnerName || null,
  scores: r.scores || [],
  result: r.result || null,
  tags: r.tags || [],
  note: r.note || '',
  recorded_by: r.recordedBy || null
})

const fromDbSession = (r) => ({
  id: r.id,
  memberId: r.member_id,
  date: r.date,
  location: r.location || '',
  durationMin: r.duration_min ?? null,
  themeTags: Array.isArray(r.theme_tags) ? r.theme_tags : [],
  note: r.note || '',
  recordedBy: r.recorded_by || null
})

const toDbSession = (r) => ({
  id: r.id,
  member_id: r.memberId,
  date: r.date,
  location: r.location || null,
  duration_min: r.durationMin ?? null,
  theme_tags: r.themeTags || [],
  note: r.note || '',
  recorded_by: r.recordedBy || null
})

const fromDbItem = (r) => ({
  id: r.id,
  sessionId: r.session_id,
  orderIndex: r.order_index ?? 0,
  kind: r.kind,
  label: r.label || '',
  metrics: r.metrics || {},
  note: r.note || ''
})

const toDbItem = (r) => ({
  id: r.id,
  session_id: r.sessionId,
  order_index: r.orderIndex ?? 0,
  kind: r.kind,
  label: r.label || null,
  metrics: r.metrics || {},
  note: r.note || ''
})

const fromDbMedia = (r) => ({
  id: r.id,
  memberId: r.member_id,
  ownerType: r.owner_type,
  ownerId: r.owner_id,
  kind: r.kind,
  storagePath: r.storage_path,
  thumbnailPath: r.thumbnail_path || null,
  durationMs: r.duration_ms ?? null,
  width: r.width ?? null,
  height: r.height ?? null,
  sizeBytes: r.size_bytes ?? null,
  tags: Array.isArray(r.tags) ? r.tags : [],
  createdAt: r.created_at
})

const toDbMedia = (r) => ({
  id: r.id,
  member_id: r.memberId,
  owner_type: r.ownerType,
  owner_id: r.ownerId,
  kind: r.kind,
  storage_path: r.storagePath,
  thumbnail_path: r.thumbnailPath || null,
  duration_ms: r.durationMs ?? null,
  width: r.width ?? null,
  height: r.height ?? null,
  size_bytes: r.sizeBytes ?? null,
  tags: r.tags || []
})

export const useAppState = () => {
  const [members, setMembers] = useState(() => {
    const cached = loadCachedMembers()
    return cached.length ? cached : defaultMembers
  })
  const [growthRecords, setGrowthRecords] = useState(() => loadCachedGrowthRecords())
  const [visionRecords, setVisionRecords] = useState(() => loadCachedVisionRecords())
  const [dentalRecords, setDentalRecords] = useState(() => loadCachedDentalRecords())
  const [matches, setMatches] = useState(() => loadCachedMatches())
  const [trainingSessions, setTrainingSessions] = useState(() => loadCachedTrainingSessions())
  const [trainingItems, setTrainingItems] = useState(() => loadCachedTrainingItems())
  const [media, setMedia] = useState(() => loadCachedMedia())
  const [activeMemberId, setActiveMemberIdState] = useState(
    () => localStorage.getItem(ACTIVE_KEY) || 'm1'
  )
  const [recorder, setRecorderState] = useState(
    () => localStorage.getItem(RECORDER_KEY) || null
  )
  const [saveError, setSaveError] = useState(null)
  const [online, setOnline] = useState(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true
  )
  const [queue, setQueueState] = useState(() => loadQueue())
  const drainingRef = useRef(false)
  const drainQueueRef = useRef(null)
  const retryTimerRef = useRef(null)

  useEffect(() => { saveCachedMembers(members) }, [members])
  useEffect(() => { saveCachedGrowthRecords(growthRecords) }, [growthRecords])
  useEffect(() => { saveCachedVisionRecords(visionRecords) }, [visionRecords])
  useEffect(() => { saveCachedDentalRecords(dentalRecords) }, [dentalRecords])
  useEffect(() => { saveCachedMatches(matches) }, [matches])
  useEffect(() => { saveCachedTrainingSessions(trainingSessions) }, [trainingSessions])
  useEffect(() => { saveCachedTrainingItems(trainingItems) }, [trainingItems])
  useEffect(() => { saveCachedMedia(media) }, [media])

  const scheduleRetry = useCallback((delayMs = 2000) => {
    if (retryTimerRef.current) clearTimeout(retryTimerRef.current)
    retryTimerRef.current = setTimeout(() => {
      retryTimerRef.current = null
      drainQueueRef.current?.()
    }, delayMs)
  }, [])

  const enqueue = useCallback((op) => {
    setQueueState((prev) => {
      const next = [...prev, op]
      saveQueue(next)
      return next
    })
    scheduleRetry(2000)
  }, [scheduleRetry])

  const execOp = useCallback(async (op) => {
    if (op.type === 'update_member') {
      const { error } = await supabase.from('members').update(memberDbPatch(op.patch)).eq('id', op.id)
      if (error) throw error
    } else if (op.type === 'insert_growth') {
      const { error } = await supabase.from('records').insert(toDbGrowthRecord(op.payload))
      if (error && error.code !== '23505') throw error
    } else if (op.type === 'update_growth') {
      const dbPatch = { ...toDbGrowthRecord(op.payload), updated_at: new Date().toISOString() }
      delete dbPatch.id
      const { error } = await supabase.from('records').update(dbPatch).eq('id', op.id)
      if (error) throw error
    } else if (op.type === 'delete_growth') {
      const { error } = await supabase.from('records').delete().eq('id', op.id)
      if (error) throw error
    } else if (op.type === 'insert_vision') {
      const { error } = await supabase.from('vision_records').insert(toDbVisionRecord(op.payload))
      if (error && error.code !== '23505') throw error
    } else if (op.type === 'update_vision') {
      const dbPatch = { ...toDbVisionRecord(op.payload), updated_at: new Date().toISOString() }
      delete dbPatch.id
      const { error } = await supabase.from('vision_records').update(dbPatch).eq('id', op.id)
      if (error) throw error
    } else if (op.type === 'delete_vision') {
      const { error } = await supabase.from('vision_records').delete().eq('id', op.id)
      if (error) throw error
    } else if (op.type === 'insert_dental') {
      const { error } = await supabase.from('dental_records').insert(toDbDentalRecord(op.payload))
      if (error && error.code !== '23505') throw error
    } else if (op.type === 'update_dental') {
      const dbPatch = { ...toDbDentalRecord(op.payload), updated_at: new Date().toISOString() }
      delete dbPatch.id
      const { error } = await supabase.from('dental_records').update(dbPatch).eq('id', op.id)
      if (error) throw error
    } else if (op.type === 'delete_dental') {
      const { error } = await supabase.from('dental_records').delete().eq('id', op.id)
      if (error) throw error
    } else if (op.type === 'insert_match') {
      const { error } = await supabase.from('matches').insert(toDbMatch(op.payload))
      if (error && error.code !== '23505') throw error
    } else if (op.type === 'update_match') {
      const dbPatch = { ...toDbMatch(op.payload), updated_at: new Date().toISOString() }
      delete dbPatch.id
      const { error } = await supabase.from('matches').update(dbPatch).eq('id', op.id)
      if (error) throw error
    } else if (op.type === 'delete_match') {
      if (op.paths?.length) {
        try { await removeFromStorageBatch(op.paths) } catch (e) { console.warn('[sync] storage cleanup failed (continuing)', e) }
      }
      const { error } = await supabase.from('matches').delete().eq('id', op.id)
      if (error) throw error
    } else if (op.type === 'insert_session') {
      const { error } = await supabase.from('training_sessions').insert(toDbSession(op.payload))
      if (error && error.code !== '23505') throw error
    } else if (op.type === 'update_session') {
      const dbPatch = { ...toDbSession(op.payload), updated_at: new Date().toISOString() }
      delete dbPatch.id
      const { error } = await supabase.from('training_sessions').update(dbPatch).eq('id', op.id)
      if (error) throw error
    } else if (op.type === 'delete_session') {
      if (op.paths?.length) {
        try { await removeFromStorageBatch(op.paths) } catch (e) { console.warn('[sync] storage cleanup failed (continuing)', e) }
      }
      const { error } = await supabase.from('training_sessions').delete().eq('id', op.id)
      if (error) throw error
    } else if (op.type === 'insert_items') {
      const rows = op.payload.map(toDbItem)
      const { error } = await supabase.from('training_items').insert(rows)
      if (error && error.code !== '23505') throw error
    } else if (op.type === 'replace_items') {
      const { error: e1 } = await supabase
        .from('training_items')
        .delete()
        .eq('session_id', op.sessionId)
      if (e1) throw e1
      if (op.payload.length) {
        const { error: e2 } = await supabase.from('training_items').insert(op.payload.map(toDbItem))
        if (e2) throw e2
      }
    } else if (op.type === 'insert_media') {
      const { error } = await supabase.from('media').insert(toDbMedia(op.payload))
      if (error && error.code !== '23505') throw error
    } else if (op.type === 'delete_media') {
      const { error } = await supabase.from('media').delete().eq('id', op.id)
      if (error) throw error
    }
  }, [])

  const drainQueue = useCallback(async () => {
    if (drainingRef.current) return
    drainingRef.current = true
    let stuck = false
    try {
      let q = loadQueue()
      while (q.length) {
        try {
          await execOp(q[0])
          q = q.slice(1)
          saveQueue(q)
          setQueueState(q)
        } catch (err) {
          console.error('[sync] drain stuck on op', q[0], err)
          stuck = true
          break
        }
      }
    } finally {
      drainingRef.current = false
    }
    if (stuck) scheduleRetry(15000)
  }, [execOp, scheduleRetry])

  useEffect(() => {
    drainQueueRef.current = drainQueue
  }, [drainQueue])

  useEffect(() => {
    return () => {
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current)
    }
  }, [])

  const fetchFromServer = useCallback(async () => {
    try {
      const [mRes, gRes, vRes, dRes, matRes, sRes, iRes, mediaRes] = await Promise.all([
        supabase.from('members').select('*').order('id'),
        supabase.from('records').select('*').order('date', { ascending: false }),
        supabase.from('vision_records').select('*').order('date', { ascending: false }),
        supabase.from('dental_records').select('*').order('date', { ascending: false }),
        supabase.from('matches').select('*').order('date', { ascending: false }),
        supabase.from('training_sessions').select('*').order('date', { ascending: false }),
        supabase.from('training_items').select('*').order('order_index'),
        supabase.from('media').select('*').order('created_at', { ascending: false })
      ])
      if (!mRes.error && mRes.data?.length) setMembers(mRes.data.map(fromDbMember))
      if (!gRes.error && gRes.data) setGrowthRecords(gRes.data.map(fromDbGrowthRecord))
      if (!vRes.error && vRes.data) setVisionRecords(vRes.data.map(fromDbVisionRecord))
      if (!dRes.error && dRes.data) setDentalRecords(dRes.data.map(fromDbDentalRecord))
      if (!matRes.error && matRes.data) setMatches(matRes.data.map(fromDbMatch))
      if (!sRes.error && sRes.data) setTrainingSessions(sRes.data.map(fromDbSession))
      if (!iRes.error && iRes.data) setTrainingItems(iRes.data.map(fromDbItem))
      if (!mediaRes.error && mediaRes.data) setMedia(mediaRes.data.map(fromDbMedia))
    } catch {
      /* offline — keep cached state */
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    const init = async () => {
      await drainQueue()
      if (cancelled) return
      await fetchFromServer()
    }
    init()
    return () => { cancelled = true }
  }, [drainQueue, fetchFromServer])

  useEffect(() => {
    const onOnline = async () => {
      setOnline(true)
      await drainQueue()
      await fetchFromServer()
    }
    const onOffline = () => setOnline(false)
    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)
    return () => {
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
    }
  }, [drainQueue, fetchFromServer])

  useEffect(() => {
    const channel = supabase
      .channel('sports-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'members' }, (payload) => {
        if (payload.eventType === 'DELETE') {
          setMembers((prev) => prev.filter((m) => m.id !== payload.old.id))
          return
        }
        const row = fromDbMember(payload.new)
        setMembers((prev) => {
          const i = prev.findIndex((m) => m.id === row.id)
          if (i < 0) return [...prev, row]
          const next = [...prev]
          next[i] = row
          return next
        })
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'records' }, (payload) => {
        if (payload.eventType === 'DELETE') {
          setGrowthRecords((prev) => prev.filter((r) => r.id !== payload.old.id))
          return
        }
        const row = fromDbGrowthRecord(payload.new)
        setGrowthRecords((prev) => {
          const i = prev.findIndex((r) => r.id === row.id)
          if (i < 0) return [row, ...prev]
          const next = [...prev]
          next[i] = row
          return next
        })
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vision_records' }, (payload) => {
        if (payload.eventType === 'DELETE') {
          setVisionRecords((prev) => prev.filter((r) => r.id !== payload.old.id))
          return
        }
        const row = fromDbVisionRecord(payload.new)
        setVisionRecords((prev) => {
          const i = prev.findIndex((r) => r.id === row.id)
          if (i < 0) return [row, ...prev]
          const next = [...prev]
          next[i] = row
          return next
        })
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'dental_records' }, (payload) => {
        if (payload.eventType === 'DELETE') {
          setDentalRecords((prev) => prev.filter((r) => r.id !== payload.old.id))
          return
        }
        const row = fromDbDentalRecord(payload.new)
        setDentalRecords((prev) => {
          const i = prev.findIndex((r) => r.id === row.id)
          if (i < 0) return [row, ...prev]
          const next = [...prev]
          next[i] = row
          return next
        })
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'matches' }, (payload) => {
        if (payload.eventType === 'DELETE') {
          setMatches((prev) => prev.filter((r) => r.id !== payload.old.id))
          return
        }
        const row = fromDbMatch(payload.new)
        setMatches((prev) => {
          const i = prev.findIndex((r) => r.id === row.id)
          if (i < 0) return [row, ...prev]
          const next = [...prev]
          next[i] = row
          return next
        })
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'training_sessions' }, (payload) => {
        if (payload.eventType === 'DELETE') {
          setTrainingSessions((prev) => prev.filter((r) => r.id !== payload.old.id))
          return
        }
        const row = fromDbSession(payload.new)
        setTrainingSessions((prev) => {
          const i = prev.findIndex((r) => r.id === row.id)
          if (i < 0) return [row, ...prev]
          const next = [...prev]
          next[i] = row
          return next
        })
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'training_items' }, (payload) => {
        if (payload.eventType === 'DELETE') {
          setTrainingItems((prev) => prev.filter((r) => r.id !== payload.old.id))
          return
        }
        const row = fromDbItem(payload.new)
        setTrainingItems((prev) => {
          const i = prev.findIndex((r) => r.id === row.id)
          if (i < 0) return [...prev, row]
          const next = [...prev]
          next[i] = row
          return next
        })
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'media' }, (payload) => {
        if (payload.eventType === 'DELETE') {
          setMedia((prev) => prev.filter((r) => r.id !== payload.old.id))
          return
        }
        const row = fromDbMedia(payload.new)
        setMedia((prev) => {
          const i = prev.findIndex((r) => r.id === row.id)
          if (i < 0) return [row, ...prev]
          const next = [...prev]
          next[i] = row
          return next
        })
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  const setActiveMember = useCallback((id) => {
    setActiveMemberIdState(id)
    try { localStorage.setItem(ACTIVE_KEY, id) } catch { /* ignore */ }
  }, [])

  const setRecorder = useCallback((value) => {
    setRecorderState(value)
    try {
      if (value) localStorage.setItem(RECORDER_KEY, value)
      else localStorage.removeItem(RECORDER_KEY)
    } catch { /* ignore */ }
  }, [])

  const updateMember = useCallback(async (id, patch) => {
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)))
    try {
      const { error } = await supabase.from('members').update(memberDbPatch(patch)).eq('id', id)
      if (error) throw error
    } catch (err) {
      console.error('[sync] update_member failed', err)
      enqueue({ type: 'update_member', id, patch })
    }
  }, [enqueue])

  const addGrowthRecord = useCallback(async (memberId, record) => {
    const newRec = { id: genId('g'), memberId, ...record }
    setGrowthRecords((prev) => [newRec, ...prev])
    try {
      const { error } = await supabase.from('records').insert(toDbGrowthRecord(newRec))
      if (error) throw error
    } catch (err) {
      console.error('[sync] insert_growth failed', err)
      enqueue({ type: 'insert_growth', payload: newRec })
    }
    return newRec
  }, [enqueue])

  const updateGrowthRecord = useCallback(async (id, patch) => {
    let merged = null
    setGrowthRecords((prev) => prev.map((r) => {
      if (r.id !== id) return r
      merged = { ...r, ...patch }
      return merged
    }))
    try {
      const dbPatch = { ...toDbGrowthRecord(merged || { id, ...patch }), updated_at: new Date().toISOString() }
      delete dbPatch.id
      const { error } = await supabase.from('records').update(dbPatch).eq('id', id)
      if (error) throw error
    } catch (err) {
      console.error('[sync] update_growth failed', err)
      enqueue({ type: 'update_growth', id, payload: merged || { id, ...patch } })
    }
  }, [enqueue])

  const deleteGrowthRecord = useCallback(async (id) => {
    setGrowthRecords((prev) => prev.filter((r) => r.id !== id))
    try {
      const { error } = await supabase.from('records').delete().eq('id', id)
      if (error) throw error
    } catch (err) {
      console.error('[sync] delete_growth failed', err)
      enqueue({ type: 'delete_growth', id })
    }
  }, [enqueue])

  const addVisionRecord = useCallback(async (memberId, record) => {
    const newRec = { id: genId('v'), memberId, ...record }
    setVisionRecords((prev) => [newRec, ...prev])
    try {
      const { error } = await supabase.from('vision_records').insert(toDbVisionRecord(newRec))
      if (error) throw error
    } catch (err) {
      console.error('[sync] insert_vision failed', err)
      enqueue({ type: 'insert_vision', payload: newRec })
    }
    return newRec
  }, [enqueue])

  const updateVisionRecord = useCallback(async (id, patch) => {
    let merged = null
    setVisionRecords((prev) => prev.map((r) => {
      if (r.id !== id) return r
      merged = { ...r, ...patch }
      return merged
    }))
    try {
      const dbPatch = { ...toDbVisionRecord(merged || { id, ...patch }), updated_at: new Date().toISOString() }
      delete dbPatch.id
      const { error } = await supabase.from('vision_records').update(dbPatch).eq('id', id)
      if (error) throw error
    } catch (err) {
      console.error('[sync] update_vision failed', err)
      enqueue({ type: 'update_vision', id, payload: merged || { id, ...patch } })
    }
  }, [enqueue])

  const deleteVisionRecord = useCallback(async (id) => {
    setVisionRecords((prev) => prev.filter((r) => r.id !== id))
    try {
      const { error } = await supabase.from('vision_records').delete().eq('id', id)
      if (error) throw error
    } catch (err) {
      console.error('[sync] delete_vision failed', err)
      enqueue({ type: 'delete_vision', id })
    }
  }, [enqueue])

  const addDentalRecord = useCallback(async (memberId, record) => {
    const newRec = { id: genId('d'), memberId, ...record }
    setDentalRecords((prev) => [newRec, ...prev])
    try {
      const { error } = await supabase.from('dental_records').insert(toDbDentalRecord(newRec))
      if (error) throw error
    } catch (err) {
      console.error('[sync] insert_dental failed', err)
      enqueue({ type: 'insert_dental', payload: newRec })
    }
    return newRec
  }, [enqueue])

  const updateDentalRecord = useCallback(async (id, patch) => {
    let merged = null
    setDentalRecords((prev) => prev.map((r) => {
      if (r.id !== id) return r
      merged = { ...r, ...patch }
      return merged
    }))
    try {
      const dbPatch = { ...toDbDentalRecord(merged || { id, ...patch }), updated_at: new Date().toISOString() }
      delete dbPatch.id
      const { error } = await supabase.from('dental_records').update(dbPatch).eq('id', id)
      if (error) throw error
    } catch (err) {
      console.error('[sync] update_dental failed', err)
      enqueue({ type: 'update_dental', id, payload: merged || { id, ...patch } })
    }
  }, [enqueue])

  const deleteDentalRecord = useCallback(async (id) => {
    setDentalRecords((prev) => prev.filter((r) => r.id !== id))
    try {
      const { error } = await supabase.from('dental_records').delete().eq('id', id)
      if (error) throw error
    } catch (err) {
      console.error('[sync] delete_dental failed', err)
      enqueue({ type: 'delete_dental', id })
    }
  }, [enqueue])

  const addMatch = useCallback(async (memberId, match) => {
    const newRec = { id: genId('match'), memberId, ...match }
    setMatches((prev) => [newRec, ...prev])
    try {
      const { error } = await supabase.from('matches').insert(toDbMatch(newRec))
      if (error) throw error
    } catch (err) {
      console.error('[sync] insert_match failed', err)
      enqueue({ type: 'insert_match', payload: newRec })
    }
    return newRec
  }, [enqueue])

  const updateMatch = useCallback(async (id, patch) => {
    let merged = null
    setMatches((prev) => prev.map((r) => {
      if (r.id !== id) return r
      merged = { ...r, ...patch }
      return merged
    }))
    try {
      const dbPatch = { ...toDbMatch(merged || { id, ...patch }), updated_at: new Date().toISOString() }
      delete dbPatch.id
      const { error } = await supabase.from('matches').update(dbPatch).eq('id', id)
      if (error) throw error
    } catch (err) {
      console.error('[sync] update_match failed', err)
      enqueue({ type: 'update_match', id, payload: merged || { id, ...patch } })
    }
  }, [enqueue])

  const deleteMatch = useCallback(async (id) => {
    const paths = []
    setMatches((prev) => prev.filter((r) => r.id !== id))
    setMedia((prev) => {
      const matching = prev.filter((m) => m.ownerType === 'match' && m.ownerId === id)
      for (const m of matching) {
        if (m.storagePath) paths.push(m.storagePath)
        if (m.thumbnailPath) paths.push(m.thumbnailPath)
      }
      return prev.filter((m) => !(m.ownerType === 'match' && m.ownerId === id))
    })
    try {
      if (paths.length) await removeFromStorageBatch(paths)
      const { error } = await supabase.from('matches').delete().eq('id', id)
      if (error) throw error
    } catch (err) {
      console.error('[sync] delete_match failed', err)
      enqueue({ type: 'delete_match', id, paths })
    }
  }, [enqueue])

  const addTrainingSession = useCallback(async (memberId, session, items = []) => {
    const sessionId = genId('s')
    const newSession = { id: sessionId, memberId, ...session }
    const newItems = items.map((it, idx) => ({
      id: genId('i'),
      sessionId,
      orderIndex: idx,
      ...it
    }))
    setTrainingSessions((prev) => [newSession, ...prev])
    if (newItems.length) setTrainingItems((prev) => [...prev, ...newItems])
    try {
      const { error: e1 } = await supabase.from('training_sessions').insert(toDbSession(newSession))
      if (e1) throw e1
      if (newItems.length) {
        const { error: e2 } = await supabase.from('training_items').insert(newItems.map(toDbItem))
        if (e2) throw e2
      }
    } catch (err) {
      console.error('[sync] insert_session failed', err)
      enqueue({ type: 'insert_session', payload: newSession })
      if (newItems.length) enqueue({ type: 'insert_items', payload: newItems })
    }
    return newSession
  }, [enqueue])

  const updateTrainingSession = useCallback(async (id, patch, items = []) => {
    let merged = null
    setTrainingSessions((prev) => prev.map((r) => {
      if (r.id !== id) return r
      merged = { ...r, ...patch }
      return merged
    }))
    const newItems = items.map((it, idx) => ({
      id: it.id || genId('i'),
      sessionId: id,
      orderIndex: idx,
      kind: it.kind,
      label: it.label || '',
      metrics: it.metrics || {},
      note: it.note || ''
    }))
    setTrainingItems((prev) => [...prev.filter((r) => r.sessionId !== id), ...newItems])
    try {
      const dbPatch = { ...toDbSession(merged || { id, ...patch }), updated_at: new Date().toISOString() }
      delete dbPatch.id
      const { error: e1 } = await supabase.from('training_sessions').update(dbPatch).eq('id', id)
      if (e1) throw e1
      const { error: e2 } = await supabase.from('training_items').delete().eq('session_id', id)
      if (e2) throw e2
      if (newItems.length) {
        const { error: e3 } = await supabase.from('training_items').insert(newItems.map(toDbItem))
        if (e3) throw e3
      }
    } catch (err) {
      console.error('[sync] update_session failed', err)
      enqueue({ type: 'update_session', id, payload: merged || { id, ...patch } })
      enqueue({ type: 'replace_items', sessionId: id, payload: newItems })
    }
  }, [enqueue])

  const deleteTrainingSession = useCallback(async (id) => {
    const paths = []
    setTrainingSessions((prev) => prev.filter((r) => r.id !== id))
    setTrainingItems((prev) => prev.filter((r) => r.sessionId !== id))
    setMedia((prev) => {
      const matching = prev.filter(
        (m) => m.ownerType === 'training_session' && m.ownerId === id
      )
      for (const m of matching) {
        if (m.storagePath) paths.push(m.storagePath)
        if (m.thumbnailPath) paths.push(m.thumbnailPath)
      }
      return prev.filter((m) => !(m.ownerType === 'training_session' && m.ownerId === id))
    })
    try {
      if (paths.length) await removeFromStorageBatch(paths)
      const { error } = await supabase.from('training_sessions').delete().eq('id', id)
      if (error) throw error
    } catch (err) {
      console.error('[sync] delete_session failed', err)
      enqueue({ type: 'delete_session', id, paths })
    }
  }, [enqueue])

  const addMedia = useCallback(async (mediaRow) => {
    const newRec = { id: genId('media'), ...mediaRow }
    setMedia((prev) => [newRec, ...prev])
    try {
      const { error } = await supabase.from('media').insert(toDbMedia(newRec))
      if (error) throw error
    } catch (err) {
      console.error('[sync] insert_media failed', err)
      enqueue({ type: 'insert_media', payload: newRec })
    }
    return newRec
  }, [enqueue])

  const deleteMedia = useCallback(async (id) => {
    let row = null
    setMedia((prev) => {
      row = prev.find((r) => r.id === id) || null
      return prev.filter((r) => r.id !== id)
    })
    try {
      if (row?.storagePath) await removeFromStorage(row.storagePath)
      if (row?.thumbnailPath) await removeFromStorage(row.thumbnailPath)
      const { error } = await supabase.from('media').delete().eq('id', id)
      if (error) throw error
    } catch (err) {
      console.error('[sync] delete_media failed', err)
      enqueue({ type: 'delete_media', id })
    }
  }, [enqueue])

  const clearSaveError = useCallback(() => setSaveError(null), [])

  const retryNow = useCallback(() => {
    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current)
      retryTimerRef.current = null
    }
    drainQueueRef.current?.()
  }, [])

  const clearQueue = useCallback(() => {
    saveQueue([])
    setQueueState([])
    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current)
      retryTimerRef.current = null
    }
  }, [])

  const state = {
    members,
    growthRecords,
    visionRecords,
    dentalRecords,
    matches,
    trainingSessions,
    trainingItems,
    media,
    activeMemberId,
    recorder,
    online,
    pendingCount: queue.length
  }

  return {
    state,
    saveError,
    clearSaveError,
    setActiveMember,
    setRecorder,
    updateMember,
    addGrowthRecord,
    updateGrowthRecord,
    deleteGrowthRecord,
    addVisionRecord,
    updateVisionRecord,
    deleteVisionRecord,
    addDentalRecord,
    updateDentalRecord,
    deleteDentalRecord,
    addMatch,
    updateMatch,
    deleteMatch,
    addTrainingSession,
    updateTrainingSession,
    deleteTrainingSession,
    addMedia,
    deleteMedia,
    retryNow,
    clearQueue
  }
}
