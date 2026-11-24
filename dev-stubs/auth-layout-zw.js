// 本地预览替身：内网私有包 auth-layout-zw 不可访问时由 vite.config.js 自动启用。
// 提供模拟登录用户与全部菜单权限，接口请求由 dev-stubs/mock 按路径返回业务数据。
import { mockRequest } from './mock/index.js';

const MOCK_TOKEN = 'dev-stub-token';

const permissions = [];
permissions.includes = () => true;

const getters = {
  token: MOCK_TOKEN,
  name: '朱晓雯',
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

export const request = mockRequest;
export const noTokenService = mockRequest;
export const mingleAxios = mockRequest;

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
