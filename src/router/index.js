import Vue from 'vue';
import Router from 'vue-router';
import routes from './routes';
import store from '../store';
import { getToken, gotoLoginPage } from 'auth-layout-zw';

Vue.use(Router);

const router = new Router({
  routes
});

router.beforeEach(async (to, from, next) => {
  // 临时注释：跳过登录校验，便于本地预览
  // if (!getToken()) {
  //   gotoLoginPage();
  //   return
  // }
  // 未登录时指标接口会失败，捕获错误避免阻塞路由跳转
  try {
    await store.dispatch('archives/initIndexList');
  } catch (err) {
    console.warn('[teacher-growth-pc] initIndexList failed:', err);
  }
  next();
});

router.afterEach(to => {
  const title = to.meta && to.meta.title;
  document.title = title ? `${title} · 南京市第十三中学` : '南京市第十三中学 · 成长愿景';
});

export default router;
