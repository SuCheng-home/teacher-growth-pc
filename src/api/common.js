import { request, store, noTokenService, mingleAxios } from 'auth-layout-zw'
import { getAuthEnvConfig } from '@/config/auth-env';

// 教师用户列表（分页）：query 传 pageNumber、pageSize、unitCode（学校编码），可带姓名等筛选条件
export function fetchTeachPageList(query) {
  return request({
    url: 'uc/sysUserTeacher/tenant/page',
    method: 'get',
    params: query
  })
}

// 获取字典信息 ByConstantId
export function getDictList(query, apiType = null) {
  const urlMap = {
    0: '/common/dict/tenant/city/listByConstantId',
    1: '/common/dict/tenant/area/listByConstantId',
    2: '/common/dict/tenant/unit/listByConstantId'
  }
  const APP_LEVEL = getAuthEnvConfig().APP_LEVEL
  
  const cotoType = apiType || APP_LEVEL
  if (typeof query === 'object') {
      return noTokenService({
      url: urlMap[cotoType],
      method: 'get',
      params: query
      })
  } else {
      return noTokenService({
          url: urlMap[cotoType],
          method: 'get',
          params: {
            constantId: query,
            orgCode: store.getters.saasOrgJson.orgCode,
            orgType: store.getters.saasOrgJson.orgType,
            tenantId: store.getters.tenantId
          }
      })
  }
}

// 获取学年List --
export function getYearList(apiType = null) {
  // 拼装查询参数
  const { tenantId, saasOrgCode: orgCode } = store.getters
  const orgType = store.getters.saasOrgJson.orgType
  const query = { tenantId, orgCode, orgType }
  return mingleAxios({
      url: '/common/term/termYear/listByOrg',
      method: 'get',
      params: query
  })
}

// AI生成
export function aiGenerate(data) {
  const ENV_CONFIG_X_CALLER = getAuthEnvConfig().ENV_CONFIG_X_CALLER
  return request({
      url: 'https://agent.zhxiaoyuan.cn/ai/generate',
      method: 'post',
      headers: {
        'X-Caller': ENV_CONFIG_X_CALLER
      },
      data
  })
}
