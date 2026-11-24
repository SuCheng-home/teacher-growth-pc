/**
 * AI 会话组件运行时配置单例
 * 由 index.js 的 install(Vue, options) 在 main.js 注册时注入；
 * api.js / sse.js / 各组件按需读取，实现与宿主项目解耦。
 */

const DEFAULT_CONFIG = {
  // AI 网关基础地址
  baseURL: 'https://agent.zhxiaoyuan.cn',
  // 调用方标识（X-Caller 请求头）
  caller: '',
  // 请求超时（毫秒）
  timeout: 60000,
  // 主题色：注入组件内部 CSS 变量，不继承宿主全局样式
  theme: {
    primary: '#2f7a68',
    primaryDark: '#245f51',
    primarySoft: '#f4f9f6'
  },
  // 取用户令牌：返回裸 token 或带 Bearer 前缀的字符串，由宿主提供
  getToken: null
}

let current = {
  ...DEFAULT_CONFIG,
  theme: { ...DEFAULT_CONFIG.theme }
}

/**
 * 合并写入运行时配置（浅合并，theme 单独深一层）
 * @param {Object} options 宿主传入的配置项
 * @returns {Object} 合并后的完整配置
 */
export function setAiChatConfig(options = {}) {
  const { theme, ...rest } = options
  current = {
    ...current,
    ...rest,
    theme: { ...current.theme, ...(theme || {}) }
  }
  return current
}

/**
 * 读取当前运行时配置
 * @returns {Object} 配置对象
 */
export function getAiChatConfig() {
  return current
}

/**
 * 生成客户端提交标识（同内容重试须复用；解耦自宿主工具）
 * @param {string} prefix 前缀
 * @returns {string} 只含 [A-Za-z0-9_-] 的唯一串
 */
export function genClientId(prefix = 'c') {
  return prefix + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8)
}
