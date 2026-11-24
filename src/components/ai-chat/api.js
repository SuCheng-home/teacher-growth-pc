import axios from 'axios'
import { getAiChatConfig } from './config'

// ==================== AI 通用会话（会话管理 + 业务对话）====================
// 公共组件专用：直接依赖 axios，不耦合任何宿主请求库/业务实例。
// baseURL、X-Caller、Authorization 均来自 config.js 运行时配置（注册时注入）。
// 后端为动作式路径：/ai/conversation/*、/ai/message/*、/ai/run/*、/ai/queue/*
const CONV_BASE = '/ai/conversation'
const MSG_BASE = '/ai/message'
const RUN_BASE = '/ai/run'

// 统一请求：注入 baseURL、超时、X-Caller 与用户令牌，返回后端响应体 { code, success, data, msg }
function request(options) {
  const cfg = getAiChatConfig()
  const headers = Object.assign({ 'X-Caller': cfg.caller || '' }, options.headers || {})
  const token = cfg.getToken ? cfg.getToken() : ''
  if (token) {
    headers.Authorization = /^Bearer\s/i.test(token) ? token : `Bearer ${token}`
  }
  return axios
    .request({
      baseURL: cfg.baseURL,
      timeout: cfg.timeout || 60000,
      ...options,
      headers
    })
    .then((res) => res.data)
}

// ---------- 会话管理 ----------

// 创建业务对话会话 POST /ai/conversation/create
// data: { scene }；响应 data 为 AskConversation（含 conversation_id、state、active_run_id 等）
export function chatConversationCreate(data) {
  return request({ url: `${CONV_BASE}/create`, method: 'post', data })
}

// 分页获取本人业务对话会话 GET /ai/conversation/list
// params: { scene, offset, limit }；响应 data 为 ConversationPage { items, next_offset }
export function chatConversationPage(params) {
  return request({ url: `${CONV_BASE}/list`, method: 'get', params })
}

// 获取业务对话会话信息 GET /ai/conversation/getDetail
// params: { conversation_id }；响应 data 为 AskConversation
export function chatConversationGet(params) {
  return request({ url: `${CONV_BASE}/getDetail`, method: 'get', params })
}

// 修改业务对话会话标题 POST /ai/conversation/updateTitle
// data: { conversation_id, title }
export function chatConversationRename(data) {
  return request({ url: `${CONV_BASE}/updateTitle`, method: 'post', data })
}

// 软删除业务对话会话 POST /ai/conversation/delete
// data: { conversation_id }；响应 data 为 ConversationAction { conversation_id, deleted }
export function chatConversationDelete(conversationId) {
  return request({ url: `${CONV_BASE}/delete`, method: 'post', data: { conversation_id: conversationId } })
}

// 分页读取业务对话历史消息 GET /ai/message/list
// params: { conversation_id, after, limit }；响应 data 为 MessagePage { items, next_after }
export function chatMessagePage(params) {
  return request({ url: `${MSG_BASE}/list`, method: 'get', params })
}

// 点赞、点踩与问题反馈 POST /ai/message/saveFeedback
// data: { conversation_id, sequence, rating, categories, comment }；整体替换，省略视为 null；响应 data 为 FeedbackData
export function chatMessageFeedback(data) {
  return request({ url: `${MSG_BASE}/saveFeedback`, method: 'post', data })
}

// ---------- 业务对话（消息投递 + Run 执行）----------

// 发送消息（默认排队）POST /ai/message/send
// data: { conversation_id, client_message_id, user_input, files?, optional_tools?, delivery?, expected_run_id? }
// HTTP 202 仅表示消息已持久化；响应 data 为 DeliveryView { message_id, delivery, delivery_status, run_id, queue_position }
export function chatMessageSend(data) {
  return request({ url: `${MSG_BASE}/send`, method: 'post', data })
}

// 撤回待处理消息 POST /ai/message/withdraw
// data: { conversation_id, message_id }
export function chatMessageWithdraw(data) {
  return request({ url: `${MSG_BASE}/withdraw`, method: 'post', data })
}

// 查询业务对话执行状态 GET /ai/run/getDetail
// params: { conversation_id, run_id }；断线兜底轮询用；响应 data 为 RunView
export function chatRunStatus(params) {
  return request({ url: `${RUN_BASE}/getDetail`, method: 'get', params })
}

// 取消指定业务对话执行 POST /ai/run/cancel
// data: { conversation_id, run_id }；关闭 SSE 不会取消执行，须显式调用本接口；响应 data 为 RunView
export function chatRunCancel(data) {
  return request({ url: `${RUN_BASE}/cancel`, method: 'post', data })
}

// 订阅会话事件（跨任务，SSE）完整 URL，供 sse.js 裸 fetch 使用
// params: { conversation_id, after?, follow? }；会话级游标，事件流须用 fetch + Authorization/X-Caller，不能用 EventSource
export function chatConversationEventsUrl(params) {
  const cfg = getAiChatConfig()
  const query = Object.keys(params || {})
    .filter((k) => params[k] !== undefined && params[k] !== null && params[k] !== '')
    .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`)
    .join('&')
  return `${cfg.baseURL}${CONV_BASE}/subscribeEvents${query ? '?' + query : ''}`
}
