<template>
  <div class="flex flex-col h-screen pb-20">
    <!-- 聊天头部 -->
    <div class="bg-white border-b border-gray-200 p-4 flex justify-between items-center">
      <div class="flex items-center">
        <i class="fa fa-robot text-blue-500 text-xl mr-2"></i>
        <h2 class="font-medium text-gray-800">AI旅游助手</h2>
      </div>
      <button @click="clearChatHistory" class="text-gray-400 hover:text-gray-600">
        <i class="fa fa-trash mr-1"></i>
        <span class="text-sm">清除聊天历史</span>
      </button>
    </div>
    
    <!-- 聊天内容 -->
    <div class="flex-1 overflow-y-auto p-6 bg-gray-50" ref="chatContainer">
      <div v-for="message in messages" :key="message.id" class="mb-4 flex" :class="message.type === 'user' ? 'justify-end' : 'justify-start'">
        <div :class="message.type === 'user' ? 'bg-blue-500 text-white rounded-lg py-2 px-4 max-w-md' : 'bg-white text-gray-800 rounded-lg py-2 px-4 max-w-md shadow-sm'">
          <div v-if="message.isLoading" class="flex items-center">
            <div class="loading-animation mr-2"></div>
            <span>AI正在思考...</span>
          </div>
          <div v-else class="whitespace-pre-line">{{ message.content }}</div>
        </div>
      </div>
      
      <!-- 错误提示 -->
      <div v-if="errorMessage" class="mb-4 flex justify-start">
        <div class="bg-red-50 border border-red-200 text-red-700 rounded-lg py-2 px-4 max-w-md">
          <i class="fa fa-exclamation-triangle mr-2"></i>
          {{ errorMessage }}
        </div>
      </div>
    </div>
    
    <!-- 聊天输入框 -->
    <div class="bg-white border-t border-gray-200 p-4">
      <div class="flex items-center">
        <input 
          v-model="newMessage" 
          type="text" 
          placeholder="输入消息..." 
          class="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
          @keyup.enter="sendMessage"
          :disabled="isLoading"
        />
        <button 
          @click="sendMessage" 
          class="ml-2 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="isLoading || !newMessage.trim()"
        >
          <i v-if="isLoading" class="fa fa-spinner fa-spin"></i>
          <i v-else class="fa fa-paper-plane"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick, onActivated, inject, onBeforeUnmount } from 'vue'
import { sendMessageToLLMStream } from '../services/llmService.js'

// 接收props
const props = defineProps({
  initialMessage: {
    type: String,
    default: ''
  }
})

// 发送事件
const emit = defineEmits(['send-message', 'chat-ready'])

// 注入全局状态
const appState = inject('appState', null)

// 消息列表
const messages = ref([])

// 新消息
const newMessage = ref('')

// 加载状态
const isLoading = ref(false)

// 错误消息
const errorMessage = ref('')

// 聊天容器引用
const chatContainer = ref(null)

// 当前正在进行的AI请求控制器
let currentAbortController = null

// 存储键名
const STORAGE_KEY = 'chatMessages'
const LOADING_STATE_KEY = 'chatLoadingState'
// 新增：保存AI请求上下文的键名
const LAST_AI_QUERY_KEY = 'lastAIQuery'

// 获取某AI消息之前的历史上下文
const getHistoryBefore = (aiMsg) => {
  const idx = messages.value.findIndex(m => m.id === aiMsg.id)
  if (idx === -1) return []
  // 只取该AI消息之前的所有消息
  return messages.value.slice(0, idx).filter(m => m.type === 'user' || m.type === 'ai').map(m => ({
    type: m.type,
    content: m.content
  }))
}

// 清除聊天历史
const clearChatHistory = () => {
  if (confirm('确定要清除所有聊天历史吗？')) {
    messages.value = []
    errorMessage.value = ''
    isLoading.value = false
    // 清除本地存储
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(LOADING_STATE_KEY)
    // 彻底清理所有AI请求上下文
    // 不再需要lastAIQueryKey
    if (currentAbortController) {
      currentAbortController.abort()
      currentAbortController = null
    }
  }
}

// 滚动到底部
const scrollToBottom = async () => {
  await nextTick()
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight
  }
}

// 滚动到顶部
const scrollToTop = async () => {
  await nextTick()
  if (chatContainer.value) {
    chatContainer.value.scrollTop = 0
  }
}

