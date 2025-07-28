<template>
  <div class="max-w-4xl mx-auto">
    <!-- 问候语 -->
    <div class="bg-white rounded-xl shadow-md p-6 mb-6 transform transition-all hover:shadow-lg">
      <h2 class="text-xl font-bold text-gray-800 mb-2">
        <i class="fa fa-hand-wave text-blue-500 mr-2"></i>{{ homeGreeting }}
      </h2>
      <p class="text-gray-600" style="text-indent: 0;">告诉我您的旅行偏好，我将为您定制专属的旅行计划</p>
    </div>
    
    <!-- 猜你想了解 -->
    <div class="bg-white rounded-xl shadow-md p-6 mb-6 transform transition-all hover:shadow-lg">
      <h2 class="text-xl font-bold text-gray-800 mb-4">猜你想了解</h2>
      
      <div class="space-y-4">
        <!-- 热门景点 -->
        <div class="border border-gray-200 rounded-lg overflow-hidden">
          <div class="flex items-center justify-between p-4 bg-gray-50 cursor-pointer" @click="toggleCategory('attractions')">
            <div class="flex items-center">
              <i class="fa fa-map-marker text-blue-500 mr-2"></i>
              <h3 class="font-medium text-gray-800">热门景点</h3>
            </div>
            <i class="fa fa-chevron-down text-gray-500 transition-transform duration-300" :class="{ 'rotate-180': categoryOpen['attractions'] }"></i>
          </div>
          
          <div v-show="categoryOpen['attractions']" class="p-4">
            <p class="text-gray-600 mb-4">{{ categories.attractions.description }}</p>
            <div class="flex flex-wrap gap-2 mb-4">
              <span v-for="item in categories.attractions.items" :key="item.id" class="px-3 py-1 rounded-full cursor-pointer transition-colors" :class="isItemSelected(item) ? 'bg-blue-500 text-white font-medium' : 'bg-gray-100 text-gray-800'" @click="toggleItemSelection(item)">
                {{ item.name }}
              </span>
            </div>
            <div class="flex justify-end space-x-2">
              <button @click="toggleCategory('attractions')" class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">关闭</button>
              <button @click="addToItinerary('attractions')" class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">加入行程</button>
            </div>
          </div>
        </div>
        
        <!-- 出游攻略 -->
        <div class="border border-gray-200 rounded-lg overflow-hidden">
          <div class="flex items-center justify-between p-4 bg-gray-50 cursor-pointer" @click="toggleCategory('guides')">
            <div class="flex items-center">
              <i class="fa fa-info-circle text-green-500 mr-2"></i>
              <h3 class="font-medium text-gray-800">出游攻略</h3>
            </div>
            <i class="fa fa-chevron-down text-gray-500 transition-transform duration-300" :class="{ 'rotate-180': categoryOpen['guides'] }"></i>
          </div>
          
          <div v-show="categoryOpen['guides']" class="p-4">
            <p class="text-gray-600 mb-4">{{ categories.guides.description }}</p>
            <div class="flex flex-wrap gap-2 mb-4">
              <span v-for="item in categories.guides.items" :key="item.id" class="px-3 py-1 rounded-full cursor-pointer transition-colors" :class="isItemSelected(item) ? 'bg-green-500 text-white font-medium' : 'bg-gray-100 text-gray-800'" @click="toggleItemSelection(item)">
                {{ item.name }}
              </span>
            </div>
            <div class="flex justify-end space-x-2">
              <button @click="toggleCategory('guides')" class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">关闭</button>
              <button @click="addToItinerary('guides')" class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">加入行程</button>
            </div>
          </div>
        </div>
        
        <!-- 特色线路 -->
        <div class="border border-gray-200 rounded-lg overflow-hidden">
          <div class="flex items-center justify-between p-4 bg-gray-50 cursor-pointer" @click="toggleCategory('routes')">
            <div class="flex items-center">
              <i class="fa fa-road text-purple-500 mr-2"></i>
              <h3 class="font-medium text-gray-800">特色线路</h3>
            </div>
            <i class="fa fa-chevron-down text-gray-500 transition-transform duration-300" :class="{ 'rotate-180': categoryOpen['routes'] }"></i>
          </div>
          
          <div v-show="categoryOpen['routes']" class="p-4">
            <p class="text-gray-600 mb-4">{{ categories.routes.description }}</p>
            <div class="flex flex-wrap gap-2 mb-4">
              <span v-for="item in categories.routes.items" :key="item.id" class="px-3 py-1 rounded-full cursor-pointer transition-colors" :class="isItemSelected(item) ? 'bg-purple-500 text-white font-medium' : 'bg-gray-100 text-gray-800'" @click="toggleItemSelection(item)">
                {{ item.name }}
              </span>
            </div>
            <div class="flex justify-end space-x-2">
              <button @click="toggleCategory('routes')" class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">关闭</button>
              <button @click="addToItinerary('routes')" class="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600">加入行程</button>
            </div>
          </div>
        </div>
        
        <!-- 必吃好店 -->
        <div class="border border-gray-200 rounded-lg overflow-hidden">
          <div class="flex items-center justify-between p-4 bg-gray-50 cursor-pointer" @click="toggleCategory('restaurants')">
            <div class="flex items-center">
              <i class="fa fa-cutlery text-red-500 mr-2"></i>
              <h3 class="font-medium text-gray-800">必吃好店</h3>
            </div>
            <i class="fa fa-chevron-down text-gray-500 transition-transform duration-300" :class="{ 'rotate-180': categoryOpen['restaurants'] }"></i>
          </div>
          
          <div v-show="categoryOpen['restaurants']" class="p-4">
            <p class="text-gray-600 mb-4">{{ categories.restaurants.description }}</p>
            <div class="flex flex-wrap gap-2 mb-4">
              <span v-for="item in categories.restaurants.items" :key="item.id" class="px-3 py-1 rounded-full cursor-pointer transition-colors" :class="isItemSelected(item) ? 'bg-red-500 text-white font-medium' : 'bg-gray-100 text-gray-800'" @click="toggleItemSelection(item)">
                {{ item.name }}
              </span>
            </div>
            <div class="flex justify-end space-x-2">
              <button @click="toggleCategory('restaurants')" class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">关闭</button>
              <button @click="addToItinerary('restaurants')" class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">加入行程</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 图片展示 -->
    <div class="bg-white rounded-xl shadow-md p-6 mb-6 transform transition-all hover:shadow-lg">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-bold text-gray-800">当地美景</h2>
        <button @click="refreshImages" class="flex items-center text-gray-600 hover:text-gray-900">
          <i class="fa fa-refresh mr-1"></i>
          <span>换一换</span>
        </button>
      </div>
      
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="(image, index) in displayedImages" :key="index" class="group">
          <div class="overflow-hidden rounded-lg">
            <img :src="image.url" :alt="image.name" class="w-full h-48 object-cover" />
            <div class="bg-white p-2 text-center">
              <h3 class="text-gray-800 font-medium text-sm">{{ image.name }}</h3>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 定制行程 -->
    <div class="bg-white rounded-xl shadow-md p-6 transform transition-all hover:shadow-lg">
      <h2 class="text-xl font-bold text-gray-800 mb-4" style="color: #1f2937 !important;">定制你的专属行程</h2>
      
      <!-- 已选内容 -->
      <div v-if="itineraryItems.length > 0" class="mb-6">
        <h3 class="font-medium text-gray-800 mb-2">已选内容</h3>
        <div class="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg">
          <span v-for="item in itineraryItems" :key="item.id" class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full flex items-center">
            {{ item.name }}
            <button @click="removeFromItinerary(item)" class="ml-1 text-blue-600 hover:text-blue-800">
              <i class="fa fa-times-circle"></i>
            </button>
          </span>
        </div>
      </div>
      
      <!-- 行程信息 -->
      <div class="space-y-4">
        <!-- 日期选择 -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-800 mb-1" style="color: #1f2937 !important;">出发日期</label>
            <input v-model="travelPlan.startDate" type="date" class="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800" style="color: #1f2937 !important;" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-800 mb-1" style="color: #1f2937 !important;">结束日期</label>
            <input v-model="travelPlan.endDate" type="date" class="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800" style="color: #1f2937 !important;" />
          </div>
        </div>
        
        <!-- 出行人数 -->
        <div>
          <label class="block text-sm font-medium text-gray-800 mb-1" style="color: #1f2937 !important;">出行人数</label>
          <select v-model="travelPlan.peopleCount" class="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800" style="color: #1f2937 !important;">
            <option value="1">1人</option>
            <option value="2">2人</option>
            <option value="3">3人</option>
            <option value="4">4人</option>
            <option value="5">5人</option>
            <option value="6+">6人及以上</option>
          </select>
        </div>
        
        <!-- 旅游偏好 -->
        <div>
          <label class="block text-sm font-medium text-gray-800 mb-1" style="color: #1f2937 !important;">旅游偏好</label>
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            <label v-for="preference in availablePreferences" :key="preference" class="flex items-center p-2 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
              <input type="checkbox" :value="preference" v-model="travelPlan.preferences" class="mr-2" />
              <span class="text-gray-800" style="color: #1f2937 !important;">{{ preference }}</span>
            </label>
          </div>
        </div>
        
        <!-- 特殊需求 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">特殊需求</label>
          <textarea v-model="travelPlan.specialRequirements" rows="3" class="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900" placeholder="请输入您的特殊需求，例如：希望安排安静的住宿环境、需要轮椅无障碍设施等"></textarea>
        </div>
        
        <!-- 生成按钮 -->
        <div class="flex justify-center mt-6 pb-20 md:pb-0">
          <button @click="generatePlan" class="px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            <i class="fa fa-magic mr-2"></i>生成AI旅行计划
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getWeatherForDateRange, formatWeatherForPrompt } from '../services/weatherService.js'

