import { useEffect, useRef, useState, type ReactNode } from 'react'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { useIdentity } from '../hooks/useIdentityData'

interface StepWrapperProps {
  stepNumber: number
  title: string
  subtitle: string
  badgeLabel: string
  badgeColor?: string
  children: ReactNode
  canComplete: boolean
  onComplete?: () => void
  completeLabel?: string
  isCompleted?: boolean
  /** If true, skip the wrapper's own complete button (step manages it internally) */
  hideCompleteButton?: boolean
}

export default function StepWrapper({
  stepNumber,
  title,
  subtitle,
  badgeLabel,
  badgeColor = 'violet',
  children,
  canComplete,
  onComplete,
  completeLabel = '完成，进入下一步',
  isCompleted = false,
  hideCompleteButton = false,
}: StepWrapperProps) {
  const { advanceStep, data } = useIdentity()
  const { currentStep } = data
  const isActive = currentStep === stepNumber

  const [visible, setVisible] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const prevStep = useRef(currentStep)

  useEffect(() => {
    if (isActive) {
      setVisible(false)
      setLeaving(false)
      const t = setTimeout(() => setVisible(true), 60)
      return () => clearTimeout(t)
    } else {
      if (prevStep.current === stepNumber) {
        setLeaving(true)
      }
    }
    prevStep.current = currentStep
  }, [isActive, stepNumber, currentStep])

  if (!isActive) return null

  const colorMap: Record<string, { badge: string; button: string; glow: string }> = {
    violet: {
      badge: 'border-violet-500/30 text-violet-300',
      button: 'from-violet-600 to-blue-600 shadow-violet-500/30',
      glow: 'bg-violet-600/5',
    },
    blue: {
      badge: 'border-blue-500/30 text-blue-300',
      button: 'from-blue-600 to-cyan-600 shadow-blue-500/30',
      glow: 'bg-blue-600/5',
    },
    emerald: {
      badge: 'border-emerald-500/30 text-emerald-300',
      button: 'from-emerald-600 to-teal-600 shadow-emerald-500/30',
      glow: 'bg-emerald-600/5',
    },
    orange: {
      badge: 'border-orange-500/30 text-orange-300',
      button: 'from-orange-600 to-amber-600 shadow-orange-500/30',
      glow: 'bg-orange-600/5',
    },
    purple: {
      badge: 'border-purple-500/30 text-purple-300',
      button: 'from-purple-600 to-pink-600 shadow-purple-500/30',
      glow: 'bg-purple-600/5',
    },
  }

  const colors = colorMap[badgeColor] || colorMap.violet

  const handleComplete = () => {
    if (onComplete) onComplete()
    advanceStep()
  }

  return (
    <section
      className={`
        min-h-screen flex flex-col pt-16 pb-8 px-4 sm:px-6
        transition-all duration-500
        ${visible && !leaving ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
      `}
    >
      <div className="max-w-4xl mx-auto w-full flex flex-col flex-1">
        {/* Step header */}
        <div className="text-center py-10 sm:py-14">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full glass border ${colors.badge} text-sm font-medium mb-5`}>
            <span className="opacity-60">步骤 {stepNumber} / 6</span>
            <span className="w-1 h-1 rounded-full bg-current opacity-40" />
            <span>{badgeLabel}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
            {title}
          </h2>
          <p className="text-gray-400 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Content */}
        <div className="flex-1">
          {children}
        </div>

        {/* Complete button */}
        {!hideCompleteButton && (
          <div className="pt-10 pb-4 flex justify-center">
            {isCompleted ? (
              <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-emerald-600/15 border border-emerald-500/30 text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-semibold text-sm">此步骤已完成</span>
                <button
                  onClick={() => advanceStep()}
                  className="ml-2 text-xs text-emerald-300 underline underline-offset-2 hover:no-underline cursor-pointer"
                >
                  继续 →
                </button>
              </div>
            ) : (
              <button
                onClick={handleComplete}
                disabled={!canComplete}
                className={`
                  group flex items-center gap-2 px-8 py-4 rounded-full text-white font-bold text-base
                  bg-gradient-to-r ${colors.button}
                  hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer
                  disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none
                `}
              >
                {completeLabel}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
