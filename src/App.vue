<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    <!-- 顶部导航栏 -->
    <header class="bg-white shadow-sm sticky top-0 z-50">
      <div class="flex items-center justify-between py-4 px-6">
        <div class="flex items-center space-x-4">
          <button @click="toggleSidebar" class="md:hidden text-gray-600 hover:text-gray-900">
            <i class="fa fa-bars text-xl"></i>
          </button>
          <div class="flex items-center space-x-2">
            <i class="fa fa-map-signs text-blue-500 text-xl"></i>
            <h1 class="text-xl font-bold text-gray-800">AI旅游助手</h1>
          </div>
        </div>

        <!-- 导航标签 -->
        <nav class="hidden md:flex space-x-6">
          <button @click="currentTab = 'home'" :class="currentTab === 'home' ? 'text-blue-500 font-medium' : 'text-gray-600 hover:text-gray-900'">
            <i class="fa fa-home mr-1"></i>首页
          </button>
          <button @click="currentTab = 'chat'" :class="currentTab === 'chat' ? 'text-blue-500 font-medium' : 'text-gray-600 hover:text-gray-900'">
            <i class="fa fa-comments mr-1"></i>对话
          </button>
        </nav>
      </div>
    </header>

    <!-- 移动端侧边栏 -->
    <div v-if="isSidebarOpen" class="fixed inset-0 z-40 bg-black bg-opacity-50">
      <div class="absolute right-0 top-0 bottom-0 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out">
        <div class="p-4 border-b border-gray-200">
          <div class="flex justify-between items-center">
            <h3 class="font-medium text-gray-800">导航菜单</h3>
            <button @click="toggleSidebar" class="text-gray-500 hover:text-gray-700">
              <i class="fa fa-times"></i>
            </button>
          </div>
        </div>
        <div class="p-4">
          <nav class="space-y-4">
            <button @click="currentTab = 'home'; toggleSidebar()" class="flex items-center space-x-2 w-full text-left py-2 px-4 rounded-lg hover:bg-gray-100">
              <i class="fa fa-home w-5 text-gray-500"></i>
              <span>首页</span>
            </button>
            <button @click="currentTab = 'chat'; toggleSidebar()" class="flex items-center space-x-2 w-full text-left py-2 px-4 rounded-lg hover:bg-gray-100">
              <i class="fa fa-comments w-5 text-gray-500"></i>
              <span>对话</span>
            </button>
          </nav>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <main class="flex-grow p-6">
      <!-- 使用keep-alive保持组件状态 -->
      <keep-alive>
        <component 
          :is="currentComponent" 
          v-bind="currentComponentProps"
          @generate-plan="generatePlan" 
          @chat-ready="onChatReady" 
        />
      </keep-alive>
    </main>

    <!-- 底部导航栏 (模拟"一机游XX"APP的底部导航) -->
    <footer class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 px-4 md:hidden z-30">
      <div class="flex justify-around">
        <button @click="currentTab = 'home'" class="flex flex-col items-center" :class="currentTab === 'home' ? 'text-blue-500' : 'text-gray-500 hover:text-blue-500'">
          <i class="fa fa-home text-lg"></i>
          <span class="text-xs mt-1">首页</span>
        </button>
        <button class="flex flex-col items-center text-gray-500 hover:text-blue-500">
          <i class="fa fa-map-marker text-lg"></i>
          <span class="text-xs mt-1">景点</span>
        </button>
        <button @click="currentTab = 'chat'" class="flex flex-col items-center" :class="currentTab === 'chat' ? 'text-blue-500' : 'text-gray-500 hover:text-blue-500'">
          <i class="fa fa-robot text-lg"></i>
          <span class="text-xs mt-1">AI助手</span>
        </button>
        <button class="flex flex-col items-center text-gray-500 hover:text-blue-500">
          <i class="fa fa-ticket text-lg"></i>
          <span class="text-xs mt-1">票务</span>
        </button>
        <button class="flex flex-col items-center text-gray-500 hover:text-blue-500">
          <i class="fa fa-user text-lg"></i>
          <span class="text-xs mt-1">我的</span>
        </button>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, provide, computed } from 'vue'
import HomePage from './components/HomePage.vue'
import ChatBox from './components/ChatBox.vue'

// 当前活动标签页
const currentTab = ref('home')

// 侧边栏状态
const isSidebarOpen = ref(false)

// 初始消息（从首页传递过来的旅行计划需求）
const initialMessage = ref('')

// 聊天组件是否已准备就绪
const chatReady = ref(false)

// 计算当前应该显示的组件
const currentComponent = computed(() => {
  return currentTab.value === 'home' ? HomePage : ChatBox
})

// 计算当前组件的props
const currentComponentProps = computed(() => {
  if (currentTab.value === 'chat') {
    return {
      initialMessage: initialMessage.value
    }
  }
  return {}
})

// 切换侧边栏
const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

// 生成旅行计划
const generatePlan = (prompt) => {
  // 清空之前的对话历史和状态
  localStorage.removeItem('chatMessages')
  localStorage.removeItem('chatLoadingState')
  localStorage.removeItem('lastAIQuery')
  
  // 保存提示词并切换到聊天页面
  initialMessage.value = prompt
  currentTab.value = 'chat'
}

// 聊天组件准备就绪回调
const onChatReady = () => {
  chatReady.value = true
}

// 向子组件提供全局状态
provide('appState', {
  currentTab,
  chatReady
})

// 监听标签页切换，重置页面滚动位置
watch(currentTab, async () => {
  await nextTick()
  // 重置页面滚动到顶部
  window.scrollTo(0, 0)
})
</script>

<style scoped>
/* 全局样式 */
body {
  font-family: 'Inter', system-ui, sans-serif;
}

/* 动画效果 */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>