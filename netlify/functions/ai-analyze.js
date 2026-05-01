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
    const victory = gamify?.victory || ''
    const mainQuest = gamify?.mainQuest || ''

    const hasData = filledAnswers || yearGoal || risk || victory || mainQuest

    // 优先尝试使用 API
    const apiKey = process.env.HUNYUAN_API_KEY || process.env.OPENAI_API_KEY

    if (apiKey && hasData) {
      const apiUrl = process.env.HUNYUAN_API_KEY
        ? 'https://api.hunyuan.cloud.tencent.com/hilos/v1/chat/completions'
        : 'https://api.openai.com/v1/chat/completions'

      const model = process.env.HUNYUAN_API_KEY ? 'hunyuan-lite' : 'gpt-3.5-turbo'

      const systemPrompt = `你是一个身份分析专家。用户完成了一个"身份改变"的心理探索练习。请根据他们填写的内容，深度分析并生成以下内容：

1. **oldLabel（旧身份标签）**：10字以内，精准描述他们当前/过去的身份状态，要体现挣扎、痛苦、停滞感
2. **newLabel（新身份标签）**：10字以内，精准描述他们渴望成为的身份，要体现蜕变、成长、自主权
3. **oldDescription（旧身份详细描述）**：根据用户的自我探索回答、年愿景、恐惧愿景等，分析提炼他们在旧身份下的详细生活状态。要求：
   - 3-5个维度：生活方式/工作状态、情绪感受、人际关系、财务状况、日常作息
   - 每个维度用1-2句话精准描述，要具体、有画面感、真实可信
   - 语气：冷静客观但带有洞察力的观察（不是评判，而是呈现）
4. **newDescription（新身份详细描述）**：根据用户的年愿景、月项目、胜利愿景、主任务等，分析提炼新身份下的详细生活状态。要求：
   - 3-5个维度：生活方式/工作状态、情绪感受、人际关系、财务状况、日常作息
   - 每个维度用1-2句话精准描述，要具体、有画面感、令人向往
   - 语气：积极但不浮夸，是可实现的愿景

直接输出JSON格式，不要有任何其他解释文字：
{"oldLabel":"...","newLabel":"...","oldDescription":"生活方式：...\\n情绪感受：...\\n人际关系：...\\n财务状况：...\\n日常作息：...","newDescription":"生活方式：...\\n情绪感受：...\\n人际关系：...\\n财务状况：...\\n日常作息：..."}`

      const userContent = [
        filledAnswers && `【自我探索回答】\n- ${filledAnswers}`,
        yearGoal && `【一年愿景】${yearGoal}`,
        monthProject && `【本月项目】${monthProject}`,
        dailyActions && `【每日行为】${dailyActions}`,
        risk && `【恐惧愿景（不想成为的）】${risk}`,
        victory && `【胜利愿景（想成为的）】${victory}`,
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
              oldDescription: parsed.oldDescription || '',
              newDescription: parsed.newDescription || '',
            }),
          }
        }
      }
    }

    // Fallback（无 API Key 或 API 失败时）
    let oldLabel = '困在旧身份中的人'
    let newLabel = '活出新身份的人'
    let oldDescription = ''
    let newDescription = ''

    if (filledAnswers || risk) {
      oldDescription = `生活方式：每天机械重复，找不到意义和方向。
情绪感受：焦虑、内耗，对现状不满却无力改变。
人际关系：疲惫的社交，不知道跟谁真正连接。
财务状况：收入稳定但天花板明显，没有增长空间。
日常作息：拖延、晚睡，早上起来依然疲惫。`
    }

    if (yearGoal || victory || mainQuest) {
      newDescription = `生活方式：找到了真正想投入的事业，每天充满期待地工作。
情绪感受：平静而充实，内心有方向感，不再焦虑内耗。
人际关系：与志同道合的人在一起，彼此支持成长。
财务状况：收入显著提升，建立了多渠道收入来源。
日常作息：早起高效，有充足的时间给热爱的事。`
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ oldLabel, newLabel, oldDescription, newDescription }),
    }
  } catch (error) {
    console.error('AI analyze error:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        oldLabel: '困在旧身份中的人',
        newLabel: '活出新身份的人',
        oldDescription: '',
        newDescription: '',
        error: error.message,
      }),
    }
  }
}
