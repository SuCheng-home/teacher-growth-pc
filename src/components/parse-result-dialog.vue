<template>
  <el-dialog
    :visible="visible"
    fullscreen
    custom-class="parse-result-dialog"
    :close-on-click-modal="false"
    append-to-body
    @close="handleClose"
  >
    <div slot="title" class="prd-head">
      <div class="dlg-eyebrow">{{ eyebrow }}</div>
      <div class="dlg-title">{{ title }}</div>
    </div>

    <div class="prd-body">
      <!-- 左：AI 输出 JSON 预览与编辑 -->
      <section class="prd-pane prd-left">
        <div class="prd-pane-head">
          <span class="prd-pane-title">AI 输出 JSON</span>
          <span v-if="error" class="prd-tag prd-tag-err">{{ error }}</span>
          <span v-else class="prd-tag prd-tag-ok">格式合法</span>
        </div>
        <textarea
          v-model="text"
          class="prd-editor"
          spellcheck="false"
          @input="handleInput"
        />
      </section>

      <!-- 右：业务依据调整后 JSON 实时渲染 -->
      <section class="prd-pane prd-right">
        <div class="prd-pane-head">
          <span class="prd-pane-title">{{ renderTitle }}</span>
        </div>
        <div class="prd-render">
          <slot :data="value" :raw="text" :error="error" />
        </div>
      </section>
    </div>

    <span slot="footer" class="prd-foot">
      <el-button size="small" @click="handleFormat">格式化</el-button>
      <el-button size="small" @click="handleClose">关闭</el-button>
      <el-button size="small" type="primary" :disabled="!!error" @click="handleConfirm">确 认</el-button>
    </span>
  </el-dialog>
</template>

<script>
/* 解析结果全屏预览弹框：左侧可编辑 JSON 预览、右侧业务自定义渲染的插槽，两侧通过 v-model 双向联动 */
export default {
  name: 'ParseResultDialog',
  props: {
    visible: { type: Boolean, default: false },
    // 顶部小徽标（对应工作台样式 eyebrow 文案）
    eyebrow: { type: String, default: 'PREVIEW' },
    // 主标题
    title: { type: String, default: '解析结果预览' },
    // 右侧渲染区顶部标题
    renderTitle: { type: String, default: '渲染预览' },
    // 双向绑定的结构化数据；打开时按该值格式化到左侧编辑器
    value: { default: null }
  },
  data() {
    return {
      text: '',
      error: ''
    };
  },
  watch: {
    visible(val) {
      if (val) this.syncFromValue(this.value);
    }
  },
  methods: {
    // 将外部数据以 2 空格缩进的 JSON 文本形式载入编辑器
    syncFromValue(val) {
      const safe = val == null ? null : val;
      this.text = safe == null ? '' : JSON.stringify(safe, null, 2);
      this.error = '';
    },
    // 编辑器实时解析：合法则回抛结构化数据，业务插槽依据其重绘；非法仅记录错误不污染数据
    handleInput() {
      if (!this.text.trim()) {
        this.error = '';
        this.$emit('input', null);
        return;
      }
      try {
        const parsed = JSON.parse(this.text);
        this.error = '';
        this.$emit('input', parsed);
      } catch (e) {
        this.error = 'JSON 格式非法：' + e.message;
      }
    },
    // 主动格式化：解析当前文本再 pretty-print 回显
    handleFormat() {
      try {
        const parsed = JSON.parse(this.text || 'null');
        this.text = JSON.stringify(parsed, null, 2);
        this.error = '';
        this.$emit('input', parsed);
      } catch (e) {
        this.error = '无法格式化：' + e.message;
      }
    },
    handleConfirm() {
      this.$emit('confirm', this.value);
    },
    handleClose() {
      this.$emit('close');
    }
  }
};
</script>

<style scoped>
/* 覆盖 el-dialog fullscreen 内边距，形成抬头/主体/页脚三段式布局 */
.prd-head {
  line-height: 1.35;
}
.prd-body {
  display: flex;
  gap: 12px;
  height: 100%;
  min-height: 0;
}
.prd-pane {
  flex: 1 1 50%;
  display: flex;
  flex-direction: column;
  min-width: 0;
  border: 1px solid var(--bd, #e5e7eb);
  border-radius: 8px;
  background: #fff;
  overflow: hidden;
}
.prd-pane-head {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-bottom: 1px solid var(--bd, #e5e7eb);
  background: #fafbfc;
  font-size: 13px;
  font-weight: 600;
  color: #1f2937;
}
.prd-pane-title {
  margin-right: auto;
}
.prd-tag {
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 500;
}
.prd-tag-ok {
  background: #ecfdf5;
  color: #047857;
}
.prd-tag-err {
  background: #fef2f2;
  color: #b91c1c;
  max-width: 60%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.prd-editor {
  flex: 1 1 auto;
  min-height: 0;
  width: 100%;
  padding: 12px;
  border: 0;
  outline: none;
  resize: none;
  font-family: Menlo, Consolas, 'Courier New', monospace;
  font-size: 12.5px;
  line-height: 1.6;
  color: #111827;
  background: #fff;
}
.prd-render {
  flex: 1 1 auto;
  min-height: 0;
  padding: 12px;
  overflow: auto;
}
.prd-foot {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
</style>

<style>
/* 全局覆盖：fullscreen 弹框的内容区需要撑满剩余高度，页脚保持悬浮 */
.el-dialog.is-fullscreen.parse-result-dialog {
  display: flex;
  flex-direction: column;
}
.el-dialog.is-fullscreen.parse-result-dialog .el-dialog__header {
  padding-bottom: 12px;
  border-bottom: 1px solid #eef0f4;
}
.el-dialog.is-fullscreen.parse-result-dialog .el-dialog__body {
  flex: 1 1 auto;
  min-height: 0;
  padding: 16px 24px;
  overflow: hidden;
}
.el-dialog.is-fullscreen.parse-result-dialog .el-dialog__footer {
  padding: 12px 24px;
  border-top: 1px solid #eef0f4;
}
</style>
