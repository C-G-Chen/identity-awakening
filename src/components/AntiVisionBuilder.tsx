import { useState } from 'react'
import { Shuffle, ChevronDown, CheckCircle2, Eye, Sparkles, Brain, Loader2 } from 'lucide-react'
import { useIdentity } from '../hooks/useIdentityData'
import StepWrapper from './StepWrapper'

const oldIdentityScenes = [
  {
    id: 'old-morning',
    title: '周二早晨 7:00',
    desc: '闹钟响了三次，还是挣扎着爬起来。脑子里飘过"今天真不想去上班"，随手刷着手机，拖延到最后一刻才出门。',
    emotion: '疲惫 · 逃避 · 麻木',
    image: '/scenes/old-morning.jpg',
    imagePlaceholder: 'https://placehold.co/600x340/1a1a2e/6b7280?text=旧身份：早晨',
  },
  {
    id: 'old-commute',
    title: '地铁上 8:30',
    desc: '挤在人群里，戴上耳机隔绝一切。刷着别人精彩的视频，心里涌起羡慕，但随即又压下去——那不是我能有的生活。',
    emotion: '羡慕 · 压抑 · 认命',
    image: '/scenes/old-commute.jpg',
    imagePlaceholder: 'https://placehold.co/600x340/1a1a2e/6b7280?text=旧身份：通勤',
  },
  {
    id: 'old-work',
    title: '办公室下午 3:00',
    desc: '又是一场没有意义的会议。你假装在做笔记，实际上在想"我还要在这里待多少年"。',
    emotion: '焦虑 · 无力 · 虚耗',
    image: '/scenes/old-work.jpg',
    imagePlaceholder: 'https://placehold.co/600x340/1a1a2e/6b7280?text=旧身份：工作',
  },
  {
    id: 'old-night',
    title: '深夜 11:30',
    desc: '躺在床上刷着短视频，告诉自己"明天再说"。这个"明天"已经重复了几百次了。',
    emotion: '空洞 · 拖延 · 自责',
    image: '/scenes/old-night.jpg',
    imagePlaceholder: 'https://placehold.co/600x340/1a1a2e/6b7280?text=旧身份：深夜',
  },
]

const newIdentityScenes = [
  {
    id: 'new-morning',
    title: '周二早晨 6:00',
    desc: '自然醒来，没有闹钟。脑子里已经在转今天要做的事。泡上咖啡，打开电脑——不是因为自律，而是因为你真的想做。',
    emotion: '清醒 · 期待 · 专注',
    image: '/scenes/new-morning.jpg',
    imagePlaceholder: 'https://placehold.co/600x340/1a1a2e/a855f7?text=新身份：早晨',
  },
  {
    id: 'new-work',
    title: '上午 9:00',
    desc: '坐在自己喜欢的地方，做自己设计的工作。没有人催你，没有无聊的会议。每一个小时都是在为愿景添砖加瓦。',
    emotion: '自主 · 心流 · 成就',
    image: '/scenes/new-work.jpg',
    imagePlaceholder: 'https://placehold.co/600x340/1a1a2e/a855f7?text=新身份：工作',
  },
  {
    id: 'new-growth',
    title: '下午 2:00',
    desc: '看着上个月的数据，第一次发现努力的反馈。不是巨大的成功，而是清晰的证明——你的选择在起效。',
    emotion: '证明 · 成长 · 确信',
    image: '/scenes/new-growth.jpg',
    imagePlaceholder: 'https://placehold.co/600x340/1a1a2e/a855f7?text=新身份：成长',
  },
  {
    id: 'new-evening',
    title: '傍晚 6:30',
    desc: '今天的工作收尾，不是因为到点了，而是真的完成了目标。感到充实，不是空洞。晚上的时间是真正的自由。',
    emotion: '充实 · 自由 · 平静',
    image: '/scenes/new-evening.jpg',
    imagePlaceholder: 'https://placehold.co/600x340/1a1a2e/a855f7?text=新身份：傍晚',
  },
]

type Scene = typeof oldIdentityScenes[0]