// 保存消息到本地存储
const saveMessagesToStorage = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.value))
  } catch (error) {
    console.error('保存消息到本地存储失败:', error)
  }
}

// 从本地存储加载消息
const loadMessagesFromStorage = () => {
  try {
    const savedMessages = localStorage.getItem(STORAGE_KEY)
    if (savedMessages) {
      messages.value = JSON.parse(savedMessages)
      return true
    }
  } catch (error) {
    console.error('从本地存储加载消息失败:', error)
  }
  return false
}

// 保存加载状态
const saveLoadingState = () => {
  try {
    const loadingState = {
      isLoading: isLoading.value,
      timestamp: Date.now()
    }
    localStorage.setItem(LOADING_STATE_KEY, JSON.stringify(loadingState))
  } catch (error) {
    console.error('保存加载状态失败:', error)
  }
}

// 恢复加载状态
const restoreLoadingState = () => {
  try {
    const savedState = localStorage.getItem(LOADING_STATE_KEY)
    if (savedState) {
      const loadingState = JSON.parse(savedState)
      // 如果加载状态是5分钟内的，则恢复
      if (Date.now() - loadingState.timestamp < 5 * 60 * 1000) {
        isLoading.value = loadingState.isLoading
        return true
      } else {
        // 清除过期的加载状态
        localStorage.removeItem(LOADING_STATE_KEY)
      }
    }
  } catch (error) {
    console.error('恢复加载状态失败:', error)
  }
  return false
}

// 保存AI请求上下文
const saveLastAIQuery = (aiMessageId, query) => {
  try {
    localStorage.setItem(LAST_AI_QUERY_KEY, JSON.stringify({ id: aiMessageId, query }))
  } catch (error) {
    console.error('保存AI请求上下文失败:', error)
  }
}

// 加载AI请求上下文
const loadLastAIQuery = () => {
  try {
    const data = localStorage.getItem(LAST_AI_QUERY_KEY)
    if (data) return JSON.parse(data)
  } catch (error) {
    console.error('加载AI请求上下文失败:', error)
  }
  return null
}

// 发送消息
const sendMessage = async () => {
  if (newMessage.value.trim() === '' || isLoading.value) return
  const userMessage = {
    id: Date.now(),
    type: 'user',
    content: newMessage.value,
    timestamp: new Date()
  }
  messages.value.push(userMessage)
  const messageContent = newMessage.value
  newMessage.value = ''
  errorMessage.value = ''
  emit('send-message', messageContent)
  // 添加AI响应占位符，保存query
  const aiMessage = {
    id: Date.now() + 1,
    type: 'ai',
    content: '',
    timestamp: new Date(),
    isLoading: true,
    query: messageContent
  }
  messages.value.push(aiMessage)
  await scrollToBottom()
  isLoading.value = true
  saveLoadingState()
  currentAbortController = new AbortController()
  try {
    // 构建对话历史（排除当前正在加载的消息）
    const conversationHistory = getHistoryBefore(aiMessage)
    let fullResponse = ''
    await sendMessageToLLMStream(messageContent, conversationHistory, (chunk) => {
      fullResponse += chunk
      aiMessage.content = fullResponse
      aiMessage.isLoading = false
      saveMessagesToStorage()
      scrollToBottom()
    }, currentAbortController.signal)
    aiMessage.isLoading = false
    aiMessage.content = fullResponse
    saveMessagesToStorage()
  } catch (error) {
    if (error.name === 'AbortError') {
      const lastMessage = messages.value[messages.value.length - 1]
      if (lastMessage && lastMessage.isLoading) messages.value.pop()
    } else {
    errorMessage.value = error.message || '发送消息失败，请稍后重试'
      const lastMessage = messages.value[messages.value.length - 1]
      if (lastMessage && lastMessage.isLoading) messages.value.pop()
    }
  } finally {
    isLoading.value = false
    currentAbortController = null
    saveLoadingState()
    await scrollToBottom()
  }
}

