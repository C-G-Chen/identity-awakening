import { useEffect, useState } from 'react'
import { ArrowRight, Brain, Shield, Zap } from 'lucide-react'
import { useIdentity } from '../hooks/useIdentityData'

const concepts = [
  {
    icon: Brain,
    title: '身份 > 行为',
    desc: '你失败不是因为懒惰，而是你还没成为那个版本的自己。',
    color: 'from-violet-600/20 to-violet-900/10',
    border: 'border-violet-500/20',
    iconColor: 'text-violet-400',
  },
  {
    icon: Shield,
    title: '大脑在保护你',
    desc: '潜意识把"过时的身份"当珍宝守护。每次改变受阻，都是旧身份在战斗。',
    color: 'from-blue-600/20 to-blue-900/10',
    border: 'border-blue-500/20',
    iconColor: 'text-blue-400',
  },
  {
    icon: Zap,
    title: '一天就能开始',
    desc: '改变的开关是"看清自己在保护不想要的身份"这一认知。一旦看见，改变就已发生。',
    color: 'from-purple-600/20 to-purple-900/10',
    border: 'border-purple-500/20',
    iconColor: 'text-purple-400',
  },
]

const STEPS_PREVIEW = [
  { num: 1, label: '自我探索', desc: '7个扎心问题，挖掘隐藏动机' },
  { num: 2, label: '身份对比', desc: '构建旧vs新身份的反愿景' },
  { num: 3, label: '三层目标', desc: '年度 / 月度 / 每日目标金字塔' },
  { num: 4, label: '打断提醒', desc: '7个时间点打破自动驾驶模式' },
  { num: 5, label: '游戏化', desc: '把人生变成一场有规则的游戏' },
  { num: 6, label: '身份宣言', desc: '导出你的全新身份宣言' },
]

export default function HeroSection() {
  const [visible, setVisible] = useState(false)
  const { advanceStep, data } = useIdentity()

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80)
    return () => clearTimeout(t)
  }, [])

  const handleStart = () => {
    advanceStep() // goes to step 1
  }

  const hasPriorProgress = data.unlockedStep > 0

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-4 sm:px-6 py-20">
      {/* Ambient */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1.5s' }} />
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `linear-gradient(rgba(124,58,237,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.5) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }} />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto w-full">
        {/* Hero text */}
        <div className="text-center mb-16">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-violet-500/30 text-violet-300 text-sm font-medium mb-8 transition-all duration-1000 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
            Dan Koe · 1.7亿阅读量核心方法论
          </div>

          <h1 className={`text-5xl sm:text-6xl md:text-7xl font-black leading-none mb-6 transition-all duration-1000 delay-200 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <span className="text-white">你不是</span>
            <br />
            <span className="gradient-text text-glow">意志力不足</span>
            <br />
            <span className="text-white">你只是</span>
            <span className="gradient-text"> 还是旧身份</span>
          </h1>

          <p className={`text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed transition-all duration-1000 delay-400 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            多数人改变失败，不是因为自律不够，而是大脑在保护"过时的身份"。
            今天，你只需做一件事——
            <span className="text-white font-semibold">看清你在保护什么。</span>
          </p>

          {/* CTA */}
          <div className={`flex flex-col sm:flex-row items-center justify-center gap-4 transition-all duration-1000 delay-600 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <button
              onClick={handleStart}
              className="group relative px-10 py-4 bg-gradient-to-r from-violet-600 to-blue-600 rounded-full text-white font-bold text-lg hover:shadow-2xl hover:shadow-violet-500/40 transition-all duration-300 hover:scale-105 cursor-pointer overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                {hasPriorProgress ? '继续我的旅程' : '开始身份觉醒'}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
          </div>
        </div>

        {/* Concept cards */}
        <div className={`grid grid-cols-1 sm:grid-cols-3 gap-4 mb-16 transition-all duration-1000 delay-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
          {concepts.map(({ icon: Icon, title, desc, color, border, iconColor }) => (
            <div key={title} className={`p-6 rounded-2xl bg-gradient-to-b ${color} border ${border} text-left`}>
              <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-4 ${iconColor}`}>
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white mb-2">{title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        {/* Steps preview */}
        <div className={`transition-all duration-1000 delay-[800ms] ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
          <p className="text-center text-gray-500 text-sm font-medium uppercase tracking-widest mb-6">你将经历的 6 步旅程</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {STEPS_PREVIEW.map(({ num, label, desc }) => (
              <div key={num} className="flex flex-col items-center text-center p-4 glass border border-white/5 rounded-2xl gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600/30 to-blue-600/30 border border-violet-500/30 flex items-center justify-center text-violet-400 text-xs font-black">
                  {num}
                </div>
                <div className="text-white text-xs font-semibold">{label}</div>
                <div className="text-gray-500 text-[10px] leading-relaxed">{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
