<template>
  <div class="parse-preview-panel">
    <div class="ppp-bar">
      <div class="ppp-toggle">
        <button type="button" :class="{ on: mode === 'page' }" @click="mode = 'page'">页面预览</button>
        <button type="button" :class="{ on: mode === 'json' }" @click="mode = 'json'">JSON 编辑</button>
      </div>
      <button v-if="showSave" class="btn sm primary" type="button" @click="handleSave">
        <i data-lucide="save"></i>保存结果
      </button>
    </div>
    <div class="ppp-body">
      <div v-if="mode === 'page'" class="ppp-page">
        <rule-render :data="nodes" />
      </div>
      <textarea
        v-else
        v-model="jsonText"
        class="ppp-editor"
        spellcheck="false"
        @input="handleInput"
      />
      <div v-if="mode === 'json' && jsonError" class="ppp-err">{{ jsonError }}</div>
    </div>
  </div>
</template>

<script>
/* 文档解析结果预览面板：顶部切换「页面预览 / JSON 编辑」，附保存按钮，供 ai-prompt-config 右侧插槽使用 */
import RuleRender from '@/components/rule-render';

export default {
  name: 'ParsePreviewPanel',
  components: { RuleRender },
  props: {
    // AI 输出的结构化数据（Array 或 Object）
    value: { default: null },
    // 是否展示保存按钮
    showSave: { type: Boolean, default: true }
  },
  data() {
    return {
      mode: 'page',
      jsonText: '',
      jsonError: ''
    };
  },
  computed: {
    nodes() {
      return this.value && typeof this.value === 'object' ? this.value : {};
    }
  },
  watch: {
    value: {
      handler(val) {
        this.jsonText = val == null ? '' : JSON.stringify(val, null, 2);
        this.jsonError = '';
      },
      immediate: true
    }
  },
  methods: {
    handleInput() {
      if (!this.jsonText.trim()) {
        this.jsonError = '';
        this.$emit('input', null);
        return;
      }
      try {
        const parsed = JSON.parse(this.jsonText);
        this.jsonError = '';
        this.$emit('input', parsed);
      } catch (e) {
        this.jsonError = 'JSON 格式非法：' + e.message;
      }
    },
    handleSave() {
      this.$emit('save', this.value);
    }
  }
};
</script>

<style scoped>
.parse-preview-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}
.ppp-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding-bottom: 6px;
  flex-shrink: 0;
}
.ppp-toggle {
  display: inline-flex;
  border: 1px solid var(--line, #e5e7eb);
  border-radius: 6px;
  overflow: hidden;
}
.ppp-toggle button {
  padding: 4px 12px;
  font-size: 12px;
  border: 0;
  background: #fff;
  color: var(--muted, #6b7280);
  cursor: pointer;
  transition: background .15s, color .15s;
}
.ppp-toggle button + button {
  border-left: 1px solid var(--line, #e5e7eb);
}
.ppp-toggle button.on {
  background: var(--hi-bg, #ecfdf5);
  color: var(--hi, #047857);
  font-weight: 600;
}
.ppp-body {
  flex: 1 1 auto;
  min-height: 0;
  overflow: auto;
}
.ppp-page {
  width: 100%;
  height: 100%;
  min-height: 200px;
  padding: 10px;
  border: 1px solid var(--line, #e5e7eb);
  border-radius: 6px;
  overflow: auto;
}
.ppp-editor {
  width: 100%;
  height: 100%;
  min-height: 200px;
  padding: 10px;
  border: 1px solid var(--line, #e5e7eb);
  border-radius: 6px;
  outline: none;
  resize: none;
  font-family: Menlo, Consolas, 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.6;
  color: #111827;
  background: #fafbfc;
  box-sizing: border-box;
  vertical-align: middle;
}
.ppp-err {
  margin-top: 6px;
  font-size: 11.5px;
  color: #b91c1c;
}
</style>
