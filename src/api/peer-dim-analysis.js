import { request } from 'auth-layout-zw'

// ---------------------------------------------------------------------------
// 同辈对比 - 维度分析设置
// 三张配置表：一级维度 ai_peer_compare_dimension → 二级维度选项
// ai_peer_compare_dimension_option → 三级选项评分 ai_peer_compare_dimension_option_score
// 选项绑定教师档案指标（indexName），评分等级明细随选项保存接口一并提交（先删后插）
// ---------------------------------------------------------------------------

// 12.1 维度列表（GET /peerCompareDimension/list）
// params.withOption：可选，1=附带每个维度的 optionList（不含评分明细）；按 sortNo asc,id asc 排序
// 响应 data：AiPeerCompareDimension 数组
export function peerDimList(params) {
  return request({
    url: '/teacherDevelop/aiAnalysis/peerCompareDimension/list',
    method: 'get',
    params
  })
}

// 12.2 新增/编辑维度（POST /peerCompareDimension/save，JSON body）
// data：AiPeerCompareDimension 对象，id 为空新建、否则更新；新建时后端自动补齐归属信息与 isDelete
export function peerDimSave(data) {
  return request({
    url: '/teacherDevelop/aiAnalysis/peerCompareDimension/save',
    method: 'post',
    data
  })
}

// 12.3 删除维度（POST /peerCompareDimension/delete，Query/Form）
// id：维度主键，逻辑删除（isDelete=2）
export function peerDimDelete(id) {
  return request({
    url: '/teacherDevelop/aiAnalysis/peerCompareDimension/delete',
    method: 'post',
    params: { id }
  })
}

// 12.4 维度选项列表（含评分明细）（GET /peerCompareDimensionOption/list）
// params.dimensionId：必填；按 sortNo asc,id asc 排序，每个选项附带 scoreList
// 响应 data：AiPeerCompareDimensionOption 数组
export function peerDimOptionList(params) {
  return request({
    url: '/teacherDevelop/aiAnalysis/peerCompareDimensionOption/list',
    method: 'get',
    params
  })
}

// 12.5 新增/编辑维度选项（连带保存评分明细）（POST /peerCompareDimensionOption/save，JSON body）
// data：AiPeerCompareDimensionOption 对象，id 为空新建、否则更新；scoreList 传评分等级明细数组
// 评分明细先删后插：scoreList 为空则仅清空旧评分；dimensionId/optionId/归属由后端自动补齐
export function peerDimOptionSave(data) {
  return request({
    url: '/teacherDevelop/aiAnalysis/peerCompareDimensionOption/save',
    method: 'post',
    data
  })
}

// 12.6 删除维度选项（POST /peerCompareDimensionOption/delete，Query/Form）
// id：选项主键，同时删除该选项下的评分明细
export function peerDimOptionDelete(id) {
  return request({
    url: '/teacherDevelop/aiAnalysis/peerCompareDimensionOption/delete',
    method: 'post',
    params: { id }
  })
}
