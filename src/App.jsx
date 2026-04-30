import { useState } from 'react'
import MemberSwitcher from './components/MemberSwitcher.jsx'
import MemberEditModal from './components/MemberEditModal.jsx'
import MacroNav from './shell/MacroNav.jsx'
import SubTabs from './shell/SubTabs.jsx'
import SyncBanner from './shell/SyncBanner.jsx'
import Dashboard from './components/Dashboard.jsx'
import MatchList from './components/MatchList.jsx'
import TrainingList from './components/TrainingList.jsx'
import TrainingSessionForm from './components/TrainingSessionForm.jsx'
import MatchForm from './components/MatchForm.jsx'
import GrowthList from './components/growth/GrowthList.jsx'
import GrowthForm from './components/growth/GrowthForm.jsx'
import GrowthCompareChart from './components/growth/GrowthCompareChart.jsx'
import VisionList from './components/vision/VisionList.jsx'
import VisionForm from './components/vision/VisionForm.jsx'
import VisionTrendChart from './components/vision/VisionTrendChart.jsx'
import { useAppState } from './hooks/useAppState.js'

const TITLES = {
  overview: { title: '雙寶紀錄', subtitle: '小孩們的成長與運動' },
  health: {
    growth: { title: '身高紀錄', subtitle: '記錄每一個長高的瞬間' },
    vision: { title: '視力紀錄', subtitle: '每次檢查都留下紀錄' },
    dental: { title: '牙齒紀錄', subtitle: '看牙醫的每次紀錄' }
  },
  sports: {
    matches: { title: '比賽紀錄', subtitle: '每一場都是經驗' },
    training: { title: '練習紀錄', subtitle: '把每天的努力留下來' }
  }
}

const HEALTH_TABS = [
  { key: 'growth', label: '成長' },
  { key: 'vision', label: '視力' },
  { key: 'dental', label: '牙齒' }
]
const SPORTS_TABS = [
  { key: 'matches', label: '比賽' },
  { key: 'training', label: '練習' }
]

const FAB_ACCENT = {
  growth: 'growth',
  vision: 'vision',
  dental: 'dental',
  matches: 'coral',
  training: 'amber'
}

const ADD_LABEL = {
  growth: '新增身高',
  vision: '新增視力',
  dental: '新增牙齒',
  matches: '新增比賽',
  training: '新增練習'
}

const PlaceholderHealth = ({ name }) => (
  <div className="px-5">
    <div className="glass rounded-ios p-8 text-center text-mute text-sm leading-relaxed">
      <p className="font-semibold text-ink mb-2">{name} 紀錄</p>
      <p>這個 domain 的功能會從原本的「身高紀錄」app 搬過來,在後續階段補上。</p>
    </div>
  </div>
)

