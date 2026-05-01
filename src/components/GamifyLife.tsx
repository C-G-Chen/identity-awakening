import { useState } from 'react'
import { Gamepad2, Swords, Trophy, Map, Star, Shield, BookOpen, CheckCircle2, Plus, Trash2 } from 'lucide-react'
import { useIdentity } from '../hooks/useIdentityData'
import StepWrapper from './StepWrapper'

const gameElements = [
  { key: 'risk', icon: Swords, title: '明确风险', subtitle: '(反愿景)', desc: '如果你不改变，五年后会失去什么？', placeholder: '具体描述你最恐惧的未来...', color: 'from-red-600/20 to-red-900/10', border: 'border-red-500/25', iconColor: 'text-red-400', inputBorder: 'focus:border-red-500/50', type: 'textarea' as const },
  { key: 'victory', icon: Trophy, title: '清晰胜利条件', subtitle: '(愿景)', desc: '你怎么知道自己赢了？定义成功的具体样子', placeholder: '一年后，如果你成功了，那时的生活是什么样子...', color: 'from-amber-600/20 to-amber-900/10', border: 'border-amber-500/25', iconColor: 'text-amber-400', inputBorder: 'focus:border-amber-500/50', type: 'textarea' as const },
  { key: 'mainQuest', icon: Map, title: '主线任务', subtitle: '(年度目标)', desc: '这一年最核心的一件事是什么？', placeholder: '例如：建立一个月收入过万的内容业务...', color: 'from-violet-600/20 to-violet-900/10', border: 'border-violet-500/25', iconColor: 'text-violet-400', inputBorder: 'focus:border-violet-500/50', type: 'input' as const },
  { key: 'bossLevel', icon: Star, title: 'Boss 战', subtitle: '(月度项目)', desc: '这个月要突破的最难挑战是什么？', placeholder: '例如：发布第一个爆款视频，完成第一笔付费...', color: 'from-blue-600/20 to-blue-900/10', border: 'border-blue-500/25', iconColor: 'text-blue-400', inputBorder: 'focus:border-blue-500/50', type: 'input' as const },
]

