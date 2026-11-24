<template>
  <!-- 报告目录：左侧粘性锚点导航，随页面滚动高亮当前段落；关闭的段落不出现在目录 -->
  <nav class="toc">
    <div class="toc-title">报告目录</div>
    <a
      v-for="item in tocItems"
      :key="item.id"
      class="toc-link"
      :class="{ on: activeId === item.id }"
      @click="scrollTo(item.id)"
    >{{ item.label }} <span class="n">{{ item.note }}</span></a>
  </nav>
</template>

<script>
import { PORTRAIT_TOC_ITEMS } from '@/constants/growth-portrait';

// 顶部 sticky 导航栏高度补偿：滚动判定时把视口上沿下移该像素
const SPY_OFFSET = 90;

export default {
  name: 'PortraitToc',
  props: {
    /* 段落显示开关（父组件按 frame.sections 传入，关闭的段落从目录隐去） */
    sections: { type: Object, default: () => ({}) },
    /* 同辈对比分组：用于将「同辈参考」单项按可比条件逐组展开为【同辈对比·XXXX】多个锚点 */
    peerGroups: { type: Array, default: () => [] }
  },
  data() {
    return {
      items: PORTRAIT_TOC_ITEMS,
      // 当前高亮段落锚点 id
      activeId: ''
    };
  },
  computed: {
    // 目录项：仅保留开关打开的段落；其中「同辈参考」按每个可比条件展开为独立锚点（id 与逐组 section 对齐）
    tocItems() {
      const result = [];
      this.items.forEach(item => {
        if (this.sections[item.key] === false) return;
        if (item.key === 'peer') {
          this.peerGroups.forEach((group, gi) => {
            result.push({ id: `sec-peer-${gi}`, label: `同辈对比·${group.name}`, note: '对标' });
          });
        } else {
          result.push(item);
        }
      });
      return result;
    }
  },
  mounted() {
    this.spy();
    window.addEventListener('scroll', this.spy, { passive: true });
  },
  beforeDestroy() {
    window.removeEventListener('scroll', this.spy);
  },
  methods: {
    // 滚动侦测：取所有已渲染段落锚点，命中「顶部以上」的最后一个即当前段
    spy() {
      const y = window.scrollY + SPY_OFFSET;
      let current = '';
      this.tocItems.forEach(item => {
        const el = document.getElementById(item.id);
        if (el && el.offsetTop <= y) {
          current = item.id;
        }
      });
      this.activeId = current;
    },
    // 点击目录项：平滑滚动到对应段落（section 已设 scroll-margin-top 让出粘性栏）
    scrollTo(id) {
      const el = document.getElementById(id);
      if (!el) {
        return;
      }
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
};
</script>
