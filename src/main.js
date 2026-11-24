import Vue from 'vue';
import ElementUI from 'element-ui';
// Element UI 主题：主色整体覆盖为品牌绿（见 styles/element-variables.scss）
import '@/styles/element-variables.scss';
import '@/styles/global.scss';
import 'auth-layout-components/dist/index/style.css'

import App from './App.vue';
import router from './router';
import store from './store';
import { setupLucideAutoRender } from '@/utils/lucide-icons';

// AI 通用会话公共组件：注册时注入运行时配置（与宿主解耦）
import AiChat from '@/components/ai-chat';

// auth-layout-zw 鉴权初始化：环境变量注册 + initApp + 路由守卫
import { registryEnvVariables, initApp, routerHandler, getToken } from 'auth-layout-zw';
import { getAuthEnvConfig } from '@/config/auth-env';

Vue.config.productionTip = false;
Vue.use(ElementUI);

// 注册应用级环境变量，必须在 initApp() 之前调用
registryEnvVariables(getAuthEnvConfig());

// AI 会话组件：注入 X-Caller、令牌获取与主题色（echarts 需宿主安装）
Vue.use(AiChat, {
  caller: getAuthEnvConfig().ENV_CONFIG_X_CALLER,
  getToken,
  theme: { primary: '#2f7a68', primaryDark: '#245f51' }
});

// 挂载应用：先接入 auth-layout-zw 路由守卫，再实例化根组件
function bootstrap() {
  // 临时注释：跳过 auth-layout-zw 路由守卫，便于本地预览
  // routerHandler(router);
  new Vue({
    router,
    store,
    render: h => h(App)
  }).$mount('#app');
  // 全局自动渲染 Lucide 图标，页面组件无需再各自调用 createIcons
  setupLucideAutoRender();
}

// 完整启用鉴权：initApp 成功后再挂载应用，失败则输出带应用前缀的错误日志
// 临时注释：跳过 initApp 登录初始化，直接挂载应用以便本地预览
// initApp()
//   .then(bootstrap)
//   .catch(err => console.error('[teacher-growth-pc] initApp failed:', err));
bootstrap();
