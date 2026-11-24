<template>
  <div class="aih-root" :class="{ 'is-inpage': inPage }" :style="rootStyle">
    <!-- 头部 -->
    <div class="aih-head">
      <span class="aih-dot"></span>
      <div class="aih-hd">
        <b>{{ title }}</b>
        <small v-if="contextLabel">{{ contextLabel }}</small>
      </div>
      <div class="aih-sess-wrap">
        <button type="button" class="aih-btn" title="新建会话" @click="newSession">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 5v14M5 12h14"/></svg>
        </button>
        <button type="button" class="aih-btn" title="切换会话" @click="toggleSess">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M4 6h16M4 12h16M4 18h10"/></svg>
        </button>
        <div v-show="sessOpen" class="aih-sess-list">
          <div
            v-for="sess in sessions"
            :key="sess.conversation_id"
            class="aih-sess-item"
            :class="{ on: sess.conversation_id === currentConvId }"
            @click="switchSession(sess.conversation_id)"
          >
            <span class="aih-dot2"></span>
            <span class="aih-sess-t">{{ sess.title || '未命名会话' }} · {{ sess.message_count || 0 }} 条</span>
            <i class="aih-sess-del" title="删除会话" @click.stop="removeSession(sess.conversation_id)">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13"/></svg>
            </i>
          </div>
          <div v-if="!sessions.length" class="aih-sess-empty">暂无历史会话</div>
        </div>
      </div>
      <div class="aih-btns">
        <button type="button" class="aih-btn" title="清空当前对话" @click="clearCurrent">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13"/></svg>
        </button>
        <button v-if="!inPage" type="button" class="aih-btn" title="关闭" @click="$emit('close')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M6 6l12 12M18 6L6 18"/></svg>
        </button>
      </div>
    </div>

    <!-- 消息区 -->
    <div ref="msgs" class="aih-msgs">
      <div v-if="loadingHistory" class="aih-hist">正在加载历史消息…</div>
      <div v-else-if="!messages.length" class="aih-hist">暂无对话记录 · 可在下方提问</div>
      <div v-else class="aih-hist">当前会话 · 共 {{ messages.length }} 条</div>

      <div
        v-for="msg in messages"
        :key="msg.id"
        class="aih-msg"
        :class="msg.role === 'user' ? 'user' : 'bot'"
      >
        <!-- 用户消息：纯文本 -->
        <template v-if="msg.role === 'user'">
          <div v-if="msg.text" class="aih-msg-text">{{ msg.text }}</div>
          <div v-if="msg.files && msg.files.length" class="aih-files">
            <span v-for="(f, fi) in msg.files" :key="fi" class="aih-file-chip">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M21 11.5l-8.5 8.5a6 6 0 01-8.5-8.5l8.5-8.5a4 4 0 015.7 5.7l-8.5 8.5a2 2 0 01-2.8-2.8l7.8-7.8"/></svg>
              {{ f.name }}
            </span>
          </div>
        </template>

        <!-- 助手消息 -->
        <template v-else>
          <div v-if="msg.streaming && !msg.text" class="aih-typing"><i></i><i></i><i></i></div>
          <ai-chat-result v-else-if="msg.result" :result="msg.result" />
          <div v-else-if="msg.text" class="aih-msg-text">{{ msg.text }}<span v-if="msg.streaming" class="aih-caret"></span></div>
          <div v-if="msg.error" class="aih-err">{{ msg.error }}</div>
          <span v-if="msg.src" class="aih-src">{{ msg.src }}</span>
          <!-- 反馈：仅已完成且有 sequence 的助手消息 -->
          <div v-if="canFeedback(msg)" class="aih-fb">
            <button
              type="button"
              class="aih-fb-btn"
              :class="{ on: msg.feedback && msg.feedback.rating === 'like' }"
              title="有帮助"
              @click="sendFeedback(msg, 'like')"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M7 11v9M7 11l4-8a2 2 0 013 2l-1 6h5a2 2 0 012 2.3l-1.2 6A2 2 0 0118 20H7"/></svg>
            </button>
            <button
              type="button"
              class="aih-fb-btn"
              :class="{ on: msg.feedback && msg.feedback.rating === 'dislike' }"
              title="待改进"
              @click="sendFeedback(msg, 'dislike')"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M17 13V4M17 13l-4 8a2 2 0 01-3-2l1-6H6a2 2 0 01-2-2.3l1.2-6A2 2 0 018 4h9"/></svg>
            </button>
          </div>
        </template>
      </div>
    </div>

    <!-- 快捷提问 -->
    <div v-if="quickList.length && !messages.length" class="aih-quick">
      <button v-for="(q, qi) in quickList" :key="qi" type="button" @click="ask(q)">{{ q }}</button>
    </div>

    <!-- 待发附件（由业务上传后回传） -->
    <div v-if="files.length" class="aih-pending">
      <span v-for="(f, fi) in files" :key="fi" class="aih-file-chip">
        {{ f.name || f.fileName }}
        <i class="aih-chip-x" @click="removeFile(fi)">×</i>
      </span>
    </div>

    <!-- 输入行 -->
    <div class="aih-form">
      <button v-if="enableVoice" type="button" class="aih-ibtn" title="语音输入" @click="voiceInput">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0014 0M12 18v3"/></svg>
      </button>
      <button
        v-if="enableAttachment"
        type="button"
        class="aih-ibtn"
        title="添加附件"
        @click="triggerUpload"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M21 11.5l-8.5 8.5a6 6 0 01-8.5-8.5l8.5-8.5a4 4 0 015.7 5.7l-8.5 8.5a2 2 0 01-2.8-2.8l7.8-7.8"/></svg>
      </button>
      <input
        v-model="draftText"
        type="text"
        :maxlength="4000"
        :placeholder="placeholder"
        :disabled="busy"
        @keyup.enter="submitInput"
      >
      <button v-if="busy" type="button" class="aih-send is-cancel" @click="cancelRun">取消</button>
      <button v-else type="button" class="aih-send" @click="submitInput">发送</button>
    </div>
    <div v-if="note" class="aih-note">{{ note }}</div>
  </div>
