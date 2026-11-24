<template>
  <div v-if="visible" class="ask-mask" @click.self="$emit('close')">
    <div class="ask-modal">
      <div class="ask-head">
        <div>
          <h3>从档案重新取数 · 「{{ itemName }}」</h3>
          <p>系统将重新读取该档案域，覆盖本行的取值与分值；本人手工修改的内容将被清除。</p>
        </div>
        <button class="gm-close" type="button" title="关闭" aria-label="关闭" @click="$emit('close')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 6l12 12M18 6L6 18"/></svg>
        </button>
      </div>
      <div class="ask-body">
        <div class="fld">
          <label>数据来源</label>
          <div><span class="src-chip" :class="itemSrc">{{ srcLabel }}</span>　{{ itemFrom }}</div>
        </div>
        <div class="fld">
          <label>该档案域现有记录（{{ recs.length }} 条）</label>
          <div class="pick-list">
            <div v-for="(x, i) in recs" :key="i"><span>·</span><span>{{ x }}</span></div>
          </div>
        </div>
        <div class="fld hint">取值时点：{{ pullTime }}（演示环境读取同一份示例档案）</div>
      </div>
      <div class="ask-foot">
        <span class="fhint">不影响其他评分项</span>
        <button class="cancel" type="button" @click="$emit('close')">取消</button>
        <button class="ok" type="button" @click="onConfirm">重新取数并重算</button>
      </div>
    </div>
  </div>
</template>

<script>
import { SRC_TYPE } from '@/constants/qualification';

export default {
  name: 'RefetchDialog',
  props: {
    visible: { type: Boolean, default: false },
    item: { type: Object, default: null },
    target: { type: Object, default: null },
    pullTime: { type: String, default: '' }
  },
  computed: {
    it() {
      return this.item && this.item.it ? this.item.it : {};
    },
    itemName() {
      return this.it.n || '';
    },
    itemSrc() {
      return this.it.src || 'tbd';
    },
    itemFrom() {
      return this.it.from || '';
    },
    srcLabel() {
      return SRC_TYPE[this.it.src] || '待原文确认';
    },
    recs() {
      return (this.it.recs && this.it.recs.length) ? this.it.recs : ['该档案域暂无记录'];
    }
  },
  methods: {
    onConfirm() {
      if (!this.item) return;
      this.$emit('confirm', { id: this.item.id, name: this.itemName });
    }
  }
};
</script>
