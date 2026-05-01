import { useState } from 'react'
import { Bell, BellOff, RefreshCw, CheckCircle2 } from 'lucide-react'
import { useIdentity } from '../hooks/useIdentityData'
import StepWrapper from './StepWrapper'

const timeColors = [
  'border-violet-500/30 bg-violet-950/20',
  'border-blue-500/30 bg-blue-950/20',
  'border-cyan-500/30 bg-cyan-950/20',
  'border-teal-500/30 bg-teal-950/20',
  'border-emerald-500/30 bg-emerald-950/20',
  'border-amber-500/30 bg-amber-950/20',
  'border-orange-500/30 bg-orange-950/20',
]
const dotColors = ['bg-violet-400','bg-blue-400','bg-cyan-400','bg-teal-400','bg-emerald-400','bg-amber-400','bg-orange-400']

function ReminderContent() {
  const { data, updateReminders } = useIdentity()
  const { reminders } = data
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission | 'unknown'>('unknown')
  const [notifEnabled, setNotifEnabled] = useState(false)

  const updateTime = (index: number, value: string) => {
    const newTimes = [...reminders.times]
    newTimes[index] = value
    updateReminders({ times: newTimes })
  }

  const randomizeTime = (index: number) => {
    const hours = Math.floor(Math.random() * 14) + 7
    const mins = [0, 15, 30, 45][Math.floor(Math.random() * 4)]
    updateTime(index, `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`)
  }

  const requestNotification = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      setPermissionStatus(permission)
      if (permission === 'granted') {
        setNotifEnabled(true)
        updateReminders({ enabled: true, completed: true })
        new Notification('身份打断提醒已开启 ✨', { body: '每天7次，提醒你审视自己的身份与行为。' })
      }
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Time slots */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-8">
        {reminders.times.map((time, i) => (
          <div key={i} className={`relative rounded-2xl border p-3 ${timeColors[i]} group`}>
            <div className="flex items-center justify-between mb-2">
              <div className={`w-2 h-2 rounded-full ${dotColors[i]}`} />
              <button onClick={() => randomizeTime(i)} className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-gray-300 transition-all cursor-pointer" title="随机时间">
                <RefreshCw className="w-3 h-3" />
              </button>
            </div>
            <div className="text-center mb-1"><span className="text-gray-400 text-xs">提醒 {i + 1}</span></div>
            <input type="time" value={time} onChange={e => updateTime(i, e.target.value)}
              className="w-full bg-transparent text-white text-center text-sm font-bold focus:outline-none cursor-pointer" />
          </div>
        ))}
      </div>

      {/* Questions */}
      <div className="glass border border-white/8 rounded-3xl p-6 mb-6">
        <h4 className="text-white font-bold mb-1">打断问题模板</h4>
        <p className="text-gray-500 text-sm mb-5">每次提醒响起时，随机选一个问题问自己</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {reminders.questions.map((q, i) => (
            <div key={i} className="flex items-start gap-3 p-3 bg-white/3 border border-white/6 rounded-xl">
              <div className="w-6 h-6 rounded-full bg-violet-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-violet-400 text-xs font-bold">{i + 1}</span>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">{q}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Enable notifications */}
      <div className="glass border border-white/8 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${notifEnabled || reminders.enabled ? 'bg-violet-500/20' : 'bg-white/5'}`}>
            {notifEnabled || reminders.enabled ? <Bell className="w-6 h-6 text-violet-400" /> : <BellOff className="w-6 h-6 text-gray-500" />}
          </div>
          <div>
            <div className="text-white font-semibold">{notifEnabled || reminders.enabled ? '打断提醒已启用' : '启用浏览器提醒'}</div>
            <div className="text-gray-500 text-sm">{notifEnabled || reminders.enabled ? '每天7次，系统将在设定时间提醒你审视身份' : '允许通知权限，在设定时间收到打断提醒'}</div>
          </div>
        </div>
        <button
          onClick={requestNotification}
          className={`flex-shrink-0 flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300 cursor-pointer ${
            notifEnabled || reminders.enabled
              ? 'bg-emerald-600/20 border border-emerald-500/30 text-emerald-400'
              : permissionStatus === 'denied'
              ? 'bg-red-600/20 border border-red-500/30 text-red-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-violet-600 to-blue-600 text-white hover:shadow-lg hover:shadow-violet-500/30 hover:scale-105'
          }`}
        >
          {notifEnabled || reminders.enabled ? <><CheckCircle2 className="w-4 h-4" />已启用</> : permissionStatus === 'denied' ? <><BellOff className="w-4 h-4" />权限被拒绝</> : <><Bell className="w-4 h-4" />开启提醒</>}
        </button>
      </div>
    </div>
  )
}

export default function InterruptReminder() {
  const { data, updateReminders } = useIdentity()
  const { reminders } = data

  return (
    <StepWrapper
      stepNumber={4}
      title={<>全天<span className="gradient-text">打断机制</span></> as unknown as string}
      subtitle={'你大多数时间都在"自动驾驶"——无意识地保护旧身份。7次随机提醒，每次都是一扇觉醒之门。'}
      badgeLabel="打断自动驾驶"
      badgeColor="orange"
      canComplete={true}
      onComplete={() => updateReminders({ completed: true })}
      completeLabel="设置完毕，进入下一步"
      isCompleted={reminders.completed}
    >
      <ReminderContent />
    </StepWrapper>
  )
}
