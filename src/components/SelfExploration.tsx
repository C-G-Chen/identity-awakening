import { useState } from 'react'
import { ChevronRight, ChevronLeft, CheckCircle2, MessageSquare } from 'lucide-react'
import { useIdentity } from '../hooks/useIdentityData'
import StepWrapper from './StepWrapper'

const questions = [
  {
    id: 0,
    label: '重复的抱怨',
    question: '你一直在抱怨却从未改变的事是什么？',
    hint: '你的抱怨暴露了你真正想要什么。那些反复出现的不满，是你内心渴望的镜像。',
    placeholder: '例如：总是抱怨工作无聊、薪资太低，却从未真正行动去改变...',
  },
  {
    id: 1,
    label: '行动的真相',
    question: '如果他人只看你的行为，他们会判断你想要什么样的生活？',
    hint: '行动比语言诚实。你每天的选择，正在默默描绘你真实想要的未来。',
    placeholder: '例如：我每天刷短视频到深夜，说明我渴望娱乐而非成就...',
  },
  {
    id: 2,
    label: '隐藏的真相',
    question: '有什么真相，你不敢对你尊重的人坦白承认？',
    hint: '我们最深的渴望，往往藏在羞于启齿的角落里。那是自我欺骗的防线。',
    placeholder: '例如：我一直想成为创业者，但在父母面前只敢说"稳定就好"...',
  },
  {
    id: 3,
    label: '机会成本',
    question: '选择"安全"的人生，你真正付出了什么代价？',
    hint: '安全感从来不是免费的。每一次选择稳定，都是在用另一种可能换取的。',
    placeholder: '例如：付出了创业的勇气、冒险的激情、还有别人眼中"有趣的人"的形象...',
  },
  {
    id: 4,
    label: '需要放弃的身份',
    question: '哪些"好身份"正在阻止你冒险和改变？',
    hint: '有些身份看似荣耀，却是枷锁。"负责任的员工""听话的孩子"——这些都是代价。',
    placeholder: '例如：需要放弃"稳定的职场人"身份，才能成为"敢于创业的人"...',
  },
  {
    id: 5,
    label: '真实的动机',
    question: '你改变的最丢人的真实原因是什么？',
    hint: '直面你最羞耻的动机——嫉妒、虚荣、恐惧被抛下。承认它，才能利用它。',
    placeholder: '例如：我想赚大钱，说实话是因为嫉妒同学比我过得好，我想证明自己...',
  },
  {
    id: 6,
    label: '保护的代价',
    question: '你最竭力保护的东西是什么？这种保护让你付出了什么？',
    hint: '保护"不失败"的形象，代价是永远不成功。你在守护什么幻觉？',
    placeholder: '例如：我拼命保护"聪明人"的形象，导致我从不敢开始任何可能失败的事...',
  },
]

