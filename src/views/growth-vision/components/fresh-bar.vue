<template>
  <div class="fresh-bar" :class="{ stale: stale, analyzing: analyzing }">
    <svg v-if="!analyzing" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M21 12a9 9 0 11-2.6-6.3M21 4v5h-5"/></svg>
    <span v-else class="fb-spinner"></span>
    <span class="fb-item">档案数据拉取于 <span class="fb-time">{{ pullTime }}</span></span>
    <template v-if="analyzing">
      <span class="fb-item fb-progress">{{ progressText }}</span>
    </template>
    <template v-else-if="anaTime">
      <span class="fb-item">本次分析基于该时点数据 · 分析完成于 <span class="fb-time">{{ anaTime }}</span></span>
    </template>
    <template v-else>
      <span class="fb-item fb-no-result">尚未生成分析结果</span>
    </template>
    <span v-if="stale && !analyzing" class="fb-stale-tag">档案有更新，建议重新分析</span>
    <button class="fb-refresh" type="button" :disabled="analyzing" @click="$emit('refresh')">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" style="width:12px;height:12px;color:inherit"><path d="M21 12a9 9 0 11-2.6-6.3M21 4v5h-5"/></svg>{{ analyzing ? '分析中…' : '重新拉取并分析' }}
    </button>
  </div>
</template>

<script>
export default {
  name: 'FreshBar',
  props: {
    pullTime: { type: String, default: '' },
    anaTime: { type: String, default: '' },
    stale: { type: Boolean, default: false },
    analyzing: { type: Boolean, default: false },
    progressText: { type: String, default: '' }
  }
};
</script>
