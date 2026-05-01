export const handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  try {
    const { text, type } = JSON.parse(event.body || '{}');

    if (!text) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing text' }) };
    }

    // 尝试用混元 API 润色
    const hunyuanKey = process.env.HUNYUAN_API_KEY || process.env.OPENAI_API_KEY;
    
    if (hunyuanKey) {
      const isOld = type === 'old';
      const systemPrompt = isOld
        ? '你是一个视觉提示词优化专家。用户会给你一个"旧身份"的描述，请将其扩展为一段英文摄影提示词，用于AI图片生成。要求： cinematic photo style, 描述具体场景、情绪、光线、色彩。输出纯英文，不超过60个单词。不要输出任何解释，只输出提示词。'
        : '你是一个视觉提示词优化专家。用户会给你一个"新身份"的描述，请将其扩展为一段英文摄影提示词，用于AI图片生成。要求：cinematic photo style, 描述具体场景、情绪、光线、色彩，充满希望和力量感。输出纯英文，不超过60个单词。不要输出任何解释，只输出提示词。';

      const apiUrl = process.env.HUNYUAN_API_KEY
        ? 'https://api.hunyuan.cloud.tencent.com/hilos/v1/chat/completions'
        : 'https://api.openai.com/v1/chat/completions';

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${hunyuanKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: process.env.HUNYUAN_API_KEY ? 'hunyuan-lite' : 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: text },
          ],
          temperature: 0.8,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const enhanced = data.choices?.[0]?.message?.content?.trim();
        if (enhanced) {
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ enhanced }),
          };
        }
      }
    }

    // Fallback: 简单本地润色
    const fallbackOld = `A person stuck in a ${text}, sitting alone in a dim room, looking at phone with regret, grey and blue tones, cinematic lighting, photorealistic, 8k`;
    const fallbackNew = `A person who has become a ${text}, standing confidently in a bright modern space, warm golden lighting, smiling, successful atmosphere, cinematic lighting, photorealistic, 8k`;
    
    const fallback = type === 'old' ? fallbackOld : fallbackNew;
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ enhanced: fallback }),
    };
  } catch (error) {
    console.error('Hunyuan function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message, enhanced: text }),
    };
  }
};
