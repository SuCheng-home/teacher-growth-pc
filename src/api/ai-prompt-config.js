import { request } from 'auth-layout-zw'

// ==================== AI 提示词设置（公共模块）====================
// 后台配置，AI 分析时按类型取提示词；多模块共用
// 提示词类型 promptType 的取值请引用
// 1 教师个人同辈条件-综合分位的提示词
// 2 教师个人同辈条件-雷达图结果的提示词
// 3 教师个人同辈条件-强于/弱于组内多数的提示词
// 4 教师个人同辈条件-组内标杆参考的提示词
// 5 教师个人同辈条件-同辈 AI 分析的提示词

// AI 提示词 - 新增/编辑（id 为空新建，否则更新；请求体 AiPromptConfig：id、promptType、promptName、promptContent、remark）
// 响应 data 为保存后的 AiPromptConfig 对象
export function promptConfigSave(data) {
  return request({
    url: '/teacherDevelop/aiAnalysis/promptConfig/save',
    method: 'post',
    data
  })
}

// AI 提示词 - 删除（逻辑删除）
// 参数 id：必填；响应 data 为空
export function promptConfigDelete(id) {
  return request({
    url: '/teacherDevelop/aiAnalysis/promptConfig/delete',
    method: 'post',
    params: { id }
  })
}

// AI 提示词 - 列表（按 id 倒序，仅返回本校数据）
// 查询条件 promptType：类型，不传查全部；响应 data 为 AiPromptConfig 数组
export function promptConfigList(promptType) {
  return request({
    url: '/teacherDevelop/aiAnalysis/promptConfig/list',
    method: 'get',
    params: { promptType }
  })
}

// AI 提示词 - 获取指定类型的最新一条
// 参数 promptType：必填；无则 data 返回 null；响应 data 为单个 AiPromptConfig 对象或 null
export function promptConfigGetByType(promptType) {
  return request({
    url: '/teacherDevelop/aiAnalysis/promptConfig/getByType',
    method: 'get',
    params: { promptType }
  })
}
