import { request } from 'auth-layout-zw'

// 画像报告文案设置 - 查询本校配置（表 ai_profile_show_set，每校一行，按 unitCode + tenantId 隔离）
// 响应 data：AiProfileShowSet；本校从未配置过时返回 null，前端按内置默认文案展示
export function profileShowSetGet() {
  return request({
    url: '/teacherDevelop/aiAnalysis/profileShowSet/get',
    method: 'get'
  })
}

// 画像报告文案设置 - 保存（upsert），只提交 reportTitle / reportEyebrow / reportHeader / disclaimer
// 已有配置 -> 仅覆盖四个文案字段并保留主键与学校/区归属；无配置 -> 新建并由后端填充学校/区/组织/租户
// 响应 data：保存后的完整配置对象
export function profileShowSetSave(data) {
  return request({
    url: '/teacherDevelop/aiAnalysis/profileShowSet/save',
    method: 'post',
    data
  })
}
