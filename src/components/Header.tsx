import { useState, useEffect } from 'react'
import { Brain, Target, Eye, AlarmClock, Gamepad2, FileText, Menu, X } from 'lucide-react'
import { useIdentity } from '../hooks/useIdentityData'

const navItems = [
  { id: 'hero', label: '理念', icon: Brain },
  { id: 'self-exploration', label: '自我探索', icon: Eye },
  { id: 'anti-vision', label: '身份对比', icon: Target },
  { id: 'goal-setter', label: '三层目标', icon: Target },
  { id: 'interrupt-reminder', label: '打断提醒', icon: AlarmClock },
  { id: 'gamify-life', label: '游戏化', icon: Gamepad2 },
  { id: 'manifesto', label: '身份宣言', icon: FileText },
]

export default function Header() {
  const { getProgress } = useIdentity()
  const [scrolled, setScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState('hero')
  const [mobileOpen, setMobileOpen] = useState(false)
  const progress = getProgress()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
      const sections = navItems.map(item => document.getElementById(item.id))
      const current = sections.find(section => {
        if (!section) return false
        const rect = section.getBoundingClientRect()
        return rect.top <= 100 && rect.bottom >= 100
      })
      if (current) setActiveSection(current.id)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    setMobileOpen(false)
  }

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? 'glass-dark shadow-2xl' : 'bg-transparent'
        }`}
      >
        {/* Progress bar */}
        <div className="h-0.5 w-full bg-white/5">
          <div
            className="h-full bg-gradient-to-r from-violet-600 via-purple-500 to-blue-500 transition-all duration-700"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => scrollTo('hero')}>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-blue-500 flex items-center justify-center glow-purple">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-sm gradient-text hidden sm:block">IDENTITY SHIFT</span>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 cursor-pointer ${
                  activeSection === id
                    ? 'bg-violet-600/30 text-violet-300 border border-violet-500/40'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                }`}
              >
                <Icon className="w-3 h-3" />
                {label}
              </button>
            ))}
          </nav>

          {/* Progress indicator + mobile menu */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="text-xs text-gray-500">进度</div>
              <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-violet-500 to-blue-500 rounded-full transition-all duration-700"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="text-xs font-medium text-violet-400">{Math.round(progress)}%</div>
            </div>
            <button
              className="md:hidden p-2 text-gray-400 hover:text-white cursor-pointer"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <div className="md:hidden glass-dark border-t border-white/5 px-4 py-3">
            <div className="flex flex-col gap-1">
              {navItems.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => scrollTo(id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 cursor-pointer ${
                    activeSection === id
                      ? 'bg-violet-600/30 text-violet-300'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>
    </>
  )
}
