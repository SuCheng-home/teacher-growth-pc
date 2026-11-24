// 本地预览替身：内网私有包 auth-layout-zw 不可访问时由 vite.config.js 自动启用。
// 提供模拟登录用户与全部菜单权限，接口请求统一返回空数据，便于直接查看页面。

const MOCK_TOKEN = 'dev-stub-token';

const permissions = [];
permissions.includes = () => true;

const getters = {
  token: MOCK_TOKEN,
  name: '张老师',
  avatar: '',
  tenantId: 'dev-tenant',
  city: { code: '320100', name: '南京市' },
  area: { code: '320102', name: '玄武区' },
  unit: { code: 'dev-unit', name: '南京市第十三中学' },
  permissions,
  curRootUrl: '/',
  curAppJson: {},
  saasOrgJson: { orgCode: 'dev-unit', orgType: 2 },
  saasOrgCode: 'dev-unit',
  saasOrgParams: {},
  teacherIndexList: [],
  teacherIndexFieldList: []
};

export const store = {
  getters,
  state: {},
  dispatch: () => Promise.resolve(),
  commit: () => {}
};

function emptyResponse(config) {
  console.warn('[dev-stub] 已拦截接口请求:', config && config.url);
  const data = Object.assign([], { records: [], list: [], rows: [], total: 0 });
  return Promise.resolve({ code: 200, msg: 'ok', data, rows: [], total: 0 });
}

export const request = emptyResponse;
export const noTokenService = emptyResponse;
export const mingleAxios = emptyResponse;

export const mixin = {
  avatarLoadError: false,
  showImageComputed: url => url || '',
  getDownloadUrlByAttachmentKey: key => key || ''
};

export const getToken = () => MOCK_TOKEN;
export const gotoLoginPage = () => {};
export const registryEnvVariables = () => {};
export const initApp = () => Promise.resolve();
export const routerHandler = () => {};

export default {
  store,
  request,
  noTokenService,
  mingleAxios,
  mixin,
  getToken,
  gotoLoginPage,
  registryEnvVariables,
  initApp,
  routerHandler
};
