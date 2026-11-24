import { request } from 'auth-layout-zw'

// 画像指标绑定 - 新增/编辑配置
// id 为空新增，否则编辑；新增由后端填充雪花 id、学校/区/组织/租户与默认值（isEnable=1、compareMethod=1）
// 前端只传 indexName 与字段全 name（teacher_xxx_yyyy），indexCode/indexFieldCode/compareFieldCode/timeFieldCode 由后端按前缀派生
export function profileIndexBindSave(data) {
  return request({
    url: '/teacherDevelop/aiAnalysis/profileIndexBind/save',
    method: 'post',
    data
  })
}

// 画像指标绑定 - 删除配置（逻辑删除 isDelete=2）
export function profileIndexBindDelete(id) {
  return request({
    url: '/teacherDevelop/aiAnalysis/profileIndexBind/delete',
    method: 'post',
    params: { id }
  })
}

// 画像指标绑定 - 启用/停用：isEnable 仅允许 1启用 / 2停用
export function profileIndexBindUpdateEnable(id, isEnable) {
  return request({
    url: '/teacherDevelop/aiAnalysis/profileIndexBind/updateEnable',
    method: 'post',
    params: { id, isEnable }
  })
}

// 画像指标绑定 - 设置页列表（含停用配置），按 moduleCode、bindType、isEnable 筛选
// 配置按当前登录人学校（unitCode + tenantId）隔离，结果按 moduleCode、sortNo、id 升序
export function profileIndexBindList(params) {
  return request({
    url: '/teacherDevelop/aiAnalysis/profileIndexBind/list',
    method: 'get',
    params
  })
}

// 画像指标绑定 - 启用中配置列表（画像渲染端取数，仅 isEnable=1；传 moduleCode 按模块取）
export function profileIndexBindEnabledList(params) {
  return request({
    url: '/teacherDevelop/aiAnalysis/profileIndexBind/enabledList',
    method: 'get',
    params
  })
}