// 定义emit
const emit = defineEmits(['generate-plan'])

// 首页问候语
const homeGreeting = ref('欢迎来到杭州！我是您的专属AI旅游助手...')

// 分类数据
const categories = reactive({
  attractions: { title: '热门景点', description: '...', items: [] },
  guides: { title: '出游攻略', description: '...', items: [] },
  routes: { title: '特色线路', description: '...', items: [] },
  restaurants: { title: '必吃好店', description: '...', items: [] }
})

// 图片数据
const allImages = ref([])

// 显示的图片
const displayedImages = ref([])

// 分类展开状态
const categoryOpen = ref({
  attractions: false,
  guides: false,
  routes: false,
  restaurants: false
})

// 已选择的项目
const selectedItems = ref({})

// 行程项目
const itineraryItems = ref([])

// 特殊需求
const specialRequirements = ref('')

// 旅游计划
const travelPlan = reactive({
  startDate: '',
  endDate: '',
  peopleCount: '2',
  preferences: [],
  specialRequirements: ''
})

// 可用的旅游偏好
const availablePreferences = ref([
  '自然风光', '人文历史', '美食体验', '休闲度假',
  '亲子游玩', '户外探险', '购物娱乐', '文化艺术'
])

// 切换分类展开状态
const toggleCategory = (category) => {
  categoryOpen.value[category] = !categoryOpen.value[category]
}

