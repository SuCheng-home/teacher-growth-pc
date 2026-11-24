import { getAiChatConfig } from './config'
import { chatConversationEventsUrl } from './api'
import { EVENT_TYPES } from './constants'

// 订阅会话事件（跨任务，SSE）
// 接口要求：必须用 fetch + Authorization/X-Caller 读取（EventSource 无法携带鉴权头），
// 按空行分帧解析 id/event/data，按会话级 event_id 游标去重；禁止把 token 放到 URL 上。
// 某 Run 的 done 事件只结束该 Run，不会关闭会话订阅；断线重连用 after 补读。

/**
 * 解析单帧 SSE 文本，提取 event 名与 data JSON
 * @param {string} frame 以空行分隔的一帧
 * @returns {{ id: number, event: string, data: Object } | null}
 */
function parseFrame(frame) {
  let event = ''
  let dataLine = ''
  frame.split('\n').forEach((raw) => {
    const line = raw.replace(/\r$/, '')
    if (line.startsWith('event:')) {
      event = line.slice(6).trim()
    } else if (line.startsWith('data:')) {
      dataLine += line.slice(5).trim()
    }
    // 忽略以 ':' 开头的注释行（: done / : stream-open 心跳）与其余字段
  })
  if (!event && !dataLine) return null
  let data = null
  if (dataLine) {
    try {
      data = JSON.parse(dataLine)
    } catch (e) {
      data = null
    }
  }
  return { event, data }
}

/**
 * 订阅会话事件流（跨任务），直到调用方中止或流中断
 * @param {Object} opts 订阅参数
 * @param {number|string} opts.conversationId 会话 ID
 * @param {number} [opts.after] 会话级断点续传游标（已消费的最大 event_id）
 * @param {Function} [opts.onEvent] 每帧回调 (type, envelope)；envelope 上附带：
 *   _delta text_delta 增量文本、_result result 权威结果、_done { status, error }、_queueError 队列级错误负载
 * @param {Function} [opts.onError] 流异常回调 (err)
 * @param {AbortSignal} [opts.signal] 中止信号
 * @returns {Promise<void>}
 */
export async function subscribeConversationEvents(opts) {
  const {
    conversationId, after = 0,
    onEvent, onError, signal
  } = opts

  const cfg = getAiChatConfig()
  const url = chatConversationEventsUrl({ conversation_id: conversationId, after })
  const headers = {
    'X-Caller': cfg.caller || '',
    Accept: 'text/event-stream'
  }
  const token = cfg.getToken ? cfg.getToken() : ''
  if (token) {
    headers.Authorization = /^Bearer\s/i.test(token) ? token : `Bearer ${token}`
  }

  let lastEventId = Number(after) || 0
  let lastError = null

  const handleFrame = (frame) => {
    const parsed = parseFrame(frame)
    // 每帧 data 为信封 { type, conversation_id, run_id, message_id, generation, data }：
    // 真实事件类型取信封 type（SSE event 行为默认 message），真实负载取信封内层 data
    if (!parsed || !parsed.data) return
    const envelope = parsed.data
    // 游标取信封 event_id（与帧 id 一致），会话级非负
    const eventId = Number(envelope.event_id || 0)
    // 按 event_id 去重：低于或等于已消费游标的帧重复投递，直接跳过
    if (eventId && eventId <= lastEventId) return
    if (eventId) lastEventId = eventId
    const type = envelope.type || parsed.event
    const payload = envelope.data || {}
    // 将负载挂到信封，供调用方统一按 type 路由（跨任务流按 run_id 分发，不适合拆多个回调）
    if (type === EVENT_TYPES.TEXT_DELTA) {
      // 流式文本只作草稿，最终答案以 result 为准
      envelope._delta = payload.text != null ? String(payload.text) : ''
    } else if (type === EVENT_TYPES.RESULT) {
      // result 事件的内层 data 即完整 AskData 权威结果
      envelope._result = payload
    } else if (type === EVENT_TYPES.ERROR) {
      // error 事件携带 code/reason/message；run_id 为 null 且 reason=QUEUE_TOOLS_CONFLICT 表示队列工具冲突
      if (envelope.run_id == null) {
        envelope._queueError = payload
      }
      lastError = payload
    } else if (type === EVENT_TYPES.DONE) {
      // done 仅结束对应 Run（succeeded / failed / cancelled），不关闭会话订阅
      envelope._done = {
        status: payload.status,
        error: payload.status === 'failed' || payload.status === 'cancelled' ? lastError : null
      }
      lastError = null
    }
    if (onEvent) onEvent(type, envelope)
  }

  try {
    const resp = await fetch(url, { headers, signal })
    if (!resp.ok || !resp.body) {
      throw new Error('SSE 连接失败：HTTP ' + resp.status)
    }
    const reader = resp.body.getReader()
    const decoder = new TextDecoder('utf-8')
    let buffer = ''

    // 累积并循环消费缓冲区中由空行分隔的完整帧，避免固定 wait 截断
    for (;;) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      let sep = buffer.indexOf('\n\n')
      while (sep !== -1) {
        const frame = buffer.slice(0, sep)
        buffer = buffer.slice(sep + 2)
        if (frame.trim()) handleFrame(frame)
        sep = buffer.indexOf('\n\n')
      }
    }
    // 冲刷解码器与残留帧
    buffer += decoder.decode()
    if (buffer.trim()) handleFrame(buffer)
  } catch (err) {
    if (err && err.name === 'AbortError') return
    if (onError) onError(err)
  }
}