// 调用 AI 分析函数，根据用户数据生成旧身份描述
async function analyzeOldIdentity(
  selfExploration: string[],
  goals: { yearGoal: string; monthProject: string; dailyActions: string[] },
  gamify: { risk: string; mainQuest: string }
): Promise<{ oldLabel: string; newLabel: string } | null> {
  try {
    const response = await fetch('/.netlify/functions/ai-analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ selfExploration, goals, gamify }),
    })
    if (response.ok) {
      const data = await response.json()
      return data
    }
  } catch (err) {
    console.error('AI analysis failed:', err)
  }
  return null
}

function SceneCard({
  scene,
  isOld,
  isSelected,
  onToggle,
}: {
  scene: Scene
  isOld: boolean
  isSelected: boolean
  onToggle: () => void
}) {
  const [imgError, setImgError] = useState(false)
  return (
    <div
      onClick={onToggle}
      className={`relative rounded-2xl border overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.01] ${
        isSelected
          ? isOld
            ? 'border-red-400/70 shadow-xl shadow-red-900/30 scale-[1.02]'
            : 'border-violet-400/70 shadow-xl shadow-violet-900/30 scale-[1.02]'
          : isOld
            ? 'border-red-500/20 hover:border-red-500/40'
            : 'border-violet-500/20 hover:border-violet-500/40'
      } bg-white/3`}
    >
      <div className="relative w-full aspect-video overflow-hidden bg-white/5">
        <img
          src={imgError ? scene.imagePlaceholder : scene.image}
          onError={() => setImgError(true)}
          alt={scene.title}
          className="w-full h-full object-cover opacity-70 hover:opacity-90 transition-opacity duration-300"
        />
        <div className={`absolute inset-0 bg-gradient-to-t ${isOld ? 'from-background-DEFAULT via-background-DEFAULT/50' : 'from-background-DEFAULT via-background-DEFAULT/30'} to-transparent`} />
        {isSelected && (
          <div className={`absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${isOld ? 'bg-red-500/20 text-red-300' : 'bg-violet-500/20 text-violet-300'}`}>
            <CheckCircle2 className="w-3.5 h-3.5" />
            已选
          </div>
        )}
        <div className="absolute bottom-3 left-3">
          <div className="text-white font-semibold text-sm">{scene.title}</div>
          <div className={`text-xs mt-0.5 font-medium ${isOld ? 'text-red-400/80' : 'text-violet-400/80'}`}>{scene.emotion}</div>
        </div>
      </div>
      <div className="p-4">
        <p className="text-gray-400 text-sm leading-relaxed">{scene.desc}</p>
      </div>
    </div>
  )
}