// 切换项目选择状态
const toggleItemSelection = (item) => {
  if (selectedItems.value[item.id]) {
    selectedItems.value[item.id] = undefined
  } else {
    selectedItems.value[item.id] = item
  }
}

// 检查项目是否被选中
const isItemSelected = (item) => {
  return selectedItems.value[item.id] && selectedItems.value[item.id] !== undefined
}

// 添加到行程
const addToItinerary = (category) => {
  const categoryItems = categories[category].items
  
  // 如果是出游攻略，只添加到特殊需求
  if (category === 'guides') {
    for (const item of categoryItems) {
      if (selectedItems.value[item.id]) {
        if (travelPlan.specialRequirements) {
          travelPlan.specialRequirements += '\n' + item.name
        } else {
          travelPlan.specialRequirements = item.name
        }
      }
    }
  } else {
    // 其他分类（景点、线路、餐厅）添加到已选内容
    for (const item of categoryItems) {
      if (selectedItems.value[item.id] && !itineraryItems.value.some(i => i.id === item.id)) {
        itineraryItems.value.push(item)
      }
    }
  }
  
  // 清空选择
  for (const item of categoryItems) {
    if (selectedItems.value[item.id]) {
      selectedItems.value[item.id] = undefined
    }
  }
  
  // 关闭分类
  categoryOpen.value[category] = false
}

