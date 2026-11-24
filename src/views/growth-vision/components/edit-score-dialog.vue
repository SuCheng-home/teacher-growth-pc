<template>
  <div v-if="visible" class="ask-mask" @click.self="$emit('close')">
    <div class="ask-modal">
      <div class="ask-head">
        <div>
          <h3>修改「{{ itemName }}」</h3>
          <p>保存后本项与总分立即重算，改动会计入分析报告留痕。</p>
        </div>
        <button class="gm-close" type="button" title="关闭" aria-label="关闭" @click="$emit('close')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 6l12 12M18 6L6 18"/></svg>
        </button>
      </div>
      <div class="ask-body">
        <div class="kind-switch">
          <button type="button" :class="{ on: kind === 'value' }" @click="kind = 'value'">改取值</button>
          <button type="button" :class="{ on: kind === 'score' }" @click="kind = 'score'">改分值</button>
          <button type="button" :class="{ on: kind === 'none' }" @click="kind = 'none'">标记不适用</button>
        </div>
        <div v-show="kind === 'value'" class="fld">
          <label>读到的取值</label>
          <input v-model="value" placeholder="例：区级公开课 4 次（学校已核准）">
          <div class="hint">改动会写进该行的「依据」里，原档案记录保留可对照。</div>
        </div>
        <div v-show="kind === 'score'" class="fld">
          <label>本项分值</label>
          <input v-model="score" type="number" step="0.5" :placeholder="'满分 ' + (itemFull != null ? itemFull : '按原文')">
        </div>
        <div class="fld">
          <label>改动理由（必填）</label>
          <textarea v-model="reason" rows="2" placeholder="例：学校已确认该记录，档案尚未回填"></textarea>
        </div>
        <div v-show="kind === 'none'" class="fld hint">标记不适用后，本项不计分，但仍会在报告里单列原因。</div>
      </div>
      <div class="ask-foot">
        <span class="fhint">如需撤销，可点该行「重新取数」恢复系统原判</span>
        <button class="cancel" type="button" @click="$emit('close')">取消</button>
        <button class="ok" type="button" :disabled="!canSave" @click="onConfirm">保存修改</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'EditScoreDialog',
  props: {
    visible: { type: Boolean, default: false },
    item: { type: Object, default: null },
    target: { type: Object, default: null },
    ov: { type: Object, default: () => ({}) }
  },
  data() {
    return {
      kind: 'value',
      value: '',
      score: '',
      reason: ''
    };
  },
  computed: {
    itemName() {
      return this.item && this.item.it ? this.item.it.n : '';
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
      if (val) this.init();
    }
  },
  methods: {
    init() {
      const ov = (this.item && this.item.ov) || {};
      this.kind = ov.del ? 'none' : ((ov.score !== undefined && ov.score !== '') ? 'score' : 'value');
      this.value = ov.value || '';
      this.score = (ov.score !== undefined && ov.score !== '') ? ov.score : '';
      this.reason = ov.reason || '';
    },
    onConfirm() {
      const reason = this.reason.trim();
      if (!reason || !this.item) return;
      const payload = { id: this.item.id, kind: this.kind, name: this.itemName, reason };
      if (this.kind === 'none') {
        payload.del = true;
      } else if (this.kind === 'score') {
        payload.score = this.score === '' ? undefined : Number(this.score);
      } else {
        payload.value = this.value.trim();
      }
      this.$emit('confirm', payload);
    }
  }
};
</script>