// 发送初始消息
const sendInitialMessage = async () => {
  const aiMessage = {
    id: Date.now(),
    type: 'ai',
    content: '',
    timestamp: new Date(),
    isLoading: true,
    query: props.initialMessage
  }
  messages.value.push(aiMessage)
  await scrollToBottom()
  isLoading.value = true
  saveLoadingState()
  currentAbortController = new AbortController()
  try {
    let fullResponse = ''
    await sendMessageToLLMStream(props.initialMessage, [], (chunk) => {
      fullResponse += chunk
      aiMessage.content = fullResponse
      aiMessage.isLoading = false
      saveMessagesToStorage()
      scrollToBottom()
    }, currentAbortController.signal)
    aiMessage.isLoading = false
    aiMessage.content = fullResponse
    saveMessagesToStorage()
  } catch (error) {
    if (error.name === 'AbortError') {
      const lastMessage = messages.value[messages.value.length - 1]
      if (lastMessage && lastMessage.isLoading) messages.value.pop()
    } else {
    errorMessage.value = error.message || '生成旅行计划失败，请稍后重试'
      const lastMessage = messages.value[messages.value.length - 1]
      if (lastMessage && lastMessage.isLoading) messages.value.pop()
    }
  } finally {
    isLoading.value = false
    currentAbortController = null
    saveLoadingState()
    await scrollToBottom()
  }
}

// 恢复所有未完成的AI回复
const recoverAllUnfinishedAIReplies = async () => {
  for (const msg of messages.value) {
    if (msg.type === 'ai' && msg.isLoading && msg.query) {
      isLoading.value = true
      currentAbortController = new AbortController()
      try {
        let fullResponse = ''
        const conversationHistory = getHistoryBefore(msg)
        await sendMessageToLLMStream(msg.query, conversationHistory, (chunk) => {
          fullResponse += chunk
          msg.content = fullResponse
          msg.isLoading = false
          saveMessagesToStorage()
          scrollToBottom()
        }, currentAbortController.signal)
        msg.isLoading = false
        msg.content = fullResponse
        saveMessagesToStorage()
      } catch (error) {
        if (error.name === 'AbortError') {
          const lastMessage = messages.value[messages.value.length - 1]
          if (lastMessage && lastMessage.isLoading) messages.value.pop()
        } else {
          errorMessage.value = error.message || '生成AI回复失败，请稍后重试'
          const lastMessage = messages.value[messages.value.length - 1]
          if (lastMessage && lastMessage.isLoading) messages.value.pop()
        }
      } finally {
        isLoading.value = false
        currentAbortController = null
        saveLoadingState()
        await scrollToBottom()
      }
    }
  }
}

// 初始化
onMounted(async () => {
  loadMessagesFromStorage()
  restoreLoadingState()
  await recoverAllUnfinishedAIReplies()
  if (props.initialMessage && messages.value.length === 0) {
    await sendInitialMessage()
  }
  await scrollToTop()
  emit('chat-ready')
})

onActivated(async () => {
  loadMessagesFromStorage()
  restoreLoadingState()
  await recoverAllUnfinishedAIReplies()
  if (props.initialMessage && messages.value.length === 0) {
    await sendInitialMessage()
  }
  if (messages.value.length > 0) {
    await scrollToBottom()
  } else {
    await scrollToTop()
  }
})

// 组件销毁前清理
onBeforeUnmount(() => {
  // 取消当前请求
  if (currentAbortController) {
    currentAbortController.abort()
  }
  // 保存当前状态
  saveMessagesToStorage()
  saveLoadingState()
  // 保存AI请求上下文
  const loadingMsg = messages.value.find(m => m.isLoading && m.type === 'ai')
  if (loadingMsg) {
    saveLastAIQuery(loadingMsg.id, loadingMsg.content)
  }
})

// 监听初始消息变化，确保新对话从顶部开始
watch(() => props.initialMessage, async (newInitialMessage) => {
  if (newInitialMessage) {
    // 只要有新需求，清空历史并生成新对话
    messages.value = []
    errorMessage.value = ''
    isLoading.value = false
    await sendInitialMessage()
    if (messages.value.length <= 1) {
      // 新会话，滚动到顶部
      await scrollToTop()
    } else {
      // 追问，滚动到底部
      await scrollToBottom()
    }
  }
})

// 监听消息变化，保存到本地存储
watch(messages, () => {
  saveMessagesToStorage()
}, { deep: true })

// 监听加载状态变化，保存到本地存储
watch(isLoading, () => {
  saveLoadingState()
})
</script>

<style scoped>
/* 加载动画 */
.loading-animation {
  display: inline-block;
  width: 1rem;
  height: 1rem;
  border: 2px solid #f3f3f3;
  border-radius: 50%;
  border-top: 2px solid #3498db;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 聊天容器滚动条样式 */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>    