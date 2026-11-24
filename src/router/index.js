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
  if (!getToken()) {
    gotoLoginPage();
    return
  }
  await store.dispatch('archives/initIndexList');
  next();
});

router.afterEach(to => {
  const title = to.meta && to.meta.title;
  document.title = title ? `${title} · 南京市第十三中学` : '南京市第十三中学 · 成长愿景';
});

export default router;
