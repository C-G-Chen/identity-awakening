// Netlify Function: 润色提示词（调用腾讯混元 API）
const crypto = require('crypto');

const SECRET_ID = process.env.TENCENT_SECRET_ID;
const SECRET_KEY = process.env.TENCENT_SECRET_KEY;

function sha1(secretKey, signStr) {
  const hmac = crypto.createHmac('sha1', secretKey);
  return hmac.update(signStr).digest('hex');
}

function doRequest(action, payload) {
  const host = 'hunyuan.tencentcloudapi.com';
  const service = 'hunyuan';
  const version = '2023-09-01';
  const algorithm = 'TC3-HMAC-SHA256';
  const timestamp = Math.floor(Date.now() / 1000);
  const date = new Date(timestamp * 1000).toISOString().split('T')[0];

  // 步骤1: 拼接规范请求串
  const httpRequestMethod = 'POST';
  const canonicalUri = '/';
  const canonicalQueryString = '';
  const canonicalHeaders = `content-type:application/json; charset=utf-8\nhost:${host}\n`;
  const signedHeaders = 'content-type;host';
  const hashedRequestPayload = crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex');
  const canonicalRequest = `${httpRequestMethod}\n${canonicalUri}\n${canonicalQueryString}\n${canonicalHeaders}\n${signedHeaders}\n${hashedRequestPayload}`;

  // 步骤2: 拼接待签名字符串
  const credentialScope = `${date}/${service}/tc3_request`;
  const hashedCanonicalRequest = crypto.createHash('sha256').update(canonicalRequest).digest('hex');
  const stringToSign = `${algorithm}\n${timestamp}\n${credentialScope}\n${hashedCanonicalRequest}`;

  // 步骤3: 计算签名
  const secretDate = sha1(`TC3${SECRET_KEY}`, date);
  const secretService = sha1(secretDate, service);
  const secretSigning = sha1(secretService, 'tc3_request');
  const signature = sha1(secretSigning, stringToSign);

  // 步骤4: 拼接 Authorization
  const authorization = `${algorithm} Credential=${SECRET_ID}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  // 发起请求
  return fetch(`https://${host}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Host': host,
      'X-TC-Action': action,
      'X-TC-Timestamp': timestamp.toString(),
      'X-TC-Version': version,
      'X-TC-Region': 'ap-guangzhou',
      'Authorization': authorization,
    },
    body: JSON.stringify(payload),
  });
}

exports.handler = async (event) => {
  // CORS 头
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  // 处理 OPTIONS 预检请求
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  // 检查密钥配置
  if (!SECRET_ID || !SECRET_KEY) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'API keys not configured' }),
    };
  }

  try {
    const { text, type } = JSON.parse(event.body || '{}');

    if (!text) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing text' }),
      };
    }

    // 根据类型选择提示词
    const systemPrompt = type === 'old'
      ? '你是一个专业的AI图像提示词优化师。把用户的中文描述转成生动的英文 Stable Diffusion 提示词，描绘一个困在旧身份、5年后依然停滞不前的人。必须包含：具体场景、光线氛围、人物情绪、视觉风格。只返回优化后的英文提示词，不要任何其他内容。'
      : '你是一个专业的AI图像提示词优化师。把用户的中文描述转成生动的英文 Stable Diffusion 提示词，描绘一个成功蜕变、5年后活出新身份的人。必须包含：具体场景、光线氛围、人物情绪、视觉风格。只返回优化后的英文提示词，不要任何其他内容。';

    // 调用腾讯混元 API
    const response = await doRequest('ChatCompletions', {
      Model: 'hunyuan-lite',
      Messages: [
        { Role: 'system', Content: systemPrompt },
        { Role: 'user', Content: text }
      ],
      Stream: false,
    });

    const data = await response.json();
    const enhanced = data.choices?.[0]?.message?.content || text;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ enhanced }),
    };
  } catch (error) {
    console.error('Enhancement error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
