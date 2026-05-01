export const handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  }

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' }
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) }
  }

  try {
    const { selfExploration, goals, gamify } = JSON.parse(event.body || '{}')

    const filledAnswers = (selfExploration || []).filter(a => a && a.trim()).join('\n- ')
    const yearGoal = goals?.yearGoal || ''
    const monthProject = goals?.monthProject || ''
    const dailyActions = (goals?.dailyActions || []).filter(a => a).join('、')
    const risk = gamify?.risk || ''
    const mainQuest = gamify?.mainQuest || ''

    const hasData = filledAnswers || yearGoal || risk || mainQuest

    // 优先尝试使用 API
    const apiKey = process.env.HUNYUAN_API_KEY || process.env.OPENAI_API_KEY

    if (apiKey && hasData) {
      const apiUrl = process.env.HUNYUAN_API_KEY
        ? 'https://api.hunyuan.cloud.tencent.com/hilos/v1/chat/completions'
        : 'https://api.openai.com/v1/chat/completions'

      const model = process.env.HUNYUAN_API_KEY ? 'hunyuan-lite' : 'gpt-3.5-turbo'

      const systemPrompt = `你是一个身份分析专家。用户完成了一个"身份改变"的心理探索练习。请根据他们填写的内容，分析并生成：
1. 一个"旧身份标签"（10字以内，描述他们当前/过去的身份状态）
2. 一个"新身份标签"（10字以内，描述他们渴望成为的身份）

要求：
- 旧身份要体现挣扎、痛苦、停滞感
- 新身份要体现蜕变、成长、自主权
- 两个标签形成鲜明对比
- 直接输出JSON格式：{"oldLabel":"...","newLabel":"..."}
- 不要输出任何解释，只输出JSON`

      const userContent = [
        filledAnswers && `【自我探索回答】\n- ${filledAnswers}`,
        yearGoal && `【一年愿景】${yearGoal}`,
        monthProject && `【本月项目】${monthProject}`,
        dailyActions && `【每日行为】${dailyActions}`,
        risk && `【恐惧愿景】${risk}`,
        mainQuest && `【主线任务】${mainQuest}`,
      ].filter(Boolean).join('\n\n')

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userContent },
          ],
          temperature: 0.7,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        const raw = data.choices?.[0]?.message?.content?.trim() || ''
        const jsonMatch = raw.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0])
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
              oldLabel: parsed.oldLabel || '困在旧身份中的人',
              newLabel: parsed.newLabel || '活出新身份的人',
            }),
          }
        }
      }
    }

    // Fallback
    let oldLabel = '困在旧身份中的人'
    let newLabel = '活出新身份的人'

    if (filledAnswers) {
      if (filledAnswers.includes('创业') || filledAnswers.includes('赚钱') || filledAnswers.includes('成功')) {
        oldLabel = '被困在格子间的打工人'
        newLabel = '独立创业的成功者'
      } else if (filledAnswers.includes('创作') || filledAnswers.includes('内容') || filledAnswers.includes('自由')) {
        oldLabel = '机械重复的上班族'
        newLabel = '自由创作者'
      } else if (filledAnswers.includes('早起') || filledAnswers.includes('自律') || filledAnswers.includes('健康')) {
        oldLabel = '放纵拖延的人'
        newLabel = '自律高效的人'
      }
    }

    if (yearGoal) {
      if (yearGoal.includes('创业') || yearGoal.includes('收入')) newLabel = '副业成功者'
      if (yearGoal.includes('内容') || yearGoal.includes('创作')) newLabel = '内容创作者'
      if (yearGoal.includes('早起') || yearGoal.includes('健康')) newLabel = '自律达人'
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ oldLabel, newLabel }),
    }
  } catch (error) {
    console.error('AI analyze error:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        oldLabel: '困在旧身份中的人',
        newLabel: '活出新身份的人',
        error: error.message,
      }),
    }
  }
}
