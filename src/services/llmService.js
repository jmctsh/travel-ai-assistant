// LLM服务 - 流式渲染专用版本

// API配置常量
const API_CONFIGS = {
  deepseek: {
    url: 'https://api.deepseek.com/v1/chat/completions',
    headers: (apiKey) => ({
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    }),
    maxTokens: 4000
  },
  openai: {
    url: 'https://api.openai.com/v1/chat/completions',
    headers: (apiKey) => ({
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    }),
    maxTokens: 2000
  },
  anthropic: {
    url: 'https://api.anthropic.com/v1/messages',
    headers: (apiKey) => ({
      'x-api-key': apiKey,
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01'
    }),
    maxTokens: 2000
  },
  ark: {
    url: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
    headers: (apiKey) => ({
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    }),
    maxTokens: 2000,
    model: 'doubao-seed-1-6-250615'
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
  // 已废弃：所有调用都应使用流式版本 sendMessageToLLMStream
  throw new Error('非流式调用已废弃，请使用 sendMessageToLLMStream')
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
 * 通用流式处理函数
 * @param {string} url - API URL
 * @param {Object} headers - 请求头
 * @param {Object} body - 请求体
 * @param {Function} onChunk - 接收数据块的回调函数
 * @param {Function} parseChunk - 解析数据块的函数
 * @param {AbortSignal} signal - 可选的AbortSignal用于取消请求
 * @returns {Promise<void>}
 */
async function sendStreamRequest(url, headers, body, onChunk, parseChunk, signal) {
  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
    signal
  })
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  
  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      
      // 将新数据添加到缓冲区
      buffer += decoder.decode(value, { stream: true })
      
      // 按行分割处理
      const lines = buffer.split('\n')
      // 保留最后一行（可能不完整）
      buffer = lines.pop() || ''
      
      for (const line of lines) {
        const trimmedLine = line.trim()
        if (trimmedLine.startsWith('data: ')) {
          const data = trimmedLine.slice(6).trim()
          if (data === '[DONE]') return
          
          try {
            const parsed = JSON.parse(data)
            const content = parseChunk(parsed)
            if (content) {
              // 立即调用回调函数，确保实时更新
              onChunk(content)
            }
          } catch (e) {
            // 忽略解析错误，继续处理下一行
            console.debug('解析数据块失败:', e.message, 'data:', data)
          }
        }
      }
    }
    
    // 处理缓冲区中剩余的数据
    if (buffer.trim()) {
      const trimmedLine = buffer.trim()
      if (trimmedLine.startsWith('data: ')) {
        const data = trimmedLine.slice(6).trim()
        if (data !== '[DONE]') {
          try {
            const parsed = JSON.parse(data)
            const content = parseChunk(parsed)
            if (content) {
              onChunk(content)
            }
          } catch (e) {
            console.debug('解析最后数据块失败:', e.message, 'data:', data)
          }
        }
      }
    }
  } finally {
    reader.releaseLock()
  }
}

/**
 * 数据块解析器
 */
const CHUNK_PARSERS = {
  deepseek: (parsed) => {
    return parsed.choices?.[0]?.delta?.content
  },
  openai: (parsed) => {
    return parsed.choices?.[0]?.delta?.content
  },
  anthropic: (parsed) => {
    return parsed.type === 'content_block_delta' ? parsed.delta?.text : null
  },
  ark: (parsed) => {
    return parsed.choices?.[0]?.delta?.content
  }
}

/**
 * 构建请求体
 * @param {string} provider - 提供商
 * @param {Array} messages - 消息数组
 * @param {Object} config - 配置
 * @returns {Object} 请求体
 */
function buildRequestBody(provider, messages, config) {
  const apiConfig = API_CONFIGS[provider]
  
  const baseBody = {
    messages,
    temperature: config.temperature,
    max_tokens: apiConfig.maxTokens,
    stream: true
  }
  
  switch (provider) {
    case 'deepseek':
    case 'openai':
      return {
        ...baseBody,
        model: config.model
      }
    case 'anthropic':
      // Anthropic 需要特殊处理消息格式
      const systemMessage = messages.find(m => m.role === 'system')
      const userMessages = messages.filter(m => m.role !== 'system')
      return {
        ...baseBody,
        model: config.model,
        messages: userMessages,
        system: systemMessage?.content
      }
    case 'ark':
      return {
        ...baseBody,
        model: apiConfig.model
      }
    default:
      return baseBody
  }
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
  
  // 验证API密钥
  if (!config.apiKey && config.provider !== 'ark') {
    throw new Error('请先在管理界面配置API密钥')
  }
  
  if (config.provider === 'ark' && !config.arkApiKey) {
    throw new Error('请先在管理界面配置Ark API密钥')
  }
  
  console.log('[sendMessageToLLMStream] provider:', config.provider, 'message:', message)
  
  try {
    const messages = buildMessages(message, conversationHistory)
    const apiConfig = API_CONFIGS[config.provider]
    
    if (!apiConfig) {
      throw new Error(`不支持的模型提供商: ${config.provider}`)
    }
    
    // 获取API密钥
    const apiKey = config.provider === 'ark' ? config.arkApiKey : config.apiKey
    
    // 构建请求参数
    const url = apiConfig.url
    const headers = apiConfig.headers(apiKey)
    const body = buildRequestBody(config.provider, messages, config)
    const parseChunk = CHUNK_PARSERS[config.provider]
    
    console.log(`[sendMessageToLLMStream] 调用 ${config.provider} 流式API, stream: true`)
    
    // 包装onChunk回调，添加调试信息
    let chunkCount = 0
    const wrappedOnChunk = (content) => {
      chunkCount++
      console.log(`[sendMessageToLLMStream] 接收到第${chunkCount}个数据块:`, content)
      onChunk(content)
    }
    
    await sendStreamRequest(url, headers, body, wrappedOnChunk, parseChunk, signal)
    console.log(`[sendMessageToLLMStream] 流式处理完成，共接收${chunkCount}个数据块`)
  } catch (error) {
    console.error('LLM流式请求失败:', error)
    throw error
  }
}