function GamifyContent() {
  const { data, updateGamify } = useIdentity()
  const { gamify } = data
  const [newDailyTask, setNewDailyTask] = useState('')
  const [newRule, setNewRule] = useState('')

  const addDailyTask = () => { if (newDailyTask.trim()) { updateGamify({ dailyTasks: [...gamify.dailyTasks.filter(t => t), newDailyTask.trim()] }); setNewDailyTask('') } }
  const removeDailyTask = (i: number) => updateGamify({ dailyTasks: gamify.dailyTasks.filter((_, idx) => idx !== i) })
  const addRule = () => { if (newRule.trim()) { updateGamify({ rules: [...gamify.rules.filter(r => r), newRule.trim()] }); setNewRule('') } }
  const removeRule = (i: number) => updateGamify({ rules: gamify.rules.filter((_, idx) => idx !== i) })

  const filledCount = [gamify.risk, gamify.victory, gamify.mainQuest, gamify.bossLevel].filter(v => v?.trim()).length
    + (gamify.dailyTasks.filter(t => t).length > 0 ? 1 : 0)
    + (gamify.rules.filter(r => r).length > 0 ? 1 : 0)
  const gameProgress = Math.round((filledCount / 6) * 100)

  return (
    <div className="max-w-5xl mx-auto">
      {/* Progress */}
      <div className="glass border border-white/8 rounded-2xl p-4 mb-6 flex items-center gap-4">
        <Gamepad2 className="w-5 h-5 text-amber-400 flex-shrink-0" />
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">游戏设计进度</span>
            <span className="text-sm font-bold text-amber-400">{gameProgress}%</span>
          </div>
          <div className="h-2 bg-white/8 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 rounded-full transition-all duration-700" style={{ width: `${gameProgress}%` }} />
          </div>
        </div>
        <div className="text-xs text-gray-500">{filledCount}/6 要素</div>
      </div>

      {/* 4 main elements */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        {gameElements.map(({ key, icon: Icon, title, subtitle, desc, placeholder, color, border, iconColor, inputBorder, type }) => (
          <div key={key} className={`p-5 rounded-2xl bg-gradient-to-br ${color} border ${border}`}>
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-9 h-9 rounded-xl bg-white/8 flex items-center justify-center ${iconColor}`}><Icon className="w-4 h-4" /></div>
              <div>
                <div className="text-white font-semibold text-sm">{title}</div>
                <div className="text-gray-500 text-xs">{subtitle}</div>
              </div>
            </div>
            <p className="text-gray-500 text-xs mb-3">{desc}</p>
            {type === 'textarea' ? (
              <textarea value={(gamify as unknown as Record<string, string>)[key]} onChange={e => updateGamify({ [key]: e.target.value })} placeholder={placeholder} rows={3}
                className={`w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-gray-200 placeholder-gray-600 text-sm focus:outline-none ${inputBorder} transition-all resize-none`} />
            ) : (
              <input type="text" value={(gamify as unknown as Record<string, string>)[key]} onChange={e => updateGamify({ [key]: e.target.value })} placeholder={placeholder}
                className={`w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-gray-200 placeholder-gray-600 text-sm focus:outline-none ${inputBorder} transition-all`} />
            )}
          </div>
        ))}
      </div>

      {/* Daily + Rules */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-600/20 to-emerald-900/10 border border-emerald-500/25">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-white/8 flex items-center justify-center text-emerald-400"><CheckCircle2 className="w-4 h-4" /></div>
            <div><div className="text-white font-semibold text-sm">日常任务</div><div className="text-gray-500 text-xs">(每日清单)</div></div>
          </div>
          <div className="space-y-2 mb-3">
            {gamify.dailyTasks.filter(t => t).map((task, i) => (
              <div key={i} className="flex items-center gap-2 group">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                <span className="text-gray-300 text-sm flex-1">{task}</span>
                <button onClick={() => removeDailyTask(i)} className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition-all cursor-pointer"><Trash2 className="w-3 h-3" /></button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input type="text" value={newDailyTask} onChange={e => setNewDailyTask(e.target.value)} onKeyDown={e => e.key === 'Enter' && addDailyTask()} placeholder="添加日常任务..."
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-gray-200 placeholder-gray-600 text-sm focus:outline-none focus:border-emerald-500/50 transition-all" />
            <button onClick={addDailyTask} className="px-3 py-2.5 bg-emerald-600/30 border border-emerald-500/30 rounded-xl text-emerald-400 hover:bg-emerald-600/50 transition-all cursor-pointer"><Plus className="w-4 h-4" /></button>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-600/20 to-purple-900/10 border border-purple-500/25">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-white/8 flex items-center justify-center text-purple-400"><Shield className="w-4 h-4" /></div>
            <div><div className="text-white font-semibold text-sm">游戏规则</div><div className="text-gray-500 text-xs">(自我约束)</div></div>
          </div>
          <div className="space-y-2 mb-3">
            {gamify.rules.filter(r => r).map((rule, i) => (
              <div key={i} className="flex items-center gap-2 group">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-400 flex-shrink-0" />
                <span className="text-gray-300 text-sm flex-1">{rule}</span>
                <button onClick={() => removeRule(i)} className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition-all cursor-pointer"><Trash2 className="w-3 h-3" /></button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input type="text" value={newRule} onChange={e => setNewRule(e.target.value)} onKeyDown={e => e.key === 'Enter' && addRule()} placeholder="例如：先创作再刷手机..."
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-gray-200 placeholder-gray-600 text-sm focus:outline-none focus:border-purple-500/50 transition-all" />
            <button onClick={addRule} className="px-3 py-2.5 bg-purple-600/30 border border-purple-500/30 rounded-xl text-purple-400 hover:bg-purple-600/50 transition-all cursor-pointer"><Plus className="w-4 h-4" /></button>
          </div>
        </div>
      </div>

      <div className="glass border border-white/8 rounded-2xl p-4 flex items-center gap-4">
        <BookOpen className="w-5 h-5 text-gray-400 flex-shrink-0" />
        <p className="text-gray-500 text-sm leading-relaxed">
          游戏让人<span className="text-white">痴迷</span>，因为它把复杂的挑战拆解为清晰的规则和即时反馈。
          你的人生游戏设计得越清晰，你就越难以逃离它的吸引力——这种吸引力，指向的是成长本身。
        </p>
      </div>
    </div>
  )
}

export default function GamifyLife() {
  const { data, updateGamify } = useIdentity()
  const { gamify } = data
  const filledCount = [gamify.risk, gamify.victory, gamify.mainQuest, gamify.bossLevel].filter(v => v?.trim()).length
  const canComplete = filledCount >= 2

  return (
    <StepWrapper
      stepNumber={5}
      title={<>把人生变成<span className="gradient-text">游戏</span></> as unknown as string}
      subtitle="游戏让人痴迷，因为它有明确的规则、风险和胜利条件。用同样的框架设计你的人生——改变就会像玩游戏一样自然。"
      badgeLabel="游戏化人生"
      badgeColor="orange"
      canComplete={canComplete}
      onComplete={() => updateGamify({ completed: true })}
      completeLabel="游戏设计完成，生成身份宣言"
      isCompleted={gamify.completed}
    >
      <GamifyContent />
    </StepWrapper>
  )
}
