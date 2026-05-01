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
    const { prompt, seed } = JSON.parse(event.body || '{}');

    if (!prompt) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing prompt' }) };
    }

    // 使用 Pollinations AI（免费，不需要 API key）
    const encodedPrompt = encodeURIComponent(prompt);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true&seed=${seed || Math.floor(Math.random() * 1000000)}`;

    // 直接返回 URL，让前端加载图片
    // 这样可以避免 CORS 问题，同时利用浏览器的图片缓存
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        url: imageUrl,
        fallback: true, // 标记为使用 URL 方式
      }),
    };
  } catch (error) {
    console.error('Image generation error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
