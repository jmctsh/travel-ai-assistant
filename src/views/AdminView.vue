<template>
  <div class="bg-gray-50 min-h-screen">
    <!-- 顶部导航栏 -->
    <header class="bg-white shadow-sm sticky top-0 z-50">
      <div class="flex items-center justify-between py-4 px-6">
        <div class="flex items-center space-x-2">
          <i class="fa fa-cog text-blue-500 text-xl"></i>
          <h1 class="text-xl font-bold text-gray-800">AI旅游助手 - 管理后台</h1>
        </div>
        <div class="flex items-center space-x-4">
          <button @click="saveChanges" :disabled="isSaving" class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400">
            <i class="fa fa-save mr-1"></i>
            <span v-if="isSaving">保存中...</span>
            <span v-else>保存更改</span>
          </button>
          <router-link to="/" class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
            <i class="fa fa-external-link mr-1"></i>查看前端
          </router-link>
        </div>
      </div>
    </header>

    <main class="p-6">
      <div v-if="isLoading" class="text-center">
        <p>正在加载配置...</p>
      </div>
      <div v-else class="max-w-7xl mx-auto space-y-6">
        <!-- API密钥配置提示 -->
        <div class="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-lg" role="alert">
          <p class="font-bold">API密钥管理</p>
          <p>为了保障安全，API密钥现在通过项目根目录下的 <code class="font-mono bg-yellow-200 px-1 rounded">.env.local</code> 文件进行管理。请在代码编辑器中打开该文件进行修改。</p>
        </div>

        <!-- 问候语设置 -->
        <div class="bg-white rounded-xl shadow-md p-6">
          <h2 class="text-xl font-bold text-gray-800 mb-4">首页问候语</h2>
          <textarea v-model="appData.homeGreeting" rows="3" class="w-full p-3 border border-gray-300 rounded-lg"></textarea>
        </div>

        <!-- AI模型配置 -->
        <div class="bg-white rounded-xl shadow-md p-6">
          <h2 class="text-xl font-bold text-gray-800 mb-4">AI模型配置</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">模型提供商</label>
              <select v-model="appData.llm.provider" class="w-full p-2 border border-gray-300 rounded-lg">
                <option value="deepseek">DeepSeek</option>
                <option value="ark">豆包 Ark</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">模型版本</label>
              <select v-model="appData.llm.model" class="w-full p-2 border border-gray-300 rounded-lg">
                <option v-for="model in availableModels" :key="model.value" :value="model.value">
                  {{ model.label }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">温度参数 (Temperature)</label>
              <input v-model.number="appData.llm.temperature" type="number" min="0" max="2" step="0.1" class="w-full p-2 border border-gray-300 rounded-lg">
            </div>
          </div>
        </div>

        <!-- 内容分类管理 -->
        <div class="bg-white rounded-xl shadow-md p-6">
          <h2 class="text-xl font-bold text-gray-800 mb-4">“猜你想了解”内容管理</h2>
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div v-for="(category, key) in appData.categories" :key="key" class="border border-gray-200 rounded-lg p-4">
              <h3 class="text-lg font-bold text-gray-700 mb-3">{{ category.title }}</h3>
              <div class="space-y-2">
                <div v-for="(item, index) in category.items" :key="item.id" class="flex items-center space-x-2">
                  <input v-model="item.name" class="flex-1 p-2 border border-gray-300 rounded" placeholder="请输入内容">
                  <button @click="removeItem(key, index)" class="text-red-500 hover:text-red-700">
                    <i class="fa fa-trash"></i>
                  </button>
                </div>
              </div>
              <button @click="addItem(key)" class="mt-3 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm">
                <i class="fa fa-plus mr-1"></i>添加新一项
              </button>
            </div>
          </div>
        </div>

        <!-- 图片管理 -->
        <div class="bg-white rounded-xl shadow-md p-6">
          <h2 class="text-xl font-bold text-gray-800 mb-4">图片管理</h2>
          <div class="space-y-4">
            <div v-for="(image, index) in appData.images" :key="image.id" class="border border-gray-200 rounded-lg p-4">
              <div class="flex items-center space-x-4">
                <img :src="image.url" @error="onImageError" alt="图片预览" class="w-24 h-16 object-cover rounded-lg bg-gray-100">
                <div class="flex-1 space-y-2">
                  <input v-model="image.name" class="w-full p-2 border border-gray-300 rounded" placeholder="图片描述">
                  <input v-model="image.url" class="w-full p-2 border border-gray-300 rounded" placeholder="图片URL或本地路径">
                </div>
                <button @click="removeImage(index)" class="text-red-500 hover:text-red-700 self-start">
                  <i class="fa fa-trash fa-lg"></i>
                </button>
              </div>
            </div>
          </div>
          <div class="mt-4 flex items-center space-x-4">
            <button @click="addImage" class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
              <i class="fa fa-plus mr-1"></i>添加图片URL
            </button>
            <div class="relative">
              <input type="file" @change="handleImageUpload" accept="image/*" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer">
              <button class="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600">
                <i class="fa fa-upload mr-1"></i>上传本地图片
              </button>
            </div>
          </div>
          <p class="text-sm text-gray-500 mt-2">提示：上传的本地图片将保存在 <code class="font-mono bg-gray-200 px-1 rounded">public/uploads</code> 文件夹中，请确保部署时一同上传该文件夹。</p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue';

const isLoading = ref(true);
const isSaving = ref(false);
const appData = reactive({
  homeGreeting: '',
  categories: {},
  images: [],
  llm: { provider: 'deepseek', model: 'deepseek-chat', temperature: 0.7 },
  weather: {}
});

// 模型配置，用于动态生成选项
const modelConfigs = {
  deepseek: [
    { value: 'deepseek-chat', label: 'DeepSeek V3 (Chat)' },
    { value: 'deepseek-reasoner', label: 'DeepSeek R1 (Reasoner)' }
  ],
  ark: [
    { value: 'doubao-seed-1-6-250615', label: 'Doubao-Seed-1.6' }
  ]
};

// 计算当前可用的模型选项
const availableModels = computed(() => {
  return modelConfigs[appData.llm.provider] || [];
});

// 监听提供商变化，如果当前模型不属于新提供商，则自动选择第一个
watch(() => appData.llm.provider, (newProvider) => {
  const models = modelConfigs[newProvider];
  if (models && !models.some(m => m.value === appData.llm.model)) {
    appData.llm.model = models[0].value;
  }
});

// 加载数据
const loadAppData = async () => {
  isLoading.value = true;
  try {
    const response = await fetch('/app-data.json');
    const data = await response.json();
    Object.assign(appData, data);
  } catch (error) {
    console.error('加载应用数据失败:', error);
    alert('加载应用数据失败，请检查public/app-data.json文件。');
  } finally {
    isLoading.value = false;
  }
};

// 添加分类项目
const addItem = (categoryKey) => {
  appData.categories[categoryKey].items.push({
    id: `new_${Date.now()}`,
    name: '',
    type: categoryKey.slice(0, -1)
  });
};

// 删除分类项目
const removeItem = (categoryKey, index) => {
  appData.categories[categoryKey].items.splice(index, 1);
};

// 添加图片（通过URL）
const addImage = () => {
  appData.images.unshift({ id: `new_${Date.now()}`, name: '', url: '' });
};

// 删除图片
const removeImage = async (index) => {
  try {
    const image = appData.images[index];
    
    // 检查是否是本地上传的图片（以/uploads/开头）
    if (image.url && image.url.startsWith('/uploads/')) {
      // 提取文件名
      const fileName = image.url.split('/').pop();
      
      // 发送请求删除服务器上的文件
      const response = await fetch('/api/delete-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName })
      });
      
      if (!response.ok) {
        console.warn('无法删除服务器上的图片文件，但会继续删除记录');
      }
    }
    
    // 从数组中移除图片记录
    appData.images.splice(index, 1);
  } catch (error) {
    console.error('删除图片失败:', error);
    alert('删除图片记录成功，但无法删除服务器上的实际文件');
  }
};

