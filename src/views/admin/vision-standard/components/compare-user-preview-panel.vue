<template>
  <div class="compare-user-preview-panel">
    <!-- 顶部：模拟测试用户选人控件 -->
    <div class="cupp-userbar">
      <span class="cupp-userbar__label">模拟测试用户</span>
      <template v-if="selectedTeacher">
        <el-avatar :size="26" :src="selectedTeacher.avatar">{{ teacherName }}</el-avatar>
        <b class="cupp-userbar__name">{{ teacherName }}</b>
        <em class="cupp-userbar__id">{{ selectedTeacher.cardId || '—' }}</em>
        <button class="btn sm" type="button" @click="openTeacherPicker">
          <i data-lucide="user-check"></i>重新选择
        </button>
        <button class="btn sm primary" type="button" :disabled="loading" @click="$emit('reanalyze', selectedTeacher)">
          <i data-lucide="refresh-cw"></i>重新分析
        </button>
      </template>
      <button v-else class="btn sm primary" type="button" @click="openTeacherPicker">
        <i data-lucide="user-check"></i>选择模拟测试用户
      </button>
    </div>

    <!-- 下方：页面预览，预览内容由默认插槽传入；分析失败时优先展示失败状态 -->
    <div v-loading="loading" class="cupp-body">
      <div v-if="error" class="cupp-error">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M12 3l10 18H2z"/><path d="M12 9v5M12 17v.5"/></svg>
        <span class="cupp-error__msg">{{ error }}</span>
        <button class="btn sm" type="button" @click="$emit('reanalyze', selectedTeacher)">
          <i data-lucide="refresh-cw"></i>重新分析
        </button>
      </div>
      <div v-else-if="selectedTeacher" class="cupp-page">
        <slot />
      </div>
      <div v-else class="cupp-empty">
        请先选择一位模拟测试用户，系统将按其后端档案数据预览评比结果。
      </div>
    </div>

    <teacher-picker
      :visible="pickerVisible"
      eyebrow="TEST USER"
      title="模拟测试用户 · 选人"
      desc="选一位教师作为模拟测试用户，按其真实档案预览评比结果。仅用于后台配置预览，不写入教师档案。"
      @close="pickerVisible = false"
      @confirm="handleTeacherConfirmed"
    />
  </div>
</template>

<script>
/* 评比用户预览面板：顶部选人控件 + 下方页面预览（预览内容经默认插槽由父级传入），供 ai-prompt-config 右侧插槽使用 */
import TeacherPicker from '@/components/teacher-picker';

export default {
  name: 'CompareUserPreviewPanel',
  components: { TeacherPicker },
  props: {
    // 外部对比任务进行中，驱动预览区 loading
    loading: { type: Boolean, default: false },
    // 分析失败原因：非空时预览区展示失败状态（优先于正常预览）
    error: { type: String, default: '' }
  },
  data() {
    return {
      pickerVisible: false,
      selectedTeacher: null
    };
  },
  computed: {
    teacherName() {
      const teacher = this.selectedTeacher || {};
      return teacher.name || teacher.trueName || teacher.userName || '';
    }
  },
  methods: {
    openTeacherPicker() {
      this.pickerVisible = true;
    },
    // 选人确认：记录教师、关闭弹框，并上抛教师对象供父级发起对比测试
    handleTeacherConfirmed(teacher) {
      this.selectedTeacher = teacher;
      this.pickerVisible = false;
      this.$emit('choose', teacher);
    }
  }
};
</script>

<style scoped>
.compare-user-preview-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}
.cupp-userbar {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
  flex-shrink: 0;
  margin-bottom: 8px;
}
.cupp-userbar__label {
  color: var(--muted, #6b7280);
}
.cupp-userbar__name {
  color: var(--ink, #111827);
  font-weight: 600;
}
.cupp-userbar__id {
  font-style: normal;
  font-size: 10.5px;
  color: var(--muted, #6b7280);
}
.cupp-body {
  flex: 1 1 auto;
  min-height: 0;
  overflow: auto;
}
.cupp-page {
  width: 100%;
  height: 100%;
  min-height: 200px;
  padding: 10px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  overflow: auto;
  box-sizing: border-box;
}
.cupp-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 200px;
  color: var(--muted, #6b7280);
  font-size: 12px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  box-sizing: border-box;
}
.cupp-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  height: 100%;
  min-height: 200px;
  padding: 16px;
  color: #dc2626;
  font-size: 12.5px;
  text-align: center;
  border: 1px solid #fecaca;
  border-radius: 4px;
  background: #fef2f2;
  box-sizing: border-box;
}
.cupp-error svg {
  width: 28px;
  height: 28px;
}
.cupp-error__msg {
  max-width: 90%;
  line-height: 1.6;
  word-break: break-all;
}
</style>
