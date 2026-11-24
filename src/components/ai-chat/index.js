import { setAiChatConfig } from './config'
import AiChatPanel from './ai-chat-panel.vue'
import AiChatResult from './ai-chat-result.vue'
import AiChatDialog from './ai-chat-dialog.vue'

// AI 通用会话组件统一入口（可移植公共组件）
// - AiChatDialog：悬浮球 + 自研遮罩弹窗宿主（整站通用入口）
// - AiChatPanel：核心会话面板（页面内嵌形态可直接使用）
// - AiChatResult：结构化结果渲染（文本/表格/图表，可独立复用）
//
// 用法（宿主 main.js）：
//   import AiChat from '@/components/ai-chat'
//   Vue.use(AiChat, {
//     caller: 'xxx',                       // X-Caller 调用方标识
//     baseURL: 'https://agent.zhxiaoyuan.cn', // AI 网关地址（可选，有默认值；接口为 /ai/conversation|message|run/*）
//     theme: { primary: '#2f7a68' },      // 主题色（可选，有默认值）
//     getToken: () => store.getters.token // 令牌获取函数（鉴权必需）
//   })
const components = {
  AiChatPanel,
  AiChatResult,
  AiChatDialog
}

// Vue 插件安装：注入运行时配置并全局注册三个组件
function install(Vue, options = {}) {
  setAiChatConfig(options)
  Object.keys(components).forEach((name) => {
    Vue.component(name, components[name])
  })
}

export { setAiChatConfig, AiChatPanel, AiChatResult, AiChatDialog }
export default { install }
