// LLM服务
import axios from 'axios'
// import OpenAI from 'openai';

// 移除 openai 包和 arkClient 相关
// let arkClient = null;

// export function initArkClient(apiKey, baseURL) {
//   arkClient = new OpenAI({
//     apiKey,
//     baseURL,
//   });
// }

// export async function sendToArk({ messages, model }) {
//   if (!arkClient) throw new Error('Ark client not initialized');
//   const response = await arkClient.chat.completions.create({
//     messages,
//     model,
//   });
//   return response.choices[0];
// }

// 新增：axios方式请求Ark API
async function sendToArkHttp(messages, config) {
  const response = await axios.post(
    'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
    {
      model: 'doubao-seed-1-6-250615',
      messages: messages
    },
    {
      headers: {
        'Authorization': `Bearer ${config.arkApiKey}`,
        'Content-Type': 'application/json'
      }
    }
  );
  return {
    content: response.data.choices[0].message.content,
    usage: response.data.usage
  }
}

// 从localStorage获取LLM配置
function getLLMConfig() {
  const savedConfig = localStorage.getItem('travelAssistantConfig')
  if (savedConfig) {
    const config = JSON.parse(savedConfig)
    return config.llm || {
      provider: 'deepseek',
      model: 'deepseek-chat',
      apiKey: '',
      temperature: 0.7,
      arkApiKey: '',
      arkBaseUrl: ''
    }
  }
  return {
    provider: 'deepseek',
    model: 'deepseek-chat',
    apiKey: '',
    temperature: 0.7,
    arkApiKey: '',
    arkBaseUrl: ''
  }
}

/**
 * 发送消息到LLM
 * @param {string} message - 用户消息
 * @param {Array} conversationHistory - 对话历史
 * @returns {Promise<Object>} LLM响应
 */
export async function sendMessageToLLM({ provider, messages, model, ...rest }) {
  if (provider === 'ark') {
    const config = getLLMConfig();
    return await sendToArkHttp(messages, config);
  }
  const config = getLLMConfig()
  
  if (!config.apiKey) {
    throw new Error('请先在管理界面配置API密钥')
  }
  
  try {
    let response
    
    switch (config.provider) {
      case 'deepseek':
        response = await sendToDeepSeek(message, conversationHistory, config)
        break
      case 'openai':
        response = await sendToOpenAI(message, conversationHistory, config)
        break
      case 'anthropic':
        response = await sendToAnthropic(message, conversationHistory, config)
        break
      default:
        throw new Error(`不支持的模型提供商: ${config.provider}`)
    }
    
    return response
  } catch (error) {
    console.error('LLM请求失败:', error)
    throw error
  }
}

/**
 * 发送消息到DeepSeek
 * @param {string} message - 用户消息
 * @param {Array} conversationHistory - 对话历史
 * @param {Object} config - 配置
 * @returns {Promise<Object>} 响应
 */
async function sendToDeepSeek(message, conversationHistory, config) {
  const messages = buildMessages(message, conversationHistory)
  
  console.log('DeepSeek请求配置:', {
    model: config.model,
    temperature: config.temperature,
    max_tokens: 4000,
    messagesCount: messages.length
  })
  
  try {
    const response = await axios.post('https://api.deepseek.com/v1/chat/completions', {
      model: config.model,
      messages: messages,
      temperature: config.temperature,
      max_tokens: 4000,
      stream: false
    }, {
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      }
    })
    
    return {
      content: response.data.choices[0].message.content,
      usage: response.data.usage
    }
  } catch (error) {
    console.error('DeepSeek API错误:', error.response?.data || error.message)
    throw error
  }
}

/**
 * 发送消息到OpenAI
 * @param {string} message - 用户消息
 * @param {Array} conversationHistory - 对话历史
 * @param {Object} config - 配置
 * @returns {Promise<Object>} 响应
 */
