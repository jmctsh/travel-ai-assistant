import MarkdownIt from 'markdown-it'
import { ref, computed } from 'vue'

// 创建Markdown实例
const md = new MarkdownIt({
  html: false, // 禁用HTML标签以提高安全性
  xhtmlOut: true, // 使用XHTML输出
  breaks: true, // 将换行符转换为<br>
  linkify: true, // 自动识别链接
  typographer: true, // 启用一些语言中性的替换和引号美化
})

// 自定义渲染规则
md.renderer.rules.table_open = () => '<table class="min-w-full divide-y divide-gray-200 my-4">'
md.renderer.rules.thead_open = () => '<thead class="bg-gray-50">'
md.renderer.rules.tbody_open = () => '<tbody class="bg-white divide-y divide-gray-200">'
md.renderer.rules.tr_open = () => '<tr>'
md.renderer.rules.th_open = () => '<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">'
md.renderer.rules.td_open = () => '<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">'

// 自定义代码块样式
md.renderer.rules.code_inline = (tokens, idx) => {
  const token = tokens[idx]
  return `<code class="bg-gray-100 text-red-600 px-1 py-0.5 rounded text-sm font-mono">${md.utils.escapeHtml(token.content)}</code>`
}

md.renderer.rules.code_block = (tokens, idx) => {
  const token = tokens[idx]
  return `<pre class="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto my-4"><code class="font-mono text-sm">${md.utils.escapeHtml(token.content)}</code></pre>`
}

md.renderer.rules.fence = (tokens, idx) => {
  const token = tokens[idx]
  const lang = token.info.trim()
  const langClass = lang ? ` language-${lang}` : ''
  return `<pre class="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto my-4"><code class="font-mono text-sm${langClass}">${md.utils.escapeHtml(token.content)}</code></pre>`
}

// 自定义列表渲染 - 不换行显示
// md.renderer.rules.bullet_list_open = () => '<ul style="margin: 0.5rem 0; padding-left: 1.5rem; list-style-type: disc; display: inline-block; width: 100%;">'
// md.renderer.rules.ordered_list_open = () => '<ol style="margin: 0.5rem 0; padding-left: 1.5rem; list-style-type: decimal; display: inline-block; width: 100%;">'
// md.renderer.rules.list_item_open = () => '<li style="margin: 0.25rem 0; line-height: 1.5; display: inline-block; width: 100%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">'

// 自定义引用样式
md.renderer.rules.blockquote_open = () => '<blockquote class="border-l-4 border-blue-500 pl-4 py-2 my-4 bg-blue-50 text-gray-700 italic">'

// 自定义标题样式
md.renderer.rules.heading_open = (tokens, idx) => {
  const token = tokens[idx]
  const level = token.tag
  const classes = {
    h1: 'text-3xl font-bold text-gray-900 mt-6 mb-4',
    h2: 'text-2xl font-semibold text-gray-800 mt-5 mb-3',
    h3: 'text-xl font-medium text-gray-800 mt-4 mb-2',
    h4: 'text-lg font-medium text-gray-700 mt-3 mb-2',
    h5: 'text-base font-medium text-gray-700 mt-2 mb-1',
    h6: 'text-sm font-medium text-gray-600 mt-2 mb-1'
  }
  return `<${level} class="${classes[level] || ''}">`
}

// 自定义段落样式
md.renderer.rules.paragraph_open = () => '<p class="text-gray-800 leading-relaxed my-3">'

// 自定义链接样式
md.renderer.rules.link_open = (tokens, idx) => {
  const token = tokens[idx]
  const href = token.attrGet('href')
  return `<a href="${href}" class="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer">`
}

// 自定义强调样式
md.renderer.rules.strong_open = () => '<strong class="font-semibold text-gray-900">'
md.renderer.rules.em_open = () => '<em class="italic text-gray-700">'

/**
 * Markdown渲染组合式函数
 */
export function useMarkdown() {
  /**
   * 渲染Markdown文本为HTML
   * @param {string} content - Markdown内容
   * @returns {string} 渲染后的HTML
   */
  const renderMarkdown = (content) => {
    if (!content || typeof content !== 'string') {
      return ''
    }
    
    try {
      return md.render(content)
    } catch (error) {
      console.error('Markdown渲染失败:', error)
      // 如果渲染失败，返回转义后的纯文本
      return md.utils.escapeHtml(content).replace(/\n/g, '<br>')
    }
  }

  /**
   * 创建响应式的Markdown渲染计算属性
   * @param {Ref<string>} contentRef - 响应式的内容引用
   * @returns {ComputedRef<string>} 渲染后的HTML计算属性
   */
  const createMarkdownComputed = (contentRef) => {
    return computed(() => renderMarkdown(contentRef.value))
  }

  /**
   * 检查内容是否包含Markdown语法
   * @param {string} content - 要检查的内容
   * @returns {boolean} 是否包含Markdown语法
   */
  const hasMarkdownSyntax = (content) => {
    if (!content || typeof content !== 'string') {
      return false
    }
    
    // 检查常见的Markdown语法
    const markdownPatterns = [
      /^#{1,6}\s/, // 标题
      /\*\*.*\*\*/, // 粗体
      /\*.*\*/, // 斜体
      /`.*`/, // 行内代码
      /```[\s\S]*```/, // 代码块
      /^\s*[-*+]\s/, // 无序列表
      /^\s*\d+\.\s/, // 有序列表
      /^\s*>\s/, // 引用
      /\[.*\]\(.*\)/, // 链接
      /!\[.*\]\(.*\)/, // 图片
    ]
    
    return markdownPatterns.some(pattern => pattern.test(content))
  }

  return {
    renderMarkdown,
    createMarkdownComputed,
    hasMarkdownSyntax
  }
}