</template>

<script>
import {
  chatConversationCreate,
  chatConversationPage,
  chatConversationDelete,
  chatMessagePage,
  chatMessageFeedback,
  chatMessageSend,
  chatMessageWithdraw,
  chatRunCancel
} from './api'
import { subscribeConversationEvents } from './sse'
import { genClientId, getAiChatConfig } from './config'
import AiChatResult from './ai-chat-result.vue'
import {
  AI_CHAT_SCENE,
  MESSAGE_STATUS,
  FEEDBACK_RATING,
  EVENT_TYPES,
  CONVERSATION_PAGE_SIZE,
  MESSAGE_PAGE_SIZE,
  MAX_MESSAGES
} from './constants'

export default {
  name: 'AiChatPanel',
  components: { AiChatResult },
  props: {
    // 业务场景 code
    scene: { type: String, default: AI_CHAT_SCENE.TEACHER_DATA },
    // 头部副标题（页面名 · 用户信息）
    contextLabel: { type: String, default: '' },
    // 头部主标题
    title: { type: String, default: '教师发展 AI 助手' },
    // 输入框占位文案
    placeholder: { type: String, default: '请输入你的问题…' },
    // 快捷提问；不传用默认
    quickPrompts: { type: Array, default: null },
    // 是否启用语音输入
    enableVoice: { type: Boolean, default: true },
    // 是否启用附件（点击触发业务上传）
    enableAttachment: { type: Boolean, default: true },
    // 待发送附件列表：由业务上传后回传，每项 { name, url }，支持 .sync
    files: { type: Array, default: () => [] },
    // 上传回调：点击附件按钮时调用，上传能力由业务实现（也可监听 upload 事件）
    onUpload: { type: Function, default: null },
    // 内嵌整页形态（无关闭按钮、撑满容器）
    inPage: { type: Boolean, default: false },
    // 内嵌面板高度
    height: { type: String, default: '' },
    // 打开时恢复到该会话（关闭重开恢复历史）；为空时展示新会话，不自动命中上一次会话
    initialConvId: { type: String, default: '' }
  },
  data() {
    return {
      sessions: [],
      currentConvId: '',
      messages: [],
      draftText: '',
      busy: false,
      sessOpen: false,
      loadingHistory: false,
      note: ''
    }
  },
  computed: {
    quickList() {
      return this.quickPrompts
    },
    // 主题色经 CSS 变量注入组件内部，不依赖宿主全局样式
    rootStyle() {
      const theme = getAiChatConfig().theme || {}
      const vars = {
        '--aichat-primary': theme.primary || '#2f7a68',
        '--aichat-primary-dark': theme.primaryDark || '#245f51',
        '--aichat-primary-soft': theme.primarySoft || '#f4f9f6'
      }
      const size = this.inPage && this.height ? { height: this.height } : {}
      return Object.assign({}, vars, size)
    }
  },
  watch: {
    // 会话切换/新建时回传宿主，供关闭弹框后重开时恢复历史会话
    currentConvId(val) {
      this.$emit('conversation-change', val)
    }
  },
  created() {
    // 非响应式运行时句柄：会话事件流中止控制器与游标
    this.abortController = null
    this.currentRunId = ''
    this.evtCursor = 0
    // 切换会话后补读历史事件时，忽略旧 run_created 事件对当前 Run 的覆盖
    this.skipRunCreated = true
    // 跨任务事件流按 run_id 路由流式气泡；pendingBots 为等待 run_created 的占位气泡
    this.botsByRun = {}
    this.pendingBots = []
    this.msgSeq = 0
    // 打字机：目标全文、已揭示长度、当前流式气泡、逐字定时器
    this.typeTarget = ''
    this.typeShown = 0
    this.typeBot = null
    this.typeTimer = null
  },
  mounted() {
    this.loadSessions()
  },
  beforeDestroy() {
    this.closeStream()
  },
  methods: {
    // ---------- 会话 ----------
    loadSessions() {
      return chatConversationPage({ scene: this.scene, offset: 0, limit: CONVERSATION_PAGE_SIZE })
        .then((res) => {
          const page = (res && res.data) || {}
          this.sessions = page.items || []
          // 不自动进入上一次会话：仅当宿主下发 initialConvId（关闭后重开）且该会话仍存在时才恢复历史
          if (this.initialConvId && this.sessions.some((s) => s.conversation_id === this.initialConvId)) {
            this.switchSession(this.initialConvId)
          }
        })
        .catch(() => {
          this.sessions = []
        })
    },
    newSession() {
      this.closeStream()
      this.resetStreamState()
      this.currentConvId = ''
      this.messages = []
      this.sessOpen = false
      this.busy = false
    },
    switchSession(convId) {
      if (!convId || this.busy) return
      this.closeStream()
      this.resetStreamState()
      this.currentConvId = convId
      this.sessOpen = false
      this.loadMessages(convId).then(() => {
        // 恢复订阅后仅接收新事件（游标置为当前最大）；
        // skipRunCreated 防止补读的历史 run_created 事件误设 currentRunId
        this.evtCursor = 0
        this.skipRunCreated = true
        this.ensureEventStream()
      })
    },
    removeSession(convId) {
      chatConversationDelete(convId).then(() => {
        this.sessions = this.sessions.filter((s) => s.conversation_id !== convId)
        if (this.currentConvId === convId) {
          if (this.sessions.length) this.switchSession(this.sessions[0].conversation_id)
          else this.newSession()
        }
      }).catch(() => {})
    },
    clearCurrent() {
      this.closeStream()
      this.resetStreamState()
      this.messages = []
      this.busy = false
    },
    toggleSess() {
      this.sessOpen = !this.sessOpen
    },

    // ---------- 历史消息 ----------
    loadMessages(convId) {
      this.loadingHistory = true
      this.messages = []
      return chatMessagePage({ conversation_id: convId, after: 0, limit: MESSAGE_PAGE_SIZE })
        .then((res) => {
          if (convId !== this.currentConvId) return
          const page = (res && res.data) || {}
          this.messages = (page.items || []).map((m) => this.normalizeMessage(m))
          this.scrollBottom()
        })
        .catch(() => {})
        .then(() => {
          this.loadingHistory = false
        })
    },
    normalizeMessage(raw) {
      const isUser = raw.role === 'user'
      return {
        id: raw.message_id || ('m' + (++this.msgSeq)),
        role: isUser ? 'user' : 'assistant',
        text: raw.text || '',
        files: raw.files || [],
        sequence: raw.sequence,
        result: raw.result || null,
        error: raw.error ? ((raw.error.reason) ? '本条回答生成失败' : '') : '',
        feedback: raw.feedback || null,
        src: this.buildSrc(raw.result),
        streaming: false,
        status: raw.status
      }
    },
    buildSrc(result) {
      if (!result) return ''
      if (result.is_mock) return '来源：演示 Mock 数据'
      if (result.data_updated_at) return '数据时点：' + result.data_updated_at
      return ''
    },

    // ---------- 提问与流式回答 ----------
    // 后端新模型：消息发送默认排队（/ai/message/send），SSE 为会话级跨任务事件流，
    // 事件按信封 run_id 路由到对应流式气泡
    ask(text) {
      const question = String(text == null ? this.draftText : text).trim()
      if (!question || this.busy) return
      const files = (this.files || []).map((f) => ({
        name: f.name || f.fileName,
        url: f.url || f.attachmentKey
      }))
      this.draftText = ''
      this.$emit('update:files', [])

      const start = (convId) => {
        this.pushLocal({ role: 'user', text: question, files })
        const bot = this.pushLocal({ role: 'assistant', text: '', streaming: true })
        // 先重置打字机再订阅，避免补读事件到达时句柄未初始化
        this.resetTypewriter(bot)
        this.skipRunCreated = false
        // 先订阅再发送，避免调度事件先于订阅到达
        this.ensureEventStream()
        this.startRun(convId, question, files, bot)
      }
      if (this.currentConvId) {
        start(this.currentConvId)
      } else {
        this.ensureConversation().then((convId) => {
          if (convId) start(convId)
        }).catch(() => {
          this.flashNote('会话创建失败，请稍后重试')
        })
      }
    },
    ensureConversation() {
      if (this.currentConvId) return Promise.resolve(this.currentConvId)
      return chatConversationCreate({ scene: this.scene }).then((res) => {
        const conv = (res && res.data) || {}
        this.currentConvId = conv.conversation_id
        if (conv.conversation_id) {
          this.sessions.unshift(conv)
        }
        return this.currentConvId
      })
    },
    startRun(convId, question, files, bot) {
      this.busy = true
      const payload = {
        conversation_id: convId,
        client_message_id: genClientId(),
        user_input: question
      }
      if (files.length) payload.files = files

      chatMessageSend(payload).then((res) => {
        const delivery = (res && res.data) || {}
        bot.messageId = delivery.message_id
        // 已分配 Run：直接登记路由；仍排队：进入待分配队列等 run_created 事件
        if (delivery.run_id) {
          this.botsByRun[delivery.run_id] = bot
        } else {
          this.pendingBots.push(bot)
        }
      }).catch((err) => {
        const status = err && err.response && err.response.status
        this.finishBot(bot, 'failed', null)
        // 409 同会话已有未结束 Run，给明确文案；其余错误由宿主统一处理
        if (status === 409) {
          this.flashNote('上一条还在生成中，请稍候')
        }
      })
    },
    // 打开会话级事件订阅（跨任务），仅切换会话/销毁时中止
    ensureEventStream() {
      if (!this.currentConvId || this.abortController) return
      this.abortController = typeof AbortController !== 'undefined' ? new AbortController() : null
      subscribeConversationEvents({
        conversationId: this.currentConvId,
        after: this.evtCursor,
        signal: this.abortController ? this.abortController.signal : undefined,
        onEvent: (type, envelope) => {
          // 会话级游标：记在 handler 最前，异常中断后重连可补读
          if (envelope.event_id) this.evtCursor = envelope.event_id
          this.handleConvEvent(type, envelope)
        },
        onError: () => {
          // 事件流异常中断：收尾全部流式气泡，避免永久停留在生成态
          this.failAllBots()
        }
      })
    },
    handleConvEvent(type, envelope) {
      const runId = envelope.run_id != null ? String(envelope.run_id) : ''
      if (type === EVENT_TYPES.RUN_CREATED && runId && !this.skipRunCreated) {
        this.currentRunId = runId
        // 队列消息按发送顺序并入新 Run（message_assigned 可能缺失，此处兜底登记）
        if (!this.botsByRun[runId]) {
          const bot = this.pendingBots.shift()
          if (bot) this.botsByRun[runId] = bot
        }
      } else if (type === EVENT_TYPES.TEXT_DELTA) {
        const bot = this.botsByRun[runId]
        // 分片只累加到目标全文，由打字机逐字揭示到气泡
        if (bot) {
          this.typeTarget += envelope._delta || ''
          this.ensureTypeTimer()
        }
      } else if (type === EVENT_TYPES.RESULT) {
        const bot = this.botsByRun[runId]
        if (bot) this.applyResult(bot, envelope._result)
      } else if (type === EVENT_TYPES.DONE) {
        const bot = this.botsByRun[runId]
        if (bot) this.finishBot(bot, envelope._done && envelope._done.status, envelope._done && envelope._done.error)
      } else if (type === EVENT_TYPES.ERROR && envelope._queueError) {
        // 队列工具冲突：run_id 为 null，不把上一 Run 标为失败，仅提示并清排队占位
        this.flashNote('排队消息与当前任务工具冲突，已停止排队，请重新发送')
        this.failPendingBots()
      }
    },
    applyResult(bot, result) {
      if (!result) return
      bot.result = result
      if (result.text) {
        // 权威全文作为打字目标，覆盖流式草稿，继续逐字揭示至最终文本
        this.typeBot = bot
        this.typeTarget = result.text
        if (this.typeShown > this.typeTarget.length) this.typeShown = this.typeTarget.length
        this.ensureTypeTimer()
      }
      bot.src = this.buildSrc(result)
      this.scrollBottom()
    },
    finishBot(bot, status, error) {
      // 收尾：立即补全打字，避免停留在半截文本
      this.flushTypewriter(bot)
      bot.streaming = false
      bot.status = status || 'succeeded'
      if (bot.status === 'failed' || bot.status === 'cancelled') {
        bot.error = bot.status === 'cancelled' ? '已取消本次回答' : '本条回答生成失败'
        if (!bot.text && !bot.result) {
          bot.text = error && error.message ? error.message : '未能获取回答，请重试'
        }
      }
      Object.keys(this.botsByRun).forEach((k) => {
        if (this.botsByRun[k] === bot) delete this.botsByRun[k]
      })
      // 会话级订阅保持打开；无进行中及排队气泡时解除发送锁定
      this.busy = Object.keys(this.botsByRun).length > 0 || this.pendingBots.length > 0
      this.currentRunId = ''
      this.refreshActiveSession()
      this.scrollBottom()
    },
    // 事件流异常中断：收尾全部进行中及排队气泡，避免永久停留在生成态
    failAllBots() {
      Object.keys(this.botsByRun).forEach((k) => {
        this.botsByRun[k].status = 'failed'
      })
      const bots = Object.keys(this.botsByRun).map((k) => this.botsByRun[k]).concat(this.pendingBots)
      this.botsByRun = {}
      this.pendingBots = []
      bots.forEach((bot) => {
        if (bot.streaming) this.finishBot(bot, 'failed', null)
      })
      this.busy = false
    },
    // 队列工具冲突：仅清排队占位，不影响已开始的 Run
    failPendingBots() {
      const bots = this.pendingBots
      this.pendingBots = []
      bots.forEach((bot) => {
        if (bot.streaming) this.finishBot(bot, 'failed', null)
      })
      this.busy = Object.keys(this.botsByRun).length > 0
    },
    resetStreamState() {
      this.botsByRun = {}
      this.pendingBots = []
      this.currentRunId = ''
      this.busy = false
      this.resetTypewriter(null)
    },
    closeStream() {
      if (this.abortController) {
        try {
          this.abortController.abort()
        } catch (e) {
          // 忽略中止异常
        }
        this.abortController = null
      }
    },

    // ---------- 打字机效果 ----------
    resetTypewriter(bot) {
      this.clearTypeTimer()
      this.typeBot = bot
      this.typeTarget = ''
      this.typeShown = 0
    },
    ensureTypeTimer() {
      if (this.typeTimer) return
      this.typeTimer = setInterval(this.tickTypewriter, 28)
    },
    tickTypewriter() {
      const bot = this.typeBot
      if (!bot) {
        this.clearTypeTimer()
        return
      }
      // 已追上目标：暂停定时器，等待新的流式分片或权威结果
      if (this.typeShown >= this.typeTarget.length) {
        this.clearTypeTimer()
        return
      }
      // 每拍揭示字符数随剩余量自适应，长文本也不会拖太久
      const remaining = this.typeTarget.length - this.typeShown
      const step = Math.max(2, Math.ceil(remaining / 10))
      this.typeShown = Math.min(this.typeTarget.length, this.typeShown + step)
      bot.text = this.typeTarget.slice(0, this.typeShown)
      this.scrollBottom()
    },
    flushTypewriter(bot) {
      this.clearTypeTimer()
      if (bot && this.typeBot === bot && this.typeTarget) {
        bot.text = this.typeTarget
      }
    },
    clearTypeTimer() {
      if (this.typeTimer) {
        clearInterval(this.typeTimer)
        this.typeTimer = null
      }
    },
    cancelRun() {
      // 已分配 Run：显式请求取消服务端执行，done 事件到达后自动收尾
      if (this.currentRunId && this.currentConvId) {
        chatRunCancel({
          conversation_id: this.currentConvId,
          run_id: this.currentRunId
        }).catch(() => {})
        return
      }
      // 仍在排队未分配 Run：撤回待处理消息
      const bot = this.pendingBots[0]
      if (bot && bot.messageId) {
        chatMessageWithdraw({
          conversation_id: this.currentConvId,
          message_id: bot.messageId
        }).then(() => {
          this.pendingBots = this.pendingBots.filter((b) => b !== bot)
          this.finishBot(bot, 'cancelled', null)
        }).catch(() => {})
      }
    },
    refreshActiveSession() {
      const sess = this.sessions.find((s) => s.conversation_id === this.currentConvId)
      if (sess) sess.message_count = this.messages.length
    },

    // ---------- 反馈 ----------
    canFeedback(msg) {
      return msg.role === 'assistant' && msg.sequence &&
        (msg.status === MESSAGE_STATUS.COMPLETED || msg.status === 'succeeded' ||
          (msg.result && !msg.streaming))
    },
    sendFeedback(msg, rating) {
      if (!this.currentConvId || !msg.sequence) return
      const next = msg.feedback && msg.feedback.rating === rating ? null : rating
      const payload = {
        conversation_id: this.currentConvId,
        sequence: msg.sequence,
        rating: next === FEEDBACK_RATING.LIKE || next === FEEDBACK_RATING.DISLIKE ? next : null
      }
      chatMessageFeedback(payload).then((res) => {
        const data = (res && res.data) || {}
        msg.feedback = data.feedback || null
      }).catch(() => {})
    },

    // ---------- 附件（上传能力由业务提供）----------
    triggerUpload() {
      if (typeof this.onUpload === 'function') this.onUpload()
      this.$emit('upload')
    },
    removeFile(index) {
      const next = (this.files || []).slice()
      next.splice(index, 1)
      this.$emit('update:files', next)
    },

    // ---------- 语音 ----------
    voiceInput() {
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition
      if (!SR) {
        this.flashNote('当前环境不支持语音输入，请用文字或附件')
        return
      }
      try {
        const rec = new SR()
        rec.lang = 'zh-CN'
        rec.interimResults = false
        rec.maxAlternatives = 1
        this.flashNote('正在聆听，请说话…')
        rec.onresult = (e) => {
          const t = e.results && e.results[0] && e.results[0][0] && e.results[0][0].transcript
          if (t) this.draftText = t
        }
        rec.onerror = () => this.flashNote('语音识别不可用，请用文字或附件')
        rec.start()
      } catch (e) {
        this.flashNote('语音识别启动失败，请用文字或附件')
      }
    },
    flashNote(text) {
      this.note = text
      clearTimeout(this._noteTimer)
      this._noteTimer = setTimeout(() => {
        this.note = ''
      }, 3600)
    },

    // ---------- 通用 ----------
    submitInput() {
      this.ask(this.draftText)
    },
    pushLocal(msg) {
      const record = Object.assign({
        id: 'l' + (++this.msgSeq),
        text: '',
        files: [],
        result: null,
        error: '',
        feedback: null,
        src: '',
        streaming: false,
        status: ''
      }, msg)
      this.messages.push(record)
      if (this.messages.length > MAX_MESSAGES) {
        this.messages.splice(0, this.messages.length - MAX_MESSAGES)
      }
      this.scrollBottom()
      return record
    },
    scrollBottom() {
      this.$nextTick(() => {
        const el = this.$refs.msgs
        if (el) el.scrollTop = el.scrollHeight
      })
    }
  }
}
</script>

