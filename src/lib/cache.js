const KEYS = {
  members: 'sports-record:cache:members',
  matches: 'sports-record:cache:matches',
  trainingSessions: 'sports-record:cache:trainingSessions',
  trainingItems: 'sports-record:cache:trainingItems',
  media: 'sports-record:cache:media',
  growthRecords: 'sports-record:cache:growthRecords',
  visionRecords: 'sports-record:cache:visionRecords',
  dentalRecords: 'sports-record:cache:dentalRecords',
  queue: 'sports-record:cache:queue'
}

const safeRead = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

const safeWrite = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

export const loadCachedMembers = () => safeRead(KEYS.members, [])
export const saveCachedMembers = (arr) => safeWrite(KEYS.members, arr)
export const loadCachedMatches = () => safeRead(KEYS.matches, [])
export const saveCachedMatches = (arr) => safeWrite(KEYS.matches, arr)
export const loadCachedTrainingSessions = () => safeRead(KEYS.trainingSessions, [])
export const saveCachedTrainingSessions = (arr) => safeWrite(KEYS.trainingSessions, arr)
export const loadCachedTrainingItems = () => safeRead(KEYS.trainingItems, [])
export const saveCachedTrainingItems = (arr) => safeWrite(KEYS.trainingItems, arr)
export const loadCachedMedia = () => safeRead(KEYS.media, [])
export const saveCachedMedia = (arr) => safeWrite(KEYS.media, arr)
export const loadCachedGrowthRecords = () => safeRead(KEYS.growthRecords, [])
export const saveCachedGrowthRecords = (arr) => safeWrite(KEYS.growthRecords, arr)
export const loadCachedVisionRecords = () => safeRead(KEYS.visionRecords, [])
export const saveCachedVisionRecords = (arr) => safeWrite(KEYS.visionRecords, arr)
export const loadCachedDentalRecords = () => safeRead(KEYS.dentalRecords, [])
export const saveCachedDentalRecords = (arr) => safeWrite(KEYS.dentalRecords, arr)
export const loadQueue = () => safeRead(KEYS.queue, [])
export const saveQueue = (arr) => safeWrite(KEYS.queue, arr)
