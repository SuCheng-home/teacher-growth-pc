<template>
  <!-- ② 六维解析：每个维度块 = 评分项对照清单 + 我的水平/可比组中位条形 + 差距解读 + 下一动作 -->
  <section v-show="enabled" id="sec-dims">
    <div class="card">
      <div class="sec-eyebrow">{{ cfg.eyebrow }}</div>
      <h2 class="sec-h"><i :data-lucide="cfg.icon"></i>{{ cfg.title }}</h2>
      <div class="sec-sub">{{ cfg.sub }}</div>
      <div class="tag-legend">
        {{ cfg.legendPrefix }}<template v-for="(item, idx) in cfg.legendItems"><span :key="item.tag" v-if="true" class="tl" :class="item.tag">{{ item.text }}</span>{{ item.note }}{{ legendSep(idx) }}</template>
      </div>
      <div style="margin-top:14px">
        <div v-for="(block, index) in cfg.blocks" :key="block.name" class="dim-block">
          <div class="dim-head">
            <h3>{{ block.name }}</h3>
            <span class="dim-score" :class="'s-' + tierOf(block.score)">{{ block.score }}</span>
            <span class="dim-tag" :class="'t-' + tierOf(block.score)">{{ block.scoreTag }}</span>
          </div>
          <p class="dim-def"><b>这个维度看什么：</b>{{ defBody(block.def) }}</p>
          <div class="gap-hd">
            <i data-lucide="clipboard-list"></i>{{ block.compareTitle }}
            <span class="gcount">{{ block.countText }}</span>
          </div>
          <div class="gap-list">
            <div v-for="item in block.items" :key="item.label" class="gap-li" :class="item.status">
              <i :data-lucide="statusIcon(item.status)"></i>
              <span class="gt">{{ item.label }}</span>
              <span class="gv">{{ item.value }}</span>
              <span class="gs">{{ statusText(item.status) }}</span>
            </div>
          </div>
          <div class="dim-body">
            <div>
              <div class="dim-bars">
                <div class="dim-bar">
                  <span class="bn">我的水平</span>
                  <div class="bb"><i :class="'v-' + tierOf(block.score)" :style="{ width: block.score + '%' }"></i></div>
                  <span class="bv">{{ block.score }}</span>
                </div>
                <div class="dim-bar ref">
                  <span class="bn">可比组中位</span>
                  <div class="bb"><i :style="{ width: block.peerMedian + '%' }"></i></div>
                  <span class="bv">{{ block.peerMedian }}</span>
                </div>
              </div>
            </div>
            <div>
              <div class="ai-line"><b>差距解读：</b><template v-for="(seg, i) in readSegs(block)"><b v-if="seg.bold" :key="'r-'+index+'-'+i">{{ seg.text }}</b><span v-else :key="'r1-'+index+'-'+i">{{ seg.text }}</span></template></div>
              <!-- 正文分组必须用块级元素：Vue 2.7 SFC 解析器遇到 <span> 直接包裹 <template v-for> 会截断模板块 -->
              <div class="ai-sug"><i data-lucide="lightbulb"></i><div class="sug-txt"><template v-for="(seg, i) in suggestSegs(block)"><b v-if="seg.bold" :key="'s-'+index+'-'+i">{{ seg.text }}</b><span v-else :key="'s1-'+index+'-'+i">{{ seg.text }}</span></template></div></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { PORTRAIT_DIMENSIONS, scoreTier, parseRichSegments } from '@/constants/growth-portrait';

// 评分项状态 → 文案，与原型 gap-li 标签口径一致
const STATUS_TEXT_MAP = { ok: '已具备', no: '缺口', wait: '待补录' };

export default {
  name: 'PortraitDimensions',
  props: {
    /* 段落是否显示（父组件按 frame.sections.dims 传入） */
    enabled: { type: Boolean, default: true }
  },
  data() {
    return {
      cfg: PORTRAIT_DIMENSIONS
    };
  },
  methods: {
    // 分数档位 → 配色后缀（elite / good / mid / low）
    tierOf(score) {
      return scoreTier(score);
    },
    // 状态 → 图标名
    statusIcon(status) {
      return this.cfg.statusIconMap[status] || 'circle';
    },
    // 状态 → 标签文案
    statusText(status) {
      return STATUS_TEXT_MAP[status] || '';
    },
    // 标签口径图例项之间的分隔符（末项不留），避免模板里堆叠三元表达式
    legendSep(idx) {
      return idx < this.cfg.legendItems.length - 1 ? ' · ' : '';
    },
    // 维度定义去掉「这个维度看什么：」前缀，前缀已由模板中的 <b> 固定渲染
    defBody(def) {
      return def.replace(/^这个维度看什么：/, '');
    },
    // 差距解读正文的 **粗体** 分段
    readSegs(block) {
      return parseRichSegments(block.readSegments);
    },
    // 下一动作正文的 **粗体** 分段
    suggestSegs(block) {
      return parseRichSegments(block.suggestSegments);
    }
  }
};
</script>
