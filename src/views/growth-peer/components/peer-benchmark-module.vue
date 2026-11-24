<template>
  <!-- 组内标杆参考模块：匿名文案由纯函数依据 result / checkedMap 生成 -->
  <section class="card">
    <div class="card-head">
      <h2>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 3a9 9 0 100 18 9 9 0 000-18z"/><path d="M12 8v5M12 16.5v.5"/></svg>
        组内标杆参考
      </h2>
      <span class="side">匿名</span>
    </div>
    <div class="bench-anon">{{ benchmarkText }}</div>
  </section>
</template>

<script>
import { buildBenchmarkReference } from '@/utils/peer-benchmark';

export default {
  name: 'PeerBenchmarkModule',
  props: {
    result: { type: Object, required: true }
  },
  computed: {
    benchmarkText() {
      return buildBenchmarkReference(this.result);
    }
  }
};
</script>
