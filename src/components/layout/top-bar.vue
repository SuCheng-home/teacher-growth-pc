<template>
  <header class="topbar">
    <div class="breadcrumb">教师发展 <span>›</span> <strong>{{ pageTitle }}</strong></div>
    <div class="header-actions">
      <!-- <span class="demo-label">DEMO · 示例数据</span> -->
      <img class="avatar" :src="avatar" alt="" :onerror="loadAvatarError">
      <span>{{ displayName }}</span>
    </div>
  </header>
</template>

<script>
import { store as authStore, mixin } from 'auth-layout-zw';
export default {
  name: 'TopBar',
  computed: {
    loadAvatarError() {
      return mixin.avatarLoadError
    },
    pageTitle() {
      return this.$route.meta && this.$route.meta.title ? this.$route.meta.title : '成长愿景';
    },
    displayName() {
      return authStore.getters.name
    },
    avatar() {
      return mixin.showImageComputed(authStore.getters.avatar)
    }
  }
};
</script>
