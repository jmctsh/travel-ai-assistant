# AI旅游助手

一个基于Vue 3的智能旅游规划助手，专为杭州旅游定制，提供个性化的旅行计划建议。

## 功能特性

- 🗺️ **智能旅游规划**：根据用户偏好生成个性化杭州旅游计划
- 🤖 **AI对话助手**：支持自然语言交互，回答旅游相关问题
- 🌤️ **天气集成**：考虑天气因素优化行程安排
- 📱 **响应式设计**：支持桌面端和移动端访问
- 💾 **状态持久化**：对话历史自动保存，切换页面不丢失
- ⚡ **实时响应**：流式AI回复，提供更好的用户体验

## 技术栈

- **前端框架**：Vue 3 + Composition API
- **构建工具**：Vite
- **样式框架**：Tailwind CSS
- **AI服务**：DeepSeek API
- **状态管理**：Vue 3 响应式系统 + localStorage
- **路由管理**：Vue Router

## 快速开始

### 环境要求

- Node.js 16.0 或更高版本
- npm 或 yarn 包管理器

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

访问 `http://localhost:5173` 查看应用。

### 构建生产版本

```bash
npm run build
```

## 项目结构

```
travel-ai-assistant-v5/
├── src/
│   ├── components/          # Vue组件
│   │   ├── HomePage.vue     # 首页组件
│   │   ├── ChatBox.vue      # 对话界面组件
│   │   └── icons/           # 图标组件
│   ├── services/            # 服务层
│   │   ├── llmService.js    # AI服务
│   │   └── weatherService.js # 天气服务
│   ├── router/              # 路由配置
│   ├── assets/              # 静态资源
│   ├── App.vue              # 根组件
│   └── main.js              # 入口文件
├── public/                  # 公共资源
├── index.html               # HTML模板
└── package.json             # 项目配置
```

## 使用指南

### 1. 首页功能

- **选择景点**：从热门景点中选择感兴趣的景点
- **出游攻略**：获取实用的出行建议
- **特色线路**：选择主题旅游路线
- **必吃好店**：推荐当地特色美食
- **定制行程**：填写出行信息生成个性化计划

### 2. AI对话

- **智能问答**：与AI助手进行自然语言交互
- **历史记录**：自动保存对话历史，切换页面不丢失
- **实时回复**：支持流式响应，提供更好的交互体验

### 3. 管理界面

访问 `/admin.html` 进入管理界面，配置：
- AI服务提供商和API密钥
- 模型参数设置
- 系统配置

## 配置说明

### AI服务配置

在管理界面中配置以下信息：

1. **服务提供商**：选择DeepSeek、OpenAI或Anthropic
2. **API密钥**：输入对应的API密钥
3. **模型选择**：选择合适的AI模型
4. **参数调整**：设置温度、最大token等参数

### 支持的AI服务

- **DeepSeek**：推荐使用，支持流式响应
- **OpenAI**：支持GPT系列模型
- **Anthropic**：支持Claude系列模型

## 开发说明

### 状态管理

项目使用Vue 3的响应式系统进行状态管理：

- **组件状态**：使用`ref`和`reactive`管理组件内部状态
- **持久化存储**：使用`localStorage`保存重要数据
- **生命周期**：利用`keep-alive`保持组件状态

### 请求管理

- **AbortController**：支持取消正在进行的请求
- **错误处理**：完善的错误处理和用户反馈
- **加载状态**：智能的加载状态管理

## 部署

### 静态部署

构建后的文件可以部署到任何静态文件服务器：

```bash
npm run build
```

将`dist`目录中的文件上传到服务器即可。

### 环境变量

可以创建`.env`文件配置环境变量：

```env
VITE_API_BASE_URL=your_api_base_url
VITE_APP_TITLE=AI旅游助手
```

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 更新日志

查看 [CHANGELOG.md](CHANGELOG.md) 了解详细的更新历史。

## 联系方式

如有问题或建议，请通过以下方式联系：

- 提交 Issue
- 发送邮件
- 项目讨论区

---

感谢使用AI旅游助手！🎉 

# 重要说明

目前已实现AI回复流式推送，首次提问时体验正常。但在多轮追问时，部分用户可能遇到AI回复内容长时间无输出、最终一次性显示的现象。经详细日志排查，API和前端流处理链路均为流式，问题可能与UI渲染或网络环境有关。后续如遇类似体验，请参考CHANGELOG.md相关说明。 