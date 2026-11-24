<template>
  <div class="ai-prompt-config" :class="{ 'is-fullscreen': isFullscreen }">
    <div class="pe-lbl">
      <b>{{ title }}</b>
      <span v-if="polishStatus === 'polishing'" class="ai-prompt-config__status">AI 润色中…</span>
      <span v-else-if="polishStatus === 'polished'" class="ai-prompt-config__status is-done">已润色，可取消或重新润色</span>
      <div class="ai-prompt-config__hd-ops">
        <button
          v-if="systemPrompt"
          class="ai-prompt-config__fs-btn"
          type="button"
          @click="systemPromptVisible = true"
        >
          查看系统提示词
        </button>
        <button
          class="ai-prompt-config__fs-btn"
          type="button"
          :title="isFullscreen ? '收起' : '全屏模式'"
          @click="toggleFullscreen"
        >
          {{ isFullscreen ? '收起' : '全屏模式' }}
        </button>
      </div>
    </div>

    <!-- 主体：loading 遮罩挂在这里，全屏/非全屏均能覆盖 -->
    <div
      class="ai-prompt-config__main"
      v-loading="loading"
      :element-loading-text="loadingText"
    >
      <!-- 非全屏：输入框 → tip → 操作栏（保持原视觉） -->
      <template v-if="!isFullscreen">
        <div class="ai-prompt-config__input">
          <el-input
            :value="value"
            type="textarea"
            :rows="rows"
            resize="none"
            :placeholder="placeholder"
            :disabled="loading"
            @input="$emit('input', $event)"
          />
        </div>
        <div v-if="tip" class="pe-hint">{{ tip }}</div>
        <div class="pe-rowops">
          <button
            v-if="polishStatus !== 'polished'"
            class="btn sm"
            type="button"
            :disabled="loading"
            @click="requestPolish"
          >
            <i data-lucide="wand-sparkles"></i>{{ polishStatus === 'polishing' ? '润色中…' : '提示词润色' }}
          </button>
          <template v-else>
            <button class="btn sm" type="button" @click="cancelPolish">
              <i data-lucide="undo-2"></i>取消润色
            </button>
            <button class="btn sm" type="button" @click="requestPolish">
              <i data-lucide="refresh-cw"></i>重新润色
            </button>
          </template>
          <slot name="action" :fullscreen="isFullscreen"></slot>
        </div>
      </template>

      <!-- 全屏：tip 上移到标题下方；主体左右两栏，左为操作栏+输入区，右为业务插槽 -->
      <template v-else>
        <div v-if="tip" class="pe-hint ai-prompt-config__tip-fs">{{ tip }}</div>
        <div class="ai-prompt-config__fs-grid" :class="{ 'is-single': !hasRightSlot }">
          <div class="ai-prompt-config__fs-left">
            <div class="pe-rowops ai-prompt-config__fs-ops">
              <button
                v-if="polishStatus !== 'polished'"
                class="btn sm"
                type="button"
                :disabled="loading"
                @click="requestPolish"
              >
                <i data-lucide="wand-sparkles"></i>{{ polishStatus === 'polishing' ? '润色中…' : '提示词润色' }}
              </button>
              <template v-else>
                <button class="btn sm" type="button" @click="cancelPolish">
                  <i data-lucide="undo-2"></i>取消润色
                </button>
                <button class="btn sm" type="button" @click="requestPolish">
                  <i data-lucide="refresh-cw"></i>重新润色
                </button>
              </template>
              <slot name="action" :fullscreen="isFullscreen"></slot>
            </div>
            <div class="ai-prompt-config__input ai-prompt-config__fs-input">
              <el-input
                :value="value"
                type="textarea"
                :rows="rows"
                resize="none"
                :placeholder="placeholder"
                :disabled="loading"
                @input="$emit('input', $event)"
              />
            </div>
          </div>
          <div class="ai-prompt-config__fs-right">
            <slot></slot>
          </div>
        </div>
      </template>
    </div>

    <!-- 系统提示词预览弹框 -->
    <el-dialog
      :visible.sync="systemPromptVisible"
      width="720px"
      top="8vh"
      custom-class="admin-dialog"
      title="系统提示词"
      append-to-body
    >
      <pre class="ai-prompt-config__sys-body">{{ systemPrompt }}</pre>
    </el-dialog>
  </div>
</template>