function SelfExplorationContent() {
  const { data, updateSelfExploration } = useIdentity()
  const { answers, currentQuestion, completed } = data.selfExploration
  const [animating, setAnimating] = useState(false)
  const [direction, setDirection] = useState<'next' | 'prev'>('next')

  const goTo = (index: number, dir: 'next' | 'prev') => {
    setDirection(dir)
    setAnimating(true)
    setTimeout(() => {
      updateSelfExploration({ currentQuestion: index })
      setAnimating(false)
    }, 180)
  }

  const handleAnswer = (value: string) => {
    const newAnswers = [...answers]
    newAnswers[currentQuestion] = value
    updateSelfExploration({ answers: newAnswers })
  }

  const filledCount = answers.filter(a => a.trim().length > 0).length
  const current = questions[currentQuestion]

  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress dots */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {questions.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i, i > currentQuestion ? 'next' : 'prev')}
            className={`transition-all duration-300 rounded-full cursor-pointer ${
              i === currentQuestion
                ? 'w-8 h-2.5 bg-violet-500'
                : answers[i]
                ? 'w-2.5 h-2.5 bg-violet-500/60'
                : 'w-2.5 h-2.5 bg-white/15 hover:bg-white/30'
            }`}
          />
        ))}
      </div>

      {/* Question card */}
      <div className={`glass border border-white/8 rounded-3xl p-8 sm:p-10 mb-6 transition-all duration-180 ${
        animating
          ? direction === 'next' ? 'opacity-0 translate-x-4' : 'opacity-0 -translate-x-4'
          : 'opacity-100 translate-x-0'
      }`}>
        <div className="flex items-start justify-between mb-6">
          <div>
            <span className="text-violet-400 text-sm font-semibold uppercase tracking-widest">
              问题 {currentQuestion + 1} / {questions.length}
            </span>
            <div className="mt-1 text-xs text-gray-500 font-medium">{current.label}</div>
          </div>
          {answers[currentQuestion]?.trim() && (
            <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-medium">
              <CheckCircle2 className="w-4 h-4" />
              已回答
            </div>
          )}
        </div>

        <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4 leading-tight">
          {current.question}
        </h3>

        <div className="flex items-start gap-3 p-4 rounded-xl bg-violet-600/10 border border-violet-500/15 mb-6">
          <div className="w-5 h-5 rounded-full bg-violet-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-violet-400 text-xs font-bold">→</span>
          </div>
          <p className="text-gray-400 text-sm leading-relaxed">{current.hint}</p>
        </div>

        <textarea
          value={answers[currentQuestion]}
          onChange={e => handleAnswer(e.target.value)}
          placeholder={current.placeholder}
          rows={4}
          className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-gray-200 placeholder-gray-600 text-sm leading-relaxed focus:outline-none focus:border-violet-500/50 focus:bg-white/8 transition-all duration-300 resize-none"
        />
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => currentQuestion > 0 && goTo(currentQuestion - 1, 'prev')}
          disabled={currentQuestion === 0}
          className="flex items-center gap-2 px-5 py-2.5 glass border border-white/10 rounded-full text-gray-400 text-sm font-medium hover:text-white hover:bg-white/10 transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          上一题
        </button>

        <div className="text-sm text-gray-500">
          已完成 <span className="text-violet-400 font-semibold">{filledCount}</span> / 7 题
        </div>

        {currentQuestion < questions.length - 1 ? (
          <button
            onClick={() => goTo(currentQuestion + 1, 'next')}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-blue-600 rounded-full text-white text-sm font-semibold hover:shadow-lg hover:shadow-violet-500/30 hover:scale-105 transition-all duration-300 cursor-pointer"
          >
            下一题
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <div className="text-sm text-gray-500 italic">填写完毕后点击下方按钮</div>
        )}
      </div>

      {/* Insight summary if completed */}
      {completed && filledCount > 0 && (
        <div className="p-6 rounded-2xl bg-gradient-to-br from-violet-600/10 to-blue-600/10 border border-violet-500/20">
          <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            你的探索洞见
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {questions.map((q, i) =>
              answers[i]?.trim() ? (
                <div key={i} className="p-3 bg-white/5 rounded-xl">
                  <div className="text-violet-400 text-xs font-semibold mb-1">{q.label}</div>
                  <p className="text-gray-300 text-xs leading-relaxed line-clamp-2">{answers[i]}</p>
                </div>
              ) : null
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function SelfExploration() {
  const { data, updateSelfExploration } = useIdentity()
  const { answers, completed } = data.selfExploration
  const filledCount = answers.filter(a => a.trim().length > 0).length

  return (
    <StepWrapper
      stepNumber={1}
      title={<>7 个<span className="gradient-text">扎心问题</span></>  as unknown as string}
      subtitle="这些问题没有标准答案。越诚实，越有力量。你的回答会成为身份改变的基石。"
      badgeLabel="自我探索"
      badgeColor="violet"
      canComplete={filledCount >= 3}
      onComplete={() => updateSelfExploration({ completed: true })}
      completeLabel={filledCount >= 7 ? '完成全部探索，进入下一步' : `已填 ${filledCount}/7 题，继续下一步`}
      isCompleted={completed}
    >
      <SelfExplorationContent />
    </StepWrapper>
  )
}