// 处理图片上传
const handleImageUpload = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      // 显示上传中状态
      isSaving.value = true;
      
      // 获取用户输入的图片名称
      const imageName = prompt('请输入景区名称:', file.name.split('.')[0]);
      if (!imageName) {
        isSaving.value = false;
        return; // 用户取消了输入
      }
      
      // 发送图片数据到服务器
      const response = await fetch('/api/upload-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageData: e.target.result,
          fileName: file.name,
          imageName: imageName
        })
      });
      
      if (!response.ok) {
        throw new Error('图片上传失败');
      }
      
      const result = await response.json();
      
      // 添加图片到列表
      appData.images.unshift({
        id: `new_${Date.now()}`,
        name: result.name, // 使用用户输入的名称
        url: result.url
      });
      
      alert('图片上传成功！');
    } catch (error) {
      console.error('图片上传失败:', error);
      alert(`图片上传失败: ${error.message}`);
    } finally {
      isSaving.value = false;
    }
  };
  reader.readAsDataURL(file);
};


// 图片加载失败时的处理
const onImageError = (event) => {
  event.target.src = 'https://via.placeholder.com/96x64?text=URL无效';
};

// 保存更改
const saveChanges = async () => {
  isSaving.value = true;
  try {
    // 在Vite开发环境中，我们可以通过一个特殊的POST请求来请求服务器写入文件
    // 这依赖于一个自定义的Vite插件或中间件，这里我们先模拟这个行为
    // 在生产环境中，这需要一个真实的后端API
    await fetch('/api/update-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appData)
    });
    alert('保存成功！');
  } catch (error) {
    console.error('保存失败:', error);
    alert('保存失败！请查看控制台获取更多信息。\n在当前模式下，您可能需要手动将更改复制到 public/app-data.json 文件中。');
  } finally {
    isSaving.value = false;
  }
};

onMounted(loadAppData);
</script>