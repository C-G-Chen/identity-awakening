import { Check, Lock } from 'lucide-react'
import { useIdentity, TOTAL_STEPS } from '../hooks/useIdentityData'

const STEP_INFO = [
  { label: '开始', short: '开始' },
  { label: '自我探索', short: '探索' },
  { label: '身份对比', short: '对比' },
  { label: '三层目标', short: '目标' },
  { label: '打断提醒', short: '提醒' },
  { label: '游戏化', short: '游戏' },
  { label: '身份宣言', short: '宣言' },
]

function isStepCompleted(data: ReturnType<typeof useIdentity>['data'], step: number): boolean {
  switch (step) {
    case 1: return data.selfExploration.completed
    case 2: return data.antiVision.completed
    case 3: return data.goals.completed
    case 4: return data.reminders.completed
    case 5: return data.gamify.completed
    default: return false
  }
}

export default function StepNav() {
  const { data, goToStep } = useIdentity()
  const { currentStep, unlockedStep } = data

  if (currentStep === 0) return null // Hide on hero

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background-DEFAULT/95 backdrop-blur-md border-b border-white/5">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-2">
        {/* Logo */}
        <button
          onClick={() => goToStep(0)}
          className="text-violet-400 font-black text-lg tracking-tight cursor-pointer hover:text-violet-300 transition-colors shrink-0"
        >
          ID↑
        </button>

        {/* Step pills */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map(step => {
            const isActive = currentStep === step
            const isCompleted = isStepCompleted(data, step)
            const isUnlocked = step <= unlockedStep
            const isLocked = !isUnlocked

            return (
              <button
                key={step}
                onClick={() => isUnlocked && goToStep(step)}
                disabled={isLocked}
                className={`
                  relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold
                  transition-all duration-300 shrink-0 cursor-pointer
                  ${isActive
                    ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30'
                    : isCompleted
                    ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600/30'
                    : isUnlocked
                    ? 'glass border border-white/10 text-gray-300 hover:text-white hover:bg-white/10'
                    : 'opacity-30 cursor-not-allowed glass border border-white/5 text-gray-600'
                  }
                `}
              >
                {isCompleted && !isActive ? (
                  <Check className="w-3 h-3" />
                ) : isLocked ? (
                  <Lock className="w-3 h-3" />
                ) : (
                  <span className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center text-[10px] leading-none">
                    {step}
                  </span>
                )}
                <span className="hidden sm:inline">{STEP_INFO[step].label}</span>
                <span className="sm:hidden">{STEP_INFO[step].short}</span>
              </button>
            )
          })}
        </div>

        {/* Progress */}
        <div className="shrink-0 text-xs text-gray-500 font-medium hidden md:block">
          {unlockedStep}/{TOTAL_STEPS}
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-0.5 bg-white/5">
        <div
          className="h-full bg-gradient-to-r from-violet-600 to-blue-600 transition-all duration-700"
          style={{ width: `${(unlockedStep / TOTAL_STEPS) * 100}%` }}
        />
      </div>
    </nav>
  )
}
