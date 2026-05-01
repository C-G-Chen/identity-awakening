import { useRef, useState } from 'react'
import { FileText, Download, Star, PartyPopper, Sparkles, Clock, Zap, RefreshCw } from 'lucide-react'
import { useIdentity } from '../hooks/useIdentityData'
import StepWrapper from './StepWrapper'

// AI生成的对比图片
interface FuturePreview {
  oldIdentity: string | null
  newIdentity: string | null
  loading: boolean
  error: string | null
}

// 调用图片生成API
async function generateImage(prompt: string): Promise<string | null> {
  try {
    // 这里使用一个示例图片API
    // 实际项目中可以替换为：OpenAI DALL-E, Midjourney API, Stable Diffusion 等
    const encodedPrompt = encodeURIComponent(prompt)
    
    // 使用 pollinations.ai - 一个免费的AI图片生成服务
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true`
    
    return imageUrl
  } catch (err) {
    console.error('Image generation failed:', err)
    return null
  }
}

function ManifestoContent() {
  const { data } = useIdentity()
  const manifestoRef = useRef<HTMLDivElement>(null)
  const [preview, setPreview] = useState<FuturePreview>({
    oldIdentity: null,
    newIdentity: null,
    loading: false,
    error: null,
  })

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

  // 生成五年后对比图
  const generateFuturePreview = async () => {
    setPreview({ ...preview, loading: true, error: null })

    try {
      const oldLabel = data.antiVision.oldIdentityLabel || 'a person stuck in stagnant life'
      const newLabel = data.antiVision.newIdentityLabel || 'a successful confident person'

      // 生成旧身份五年后的描述
      const oldPrompt = `Cinematic photo, ${oldLabel}, 5 years in the future, sitting at desk looking at phone with regret, dimly lit room, grey tones, depressed atmosphere, photorealistic`

      // 生成新身份五年后的描述
      const newPrompt = `Cinematic photo, ${newLabel}, 5 years in the future, standing proudly in beautiful space, warm golden lighting, thriving atmosphere, photorealistic`

      // 并行生成两张图
      const [oldImg, newImg] = await Promise.all([
        generateImage(oldPrompt),
        generateImage(newPrompt),
      ])

      setPreview({
        oldIdentity: oldImg,
        newIdentity: newImg,
        loading: false,
        error: null,
      })
    } catch (err) {
      setPreview({
        ...preview,
        loading: false,
        error: '图片生成失败，请重试',
      })
    }
  }

  const today = new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
  const fiveYearsLater = new Date(Date.now() + 5 * 365 * 24 * 60 * 60 * 1000).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })

  const hasIdentityData = data.antiVision.oldIdentityLabel || data.antiVision.newIdentityLabel

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

      {/* 五年后对比预览 - 新增区域 */}
      <div className="mb-10 p-6 rounded-3xl bg-gradient-to-br from-slate-900/80 to-slate-800/50 border border-slate-600/30">
        <div className="flex items-center justify-center gap-3 mb-6">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <h3 className="text-xl font-bold text-white">🚀 五年后人生对比</h3>
          <Sparkles className="w-5 h-5 text-amber-400" />
        </div>

        <p className="text-center text-gray-400 text-sm mb-6">
          基于你在前面步骤的思考，AI生成两条人生道路的五年后对比
        </p>

        {preview.loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="relative w-16 h-16 mb-4">
              <div className="absolute inset-0 border-4 border-violet-500/20 rounded-full" />
              <div className="absolute inset-0 border-4 border-transparent border-t-violet-500 rounded-full animate-spin" />
              <div className="absolute inset-2 border-4 border-transparent border-t-blue-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
            </div>
            <p className="text-gray-300 text-sm font-medium mb-1">AI 正在生成对比图...</p>
            <p className="text-gray-500 text-xs">这可能需要 10-20 秒</p>
          </div>
        ) : preview.error ? (
          <div className="text-center py-8">
            <p className="text-red-400 text-sm mb-4">{preview.error}</p>
            <button
              onClick={generateFuturePreview}
              className="px-6 py-3 bg-violet-600/50 border border-violet-500/30 rounded-full text-white text-sm hover:bg-violet-600/70 transition-all cursor-pointer"
            >
              重新生成
            </button>
          </div>
        ) : preview.oldIdentity && preview.newIdentity ? (
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
                  <p className="text-white font-bold text-lg leading-tight">{data.antiVision.oldIdentityLabel || '旧身份'}</p>
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
                  <p className="text-white font-bold text-lg leading-tight">{data.antiVision.newIdentityLabel || '新身份'}</p>
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
            <div className="flex justify-center">
              <button
                onClick={generateFuturePreview}
                className="text-gray-500 text-xs hover:text-gray-300 transition-colors cursor-pointer flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                重新生成
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-violet-600/30 via-blue-600/30 to-purple-600/30 flex items-center justify-center relative">
              <Sparkles className="w-12 h-12 text-violet-400" />
              <div className="absolute inset-0 rounded-full border-2 border-dashed border-violet-500/30 animate-pulse" />
            </div>
            <p className="text-gray-300 text-sm mb-2">还没有生成预览</p>
            <p className="text-gray-500 text-xs mb-6">点击下方按钮，AI将基于你的选择生成对比图</p>
            <button
              onClick={generateFuturePreview}
              disabled={!hasIdentityData}
              className="group px-10 py-5 bg-gradient-to-r from-violet-600 via-purple-600 to-blue-600 rounded-2xl text-white font-bold hover:shadow-2xl hover:shadow-violet-500/50 hover:scale-105 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 cursor-pointer"
            >
              <span className="flex items-center gap-3">
                <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                <span className="text-lg">生成五年后对比图</span>
              </span>
            </button>
            {!hasIdentityData && (
              <p className="text-gray-600 text-xs mt-4">（建议先在步骤2填写你的新旧身份）</p>
            )}
          </div>
        )}
      </div>

      {/* Manifesto card */}
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
