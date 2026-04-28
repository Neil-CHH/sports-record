import { useState } from 'react'
import { CloudOff, RefreshCw } from 'lucide-react'
import MemberSwitcher from './components/MemberSwitcher.jsx'
import MemberEditModal from './components/MemberEditModal.jsx'
import BottomTabBar from './components/BottomTabBar.jsx'
import Dashboard from './components/Dashboard.jsx'
import MatchList from './components/MatchList.jsx'
import TrainingList from './components/TrainingList.jsx'
import TrainingSessionForm from './components/TrainingSessionForm.jsx'
import MatchForm from './components/MatchForm.jsx'
import { useAppState } from './hooks/useAppState.js'

const TITLES = {
  dashboard: { title: '雙寶運動紀錄', subtitle: '今天練得怎麼樣?' },
  matches: { title: '比賽紀錄', subtitle: '每一場都是經驗' },
  training: { title: '練習紀錄', subtitle: '把每天的努力留下來' }
}

const ADD_LABELS = {
  dashboard: '新增紀錄',
  matches: '新增比賽',
  training: '新增練習'
}

export default function App() {
  const {
    state,
    saveError,
    clearSaveError,
    setActiveMember,
    updateMember,
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

  const [tab, setTab] = useState('dashboard')
  const [showEdit, setShowEdit] = useState(false)
  const [trainingDraft, setTrainingDraft] = useState(null) // { editing?: session }
  const [matchDraft, setMatchDraft] = useState(null)

  const activeMember =
    state.members.find((m) => m.id === state.activeMemberId) || state.members[0]
  const showSyncBanner = !state.online || state.pendingCount > 0

  const openNewTraining = () => setTrainingDraft({ editing: null })
  const openEditTraining = (session) => setTrainingDraft({ editing: session })
  const closeTraining = () => setTrainingDraft(null)

  const openNewMatch = () => setMatchDraft({ editing: null })
  const openEditMatch = (match) => setMatchDraft({ editing: match })
  const closeMatch = () => setMatchDraft(null)

  const handleAdd = () => {
    if (tab === 'matches') openNewMatch()
    else if (tab === 'training') openNewTraining()
    else setTab('training')
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

      {showSyncBanner && (
        <button
          type="button"
          onClick={state.online && state.pendingCount > 0 ? retryNow : undefined}
          onContextMenu={(e) => {
            if (state.pendingCount === 0) return
            e.preventDefault()
            if (window.confirm(`要捨棄 ${state.pendingCount} 筆待同步紀錄嗎?(只清前端 queue,已同步的雲端資料不受影響)`)) {
              clearQueue()
            }
          }}
          className={`w-full px-5 py-2 text-xs flex items-center justify-center gap-2 ${
            !state.online ? 'bg-warm text-ink/80' : 'bg-amber/20 text-coralDark'
          }`}
        >
          {!state.online ? (
            <>
              <CloudOff className="w-3.5 h-3.5" />
              <span>
                離線模式
                {state.pendingCount > 0 ? ` · ${state.pendingCount} 筆待同步` : ''}
              </span>
            </>
          ) : (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>同步中 · 還有 {state.pendingCount} 筆 · 點此重試</span>
            </>
          )}
        </button>
      )}

      <header className="sticky top-0 z-20 bg-cream/80 backdrop-blur-ios border-b border-warm/40">
        <div className="max-w-md mx-auto">
          <div className="px-5 pt-4 pb-1">
            <h1 className="text-2xl font-bold tracking-tight">{TITLES[tab].title}</h1>
            <p className="text-xs text-mute mt-0.5">{TITLES[tab].subtitle}</p>
          </div>
          <MemberSwitcher
            members={state.members}
            activeId={activeMember?.id}
            onSelect={setActiveMember}
            onEdit={() => setShowEdit(true)}
          />
        </div>
      </header>

      <main className="max-w-md mx-auto pt-4">
        {activeMember && tab === 'dashboard' && (
          <Dashboard
            member={activeMember}
            matches={state.matches}
            sessions={state.trainingSessions}
            items={state.trainingItems}
            media={state.media}
            onJumpMatches={() => setTab('matches')}
          />
        )}
        {activeMember && tab === 'matches' && (
          <MatchList
            matches={state.matches}
            media={state.media}
            member={activeMember}
            onEdit={openEditMatch}
            onDelete={(m) => deleteMatch(m.id)}
          />
        )}
        {activeMember && tab === 'training' && (
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

      <BottomTabBar
        tab={tab}
        onTabChange={setTab}
        onAdd={handleAdd}
        addLabel={ADD_LABELS[tab]}
      />

      <MemberEditModal
        open={showEdit}
        members={state.members}
        onClose={() => setShowEdit(false)}
        onSave={updateMember}
      />

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
