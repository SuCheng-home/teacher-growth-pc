<template>
  <div class="placeholder-page">
    <h2>{{ title }}</h2>
    <p>该功能模块正在开发中，敬请期待。</p>
  </div>
</template>

<script>
export default {
  name: 'PlaceholderPage',
  computed: {
    title() {
      return this.$route.meta && this.$route.meta.title ? this.$route.meta.title : '功能开发中';
    }
  }
};
</script>
