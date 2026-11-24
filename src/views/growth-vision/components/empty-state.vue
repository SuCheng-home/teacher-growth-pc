<template>
  <section class="card empty-state">
    <div class="empty-ico">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 3l10 18H2z"/><path d="M12 9v5M12 17v.5"/></svg>
    </div>
    <h2>暂未设置成长愿景</h2>
    <p>添加成长愿景后，系统将按该愿景标准进行资格预审与差距分析。</p>
    <button class="primary-btn" type="button" @click="$emit('add')">添加我的成长愿景</button>
  </section>
</template>

<script>
export default {
  name: 'EmptyState'
};
</script>
