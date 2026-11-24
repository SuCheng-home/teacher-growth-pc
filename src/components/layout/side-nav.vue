<template>
  <aside class="sidebar">
    <div class="brand">
      <!-- logoModel===1：展示长 Logo；否则展示方图图标 + 平台名称（与 AppLogo 保持一致） -->
      <template v-if="workPageParams.logoModel === 1 && workPageParams.longLogo && workPageParams.longLogo.length">
        <img class="app-logo long-logo" :src="showImageComputed(workPageParams.longLogo[0].attachmentKey)" />
      </template>
      <template v-else-if="workPageParams.squareIcon">
        <img class="app-logo" :src="showImageComputed(workPageParams.squareIcon)" />
        <strong>{{ workPageParams.name }}</strong>
      </template>
    </div>
    <div class="platform-name">{{ curAppJson.sysAppNicename || curAppJson.name }}</div>
    <nav>
      <template v-for="item in filterPermissionNavItems">
        <div
          v-if="item.type === 'navGroup'"
          :key="'g-' + item.key"
          class="nav-group"
          :class="{ 'has-active': isGroupActive(item) }"
          :data-open="openGroups[item.key] ? '1' : '0'"
        >
          <button class="nav-caption" type="button" @click="toggleGroup(item.key)">
            <span>{{ item.label }}</span>
            <i data-lucide="chevron-down"></i>
          </button>
          <div class="nav-sub">
            <!-- 包裹层：grid 0fr→1fr 折叠过渡需要单一 overflow:hidden 子层 -->
            <div class="nav-sub-inner">
              <template v-for="child in item.children">
                <!-- 带 open 标记的菜单为外部系统地址：新窗口打开，不进前端路由 -->
                <a
                  v-if="child.open"
                  :key="'o-' + child.path"
                  class="nav-item sub"
                  :href="child.path"
                  target="_blank"
                  rel="noopener"
                >
                  <i :data-lucide="child.icon"></i>
                  <span class="nav-label">{{ child.label }}</span>
                </a>
                <router-link
                  v-else-if="child.path"
                  :key="child.path"
                  :to="child.path"
                  class="nav-item sub"
                  active-class="active"
                >
                  <i :data-lucide="child.icon"></i>
                  <span class="nav-label">{{ child.label }}</span>
                </router-link>
                <a v-else :key="'x-' + child.label" class="nav-item sub disabled">
                  <i :data-lucide="child.icon"></i>
                  <span class="nav-label">{{ child.label }}</span>
                </a>
              </template>
            </div>
          </div>
        </div>
        <router-link
          v-else-if="item.path"
          :key="item.label"
          :to="item.path"
          class="nav-item"
          :class="{ flat: item.flat }"
          active-class="active"
        >
          <i :data-lucide="item.icon"></i>
          <span class="nav-label">{{ item.label }}</span>
        </router-link>
        <a v-else :key="'x-' + item.label" class="nav-item disabled" :class="{ flat: item.flat }">
          <i :data-lucide="item.icon"></i>
          <span class="nav-label">{{ item.label }}</span>
        </a>
      </template>
    </nav>
    <div class="sidebar-bottom">
      <div class="school-photo"><span>向下扎根 · 向上生长</span></div>
      <!-- <button class="help">
        <i data-lucide="circle-help"></i>帮助与反馈<i data-lucide="arrow-up-right"></i>
      </button> -->
      <!-- <div class="source-state">
        <span class="status-dot"></span>区校同源 · 演示模式
      </div> -->
    </div>
  </aside>
</template>

