<template>
  <div class="aih-dialog-host" :style="rootStyle">
    <!-- 悬浮球：showFab 时展示，点击打开会话弹窗 -->
    <button
      v-if="showFab"
      type="button"
      class="aih-fab"
      :class="{ 'is-hidden': dialogVisible }"
      :title="title + ' (Ctrl+Enter 发送)'"
      @click="open()"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 2l2.5 5 5.5.8-4 3.9.9 5.5-4.9-2.6-4.9 2.6.9-5.5-4-3.9 5.5-.8z"/></svg>
      <i></i>
    </button>

    <!-- 自研遮罩弹窗：不依赖任何 UI 组件库，样式全部内部定义 -->
    <transition name="aih-fade">
      <div v-if="dialogVisible" class="aih-mask">
        <div class="aih-modal">
          <ai-chat-panel
            ref="aiPanel"
            :scene="scene"
            :initial-conv-id="lastConvId"
            :context-label="contextLabel"
            :title="title"
            :placeholder="placeholder"
            :quick-prompts="quickPrompts"
            :enable-voice="enableVoice"
            :enable-attachment="enableAttachment"
            :files="files"
            :on-upload="onUpload"
            @update:files="(v) => $emit('update:files', v)"
            @upload="() => $emit('upload')"
            @conversation-change="lastConvId = $event"
            @close="close()"
          />
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import AiChatPanel from './ai-chat-panel.vue'
import { getAiChatConfig } from './config'
import { AI_CHAT_SCENE } from './constants'

export default {
  name: 'AiChatDialog',
  components: { AiChatPanel },
  props: {
    // 是否展示右下角悬浮球（关闭则仅作受控弹窗使用）
    showFab: { type: Boolean, default: true },
    scene: { type: String, default: AI_CHAT_SCENE.TEACHER_DATA },
    contextLabel: { type: String, default: '' },
    title: { type: String, default: 'AI助手' },
    placeholder: { type: String, default: '请输入你的问题…' },
    quickPrompts: { type: Array, default: null },
    enableVoice: { type: Boolean, default: true },
    enableAttachment: { type: Boolean, default: true },
    // 待发送附件列表（透传面板，支持 .sync）
    files: { type: Array, default: () => [] },
    // 上传回调（透传面板，上传能力由业务实现）
    onUpload: { type: Function, default: null }
  },
  data() {
    return {
      dialogVisible: false,
      // 记住面板当前会话：首次为空→展示新会话；关闭重开时回传面板恢复历史
      lastConvId: ''
    }
  },
  computed: {
    // 主题色经 CSS 变量注入悬浮球与遮罩，与面板保持同一套主题
    rootStyle() {
      const theme = getAiChatConfig().theme || {}
      return {
        '--aichat-primary': theme.primary || '#2f7a68',
        '--aichat-primary-dark': theme.primaryDark || '#245f51',
        '--aichat-primary-soft': theme.primarySoft || '#f4f9f6'
      }
    }
  },
  methods: {
    // 打开会话
    open() {
      this.dialogVisible = true
      this.$emit('open')
    },
    // 外部唤起并带入问题：先打开弹窗，面板挂载后再发送；空问题仅打开会话
    openAsk(question) {
      this.open()
      const text = String(question == null ? '' : question).trim()
      if (!text) return
      this.$nextTick(() => {
        const panel = this.$refs.aiPanel
        if (panel) panel.ask(text)
      })
    },
    close() {
      this.dialogVisible = false
      this.$emit('close')
    }
  }
}
</script>

<style lang="scss" scoped>
// 主题色来自 CSS 变量（见 rootStyle），带默认值兜底，不继承宿主全局样式
$brand: var(--aichat-primary, #2f7a68);
$brand-dark: var(--aichat-primary-dark, #245f51);

.aih-fab {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 70;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 54px;
  height: 54px;
  padding: 0;
  color: #fff;
  cursor: pointer;
  background: linear-gradient(135deg, $brand, $brand-dark);
  border: 0;
  border-radius: 50%;
  box-shadow: 0 10px 24px rgba(36, 95, 81, .34);
  transition: transform .16s;

  svg {
    width: 24px;
    height: 24px;
  }
  i {
    position: absolute;
    right: 3px;
    bottom: 3px;
    width: 10px;
    height: 10px;
    background: #9fd6a8;
    border: 2px solid #fff;
    border-radius: 50%;
  }
}
.aih-fab:hover {
  transform: translateY(-2px);
}
.aih-fab.is-hidden {
  display: none;
}

.aih-mask {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(15, 23, 20, .45);
}
.aih-modal {
  width: 720px;
  max-width: calc(100vw - 32px);
  height: 72vh;
  overflow: hidden;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 24px 64px rgba(15, 23, 20, .28);
}

.aih-fade-enter-active,
.aih-fade-leave-active {
  transition: opacity .18s;
}
.aih-fade-enter,
.aih-fade-leave-to {
  opacity: 0;
}

@media (max-width: 640px) {
  .aih-fab {
    right: 16px;
    bottom: 16px;
    width: 48px;
    height: 48px;
  }
  .aih-modal {
    height: 86vh;
  }
}
</style>
