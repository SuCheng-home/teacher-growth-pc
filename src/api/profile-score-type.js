import { request } from 'auth-layout-zw';

// 分数段教师类型设置 - 新增/编辑档位
// id 为空新增，否则编辑；minScore 必填 0–100，maxScore 留空＝无上限，启用档位之间下限不允许重复
export function profileScoreTypeSetSave(data) {
  return request({
    url: '/teacherDevelop/aiAnalysis/profileScoreTypeSet/save',
    method: 'post',
    data
  });
}

// 分数段教师类型设置 - 删除档位（逻辑删除 isDelete=2）
export function profileScoreTypeSetDelete(id) {
  return request({
    url: '/teacherDevelop/aiAnalysis/profileScoreTypeSet/delete',
    method: 'post',
    params: { id }
  });
}

// 分数段教师类型设置 - 启用/停用：isEnable 仅允许 1启用 / 2停用
export function profileScoreTypeSetUpdateEnable(id, isEnable) {
  return request({
    url: '/teacherDevelop/aiAnalysis/profileScoreTypeSet/updateEnable',
    method: 'post',
    params: { id, isEnable }
  });
}

// 分数段教师类型设置 - 设置页档位列表（含停用，按 minScore 降序）
// 档位按当前登录学校（unitCode + tenantId）隔离
export function profileScoreTypeSetList() {
  return request({
    url: '/teacherDevelop/aiAnalysis/profileScoreTypeSet/list',
    method: 'get'
  });
}

// 分数段教师类型设置 - 启用中档位列表（画像渲染端取数，按 minScore 降序）
export function profileScoreTypeSetEnabledList() {
  return request({
    url: '/teacherDevelop/aiAnalysis/profileScoreTypeSet/enabledList',
    method: 'get'
  });
}

// 分数段教师类型设置 - 按综合指数命中档位（画像头部渲染「档位N：类型名称」）
// 画像页常规链路已由 getDimensionStat 内嵌返回 scoreType，仅无维度统计上下文时调用
export function profileScoreTypeSetMatchType(score) {
  return request({
    url: '/teacherDevelop/aiAnalysis/profileScoreTypeSet/matchType',
    method: 'get',
    params: { score }
  });
}