<script>
import { store, mixin } from 'auth-layout-zw'
import { getAuthEnvConfig } from '@/config/auth-env';
export default {
  name: 'SideNav',
  data() {
    const env = getAuthEnvConfig()
    return {
      navItems: [
        {
          type: 'navGroup',
          key: 'self',
          label: '个人成长空间',
          defaultOpen: true,
          children: [
            { label: '成长首页', icon: 'layout-dashboard', path: '/growth/index' },
            { label: '我的画像', icon: 'contact-round', path: '/growth/portrait' },
            { label: '电子档案袋', icon: 'folder-open', open: true, path: `${store.getters.curRootUrl}teacherArchivesSchNew/myTask/list` },
            { label: '成长愿景', icon: 'route', path: '/growth/vision' },
            { label: '同辈对标', icon: 'chart-no-axes-combined', path: '/growth/peer' },
            { label: '校级评选', icon: 'award', open: true, path: `${store.getters.curRootUrl}evaluateSch/home` },
          ]
        },
        // 管理员菜单（后期绑定权限值控制展示隐藏）
        {
          type: 'navGroup',
          key: 'vision',
          label: '成长愿景设置',
          defaultOpen: true,
          permission: `${env.APP_ORIGIN}-vision`,
          children: [
            { label: '愿景分类管理', icon: 'tags', path: '/admin/vision/category' },
            { label: '标准管理', icon: 'library', path: '/admin/vision/standard' }
          ]
        },
        {
          type: 'navGroup',
          key: 'portrait',
          label: '教师画像设置',
          defaultOpen: false,
          permission: `${env.APP_ORIGIN}-portrait`,
          children: [
            { label: '画像维度配置', icon: 'layout-grid', path: '/admin/portrait/dimension' },
            { label: '我的画像设置', icon: 'user-round-cog', path: '/admin/portrait/config' },
            { label: '画像指标绑定', icon: 'link-2', path: '/admin/portrait/bind' },
            { label: '分数段类型设置', icon: 'medal', path: '/admin/portrait/score-type' }
          ]
        },
        {
          type: 'navGroup',
          key: 'peer',
          label: '同辈对标设置',
          defaultOpen: false,
          permission: `${env.APP_ORIGIN}-peer`,
          children: [
            { label: '同辈对标设置', icon: 'users', path: '/admin/peer/setting' },
            { label: '维度分析设置', icon: 'layers', path: '/admin/peer/dim-analysis' }
          ]
        },
        {
          type: 'navGroup',
          key: 'data',
          label: '数据与校验',
          defaultOpen: false,
          permission: `${env.APP_ORIGIN}-data`,
          children: [
            { label: '发展大事件管理', icon: 'calendar-days', path: '/admin/data/events' },
            // { label: '试算与校验', icon: 'flask-conical', path: '/admin/data/trial' },
            // { label: '数据质量看板', icon: 'shield-check', path: '/admin/data/quality' },
            // { label: '报告口径', icon: 'file-text', path: '/admin/data/report' }
          ]
        },
        // {
        //   type: 'navGroup',
        //   key: 'ai',
        //   label: 'AI 助手',
        //   defaultOpen: false,
        //   children: [
        //     { label: '知识库文件', icon: 'database', path: '/admin/ai/knowledge' },
        //     { label: '提示词配置', icon: 'braces', path: '/admin/ai/prompt' },
        //     { label: '参数配置', icon: 'sliders-horizontal', path: '/admin/ai/parameter' },
        //     { label: '对话审计与用量', icon: 'scroll-text', path: '/admin/ai/audit' }
        //   ]
        // },
        // 校管理员·队伍分析
        {
          type: 'navGroup',
          key: 'team',
          label: '队伍分析',
          defaultOpen: false,
          permission: `${env.APP_ORIGIN}-team`,
          children: [
            { label: '队伍全景', icon: 'layout-dashboard', path: '/admin/team/overview' },
            { label: '同辈对标', icon: 'chart-no-axes-combined', path: '/admin/team/peer' }
          ]
        }
      ],
      // 折叠状态（手风琴：同时只展开一组）：初始仅第一个 defaultOpen 组展开，见 created 钩子
      openGroups: {}
    };
  },
  computed: {
    currentPath() {
      return this.$route && this.$route.path ? this.$route.path : '';
    },
    filterPermissionNavItems() {
      return this.navItems.filter((item) => {
        return !item.permission || store.getters.permissions.includes(item.permission);
      });
    },
    curAppJson() {
      return store.getters.curAppJson;
    },
    /* 平台展示配置：来自 saas 组织参数 workPageParams（JSON 字符串） */
    workPageParams() {
      const params = store.getters.saasOrgParams || {};
      try {
        return JSON.parse(params.workPageParams || '{}');
      } catch (e) {
        return {};
      }
    },
  },
  watch: {
    currentPath() {
      this.expandActiveGroup();
    }
  },
  created() {
    /* 手风琴初始态：只开第一个 defaultOpen 组，其余全部收起 */
    let opened = false;
    this.filterPermissionNavItems.forEach((item) => {
      if (item.type === 'navGroup') {
        const open = !opened && !!item.defaultOpen;
        if (open) opened = true;
        this.$set(this.openGroups, item.key, open);
      }
    });
  },
  mounted() {
    this.expandActiveGroup();
  },
  methods: {
    showImageComputed(val) {
      return mixin.showImageComputed(val);
    },
    /* 手风琴开关：展开某组时收起其余组；点已展开组则收起（允许全关） */
    toggleGroup(key) {
      if (this.openGroups[key]) {
        this.$set(this.openGroups, key, false);
      } else {
        Object.keys(this.openGroups).forEach((k) => this.$set(this.openGroups, k, k === key));
      }
    },
    isGroupActive(group) {
      return (group.children || []).some((child) => child.path === this.currentPath);
    },
    expandActiveGroup() {
      /* 路由命中某组时按手风琴口径只展开该组；未命中（如首页外部路由）保持现状 */
      const active = this.filterPermissionNavItems.find((item) => item.type === 'navGroup' && this.isGroupActive(item));
      if (active) {
        Object.keys(this.openGroups).forEach((k) => this.$set(this.openGroups, k, k === active.key));
      }
    }
  }
};
</script>