async function sendToOpenAI(message, conversationHistory, config) {
  const messages = buildMessages(message, conversationHistory)
  
  const response = await axios.post('https://api.openai.com/v1/chat/completions', {
    model: config.model,
    messages: messages,
    temperature: config.temperature,
    max_tokens: 2000,
    stream: false
  }, {
    headers: {
      'Authorization': `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json'
    }
  })
  
  return {
    content: response.data.choices[0].message.content,
    usage: response.data.usage
  }
}

/**
 * 发送消息到Anthropic
 * @param {string} message - 用户消息
 * @param {Array} conversationHistory - 对话历史
 * @param {Object} config - 配置
 * @returns {Promise<Object>} 响应
 */
async function sendToAnthropic(message, conversationHistory, config) {
  const messages = buildMessages(message, conversationHistory)
  
  const response = await axios.post('https://api.anthropic.com/v1/messages', {
    model: config.model,
    messages: messages,
    temperature: config.temperature,
    max_tokens: 2000
  }, {
    headers: {
      'x-api-key': config.apiKey,
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01'
    }
  })
  
  return {
    content: response.data.content[0].text,
    usage: response.data.usage
  }
}

/**
 * 构建消息格式
 * @param {string} message - 用户消息
 * @param {Array} conversationHistory - 对话历史
 * @returns {Array} 消息数组
 */
function buildMessages(message, conversationHistory) {
  const messages = [
    {
      role: 'system',
      content: `你是一个专业的杭州旅游规划助手。你需要根据用户的需求，为他们制定详细的杭州旅游计划。

你的职责包括：
1. 根据用户选择的景点、日期、人数等信息制定个性化行程
2. 提供实用的交通、住宿、用餐建议
3. 考虑天气因素调整行程安排
4. 推荐当地特色美食和文化体验
5. 回答用户关于杭州旅游的各种问题

请用友好、专业的语气回答，并提供详细、实用的建议。`
    }
  ]
  
  // 添加对话历史
  conversationHistory.forEach(item => {
    if (item.type === 'user') {
      messages.push({
        role: 'user',
        content: item.content
      })
    } else if (item.type === 'ai' || item.type === 'system') {
      messages.push({
        role: 'assistant',
        content: item.content
      })
    }
  })
  
  // 添加当前消息
  messages.push({
    role: 'user',
    content: message
  })
  
  return messages
}

/**
 * 流式发送消息到LLM（用于实时显示响应）
 * @param {string} message - 用户消息
 * @param {Array} conversationHistory - 对话历史
 * @param {Function} onChunk - 接收数据块的回调函数
 * @param {AbortSignal} signal - 可选的AbortSignal用于取消请求
 * @returns {Promise<void>}
 */
export async function sendMessageToLLMStream(message, conversationHistory = [], onChunk, signal) {
  const config = getLLMConfig()
  if (config.provider === 'ark') {
    if (!config.arkApiKey) {
      throw new Error('请先在管理界面配置Ark API密钥')
    }
    // 构建消息格式
    const messages = buildMessages(message, conversationHistory)
    // 调用豆包流式输出
    await sendToArkStream(messages, config, onChunk, signal)
    return
  }
  config.provider = 'deepseek'
  console.log('[sendMessageToLLMStream] provider:', config.provider, 'message:', message)
  if (!config.apiKey) {
    throw new Error('请先在管理界面配置API密钥')
  }
  try {
    const messages = buildMessages(message, conversationHistory)
    console.log('[sendMessageToLLMStream] 调用 sendToDeepSeekStream, stream: true', { model: config.model, messagesCount: messages.length })
    await sendToDeepSeekStream(messages, config, onChunk, signal)
  } catch (error) {
    console.error('LLM流式请求失败:', error)
    throw error
  }
}

/**
 * 发送流式消息到DeepSeek
 * @param {Array} messages - 消息数组
 * @param {Object} config - 配置
 * @param {Function} onChunk - 接收数据块的回调函数
 * @param {AbortSignal} signal - 可选的AbortSignal用于取消请求
 * @returns {Promise<void>}
 */
async function sendToDeepSeekStream(messages, config, onChunk, signal) {
  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: config.model,
      messages: messages,
      temperature: config.temperature,
      max_tokens: 4000,
      stream: true
    }),
    signal: signal // 添加AbortSignal支持
  })
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) {
        break
      }
      const chunk = decoder.decode(value)
      const lines = chunk.split('\n')
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6)
          if (data === '[DONE]') {
            return
          }
          try {
            const parsed = JSON.parse(data)
            if (parsed.choices && parsed.choices[0] && parsed.choices[0].delta && parsed.choices[0].delta.content) {
              onChunk(parsed.choices[0].delta.content)
            }
          } catch (e) {
            // 忽略解析错误
          }
        }
      }
    }
  } finally {
    reader.releaseLock()
  }
} 

// 新增：豆包Ark流式输出
async function sendToArkStream(messages, config, onChunk, signal) {
  const response = await fetch('https://ark.cn-beijing.volces.com/api/v3/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.arkApiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'doubao-seed-1-6-250615',
      messages: messages,
      stream: true
    }),
    signal
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') return;
          try {
            const parsed = JSON.parse(data);
            if (parsed.choices && parsed.choices[0] && parsed.choices[0].delta && parsed.choices[0].delta.content) {
              onChunk(parsed.choices[0].delta.content);
            }
          } catch (e) { /* 忽略解析错误 */ }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
} 