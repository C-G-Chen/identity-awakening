import { useRef, useState, useEffect } from 'react'
import { FileText, Download, Star, PartyPopper, Sparkles, Clock, Zap, RefreshCw, Brain } from 'lucide-react'
import { useIdentity } from '../hooks/useIdentityData'
import StepWrapper from './StepWrapper'

// AI生成的对比图片
type Stage = 'analyzing' | 'input' | 'enhancing' | 'confirm' | 'generating' | 'done' | 'error'

interface FuturePreview {
  stage: Stage
  oldIdentity: string | null   // 最终图片 URL
  newIdentity: string | null
  error: string | null
  oldInput: string            // 旧身份标签（简短，用于图片）
  newInput: string            // 新身份标签（简短，用于图片）
  oldDescription: string       // 旧身份详细描述
  newDescription: string       // 新身份详细描述
  oldEnhanced: string         // AI 润色后的旧身份提示词
  newEnhanced: string         // AI 润色后的新身份提示词
}

// 收集用户数据，调用 ai-analyze 生成新旧身份描述
async function analyzeIdentity(
  selfExploration: string[],
  goals: { yearGoal: string; monthProject: string; dailyActions: string[] },
  gamify: { risk: string; victory: string; mainQuest: string }
): Promise<{ oldLabel: string; newLabel: string; oldDescription: string; newDescription: string } | null> {
  try {
    const response = await fetch('/.netlify/functions/ai-analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        selfExploration,
        goals: {
          yearGoal: goals.yearGoal,
          monthProject: goals.monthProject,
          dailyActions: goals.dailyActions,
        },
        gamify: {
          risk: gamify.risk,
          victory: gamify.victory,
          mainQuest: gamify.mainQuest,
        },
      }),
    })
    if (response.ok) {
      const data = await response.json()
      if (data.oldLabel && data.newLabel) {
        return {
          oldLabel: data.oldLabel,
          newLabel: data.newLabel,
          oldDescription: data.oldDescription || '',
          newDescription: data.newDescription || '',
        }
      }
    }
  } catch (err) {
    console.error('AI analysis failed:', err)
  }
  return null
}

// 调用 Netlify Function 润色提示词
async function enhancePrompt(text: string, type: 'old' | 'new'): Promise<string> {
  try {
    const response = await fetch('/.netlify/functions/hunyuan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, type })
    })
    
    const data = await response.json()
    if (data.error) {
      console.error('Enhancement API error:', data.error)
      return text // 失败时用原文
    }
    return data.enhanced || text
  } catch (error) {
    console.error('Enhancement failed:', error)
    return text
  }
}

