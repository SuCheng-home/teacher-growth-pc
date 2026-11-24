<template>
  <div v-if="visible" class="ask-mask" @click.self="$emit('close')">
    <div class="ask-modal">
      <div class="ask-head">
        <div>
          <h3>剔除「{{ itemName }}」</h3>
          <p>剔除后本项不计分，报告里会单列这一条与原因。</p>
        </div>
        <button class="gm-close" type="button" title="关闭" aria-label="关闭" @click="$emit('close')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 6l12 12M18 6L6 18"/></svg>
        </button>
      </div>
      <div class="ask-body">
        <div class="fld">
          <label>剔除理由（必填）</label>
          <textarea v-model="reason" rows="2" placeholder="例：该记录不属于本次申报时间窗口"></textarea>
        </div>
        <div class="excl-note" style="margin-top:0">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 3a9 9 0 100 18 9 9 0 000-18z"/><path d="M9 9l6 6M15 9l-6 6"/></svg>
          <span>本项原分值 <b>{{ itemScore != null ? itemScore : '—' }}</b> 将从总分扣除，满分 <b>{{ itemFull != null ? itemFull : '—' }}</b> 同步从分母扣除。</span>
        </div>
      </div>
      <div class="ask-foot">
        <button class="cancel" type="button" @click="$emit('close')">取消</button>
        <button class="ok" type="button" :disabled="!canSave" @click="onConfirm">确认剔除</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DeleteScoreDialog',
  props: {
    visible: { type: Boolean, default: false },
    item: { type: Object, default: null },
    target: { type: Object, default: null }
  },
  data() {
    return { reason: '' };
  },
  computed: {
    itemName() {
      return this.item && this.item.it ? this.item.it.n : '';
    },
    itemScore() {
      return this.item ? this.item.score : null;
    },
    itemFull() {
      return this.item && this.item.it ? this.item.it.full : null;
    },
    canSave() {
      return !!this.reason.trim();
    }
  },
  watch: {
    visible(val) {
      if (val) this.reason = '';
    }
  },
  methods: {
    onConfirm() {
      const reason = this.reason.trim();
      if (!reason || !this.item) return;
      this.$emit('confirm', { id: this.item.id, name: this.itemName, reason });
    }
  }
};
</script>
