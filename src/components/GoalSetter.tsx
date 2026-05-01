import { useState } from 'react'
import { Target, Calendar, CheckSquare, Plus, Trash2 } from 'lucide-react'
import { useIdentity } from '../hooks/useIdentityData'
import StepWrapper from './StepWrapper'

function GoalContent() {
  const { data, updateGoals } = useIdentity()
  const { goals } = data
  const [newDaily, setNewDaily] = useState('')

  const addDailyAction = () => {
    const trimmed = newDaily.trim()
    if (trimmed) {
      // 过滤掉空值，添加新行动
      const existingFiltered = goals.dailyActions.filter(a => a && a !== trimmed)
      updateGoals({ dailyActions: [...existingFiltered, trimmed] })
      setNewDaily('')
    }
  }

  const removeDailyAction = (index: number) => {
    const updated = goals.dailyActions.filter((_, i) => i !== index)
    updateGoals({ dailyActions: updated })
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex flex-col gap-3">
        {/* Year */}
        <div className="relative p-6 rounded-2xl bg-gradient-to-br from-violet-600/20 to-violet-900/10 border border-violet-500/30">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center flex-shrink-0">
              <Target className="w-6 h-6 text-violet-400" />
            </div>
            <div className="flex-1">
              <div className="text-violet-400 text-xs font-semibold uppercase tracking-wider mb-1">一年愿景目标</div>
              <div className="text-gray-400 text-xs mb-3">你想成为谁？以新身份的视角定义一年后的自己</div>
              <input type="text" value={goals.yearGoal} onChange={e => updateGoals({ yearGoal: e.target.value })}
                placeholder="例如：成为月入过万的独立内容创作者"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-gray-200 placeholder-gray-600 text-sm focus:outline-none focus:border-violet-500/50 transition-all" />
            </div>
          </div>
          <div className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 flex flex-col items-center">
            <div className="h-3 w-px bg-gradient-to-b from-violet-500/60 to-blue-500/60" />
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
          </div>
        </div>

        {/* Month */}
        <div className="relative p-6 rounded-2xl bg-gradient-to-br from-blue-600/20 to-blue-900/10 border border-blue-500/30">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
              <Calendar className="w-6 h-6 text-blue-400" />
            </div>
            <div className="flex-1">
              <div className="text-blue-400 text-xs font-semibold uppercase tracking-wider mb-1">本月能力项目</div>
              <div className="text-gray-400 text-xs mb-3">这个月要完成什么，来证明你正在成为那个人？</div>
              <input type="text" value={goals.monthProject} onChange={e => updateGoals({ monthProject: e.target.value })}
                placeholder="例如：完成10个短视频，发布第一个作品集"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-gray-200 placeholder-gray-600 text-sm focus:outline-none focus:border-blue-500/50 transition-all" />
            </div>
          </div>
          <div className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 flex flex-col items-center">
            <div className="h-3 w-px bg-gradient-to-b from-blue-500/60 to-emerald-500/60" />
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          </div>
        </div>

        {/* Daily */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-600/20 to-emerald-900/10 border border-emerald-500/30">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
              <CheckSquare className="w-6 h-6 text-emerald-400" />
            </div>
            <div className="flex-1">
              <div className="text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">每日行为锚点 <span className="text-emerald-500/60 font-normal normal-case tracking-normal">(可选)</span></div>
              <div className="text-gray-400 text-xs mb-4">当你是那个身份的人，每天会做什么？（无需自律，因为那是你本性）</div>
              <div className="space-y-2 mb-3">
                {goals.dailyActions.filter(a => a).map((action, i) => (
                  <div key={i} className="flex items-center gap-2 group">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                    <span className="text-gray-300 text-sm flex-1">{action}</span>
                    <button onClick={() => removeDailyAction(i)} className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition-all cursor-pointer">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input type="text" value={newDaily} onChange={e => setNewDaily(e.target.value)} onKeyDown={e => e.key === 'Enter' && addDailyAction()}
                  placeholder="例如：早起发一条内容..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-gray-200 placeholder-gray-600 text-sm focus:outline-none focus:border-emerald-500/50 transition-all" />
                <button onClick={addDailyAction} className="px-3 py-2.5 bg-emerald-600/30 border border-emerald-500/30 rounded-xl text-emerald-400 hover:bg-emerald-600/50 transition-all cursor-pointer">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Causality */}
      <div className="glass border border-white/8 rounded-2xl p-5 mt-6">
        <div className="flex items-start gap-4">
          <div className="flex flex-col items-center gap-1 flex-shrink-0 pt-1">
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-xs text-emerald-400 font-bold">日</div>
            <div className="h-5 w-px bg-white/10" />
            <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-xs text-blue-400 font-bold">月</div>
            <div className="h-5 w-px bg-white/10" />
            <div className="w-6 h-6 rounded-full bg-violet-500/20 flex items-center justify-center text-xs text-violet-400 font-bold">年</div>
          </div>
          <p className="text-gray-400 text-sm leading-relaxed">
            <span className="text-emerald-400 font-medium">每日行动</span>不是任务清单，而是新身份的自然表达。
            积累后证明了<span className="text-blue-400 font-medium">月度能力</span>，
            而月度能力的叠加让<span className="text-violet-400 font-medium">年度愿景</span>成为必然。
          </p>
        </div>
      </div>
    </div>
  )
}

export default function GoalSetter() {
  const { data, updateGoals } = useIdentity()
  const { goals } = data
  const hasDailyAction = goals.dailyActions.filter(a => a).length > 0
  const isComplete = !!(goals.yearGoal.trim() && goals.monthProject.trim())

  return (
    <StepWrapper
      stepNumber={3}
      title={<>三层<span className="gradient-text">目标金字塔</span></> as unknown as string}
      subtitle="目标不是为了证明自己，而是新身份的自然结果。三层目标形成因果链——每日行动积累月度项目，月度项目托举年度愿景。"
      badgeLabel="目标外化"
      badgeColor="emerald"
      canComplete={isComplete}
      onComplete={() => updateGoals({ completed: true })}
      completeLabel="确认目标，进入下一步"
      isCompleted={goals.completed}
    >
      <GoalContent />
    </StepWrapper>
  )
}