// 调用图片生成API
async function generateImage(prompt: string): Promise<string | null> {
  try {
    const encodedPrompt = encodeURIComponent(prompt)
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true`
    return imageUrl
  } catch (err) {
    console.error('Image generation failed:', err)
    return null
  }
}

function ManifestoContent() {
  const { data, updateAntiVision } = useIdentity()
  const manifestoRef = useRef<HTMLDivElement>(null)
  const hasAutoAnalyzed = useRef(false) // 防止重复调用

  // 分阶段状态机：
  // analyizing → AI 正在分析用户数据
  // input → 用户输入新旧身份文本
  // enhancing → AI 正在润色
  // confirm → 展示润色结果，等待用户确认
  // generatng → 正在生成图片
  // done → 图片已生成
  // error → 出错
  const [preview, setPreview] = useState<FuturePreview>({
    stage: 'analyzing', // 初始为分析状态
    oldIdentity: null,
    newIdentity: null,
    error: null,
    oldInput: '',
    newInput: '',
    oldDescription: '',
    newDescription: '',
    oldEnhanced: '',
    newEnhanced: '',
  })

  // 组件加载时，自动分析用户已填写的内容
  useEffect(() => {
    // 防止重复调用
    if (hasAutoAnalyzed.current) return
    hasAutoAnalyzed.current = true

    const runAnalysis = async () => {
      // 检查用户是否有填写内容
      const hasData =
        data.selfExploration.answers.some(a => a.trim()) ||
        data.goals.yearGoal ||
        data.goals.monthProject ||
        data.gamify.risk ||
        data.gamify.victory

      if (!hasData) {
        // 没有数据，直接进入输入状态
        setPreview(prev => ({ ...prev, stage: 'input' }))
        return
      }

      try {
        const result = await analyzeIdentity(
          data.selfExploration.answers,
          { yearGoal: data.goals.yearGoal, monthProject: data.goals.monthProject, dailyActions: data.goals.dailyActions },
          { risk: data.gamify.risk, victory: data.gamify.victory, mainQuest: data.gamify.mainQuest }
        )

        if (result) {
          setPreview(prev => ({
            ...prev,
            stage: 'input',
            oldInput: result.oldLabel,
            newInput: result.newLabel,
            oldDescription: result.oldDescription,
            newDescription: result.newDescription,
          }))
          // 同时保存到 antiVision
          updateAntiVision({
            oldIdentityLabel: result.oldLabel,
            newIdentityLabel: result.newLabel,
            oldDescription: result.oldDescription,
            newDescription: result.newDescription,
          })
        } else {
          // AI 分析失败，使用基础描述
          const fallbackOld = data.antiVision.oldIdentityLabel || data.gamify.risk || '困在现状的人'
          const fallbackNew = data.antiVision.newIdentityLabel || data.gamify.victory || data.goals.yearGoal || '理想中的自己'
          const fallbackOldDesc = data.antiVision.oldDescription || data.gamify.risk || ''
          const fallbackNewDesc = data.antiVision.newDescription || data.gamify.victory || data.goals.yearGoal || ''
          setPreview(prev => ({
            ...prev,
            stage: 'input',
            oldInput: fallbackOld,
            newInput: fallbackNew,
            oldDescription: fallbackOldDesc,
            newDescription: fallbackNewDesc,
          }))
        }
      } catch {
        setPreview(prev => ({ ...prev, stage: 'input' }))
      }
    }

    runAnalysis()
  }, []) // 只在组件挂载时执行一次

  const handleExport = async () => {
    const jsPDF = (await import('jspdf')).default
    const html2canvas = (await import('html2canvas')).default
    if (!manifestoRef.current) return
    const canvas = await html2canvas(manifestoRef.current, { backgroundColor: '#0A0A0F', scale: 2, useCORS: true })
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
    pdf.save('我的身份宣言.pdf')
  }

  // 阶段1：用户输入完毕，点击"AI 润色"
  const handleEnhance = async () => {
    setPreview(prev => ({ ...prev, stage: 'enhancing', error: null }))
    try {
      const [enhancedOld, enhancedNew] = await Promise.all([
        enhancePrompt(preview.oldInput, 'old'),
        enhancePrompt(preview.newInput, 'new'),
      ])
      updateAntiVision({
        oldIdentityLabel: preview.oldEnhanced || preview.oldInput,
        newIdentityLabel: preview.newEnhanced || preview.newInput,
        oldDescription: preview.oldDescription,
        newDescription: preview.newDescription,
      })
      setPreview(prev => ({
        ...prev,
        stage: 'confirm',
        oldEnhanced: enhancedOld,
        newEnhanced: enhancedNew,
      }))
    } catch {
      setPreview(prev => ({ ...prev, stage: 'error', error: 'AI 润色失败，请重试' }))
    }
  }

  // 阶段2：用户确认润色结果，生成图片
  const handleConfirmAndGenerate = async () => {
    setPreview(prev => ({ ...prev, stage: 'generating', error: null }))
    try {
      const oldPrompt = `Cinematic photo, ${preview.oldEnhanced}, 5 years in the future, sitting at desk looking at phone with regret, dimly lit room, grey tones, depressed atmosphere, photorealistic`
      const newPrompt = `Cinematic photo, ${preview.newEnhanced}, 5 years in the future, standing proudly in beautiful space, warm golden lighting, thriving atmosphere, photorealistic`
      const [oldImg, newImg] = await Promise.all([
        generateImage(oldPrompt),
        generateImage(newPrompt),
      ])
      setPreview(prev => ({ ...prev, stage: 'done', oldIdentity: oldImg, newIdentity: newImg }))
    } catch {
      setPreview(prev => ({ ...prev, stage: 'error', error: '图片生成失败，请重试' }))
    }
  }

  // 重置到输入阶段
  const handleReset = () => {
    setPreview(prev => ({
      ...prev,
      stage: 'input',
      oldIdentity: null,
      newIdentity: null,
      error: null,
      oldEnhanced: '',
      newEnhanced: '',
      // 保留用户已编辑的内容
    }))
  }

  // 重新生成图片（基于已有润色结果）
  const handleRegenerate = async () => {
    setPreview(prev => ({ ...prev, stage: 'generating', error: null }))
    try {
      const oldPrompt = `Cinematic photo, ${preview.oldEnhanced}, 5 years in the future, sitting at desk looking at phone with regret, dimly lit room, grey tones, depressed atmosphere, photorealistic`
      const newPrompt = `Cinematic photo, ${preview.newEnhanced}, 5 years in the future, standing proudly in beautiful space, warm golden lighting, thriving atmosphere, photorealistic`
      const [oldImg, newImg] = await Promise.all([
        generateImage(oldPrompt),
        generateImage(newPrompt),
      ])
      setPreview(prev => ({ ...prev, stage: 'done', oldIdentity: oldImg, newIdentity: newImg }))
    } catch {
      setPreview(prev => ({ ...prev, stage: 'error', error: '图片生成失败，请重试' }))
    }
  }

  const today = new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
  const fiveYearsLater = new Date(Date.now() + 5 * 365 * 24 * 60 * 60 * 1000).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div className="max-w-4xl mx-auto">
      {/* Celebration banner */}
      <div className="flex items-center justify-center gap-3 mb-8 p-5 rounded-2xl bg-gradient-to-br from-violet-600/15 to-blue-600/15 border border-violet-500/20">
        <PartyPopper className="w-6 h-6 text-violet-400" />
        <div className="text-center">
          <div className="text-white font-bold text-lg">恭喜完成身份觉醒之旅！</div>
          <div className="text-gray-400 text-sm">这是你今天所有觉醒的总结。把它打印出来，贴在你能每天看见的地方。</div>
        </div>
        <PartyPopper className="w-6 h-6 text-blue-400 scale-x-[-1]" />
      </div>

      {/* 五年后对比预览 - AI 润色版 */}
      <div className="mb-10 p-6 rounded-3xl bg-gradient-to-br from-slate-900/80 to-slate-800/50 border border-slate-600/30">
        <div className="flex items-center justify-center gap-3 mb-6">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <h3 className="text-xl font-bold text-white">🚀 五年后人生对比</h3>
          <Sparkles className="w-5 h-5 text-amber-400" />
        </div>

        <p className="text-center text-gray-400 text-sm mb-6">
          AI 深度理解你的愿景，生成两条人生道路的五年后对比
        </p>

        {/* 分析状态：AI 正在读取用户数据 */}
        {preview.stage === 'analyzing' && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="relative w-20 h-20 mb-6">
              <div className="absolute inset-0 border-4 border-violet-500/20 rounded-full" />
              <div className="absolute inset-0 border-4 border-transparent border-t-violet-500 rounded-full animate-spin" />
              <div className="absolute inset-3 border-4 border-transparent border-t-blue-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
              <div className="absolute inset-6 border-4 border-transparent border-t-amber-500 rounded-full animate-spin" style={{ animationDuration: '2s' }} />
            </div>
            <p className="text-gray-200 text-base font-medium mb-1">🧠 AI 正在分析你的数据...</p>
            <p className="text-gray-500 text-xs">读取你的自我探索、目标与愿景</p>
          </div>
        )}

        {/* 阶段一：输入新旧身份文本 */}
        {preview.stage === 'input' && (
          <div className="space-y-6">
            <p className="text-center text-gray-400 text-sm">
              AI 已根据你的回答生成了新旧身份的描述，你可以直接使用或修改
            </p>

            {/* 旧身份输入 */}
            <div className="p-5 rounded-2xl bg-red-500/5 border border-red-500/20">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-red-400" />
                <span className="text-red-400 text-sm font-semibold">旧身份</span>
                <span className="text-gray-600 text-xs">（你想要改变的那个身份）</span>
              </div>

              {/* 简短标签 */}
              <div className="mb-3">
                <label className="text-gray-500 text-xs mb-1 block">身份标签（用于图片标题）</label>
                <input
                  type="text"
                  value={preview.oldInput}
                  onChange={e => setPreview(prev => ({ ...prev, oldInput: e.target.value }))}
                  placeholder="例如：困在不喜欢的工作里的人"
                  className="w-full bg-slate-800/60 border border-red-500/20 rounded-xl px-4 py-2.5 text-gray-200 text-sm placeholder-gray-600 focus:outline-none focus:border-red-500/50 transition-colors"
                />
              </div>

              {/* 详细描述 */}
              <div>
                <label className="text-gray-500 text-xs mb-1 block">详细描述（生活/情绪/人际/财务/作息）</label>
                <textarea
                  value={preview.oldDescription}
                  onChange={e => setPreview(prev => ({ ...prev, oldDescription: e.target.value }))}
                  placeholder="AI 已生成详细描述，你可以修改..."
                  rows={5}
                  className="w-full bg-slate-800/60 border border-red-500/20 rounded-xl px-4 py-3 text-gray-200 text-sm placeholder-gray-600 resize-none focus:outline-none focus:border-red-500/50 transition-colors"
                />
              </div>
            </div>

            {/* 新身份输入 */}
            <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-emerald-400 text-sm font-semibold">新身份</span>
                <span className="text-gray-600 text-xs">（你想要成为的那个人）</span>
              </div>

              {/* 简短标签 */}
              <div className="mb-3">
                <label className="text-gray-500 text-xs mb-1 block">身份标签（用于图片标题）</label>
                <input
                  type="text"
                  value={preview.newInput}
                  onChange={e => setPreview(prev => ({ ...prev, newInput: e.target.value }))}
                  placeholder="例如：自由职业者，做着热爱的事业"
                  className="w-full bg-slate-800/60 border border-emerald-500/20 rounded-xl px-4 py-2.5 text-gray-200 text-sm placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 transition-colors"
                />
              </div>

              {/* 详细描述 */}
              <div>
                <label className="text-gray-500 text-xs mb-1 block">详细描述（生活/情绪/人际/财务/作息）</label>
                <textarea
                  value={preview.newDescription}
                  onChange={e => setPreview(prev => ({ ...prev, newDescription: e.target.value }))}
                  placeholder="AI 已生成详细描述，你可以修改..."
                  rows={5}
                  className="w-full bg-slate-800/60 border border-emerald-500/20 rounded-xl px-4 py-3 text-gray-200 text-sm placeholder-gray-600 resize-none focus:outline-none focus:border-emerald-500/50 transition-colors"
                />
              </div>
            </div>

            {/* 提交按钮 */}
            <div className="flex justify-center">
              <button
                onClick={handleEnhance}
                disabled={!preview.oldInput.trim() || !preview.newInput.trim()}
                className="group px-10 py-5 bg-gradient-to-r from-violet-600 via-purple-600 to-blue-600 rounded-2xl text-white font-bold hover:shadow-2xl hover:shadow-violet-500/50 hover:scale-105 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 cursor-pointer"
              >
                <span className="flex items-center gap-3">
                  <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                  <span className="text-lg">让 AI 润色标签</span>
                </span>
              </button>
            </div>
          </div>
        )}

        {/* 阶段二：展示润色结果，等待确认 */}
        {preview.stage === 'confirm' && (
          <div className="space-y-6">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <p className="text-gray-200 text-sm font-medium">🤖 AI 已完成润色，请确认</p>
              <Sparkles className="w-5 h-5 text-amber-400" />
            </div>

            {/* 旧身份润色结果 */}
            <div className="p-5 rounded-2xl bg-red-500/5 border border-red-500/20">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-red-400" />
                <span className="text-red-400 text-sm font-semibold">旧身份</span>
              </div>
              <div className="bg-slate-800/40 rounded-xl p-4 space-y-3">
                <div>
                  <span className="text-gray-500 text-xs">✨ 身份标签：</span>
                  <p className="text-gray-200 text-sm mt-0.5">{preview.oldEnhanced}</p>
                </div>
                {preview.oldDescription && (
                  <div>
                    <span className="text-gray-500 text-xs">📋 详细描述：</span>
                    <p className="text-gray-300 text-xs mt-1 whitespace-pre-line leading-relaxed">{preview.oldDescription}</p>
                  </div>
                )}
              </div>
            </div>

            {/* 新身份润色结果 */}
            <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-emerald-400 text-sm font-semibold">新身份</span>
              </div>
              <div className="bg-slate-800/40 rounded-xl p-4 space-y-3">
                <div>
                  <span className="text-gray-500 text-xs">✨ 身份标签：</span>
                  <p className="text-gray-200 text-sm mt-0.5">{preview.newEnhanced}</p>
                </div>
                {preview.newDescription && (
                  <div>
                    <span className="text-gray-500 text-xs">📋 详细描述：</span>
                    <p className="text-gray-300 text-xs mt-1 whitespace-pre-line leading-relaxed">{preview.newDescription}</p>
                  </div>
                )}
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={handleConfirmAndGenerate}
                className="group px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl text-white font-bold hover:shadow-2xl hover:shadow-emerald-500/40 hover:scale-105 transition-all cursor-pointer"
              >
                <span className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5" />
                  <span>确认并生成对比图</span>
                </span>
              </button>
              <button
                onClick={handleReset}
                className="px-6 py-3 text-gray-500 text-sm hover:text-gray-300 transition-colors cursor-pointer"
              >
                重新编辑
              </button>
            </div>
          </div>
        )}

        {/* 阶段三：AI 润色中 */}
        {preview.stage === 'enhancing' && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="relative w-20 h-20 mb-6">
              <div className="absolute inset-0 border-4 border-violet-500/20 rounded-full" />
              <div className="absolute inset-0 border-4 border-transparent border-t-violet-500 rounded-full animate-spin" />
              <div className="absolute inset-3 border-4 border-transparent border-t-blue-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
              <div className="absolute inset-6 border-4 border-transparent border-t-amber-500 rounded-full animate-spin" style={{ animationDuration: '2s' }} />
            </div>
            <p className="text-gray-200 text-base font-medium mb-1">🤖 AI 正在润色你的描述...</p>
            <p className="text-gray-500 text-xs">将你的想法转化为精准的视觉描述</p>
          </div>
        )}

        {/* 阶段四：生成图片中 */}
        {preview.stage === 'generating' && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="relative w-16 h-16 mb-4">
              <div className="absolute inset-0 border-4 border-violet-500/20 rounded-full" />
              <div className="absolute inset-0 border-4 border-transparent border-t-violet-500 rounded-full animate-spin" />
              <div className="absolute inset-2 border-4 border-transparent border-t-blue-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
            </div>
            <p className="text-gray-300 text-sm font-medium mb-1">AI 正在生成对比图...</p>
            <p className="text-gray-500 text-xs">这可能需要 10-20 秒</p>
          </div>
        )}

        {/* 错误状态 */}
        {preview.stage === 'error' && (
          <div className="text-center py-8">
            <p className="text-red-400 text-sm mb-4">{preview.error}</p>
            <div className="flex justify-center gap-3">
              <button
                onClick={preview.oldEnhanced ? handleRegenerate : handleEnhance}
                className="px-6 py-3 bg-violet-600/50 border border-violet-500/30 rounded-full text-white text-sm hover:bg-violet-600/70 transition-all cursor-pointer"
              >
                重新尝试
              </button>
              <button
                onClick={handleReset}
                className="px-6 py-3 text-gray-500 text-sm hover:text-gray-300 transition-colors cursor-pointer"
              >
                返回编辑
              </button>
            </div>
          </div>
        )}

        {/* 阶段五：图片已生成 */}
        {preview.stage === 'done' && (
          <div className="space-y-6">
            {/* 时间标签 */}
            <div className="flex items-center justify-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-gray-500">{fiveYearsLater}</span>
            </div>

            {/* 对比图 */}
            <div className="grid grid-cols-2 gap-4">
              {/* 旧身份 */}
              <div className="relative group overflow-hidden rounded-2xl">
                <img
                  src={preview.oldIdentity || ''}
                  alt="如果继续旧身份"
                  className="w-full aspect-square object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {/* 渐变遮罩 */}
                <div className="absolute inset-0 bg-gradient-to-t from-red-900/90 via-red-900/20 to-transparent" />
                {/* 标签 */}
                <div className="absolute top-3 left-3 z-10">
                  <span className="px-3 py-1 bg-red-500/90 backdrop-blur rounded-full text-white text-xs font-bold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    停滞路线
                  </span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-red-200 text-xs mb-1">如果你继续</p>
                  <p className="text-white font-bold text-lg leading-tight">{preview.oldInput || data.antiVision.oldIdentityLabel || '旧身份'}</p>
                </div>
              </div>

              {/* 新身份 */}
              <div className="relative group overflow-hidden rounded-2xl">
                <img
                  src={preview.newIdentity || ''}
                  alt="如果成为新身份"
                  className="w-full aspect-square object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {/* 渐变遮罩 */}
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/80 via-emerald-900/10 to-transparent" />
                {/* 标签 */}
                <div className="absolute top-3 left-3 z-10">
                  <span className="px-3 py-1 bg-emerald-500/90 backdrop-blur rounded-full text-white text-xs font-bold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    觉醒路线
                  </span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-emerald-200 text-xs mb-1">如果你成为</p>
                  <p className="text-white font-bold text-lg leading-tight">{preview.newInput || data.antiVision.newIdentityLabel || '新身份'}</p>
                </div>
              </div>
            </div>

            {/* 洞察语句 */}
            <div className="flex items-center justify-center gap-4 p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20">
              <Zap className="w-5 h-5 text-amber-400 flex-shrink-0" />
              <p className="text-gray-300 text-sm text-center">
                每一天的选择，都在决定你属于左边还是右边。
                <span className="text-white font-semibold ml-1">今天，你选哪边？</span>
              </p>
            </div>

            {/* 重新生成按钮 */}
            <div className="flex justify-center gap-3">
              <button
                onClick={handleRegenerate}
                className="text-gray-500 text-xs hover:text-gray-300 transition-colors cursor-pointer flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                重新生成
              </button>
              <button
                onClick={handleReset}
                className="text-gray-500 text-xs hover:text-gray-300 transition-colors cursor-pointer flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10"
              >
                重新编辑
              </button>
            </div>
          </div>
        )}

        {/* 洞察语句 */}
      <div
        ref={manifestoRef}
        className="glass border border-violet-500/20 rounded-3xl p-8 mb-8"
        style={{ background: 'linear-gradient(135deg, #0d0d1a 0%, #111128 50%, #0a0a15 100%)' }}
      >
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-violet-500/40" />
          <Star className="w-5 h-5 text-violet-400" />
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-violet-500/40" />
        </div>

        <div className="text-center mb-10">
          <div className="text-violet-400 text-xs font-semibold uppercase tracking-widest mb-2">身份宣言书</div>
          <div className="text-gray-500 text-sm">{today}</div>
        </div>

        <div className="mb-8 text-center">
          <p className="text-gray-400 text-sm mb-2">我正在告别</p>
          <h3 className="text-2xl font-bold text-red-400/80 mb-4">{data.antiVision.oldIdentityLabel || '过去的旧身份'}</h3>
          <div className="flex items-center justify-center gap-3 my-4">
            <div className="h-px w-12 bg-white/10" />
            <span className="text-gray-600 text-sm">成为</span>
            <div className="h-px w-12 bg-white/10" />
          </div>
          <h3 className="text-2xl font-bold gradient-text">{data.antiVision.newIdentityLabel || '全新的自己'}</h3>
        </div>

        <div className="space-y-4 mb-8">
          {/* 旧身份详细描述 */}
          {data.antiVision.oldDescription && (
            <div className="p-4 bg-red-600/10 border border-red-500/15 rounded-2xl">
              <div className="text-red-400 text-xs font-semibold uppercase tracking-wider mb-2">🛑 我正在告别的旧身份</div>
              <p className="text-gray-300 text-sm whitespace-pre-line leading-relaxed">{data.antiVision.oldDescription}</p>
            </div>
          )}
          {/* 新身份详细描述 */}
          {data.antiVision.newDescription && (
            <div className="p-4 bg-emerald-600/10 border border-emerald-500/15 rounded-2xl">
              <div className="text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">✨ 我正在成为的新身份</div>
              <p className="text-gray-300 text-sm whitespace-pre-line leading-relaxed">{data.antiVision.newDescription}</p>
            </div>
          )}
          {data.goals.yearGoal && (
            <div className="p-4 bg-violet-600/10 border border-violet-500/15 rounded-2xl">
              <div className="text-violet-400 text-xs font-semibold uppercase tracking-wider mb-2">一年愿景</div>
              <p className="text-gray-200 text-sm">{data.goals.yearGoal}</p>
            </div>
          )}
          {data.goals.monthProject && (
            <div className="p-4 bg-blue-600/10 border border-blue-500/15 rounded-2xl">
              <div className="text-blue-400 text-xs font-semibold uppercase tracking-wider mb-2">本月项目</div>
              <p className="text-gray-200 text-sm">{data.goals.monthProject}</p>
            </div>
          )}
          {data.goals.dailyActions.filter(a => a).length > 0 && (
            <div className="p-4 bg-emerald-600/10 border border-emerald-500/15 rounded-2xl">
              <div className="text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">每日行为</div>
              <ul className="space-y-1">
                {data.goals.dailyActions.filter(a => a).map((action, i) => (
                  <li key={i} className="text-gray-200 text-sm flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-emerald-400" />
                    {action}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {data.gamify.risk && (
            <div className="p-4 bg-red-600/10 border border-red-500/15 rounded-2xl">
              <div className="text-red-400 text-xs font-semibold uppercase tracking-wider mb-2">我在逃离的未来</div>
              <p className="text-gray-200 text-sm">{data.gamify.risk}</p>
            </div>
          )}
        </div>

        <div className="text-center border-t border-white/8 pt-8">
          <p className="text-gray-400 text-sm leading-loose">
            改变的本质不是添加新习惯，<br />
            而是成为一个<span className="text-white font-medium">新的人</span>。<br />
            今天，我选择看清我在保护的旧身份，<br />
            并有意识地成为<span className="gradient-text font-semibold">我真正想成为的那个人</span>。
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 mt-8">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-violet-500/40" />
          <Star className="w-4 h-4 text-violet-400" />
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-violet-500/40" />
        </div>

      {/* Export */}
      <div className="flex justify-center mb-10">
        <button
          onClick={handleExport}
          className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-violet-600 to-blue-600 rounded-full text-white font-semibold hover:shadow-2xl hover:shadow-violet-500/40 hover:scale-105 transition-all cursor-pointer"
        >
          <Download className="w-5 h-5" />
          导出 PDF 宣言
        </button>
      </div>

      <div className="text-center pb-4">
        <blockquote className="text-gray-600 text-sm italic leading-relaxed max-w-lg mx-auto">
          "The goal is not to change your behavior. The goal is to change your identity."
          <br />
          <span className="text-gray-500 not-italic">— Dan Koe</span>
        </blockquote>
      </div>
      </div>
    </div>
  )
}

export default function ManifestoExport() {
  return (
    <StepWrapper
      stepNumber={6}
      title={<>你的<span className="gradient-text">身份宣言</span></> as unknown as string}
      subtitle="你完成了今天最重要的功课。现在生成你的身份宣言，把它作为每天的提醒。"
      badgeLabel="身份宣言"
      badgeColor="purple"
      canComplete={false}
      hideCompleteButton={true}
    >
      <ManifestoContent />
    </StepWrapper>
  )
}
