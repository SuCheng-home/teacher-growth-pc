/**
 * Markdown 渲染：markdown-it 解析 + DOMPurify 消毒。
 * markdown-it 关闭原始 HTML（html: false），AI 返回文本中的 <script> 等标签
 * 只作为纯文本展示；再由 DOMPurify 对生成 HTML 做二次白名单过滤，双重防 XSS。
 * 链接统一新窗口打开并附加 rel 安全属性。
 */
import MarkdownIt from 'markdown-it'
import DOMPurify from 'dompurify'

const md = new MarkdownIt({
  html: false,
  linkify: true,
  breaks: true,
  typographer: false
})

// 外链安全处理：新窗口打开，阻断 opener/window.name 攻击面
const defaultLinkRender = md.renderer.rules.link_open || function (tokens, idx, options, _env, self) {
  return self.renderToken(tokens, idx, options)
}
md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
  tokens[idx].attrSet('target', '_blank')
  tokens[idx].attrSet('rel', 'noopener noreferrer')
  return defaultLinkRender(tokens, idx, options, env, self)
}

// 消毒白名单：仅放行常规富文本标签，禁止 script/iframe/事件属性等
const PURIFY_CONFIG = {
  USE_PROFILES: { html: true },
  FORBID_TAGS: ['style', 'script', 'iframe', 'form', 'input'],
  FORBID_ATTR: ['style', 'onerror', 'onload', 'onclick']
}

/**
 * 将 Markdown 文本渲染为安全 HTML 字符串（外层包 .acr-md 容器供组件样式作用域）
 * @param {string} raw 原始 Markdown 文本
 * @returns {string} 消毒后的 HTML
 */
export function renderMarkdown(raw) {
  const text = String(raw == null ? '' : raw)
  if (!text) return ''
  const html = `<div class="acr-md">${md.render(text)}</div>`
  return DOMPurify.sanitize(html, PURIFY_CONFIG)
}
