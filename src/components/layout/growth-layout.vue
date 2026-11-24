<template>
  <div>
    <side-nav />
    <div class="workspace">
      <top-bar />
      <main>
        <router-view />
      </main>
      <footer>
        <span>南京市第十三中学 · 教师发展平台</span>
        <span>本页分析结果仅供参考，最终解释权归组织和管理部门所有</span>
        <span>界面演示，非实时业务数据</span>
      </footer>
    </div>
  </div>
</template>

<script>
import SideNav from './side-nav.vue';
import TopBar from './top-bar.vue';

export default {
  name: 'GrowthLayout',
  components: { SideNav, TopBar }
};
</script>