<style lang="scss" scoped>
// 主题色经 CSS 变量注入（见 rootStyle），带默认值兑底，不继承宿主全局样式
$brand: var(--aichat-primary, #2f7a68);
$brand-dark: var(--aichat-primary-dark, #245f51);

.aih-root {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  background: #fff;
  font-family: inherit;
}
.aih-root.is-inpage {
  border-radius: 14px;
}

/* 头部 */
.aih-head {
  display: flex;
  flex-shrink: 0;
  gap: 10px;
  align-items: center;
  padding: 13px 16px;
  color: #fff;
  background: linear-gradient(135deg, $brand, $brand-dark);
}
.aih-dot {
  flex-shrink: 0;
  width: 8px;
  height: 8px;
  background: #9fd6a8;
  border-radius: 50%;
}
.aih-hd {
  flex: 1;
  min-width: 0;
}
.aih-hd b {
  display: block;
  overflow: hidden;
  font-size: 13.5px;
  font-weight: 600;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.aih-hd small {
  display: block;
  margin-top: 2px;
  overflow: hidden;
  font-size: 10px;
  line-height: 1.4;
  opacity: .82;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.aih-btns {
  display: flex;
  flex-shrink: 0;
  gap: 6px;
}
.aih-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  color: #fff;
  cursor: pointer;
  background: rgba(255, 255, 255, .15);
  border: 0;
  border-radius: 8px;

  svg {
    width: 16px;
    height: 16px;
  }
}
.aih-btn:hover {
  background: rgba(255, 255, 255, .3);
}

/* 会话下拉 */
.aih-sess-wrap {
  position: relative;
  display: flex;
  flex-shrink: 0;
  gap: 5px;
  align-items: center;
}
.aih-sess-list {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  z-index: 40;
  max-width: 320px;
  min-width: 230px;
  max-height: 300px;
  padding: 6px;
  overflow: auto;
  background: #fff;
  border: 1px solid #e7ece8;
  border-radius: 12px;
  box-shadow: 0 14px 40px rgba(24, 38, 32, .2);
}
.aih-sess-item {
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 9px 10px;
  font-size: 12.5px;
  color: #3c4b42;
  cursor: pointer;
  border-radius: 8px;
}
.aih-sess-item:hover {
  background: #f4f9f6;
}
.aih-sess-item.on {
  font-weight: 600;
  color: $brand-dark;
  background: #e8f3ed;
}
.aih-dot2 {
  flex-shrink: 0;
  width: 7px;
  height: 7px;
  background: #cbd6cf;
  border-radius: 50%;
}
.aih-sess-item.on .aih-dot2 {
  background: $brand;
}
.aih-sess-t {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.aih-sess-del {
  display: none;
  flex-shrink: 0;
  width: 18px;
  height: 18px;
  color: #b7c2bb;
  cursor: pointer;

  svg {
    width: 14px;
    height: 14px;
  }
}
.aih-sess-item:hover .aih-sess-del {
  display: inline-flex;
}
.aih-sess-del:hover {
  color: #e05b5b;
}
.aih-sess-empty {
  padding: 12px;
  font-size: 12px;
  color: #9aa59e;
  text-align: center;
}

/* 消息区 */
.aih-msgs {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 11px;
  min-height: 0;
  padding: 15px 16px;
  overflow-x: hidden;
  overflow-y: auto;
  background: #fafbfa;
}
.aih-hist {
  flex-shrink: 0;
  padding-bottom: 2px;
  font-size: 10.5px;
  color: #98a49c;
  text-align: center;
}
.aih-msg {
  min-width: 0;
  max-width: 84%;
  padding: 10px 13px;
  font-size: 12.5px;
  line-height: 1.78;
  word-break: break-word;
  border-radius: 12px;
}
.aih-msg.bot {
  align-self: flex-start;
  color: #3c4b42;
  background: #fff;
  border: 1px solid #e7ece8;
  border-bottom-left-radius: 3px;
}
.aih-msg.user {
  align-self: flex-end;
  color: #fff;
  background: $brand-dark;
  border-bottom-right-radius: 3px;
}
.aih-msg-text {
  white-space: pre-wrap;
}
.aih-src {
  display: block;
  padding-top: 6px;
  margin-top: 7px;
  font-size: 10px;
  line-height: 1.6;
  color: #96a29a;
  border-top: 1px dashed #e7ece8;
}
.aih-msg.user .aih-src {
  color: rgba(255, 255, 255, .75);
  border-top-color: rgba(255, 255, 255, .25);
}
.aih-err {
  margin-top: 6px;
  font-size: 11px;
  color: #e05b5b;
}

/* 打字指示 */
.aih-typing {
  display: inline-flex;
  gap: 4px;
  align-items: center;
  height: 16px;

  i {
    width: 6px;
    height: 6px;
    background: #b7c2bb;
    border-radius: 50%;
    animation: aih-blink 1.2s infinite both;
  }
  i:nth-child(2) { animation-delay: .2s; }
  i:nth-child(3) { animation-delay: .4s; }
}
@keyframes aih-blink {
  0%, 80%, 100% { opacity: .3; }
  40% { opacity: 1; }
}
.aih-caret {
  display: inline-block;
  width: 6px;
  height: 14px;
  margin-left: 2px;
  vertical-align: -2px;
  background: $brand;
  animation: aih-caret 1s steps(2) infinite;
}
@keyframes aih-caret {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

/* 反馈 */
.aih-fb {
  display: flex;
  gap: 6px;
  margin-top: 8px;
}
.aih-fb-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 22px;
  padding: 0;
  color: #a7b3ab;
  cursor: pointer;
  background: #fff;
  border: 1px solid #e7ece8;
  border-radius: 6px;

  svg {
    width: 14px;
    height: 14px;
  }
}
.aih-fb-btn:hover {
  color: $brand;
  border-color: #8fbca6;
}
.aih-fb-btn.on {
  color: #fff;
  background: $brand;
  border-color: $brand;
}

/* 附件 chip */
.aih-files {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 6px;
}
.aih-file-chip {
  display: inline-flex;
  gap: 4px;
  align-items: center;
  max-width: 100%;
  padding: 3px 8px;
  overflow: hidden;
  font-size: 11px;
  white-space: nowrap;
  text-overflow: ellipsis;
  background: #f4f9f6;
  border: 1px solid #d9e4dc;
  border-radius: 10px;

  svg {
    flex-shrink: 0;
    width: 12px;
    height: 12px;
    color: $brand;
  }
}
.aih-msg.user .aih-file-chip {
  color: #fff;
  background: rgba(255, 255, 255, .16);
  border-color: rgba(255, 255, 255, .3);

  svg {
    color: #fff;
  }
}
.aih-pending {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 8px 16px 0;
  background: #fff;
}
.aih-chip-x {
  font-style: normal;
  color: #b7c2bb;
  cursor: pointer;
}
.aih-chip-x:hover {
  color: #e05b5b;
}

/* 快捷提问 */
.aih-quick {
  display: flex;
  flex-shrink: 0;
  flex-wrap: wrap;
  gap: 8px;
  padding: 11px 16px 0;
  background: #fff;

  button {
    padding: 5px 12px;
    font-family: inherit;
    font-size: 11.5px;
    color: $brand;
    cursor: pointer;
    background: #f4f9f6;
    border: 1px solid #d9e4dc;
    border-radius: 14px;
  }
  button:hover {
    background: #e8f3ed;
  }
}

/* 输入行 */
.aih-form {
  display: flex;
  flex-shrink: 0;
  gap: 9px;
  align-items: center;
  padding: 12px 16px 10px;
  background: #fff;

  input {
    flex: 1;
    min-width: 0;
    padding: 10px 13px;
    font-family: inherit;
    font-size: 12.5px;
    color: #22302a;
    outline: none;
    background: #fff;
    border: 1px solid #dfe6e1;
    border-radius: 10px;
  }
  input:focus {
    border-color: #8fbca6;
  }
}
.aih-ibtn {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  padding: 0;
  color: #5b6b62;
  cursor: pointer;
  background: #fff;
  border: 1px solid #dfe6e1;
  border-radius: 10px;

  svg {
    width: 18px;
    height: 18px;
  }
}
.aih-ibtn:hover {
  color: $brand-dark;
  border-color: #8fbca6;
}
.aih-send {
  flex-shrink: 0;
  padding: 10px 20px;
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 600;
  color: #fff;
  cursor: pointer;
  background: $brand-dark;
  border: 0;
  border-radius: 10px;
}
.aih-send:hover {
  background: $brand;
}
.aih-send.is-cancel {
  background: #b7c2bb;
}
.aih-send.is-cancel:hover {
  background: #9aa59e;
}
.aih-note {
  flex-shrink: 0;
  padding: 0 16px 12px;
  font-size: 10.5px;
  color: #9aa59e;
  background: #fff;
}

/* 移动端适配 */
@media (max-width: 640px) {
  .aih-sess-list { right: -6px; }
  .aih-msg { max-width: 92%; }
}
</style>