<script>
import { aiGenerate } from '@/api/common';
import { polishPrompt } from '@/constants/prompt';
/* AI 提示词配置：文本域编辑 + 提示词润色（润色后可取消/重新润色）+ 输出测试结果插槽；支持「更多操作」扩展视图 */
export default {
  name: 'AiPromptConfig',
  props: {
    // v-model 双向绑定的 AI 提示词正文
    value: { type: String, default: '' },
    title: { type: String, default: 'AI 提示词' },
    tip: { type: String, default: '' },
    placeholder: { type: String, default: '请输入 AI 提示词' },
    rows: { type: Number, default: 5 },
    // 父级发起的异步任务（如测试解析）标记，驱动组件内部 loading 遮罩，全屏模式下同样生效
    testing: { type: Boolean, default: false },
    // 外部传入的系统提示词，非空时展示「查看系统提示词」按钮
    systemPrompt: { type: String, default: '' }
  },
  data() {
    return {
      // idle=未润色，polishing=润色请求中，polished=润色完成待确认
      polishStatus: 'idle',
      undoPromptText: '',
      // 是否处于「更多操作」扩展视图（全屏左右分栏）
      isFullscreen: false,
      // 系统提示词预览弹框显隐
      systemPromptVisible: false
    };
  },
  computed: {
    // 润色中或外部测试中，任一为真即展示遮罩
    loading() {
      return this.polishStatus === 'polishing' || this.testing;
    },
    loadingText() {
      return this.polishStatus === 'polishing' ? 'AI 润色中…' : 'AI 分析处理中…';
    },
    // 右侧插槽是否传入了实际内容（用于驱动左右分栏宽度过渡）
    hasRightSlot() {
      const nodes = this.$slots.default || [];
      return nodes.some((vnode) => !!vnode.tag || ((vnode.text || '').trim() !== ''));
    }
  },
  watch: {
    // 父级发起测试解析时自动切到全屏模式，以便右侧结果面板可见
    testing(val) {
      if (val) this.isFullscreen = true;
    }
  },
  methods: {
    // 提示词润色：组件内部功能，向 AI 接口发起润色并回填结果，不再依赖父级处理
    requestPolish() {
      if (!this.value) {
        this.$message.error('请输入 AI 提示词')
        return;
      }
      if (this.polishStatus === 'polishing') return;
      this.undoPromptText = this.value;
      this.polishStatus = 'polishing';
      // TODO: 接入 AI 润色接口，异步拿到润色结果后回填并置为 polished
      aiGenerate({
        "output_format": "plain",
        "save_conversation": false,
        "stream": false,
        "system_prompt": polishPrompt,
        "tools": [],
        "user_input": this.value
      })
        .then(({ data }) => {
          this.polishStatus = 'polished';
          this.$emit('input', data.text);
        })
        .catch(() => {
          this.polishStatus = 'idle';
          this.$message.error('提示词润色失败，请重试');
        });
    },
    cancelPolish() {
      this.polishStatus = 'idle';
      this.$emit('input', this.undoPromptText);
    },
    // 切换「更多操作」扩展视图
    toggleFullscreen() {
      this.isFullscreen = !this.isFullscreen;
    },
    // 供父级通过 ref 调用：展开到全屏模式（用于点击操作按钮时展示右侧插槽面板）
    enterFullscreen() {
      this.isFullscreen = true;
    },
    // 父级以其他方式（如按生成脚本重新产出）覆盖提示词正文时调用，退出润色待确认态
    resetPolish() {
      this.polishStatus = 'idle';
      this.undoPromptText = '';
    }
  }
};
</script>

<style scoped>
.ai-prompt-config {
  margin-top: 12px;
}
.ai-prompt-config__status {
  font-size: 11px;
  color: var(--muted);
}
.ai-prompt-config__status.is-done {
  color: var(--green);
}
.ai-prompt-config__test {
  margin-top: 11px;
  border: 1px solid var(--line);
  border-radius: 8px;
  padding: 12px 13px;
  background: #fcfdfc;
}
.ai-prompt-config__fs-btn {
  border: 1px solid var(--line);
  border-radius: 6px;
  padding: 2px 10px;
  font-size: 12px;
  color: var(--muted);
  background: #fff;
  cursor: pointer;
}
.ai-prompt-config__hd-ops {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.ai-prompt-config__sys-body {
  margin: 0;
  max-height: 60vh;
  overflow: auto;
  white-space: pre-wrap;
  word-break: break-word;
  font-family: Menlo, Consolas, 'Courier New', monospace;
  font-size: 12.5px;
  line-height: 1.7;
  color: #1f2937;
}
.ai-prompt-config__fs-btn:hover {
  color: var(--green);
  border-color: var(--green);
}
/* 主体：非全屏为普通块级；v-loading 遮罩需要定位父级 */
.ai-prompt-config__main {
  position: relative;
}

/* 扩展视图（更多操作）：铺满视口，抬头字号放大，主体左右分栏 */
.ai-prompt-config.is-fullscreen {
  position: fixed;
  inset: 0;
  z-index: 2000;
  margin-top: 0;
  padding: 20px 24px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  background: #fff;
}
.ai-prompt-config.is-fullscreen .pe-lbl {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
}
.ai-prompt-config.is-fullscreen .pe-lbl b {
  font-size: 18px;
}
.ai-prompt-config.is-fullscreen .ai-prompt-config__status {
  font-size: 13px;
}
.ai-prompt-config.is-fullscreen .ai-prompt-config__fs-btn {
  font-size: 13px;
  padding: 4px 12px;
}
.ai-prompt-config.is-fullscreen .ai-prompt-config__main {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
.ai-prompt-config__tip-fs {
  font-size: 13px;
  color: var(--muted);
  margin: 0 0 10px;
  line-height: 1.7;
}
.ai-prompt-config__fs-grid {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  gap: 8px;
}
.ai-prompt-config__fs-left {
  flex: 1 1 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
}
/* 右侧插槽栏：宽度带过渡，插槽无内容时通过 is-single 折叠为 0，左侧自然撑开 */
.ai-prompt-config__fs-right {
  flex: 0 0 50%;
  min-width: 0;
  overflow: auto;
  transition: flex-basis 300ms ease, padding 300ms ease;
}
.ai-prompt-config__fs-grid.is-single .ai-prompt-config__fs-right {
  flex-basis: 0;
  overflow: hidden;
}
.ai-prompt-config__fs-ops {
  order: 0;
  margin: 0;
  margin-bottom: 8px;
}
.ai-prompt-config__fs-input {
  flex: 1 1 auto;
  min-height: 0;
}
.ai-prompt-config__fs-input ::v-deep .el-textarea,
.ai-prompt-config__fs-input ::v-deep .el-textarea__inner {
  height: 100%;
}
</style>
