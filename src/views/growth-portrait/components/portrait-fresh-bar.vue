<template>
  <!-- 数据时点条：档案数据时点 / 统计完成时点 / 计分口径 / 时间窗与状态口径 + 重新拉取并统计 -->
  <div class="fresh-bar">
    <i data-lucide="database"></i>
    <span class="fb-item">档案数据时点 <b class="fb-time">{{ pullTime }}</b></span>
    <span class="fb-item">本次统计基于该时点数据 · 统计完成于 <b class="fb-time">{{ pullTime }}</b></span>
    <span class="fb-clause">时间窗 <b>{{ cfg.timeWindow }}</b></span>
    <span class="fb-clause">计分口径 <b>内置默认</b></span>
    <span class="fb-note">{{ cfg.statusClause }}</span>
    <span v-if="stale" class="fb-stale-tag">{{ cfg.staleTag }}</span>
    <button class="fb-refresh" type="button" @click="handleRefresh">
      <!-- 成功态与常态各用独立占位节点，避免 Vue 复用已被图标库替换的节点 -->
      <template v-if="refreshed">
        <i data-lucide="check"></i>{{ cfg.refreshDone }}
      </template>
      <template v-else>
        <i data-lucide="refresh-cw"></i>{{ cfg.refreshIdle }}
      </template>
    </button>
  </div>
</template>

<script>
import { PORTRAIT_FRESH_BAR } from '@/constants/growth-portrait';

export default {
  name: 'PortraitFreshBar',
  props: {
    /* 档案数据时点（父组件在拉取愿景与重算时刷新） */
    pullTime: { type: String, default: '—' },
    /* 档案口径是否变化（父组件按愿景指纹判定） */
    stale: { type: Boolean, default: false }
  },
  data() {
    return {
      cfg: PORTRAIT_FRESH_BAR,
      /* 刷新成功提示态，延时后自动回落为常态按钮 */
      refreshed: false,
      resetTimer: null
    };
  },
  beforeDestroy() {
    clearTimeout(this.resetTimer);
  },
  methods: {
    // 重新拉取并统计：先向父组件请求重拉，成功回调后展示 2.2s 已重算提示并清除过期标记
    handleRefresh() {
      this.$emit('refresh', () => {
        this.refreshed = true;
        clearTimeout(this.resetTimer);
        this.resetTimer = setTimeout(() => {
          this.refreshed = false;
        }, PORTRAIT_FRESH_BAR.refreshResetDelay);
      });
    }
  }
};
</script>
