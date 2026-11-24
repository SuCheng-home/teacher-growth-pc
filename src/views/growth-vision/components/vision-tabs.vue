<template>
  <div class="tabs" id="tabs">
    <button
      v-for="(def, i) in tabDefs"
      :key="def.k"
      class="tab"
      :class="{ on: activeTab === def.k }"
      :data-t="def.k"
      type="button"
      @click="$emit('change', def.k)"
    >
      <span class="tno">{{ i + 1 }}</span>
      <svg v-if="def.k === 'doc'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8z"/><path d="M14 3v5h5"/><path d="M9 13h6M9 17h4"/></svg>
      <svg v-else-if="def.k === 'cmp'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M9 6h11M9 12h11M9 18h11"/><path d="M4.2 6.2l1.3 1.3L8 4.8M4.2 12.2l1.3 1.3L8 10.8M4.2 18.2l1.3 1.3L8 16.8"/></svg>
      <svg v-else-if="def.k === 'sum'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1" fill="currentColor"/></svg>
      <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8z"/><path d="M14 3v5h5"/><path d="M9 14h2v4H9zM15 11v7"/></svg>
      <span class="lb">{{ def.t }}</span>
      <span v-if="badgeOf(def.k)" class="bd">{{ badgeOf(def.k) }}</span>
    </button>
  </div>
</template>

<script>
import { TAB_DEFS } from '@/constants/qualification';

export default {
  name: 'VisionTabs',
  props: {
    activeTab: { type: String, default: 'doc' },
    /* AiVisionAnalysis 汇总（来源 8.3 detail / 8.4 latest） */
    detail: { type: Object, default: null },
    /* 分析结果全量结构（来源 8.7 analysisStructure）：{ fixPath, scoreItems, ... } */
    structure: { type: Object, default: null },
    /* 评估标准原文文件数（标准解读面板按 goalId 拉取后上抛）：政策规则解读页签徽标 */
    fileCount: { type: Number, default: 0 }
  },
  data() {
    return { tabDefs: TAB_DEFS };
  },
  computed: {
    /* 需本人办理事项数：结构 fixPath 条目数，兼容 JSON 字符串/数组 */
    fixPathCount() {
      let fp = (this.structure && this.structure.fixPath) || [];
      if (typeof fp === 'string') {
        try {
          fp = JSON.parse(fp);
        } catch (e) {
          fp = fp ? [fp] : [];
        }
      }
      return Array.isArray(fp) ? fp.length : 0;
    },
    /* 缺口项数：评分项中材料分未达满分者，与「汇总与差距」面板 gapRows 同口径 */
    gapCount() {
      let n = 0;
      ((this.structure && this.structure.scoreItems) || []).forEach(g => (g.entries || []).forEach(e => {
        if (e.score != null && e.fullScore != null && (e.score - e.fullScore) < 0) n += 1;
      }));
      return n;
    }
  },
  methods: {
    /* 页签徽标：解读=原文份数｜比对=需本人办理项数｜汇总=缺口项数 */
    badgeOf(k) {
      if (!this.detail && !this.structure) return '';
      if (k === 'doc') return this.fileCount ? this.fileCount + ' 份原文' : '';
      if (k === 'cmp') return this.fixPathCount ? this.fixPathCount + ' 项需本人办理' : '无需办理';
      if (k === 'sum') return this.gapCount ? '缺口 ' + this.gapCount + ' 项' : '已无缺口';
      return '';
    }
  }
};
</script>
