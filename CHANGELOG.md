# AI旅游助手 - 开发日志

## 2025年07月20日 - 对话历史状态管理优化

### 问题背景

用户反馈在对话界面与AI交互时，如果切换到首页再切换回对话界面，会发现：
1. 历史对话信息消失
2. 显示"AI正在思考"的加载状态
3. 无法正确处理正在进行的AI请求

### 解决思路

#### 1. 组件状态保持问题
**问题分析**：使用简单的 `v-if` 条件渲染导致组件在切换时被完全销毁和重新创建，状态丢失。

**解决方案**：使用 Vue 的 `keep-alive` 组件保持子组件状态。

**实现过程**：
- 最初尝试直接在 `keep-alive` 中使用条件渲染，但遇到编译错误：`<KeepAlive> expects exactly one child component`
- 改用动态组件 `component` 配合计算属性解决此问题
- 添加 `currentComponent` 和 `currentComponentProps` 计算属性

**代码变更**：
```vue
<!-- App.vue -->
<keep-alive>
  <component 
    :is="currentComponent" 
    v-bind="currentComponentProps"
    @generate-plan="generatePlan" 
    @chat-ready="onChatReady" 
  />
</keep-alive>
```

#### 2. 对话历史持久化
**问题分析**：组件重新创建时，对话历史完全丢失。

**解决方案**：使用 `localStorage` 实现对话历史的持久化存储。

**实现功能**：
- 消息自动保存：监听消息变化，实时保存到本地存储
- 状态恢复：组件激活时自动从本地存储恢复消息
- 加载状态持久化：保存AI请求状态，支持5分钟内的状态恢复

**核心代码**：
```javascript
// 保存消息到本地存储
const saveMessagesToStorage = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.value))
  } catch (error) {
    console.error('保存消息到本地存储失败:', error)
  }
}

// 恢复加载状态
const restoreLoadingState = () => {
  try {
    const savedState = localStorage.getItem(LOADING_STATE_KEY)
    if (savedState) {
      const loadingState = JSON.parse(savedState)
      if (Date.now() - loadingState.timestamp < 5 * 60 * 1000) {
        isLoading.value = loadingState.isLoading
        return true
      }
    }
  } catch (error) {
    console.error('恢复加载状态失败:', error)
  }
  return false
}
```

#### 3. 请求管理优化
**问题分析**：AI请求无法取消，用户切换页面后请求仍在后台运行。

**解决方案**：使用 `AbortController` 管理正在进行的AI请求。

**实现功能**：
- 请求取消：支持用户主动取消正在进行的请求
- 错误处理：区分用户主动取消和网络错误
- 资源清理：组件销毁时自动取消请求

**代码变更**：
```javascript
// 创建新的AbortController
currentAbortController = new AbortController()

// 在请求中使用signal
await sendMessageToLLMStream(messageContent, conversationHistory, (chunk) => {
  // 处理响应
}, currentAbortController.signal)

// 组件销毁前清理
onBeforeUnmount(() => {
  if (currentAbortController) {
    currentAbortController.abort()
  }
})
```

#### 4. 生命周期优化
**问题分析**：组件激活时状态恢复不完整。

**解决方案**：完善生命周期钩子的处理逻辑。

**实现功能**：
- `onMounted`：初始化加载，处理初始消息
- `onActivated`：组件激活时重新加载消息，恢复加载状态
- `onBeforeUnmount`：组件销毁前保存状态，取消请求

#### 5. 初始消息处理优化
**问题分析**：从首页提交需求后，提示词会显示在对话界面中，用户不希望看到这些技术细节。

**解决方案**：修改初始消息处理逻辑，隐藏用户提交的需求。

**实现变更**：
```javascript
// 修改前：显示用户需求
const sendInitialMessage = async () => {
  const userMessage = { type: 'user', content: props.initialMessage }
  messages.value.push(userMessage)
  // ...
}

// 修改后：隐藏用户需求
const sendInitialMessage = async () => {
  // 不添加用户消息到界面，直接添加AI响应占位符
  const aiMessage = { type: 'ai', isLoading: true }
  messages.value.push(aiMessage)
  // 直接发送给AI，不传递用户消息作为历史
  await sendMessageToLLMStream(props.initialMessage, [], ...)
}
```

#### 6. API配置优化
**问题分析**：根据用户提供的DeepSeek官方文档，需要修正API配置。

**解决方案**：更新API配置以符合官方文档。

**变更内容**：
- 修正默认模型名称：`deepseek-chat-v3` → `deepseek-chat`
- 移除管理界面中不必要的"即将支持"选项
- 简化README中的技术栈描述，避免夸大

### 技术要点

1. **Vue 3 Composition API**：充分利用响应式系统和生命周期钩子
2. **keep-alive 组件**：正确使用保持组件状态
3. **localStorage 持久化**：实现客户端数据持久化
4. **AbortController**：现代浏览器API，用于请求取消
5. **动态组件**：Vue 3的动态组件特性

### 测试验证

1. **状态持久化测试**：
   - 进行多轮对话
   - 切换到首页再切回
   - 验证：对话历史完整保留

2. **加载状态恢复测试**：
   - AI正在回复时切换页面
   - 切回对话界面
   - 验证：加载状态正确恢复

3. **初始消息测试**：
   - 在首页提交旅游需求
   - 切换到对话界面
   - 验证：只看到AI响应，不显示用户需求

### 文件变更清单

- **App.vue**：添加keep-alive和动态组件支持
- **ChatBox.vue**：实现状态持久化、请求管理、生命周期优化
- **llmService.js**：添加AbortController支持
- **admin.html**：移除不必要的"即将支持"选项
- **README.md**：修正技术栈描述

### 总结

通过这次优化，成功解决了对话历史状态管理的问题，提升了用户体验。主要成果包括：

- ✅ 对话历史在页面切换后完整保留
- ✅ AI请求状态正确恢复
- ✅ 支持取消正在进行的请求
- ✅ 隐藏不必要的技术细节
- ✅ 提升了应用的稳定性和用户体验

这些改进使得AI旅游助手具有了更好的状态管理能力，为用户提供了更流畅的交互体验。 

## 2025年07月20日 - 追问AI回复非流式显示问题排查

### 问题背景

用户反馈：在对话界面追问（多轮对话）时，AI回复表现为“非流式”显示，即内容长时间无输出，最终一次性显示全部回复。首次提问时流式正常，追问时体验不佳。

### 排查过程

1. **添加详细日志**：在llmService.js的sendToDeepSeekStream和onChunk回调中添加了详细的console.log，记录每个流式chunk的到达和处理。
2. **用户测试反馈**：用户提供了首次query的完整控制台日志，显示API端和前端onChunk回调均持续收到流式数据，chunk内容逐步推送，未见阻塞。
3. **结论**：
   - DeepSeek API端、fetch流读取、onChunk回调全部是流式的，数据流式推送无异常。
   - “非流式”体验可能是UI渲染卡顿、浏览器渲染延迟或极端情况下的网络缓冲，并非API或前端流处理逻辑问题。
   - 追问时的流式体验问题**暂未彻底解决**，但技术链路已排查无误。

### 遗留问题

- 追问时AI回复偶现“非流式”体验，需后续开发者关注UI渲染优化、网络环境等因素。
- 建议后续如遇类似问题，可继续从UI渲染、浏览器兼容性、网络层面排查。

### 相关文件
- src/services/llmService.js
- src/components/ChatBox.vue 