function AntiVisionContent() {
  const { data, updateAntiVision } = useIdentity()
  const { antiVision } = data
  const [showForm, setShowForm] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [analyzeError, setAnalyzeError] = useState<string | null>(null)

  const hasOldSelected = antiVision.selectedOldScenes.length > 0
  const hasNewSelected = antiVision.selectedNewScenes.length > 0

  const toggleOldScene = (id: string) => {
    const next = antiVision.selectedOldScenes.includes(id)
      ? antiVision.selectedOldScenes.filter(s => s !== id)
      : [...antiVision.selectedOldScenes, id]
    updateAntiVision({ selectedOldScenes: next })
  }

  const toggleNewScene = (id: string) => {
    const next = antiVision.selectedNewScenes.includes(id)
      ? antiVision.selectedNewScenes.filter(s => s !== id)
      : [...antiVision.selectedNewScenes, id]
    updateAntiVision({ selectedNewScenes: next })
  }

  const handleAIAutoGenerate = async () => {
    setAnalyzing(true)
    setAnalyzeError(null)
    try {
      const result = await analyzeOldIdentity(
        data.selfExploration.answers,
        data.goals,
        data.gamify
      )
      if (result) {
        updateAntiVision({
          oldIdentityLabel: result.oldLabel,
          newIdentityLabel: result.newLabel,
        })
      } else {
        setAnalyzeError('AI 分析失败，请手动填写')
      }
    } catch {
      setAnalyzeError('AI 分析失败，请手动填写')
    }
    setAnalyzing(false)
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* AI Auto-generate banner */}
      {data.selfExploration.answers.some(a => a.trim()) && !antiVision.oldIdentityLabel && (
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <Brain className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <div className="text-white text-sm font-semibold">🤖 AI 智能分析可用</div>
                <div className="text-gray-400 text-xs">根据你在步骤1的回答，AI 可以自动生成旧身份描述</div>
              </div>
            </div>
            <button
              onClick={handleAIAutoGenerate}
              disabled={analyzing}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 rounded-xl text-white text-sm font-semibold hover:shadow-lg hover:shadow-amber-500/30 hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {analyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  AI 分析中...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  一键生成
                </>
              )}
            </button>
          </div>
          {analyzeError && (
            <p className="text-red-400 text-xs mt-2">{analyzeError}</p>
          )}
        </div>
      )}

      {/* Side-by-side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        {/* Old */}
        <div className={`rounded-3xl border overflow-hidden transition-all duration-500 ${hasOldSelected ? 'border-red-400/50 shadow-2xl shadow-red-900/20' : 'border-red-500/20'}`}>
          <div className={`p-5 ${hasOldSelected ? 'bg-red-950/40' : 'bg-red-950/20'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center text-lg">😔</div>
                <div>
                  <div className="text-red-400 text-xs font-semibold uppercase tracking-wider">
                    当前身份
                    {hasOldSelected && (
                      <span className="ml-2 text-red-300">({antiVision.selectedOldScenes.length}个场景)</span>
                    )}
                  </div>
                  <h3 className="text-white font-bold text-lg">{antiVision.oldIdentityLabel || '点击场景卡片选择...'}</h3>
                </div>
              </div>
              {hasOldSelected && (
                <div className="flex items-center gap-1.5 bg-red-500/20 text-red-300 text-xs font-semibold px-3 py-1.5 rounded-full">
                  <Eye className="w-3 h-3" />
                  已选择
                </div>
              )}
            </div>
          </div>
          <div className="p-4 bg-background-DEFAULT/50 space-y-3">
            {oldIdentityScenes.map(scene => (
              <SceneCard
                key={scene.id}
                scene={scene}
                isOld={true}
                isSelected={antiVision.selectedOldScenes.includes(scene.id)}
                onToggle={() => toggleOldScene(scene.id)}
              />
            ))}
          </div>
        </div>

        {/* VS divider mobile */}
        <div className="lg:hidden flex items-center justify-center">
          <div className="flex items-center gap-4">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-white/20" />
            <span className="text-gray-500 font-bold text-sm">OR</span>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-white/20" />
          </div>
        </div>

        {/* New */}
        <div className={`rounded-3xl border overflow-hidden transition-all duration-500 ${hasNewSelected ? 'border-violet-400/50 shadow-2xl shadow-violet-900/20' : 'border-violet-500/20'}`}>
          <div className={`p-5 ${hasNewSelected ? 'bg-violet-950/40' : 'bg-violet-950/20'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center text-lg">🚀</div>
                <div>
                  <div className="text-violet-400 text-xs font-semibold uppercase tracking-wider">
                    渴望身份
                    {hasNewSelected && (
                      <span className="ml-2 text-violet-300">({antiVision.selectedNewScenes.length}个场景)</span>
                    )}
                  </div>
                  <h3 className="text-white font-bold text-lg">{antiVision.newIdentityLabel || '点击场景卡片选择...'}</h3>
                </div>
              </div>
              {hasNewSelected && (
                <div className="flex items-center gap-1.5 bg-violet-500/20 text-violet-300 text-xs font-semibold px-3 py-1.5 rounded-full">
                  <Eye className="w-3 h-3" />
                  已选择
                </div>
              )}
            </div>
          </div>
          <div className="p-4 bg-background-DEFAULT/50 space-y-3">
            {newIdentityScenes.map(scene => (
              <SceneCard
                key={scene.id}
                scene={scene}
                isOld={false}
                isSelected={antiVision.selectedNewScenes.includes(scene.id)}
                onToggle={() => toggleNewScene(scene.id)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Hint for multi-select */}
      <div className="text-center mb-6">
        <p className="text-gray-500 text-xs">
          💡 可多选：同时选中多个场景，更全面地描述你的身份状态
        </p>
      </div>

      {/* Identity labels */}
      <div className="glass border border-white/8 rounded-3xl p-6 mb-6">
        <h4 className="text-white font-bold mb-1 flex items-center gap-2">
          <Shuffle className="w-5 h-5 text-violet-400" />
          定义你的两种身份
        </h4>
        <p className="text-gray-500 text-sm mb-5">用一句话写下你的旧身份和新身份标签</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-red-400 text-xs font-semibold uppercase tracking-wider mb-2">旧身份标签</label>
            <input
              type="text"
              value={antiVision.oldIdentityLabel}
              onChange={e => updateAntiVision({ oldIdentityLabel: e.target.value })}
              placeholder="例如：每天挣扎早起的打工人"
              className="w-full bg-red-950/20 border border-red-500/20 rounded-xl px-4 py-3 text-gray-200 placeholder-gray-600 text-sm focus:outline-none focus:border-red-400/50 transition-all duration-300"
            />
          </div>
          <div>
            <label className="block text-violet-400 text-xs font-semibold uppercase tracking-wider mb-2">新身份标签</label>
            <input
              type="text"
              value={antiVision.newIdentityLabel}
              onChange={e => updateAntiVision({ newIdentityLabel: e.target.value })}
              placeholder="例如：每天创作内容的独立创业者"
              className="w-full bg-violet-950/20 border border-violet-500/20 rounded-xl px-4 py-3 text-gray-200 placeholder-gray-600 text-sm focus:outline-none focus:border-violet-400/50 transition-all duration-300"
            />
          </div>
        </div>
      </div>

      {/* Anti-vision form */}
      <button
        onClick={() => setShowForm(!showForm)}
        className="w-full flex items-center justify-between p-5 glass border border-white/8 rounded-2xl text-left hover:bg-white/5 transition-all duration-300 cursor-pointer mb-4"
      >
        <div>
          <div className="text-white font-semibold">构建你的反愿景场景</div>
          <div className="text-gray-500 text-sm">写下五年后噩梦场景的具体细节，让恐惧成为驱动力</div>
        </div>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${showForm ? 'rotate-180' : ''}`} />
      </button>

      {showForm && (
        <div className="glass border border-white/8 rounded-2xl p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">时间节点</label>
              <input type="text" value={antiVision.time} onChange={e => updateAntiVision({ time: e.target.value })} placeholder="五年后的周二早晨 8:00"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-gray-200 placeholder-gray-600 text-sm focus:outline-none focus:border-violet-500/40 transition-all" />
            </div>
            <div>
              <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">场景地点</label>
              <input type="text" value={antiVision.place} onChange={e => updateAntiVision({ place: e.target.value })} placeholder="同一个格子间，同一张椅子"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-gray-200 placeholder-gray-600 text-sm focus:outline-none focus:border-violet-500/40 transition-all" />
            </div>
          </div>
          <div>
            <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">你的情绪感受</label>
            <input type="text" value={antiVision.emotion} onChange={e => updateAntiVision({ emotion: e.target.value })} placeholder="麻木、后悔、疲惫，感觉什么都没变"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-gray-200 placeholder-gray-600 text-sm focus:outline-none focus:border-violet-500/40 transition-all" />
          </div>
          <div>
            <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">你在保护的身份是什么？</label>
            <textarea value={antiVision.details} onChange={e => updateAntiVision({ details: e.target.value })} rows={3} placeholder="写下你一直在保护的旧身份..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-gray-200 placeholder-gray-600 text-sm focus:outline-none focus:border-violet-500/40 transition-all resize-none" />
          </div>
        </div>
      )}
    </div>
  )
}

export default function AntiVisionBuilder() {
  const { data, updateAntiVision } = useIdentity()
  const { antiVision } = data
  const hasOldSelected = antiVision.selectedOldScenes.length > 0
  const hasNewSelected = antiVision.selectedNewScenes.length > 0
  const canComplete = !!(hasOldSelected || hasNewSelected || (antiVision.oldIdentityLabel && antiVision.newIdentityLabel))

  return (
    <StepWrapper
      stepNumber={2}
      title={<><span className="text-red-400">旧身份</span><span className="text-gray-500 mx-3">vs</span><span className="gradient-text">新身份</span></> as unknown as string}
      subtitle="点击不同的生活场景，感受两种身份的真实重量。可以同时选择多个场景。你正在保护哪一个？你真正渴望哪一个？"
      badgeLabel="身份觉醒"
      badgeColor="violet"
      canComplete={canComplete}
      onComplete={() => updateAntiVision({ completed: true })}
      completeLabel="我看清了，进入下一步"
      isCompleted={antiVision.completed}
    >
      <AntiVisionContent />
    </StepWrapper>
  )
}