// 从行程中移除
const removeFromItinerary = (item) => {
  const index = itineraryItems.value.findIndex(i => i.id === item.id)
  if (index > -1) {
    itineraryItems.value.splice(index, 1)
  }
}

// 刷新图片
const refreshImages = () => {
  // 随机选择3张图片
  const shuffled = [...allImages.value].sort(() => 0.5 - Math.random())
  displayedImages.value = shuffled.slice(0, 3)
}



// 生成旅行计划
const generatePlan = async () => {
  // 验证表单
  if (!travelPlan.startDate || !travelPlan.endDate) {
    alert('请选择出发日期和结束日期')
    return
  }
  
  if (travelPlan.startDate > travelPlan.endDate) {
    alert('出发日期不能晚于结束日期')
    return
  }
  
  if (itineraryItems.value.length === 0 && !travelPlan.specialRequirements) {
    alert('请至少选择一个景点、线路、餐厅或攻略')
    return
  }
  
  // 获取天气信息
  let weatherInfo = ''
  try {
    const weatherData = await getWeatherForDateRange(travelPlan.startDate, travelPlan.endDate)
    weatherInfo = formatWeatherForPrompt(weatherData)
  } catch (error) {
    console.error('获取天气信息失败:', error)
    weatherInfo = '\n\n天气信息：暂时无法获取天气数据，建议您查看天气预报。'
  }
  
  // 构建提示词
  const selectedAttractions = itineraryItems.value.filter(item => 
    ['attraction', 'route', 'restaurant'].includes(item.type)
  ).map(item => item.name).join('、')
  
  const preferences = travelPlan.preferences.join('、')
  
  const prompt = `请为我制定一个杭州旅游计划：
出行时间：${travelPlan.startDate} 到 ${travelPlan.endDate}
出行人数：${travelPlan.peopleCount}
${selectedAttractions ? `希望游览的地点：${selectedAttractions}` : ''}
${preferences ? `旅游偏好：${preferences}` : ''}
${travelPlan.specialRequirements ? `特殊需求：${travelPlan.specialRequirements}` : ''}${weatherInfo}

请为我详细规划每天的行程安排，包括景点游览顺序、交通方式、用餐建议和住宿推荐。请根据天气情况调整行程，如雨天可安排室内景点，晴天适合户外活动等。`

  // 触发事件，通知父组件生成计划
  emit('generate-plan', prompt)
}

// 加载应用数据
const loadAppData = async () => {
  try {
    const response = await fetch('/app-data.json');
    if (!response.ok) {
      throw new Error('无法加载应用数据');
    }
    const appData = await response.json();

    // 更新UI数据
    homeGreeting.value = appData.homeGreeting || homeGreeting.value;
    Object.assign(categories, appData.categories);
    allImages.value = appData.images || [];

    // 将llm和weather配置保存到localStorage，供其他服务使用
    const appConfig = {
      llm: appData.llm,
      weather: appData.weather
    };
    localStorage.setItem('travelAssistantConfig', JSON.stringify(appConfig));

  } catch (error) {
    console.error('加载应用数据失败:', error);
    // 在这里可以设置一个错误状态，并在UI上显示提示
  }
};

// 生命周期钩子
onMounted(async () => {
  await loadAppData();

  // 设置默认日期
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  travelPlan.startDate = formatDate(today)
  travelPlan.endDate = formatDate(tomorrow)
  
  // 初始化显示的图片
  refreshImages()
})

// 工具函数：格式化日期
const formatDate = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
</script>

<style scoped>
/* 图片悬停效果 */
.group {
  overflow: hidden;
  border-radius: 0.5rem;
}

.group img {
  transition: transform 0.5s ease;
}

.group:hover img {
  transform: scale(1.1);
}

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
</style>    