export default function App() {
  const {
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
    addTrainingSession,
    updateTrainingSession,
    deleteTrainingSession,
    addMatch,
    updateMatch,
    deleteMatch,
    addMedia,
    deleteMedia,
    retryNow,
    clearQueue
  } = useAppState()

  const [macro, setMacro] = useState('overview')
  const [healthSub, setHealthSub] = useState('growth')
  const [sportsSub, setSportsSub] = useState('matches')
  const [showEdit, setShowEdit] = useState(false)
  const [growthDraft, setGrowthDraft] = useState(null)
  const [visionDraft, setVisionDraft] = useState(null)
  const [trainingDraft, setTrainingDraft] = useState(null)
  const [matchDraft, setMatchDraft] = useState(null)

  const activeMember =
    state.members.find((m) => m.id === state.activeMemberId) || state.members[0]
  const subTab = macro === 'health' ? healthSub : macro === 'sports' ? sportsSub : null
  const titleObj = subTab ? TITLES[macro][subTab] : TITLES.overview

  const fabAccent = subTab ? FAB_ACCENT[subTab] : 'amber'
  const showFab = macro !== 'overview'
  const addLabel = subTab ? ADD_LABEL[subTab] : '新增'

  const openNewGrowth = () => setGrowthDraft({ editing: null })
  const openEditGrowth = (record) => {
    setMacro('health')
    setHealthSub('growth')
    setGrowthDraft({ editing: record })
  }
  const closeGrowth = () => setGrowthDraft(null)

  const openNewVision = () => setVisionDraft({ editing: null })
  const openEditVision = (record) => {
    setMacro('health')
    setHealthSub('vision')
    setVisionDraft({ editing: record })
  }
  const closeVision = () => setVisionDraft(null)

  const openNewTraining = () => setTrainingDraft({ editing: null })
  const openEditTraining = (session) => {
    setMacro('sports')
    setSportsSub('training')
    setTrainingDraft({ editing: session })
  }
  const closeTraining = () => setTrainingDraft(null)

  const openNewMatch = () => setMatchDraft({ editing: null })
  const openEditMatch = (match) => {
    setMacro('sports')
    setSportsSub('matches')
    setMatchDraft({ editing: match })
  }
  const closeMatch = () => setMatchDraft(null)

  const handleAdd = () => {
    if (macro === 'sports') {
      if (sportsSub === 'matches') openNewMatch()
      else openNewTraining()
    } else if (macro === 'health') {
      if (healthSub === 'growth') openNewGrowth()
      else if (healthSub === 'vision') openNewVision()
      // 牙齒 還沒實作,後續階段補
    }
  }

  const saveTraining = async (memberId, session, items, mediaList = []) => {
    const saved = await addTrainingSession(memberId, session, items)
    for (const m of mediaList) {
      await addMedia({
        memberId,
        ownerType: 'training_session',
        ownerId: saved.id,
        ...m
      })
    }
  }

  const saveMatch = async (memberId, match, mediaList = []) => {
    const saved = await addMatch(memberId, match)
    for (const m of mediaList) {
      await addMedia({
        memberId,
        ownerType: 'match',
        ownerId: saved.id,
        ...m
      })
    }
  }

  const trainingItemsFor = (sessionId) =>
    state.trainingItems.filter((i) => i.sessionId === sessionId)
  const mediaForOwner = (ownerType, ownerId) =>
    state.media.filter((m) => m.ownerType === ownerType && m.ownerId === ownerId)

  return (
    <div className="min-h-full pb-44 bg-gradient-to-b from-cream via-cream to-warm/40">
      <div className="safe-top" />

      <SyncBanner state={state} retryNow={retryNow} clearQueue={clearQueue} />

      <header className="sticky top-0 z-20 bg-cream/80 backdrop-blur-ios border-b border-warm/40">
        <div className="max-w-md mx-auto">
          <div className="px-5 pt-4 pb-1">
            <h1 className="text-2xl font-bold tracking-tight">{titleObj.title}</h1>
            <p className="text-xs text-mute mt-0.5">{titleObj.subtitle}</p>
          </div>
          <MemberSwitcher
            members={state.members}
            activeId={activeMember?.id}
            onSelect={setActiveMember}
            onEdit={() => setShowEdit(true)}
          />
          {macro === 'health' && (
            <SubTabs items={HEALTH_TABS} active={healthSub} onChange={setHealthSub} />
          )}
          {macro === 'sports' && (
            <SubTabs items={SPORTS_TABS} active={sportsSub} onChange={setSportsSub} />
          )}
        </div>
      </header>

      <main className="max-w-md mx-auto pt-4">
        {activeMember && macro === 'overview' && (
          <Dashboard
            member={activeMember}
            matches={state.matches}
            sessions={state.trainingSessions}
            items={state.trainingItems}
            media={state.media}
            onJumpMatches={() => {
              setMacro('sports')
              setSportsSub('matches')
            }}
          />
        )}

        {activeMember && macro === 'health' && healthSub === 'growth' && (
          <>
            <GrowthList
              records={state.growthRecords}
              member={activeMember}
              onEdit={openEditGrowth}
              onDelete={deleteGrowthRecord}
            />
            {state.growthRecords.length >= 2 && (
              <GrowthCompareChart members={state.members} records={state.growthRecords} />
            )}
          </>
        )}
        {activeMember && macro === 'health' && healthSub === 'vision' && (
          <>
            <VisionList
              records={state.visionRecords}
              member={activeMember}
              onEdit={openEditVision}
              onDelete={deleteVisionRecord}
            />
            {state.visionRecords.filter((r) => r.memberId === activeMember.id).length >= 2 && (
              <VisionTrendChart records={state.visionRecords} member={activeMember} />
            )}
          </>
        )}
        {macro === 'health' && healthSub === 'dental' && <PlaceholderHealth name="牙齒" />}

        {activeMember && macro === 'sports' && sportsSub === 'matches' && (
          <MatchList
            matches={state.matches}
            media={state.media}
            member={activeMember}
            onEdit={openEditMatch}
            onDelete={(m) => deleteMatch(m.id)}
          />
        )}
        {activeMember && macro === 'sports' && sportsSub === 'training' && (
          <TrainingList
            sessions={state.trainingSessions}
            items={state.trainingItems}
            media={state.media}
            member={activeMember}
            onEdit={openEditTraining}
            onDelete={(s) => deleteTrainingSession(s.id)}
          />
        )}
      </main>

      <MacroNav
        macro={macro}
        onMacroChange={setMacro}
        onAdd={handleAdd}
        fabAccent={fabAccent}
        showFab={showFab}
        addLabel={addLabel}
      />

      <MemberEditModal
        open={showEdit}
        members={state.members}
        media={state.media}
        onClose={() => setShowEdit(false)}
        onSave={updateMember}
      />

      {activeMember && (
        <GrowthForm
          open={Boolean(growthDraft)}
          member={activeMember}
          recorder={state.recorder}
          initial={growthDraft?.editing || null}
          onRecorderChange={setRecorder}
          onClose={closeGrowth}
          onSave={addGrowthRecord}
          onUpdate={updateGrowthRecord}
        />
      )}

      {activeMember && (
        <VisionForm
          open={Boolean(visionDraft)}
          member={activeMember}
          recorder={state.recorder}
          initial={visionDraft?.editing || null}
          onRecorderChange={setRecorder}
          onClose={closeVision}
          onSave={addVisionRecord}
          onUpdate={updateVisionRecord}
        />
      )}

      {activeMember && (
        <TrainingSessionForm
          open={Boolean(trainingDraft)}
          member={activeMember}
          recorder={state.recorder}
          initial={trainingDraft?.editing || null}
          initialItems={
            trainingDraft?.editing ? trainingItemsFor(trainingDraft.editing.id) : []
          }
          initialMedia={
            trainingDraft?.editing
              ? mediaForOwner('training_session', trainingDraft.editing.id)
              : []
          }
          onClose={closeTraining}
          onSave={saveTraining}
          onUpdate={updateTrainingSession}
          onAddMedia={addMedia}
          onDeleteMedia={deleteMedia}
        />
      )}

      {activeMember && (
        <MatchForm
          open={Boolean(matchDraft)}
          member={activeMember}
          recorder={state.recorder}
          matches={state.matches}
          initial={matchDraft?.editing || null}
          initialMedia={
            matchDraft?.editing ? mediaForOwner('match', matchDraft.editing.id) : []
          }
          onClose={closeMatch}
          onSave={saveMatch}
          onUpdate={updateMatch}
          onAddMedia={addMedia}
          onDeleteMedia={deleteMedia}
        />
      )}

      {saveError && (
        <div
          className="fixed top-20 left-1/2 -translate-x-1/2 z-50 glass-strong rounded-ios px-4 py-3 max-w-xs text-sm text-coralDark border-coral/30 animate-fadeIn"
          onClick={clearSaveError}
        >
          {saveError}
        </div>
      )}
    </div>
  )
}
