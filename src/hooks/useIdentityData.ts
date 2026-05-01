import { useState, useEffect, createContext, useContext } from 'react'

export interface IdentityData {
  // Current step (0 = hero/intro, 1-7 = steps)
  currentStep: number
  unlockedStep: number // highest step unlocked

  selfExploration: {
    answers: string[]
    currentQuestion: number
    completed: boolean
  }
  antiVision: {
    oldIdentityLabel: string
    newIdentityLabel: string
    scenario: string
    time: string
    place: string
    emotion: string
    details: string
    selectedSide: 'old' | 'new' | null
    completed: boolean
  }
  goals: {
    yearGoal: string
    monthProject: string
    dailyActions: string[]
    completed: boolean
  }
  reminders: {
    times: string[]
    enabled: boolean
    questions: string[]
    completed: boolean
  }
  gamify: {
    risk: string
    victory: string
    mainQuest: string
    bossLevel: string
    dailyTasks: string[]
    rules: string[]
    completed: boolean
  }
}

const defaultData: IdentityData = {
  currentStep: 0,
  unlockedStep: 0,
  selfExploration: {
    answers: Array(7).fill(''),
    currentQuestion: 0,
    completed: false,
  },
  antiVision: {
    oldIdentityLabel: '',
    newIdentityLabel: '',
    scenario: '',
    time: '',
    place: '',
    emotion: '',
    details: '',
    selectedSide: null,
    completed: false,
  },
  goals: {
    yearGoal: '',
    monthProject: '',
    dailyActions: ['', '', ''],
    completed: false,
  },
  reminders: {
    times: ['07:00', '09:30', '12:00', '14:30', '17:00', '19:30', '22:00'],
    enabled: false,
    questions: [
      '我现在在逃避什么？',
      '我的行为在保护旧身份还是真实欲望？',
      '此刻我在扮演谁？',
      '我真正想要的是什么？',
      '恐惧在阻止我做什么？',
      '如果新身份的我会怎么做？',
      '今天哪个决定会让未来的我感谢现在的自己？',
    ],
    completed: false,
  },
  gamify: {
    risk: '',
    victory: '',
    mainQuest: '',
    bossLevel: '',
    dailyTasks: ['', '', ''],
    rules: ['', '', ''],
    completed: false,
  },
}

function loadData(): IdentityData {
  const saved = localStorage.getItem('identity-change-data-v2')
  if (saved) {
    try {
      const parsed = JSON.parse(saved)
      return { ...defaultData, ...parsed }
    } catch {
      return defaultData
    }
  }
  return defaultData
}

function saveData(data: IdentityData) {
  localStorage.setItem('identity-change-data-v2', JSON.stringify(data))
}

export interface IdentityContextType {
  data: IdentityData
  updateSelfExploration: (updates: Partial<IdentityData['selfExploration']>) => void
  updateAntiVision: (updates: Partial<IdentityData['antiVision']>) => void
  updateGoals: (updates: Partial<IdentityData['goals']>) => void
  updateReminders: (updates: Partial<IdentityData['reminders']>) => void
  updateGamify: (updates: Partial<IdentityData['gamify']>) => void
  goToStep: (step: number) => void
  advanceStep: () => void
  getProgress: () => number
  totalSteps: number
}

export const TOTAL_STEPS = 6 // steps 1-6 (hero is step 0)

export const IdentityContext = createContext<IdentityContextType | null>(null)

export function useIdentityData() {
  const [data, setData] = useState<IdentityData>(loadData)

  useEffect(() => {
    saveData(data)
  }, [data])

  const update = (section: keyof IdentityData, updates: object) => {
    setData(prev => ({
      ...prev,
      [section]: { ...(prev[section] as object), ...updates },
    }))
  }

  const goToStep = (step: number) => {
    setData(prev => ({ ...prev, currentStep: step }))
  }

  const advanceStep = () => {
    setData(prev => {
      const next = Math.min(prev.currentStep + 1, TOTAL_STEPS)
      return {
        ...prev,
        currentStep: next,
        unlockedStep: Math.max(prev.unlockedStep, next),
      }
    })
  }

  const getProgress = () => {
    let completed = 0
    if (data.selfExploration.completed) completed++
    if (data.antiVision.completed) completed++
    if (data.goals.completed) completed++
    if (data.reminders.completed) completed++
    if (data.gamify.completed) completed++
    return (completed / 5) * 100
  }

  return {
    data,
    updateSelfExploration: (updates: Partial<IdentityData['selfExploration']>) => update('selfExploration', updates),
    updateAntiVision: (updates: Partial<IdentityData['antiVision']>) => update('antiVision', updates),
    updateGoals: (updates: Partial<IdentityData['goals']>) => update('goals', updates),
    updateReminders: (updates: Partial<IdentityData['reminders']>) => update('reminders', updates),
    updateGamify: (updates: Partial<IdentityData['gamify']>) => update('gamify', updates),
    goToStep,
    advanceStep,
    getProgress,
    totalSteps: TOTAL_STEPS,
  }
}

export function useIdentity() {
  const ctx = useContext(IdentityContext)
  if (!ctx) throw new Error('useIdentity must be used within IdentityProvider')
  return ctx
}
