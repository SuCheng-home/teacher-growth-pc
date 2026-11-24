<template>
  <div class="rule-render">
    <!-- 一、资格门槛 -->
    <template v-if="gates.length">
      <div class="cat-band">
        <b>一、资格门槛（{{ gateTotal }}条）</b>
        <span class="cl"></span>
      </div>
      <div v-for="(group, gi) in gates" :key="'gg-' + gi" class="rule-render__group">
        <div v-if="group.group" class="rule-render__group-title">{{ group.group }}</div>
        <rule-item
          v-for="(entry, ei) in group.entries || []"
          :key="'ge-' + gi + '-' + ei"
          type="gate"
          :entry="entry"
          :index="gateOffset(gi) + ei"
        />
      </div>
    </template>

    <!-- 二、材料评分项 -->
    <template v-if="scoreItems.length">
      <div class="cat-band" :class="{ 'mt': gates.length }">
        <b>二、材料评分项（{{ scoreTotal }}项）</b>
        <span class="cl"></span>
      </div>
      <div v-for="(cat, ci) in scoreItems" :key="'sc-' + ci" class="rule-render__group">
        <div v-if="cat.category" class="rule-render__group-title">{{ cat.category }}</div>
        <rule-item
          v-for="(entry, ei) in cat.entries || []"
          :key="'se-' + ci + '-' + ei"
          type="score"
          :entry="entry"
          :index="scoreOffset(ci) + ei"
        />
      </div>
    </template>
  </div>
</template>

<script>
/* 规则解读渲染容器：按后端固定结构 { gates, scoreItems } 分派渲染 */
import RuleItem from './rule-item';

export default {
  name: 'RuleRender',
  components: { RuleItem },
  props: {
    // 后端 JSON 数据：{ gates: [...], scoreItems: [...] }
    data: { type: Object, default: () => ({}) }
  },
  computed: {
    gates() {
      return this.data.gates || [];
    },
    scoreItems() {
      return this.data.scoreItems || [];
    },
    gateTotal() {
      return this.gates.reduce((sum, g) => sum + (g.entries || []).length, 0);
    },
    scoreTotal() {
      return this.scoreItems.reduce((sum, c) => sum + (c.entries || []).length, 0);
    }
  },
  methods: {
    // 计算某个 group 之前已累计的条目数（用于全局序号）
    gateOffset(groupIndex) {
      let offset = 0;
      for (let i = 0; i < groupIndex; i++) {
        offset += (this.gates[i].entries || []).length;
      }
      return offset;
    },
    scoreOffset(catIndex) {
      let offset = 0;
      for (let i = 0; i < catIndex; i++) {
        offset += (this.scoreItems[i].entries || []).length;
      }
      return offset;
    }
  }
};
</script>

<style scoped>
.rule-render__group {
  margin-bottom: 4px;
}
.rule-render__group-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--muted, #6b7280);
  padding: 6px 0 2px 4px;
}
.cat-band.mt {
  margin-top: 18px;
}
</style>
