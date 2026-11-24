import { request } from 'auth-layout-zw'

// ---------------------------------------------------------------------------
// 学校教师发展大事件（/teacherDevelop/aiAnalysis/event）
// 后台发布管理，教师端首页同源展示。状态由开始/结束时间自动判定，不手工标注。
// ---------------------------------------------------------------------------

// 1.1 发布/编辑大事件（JSON）
// 请求体 AiDevelopmentEvent：id 为空新建、否则更新；
// eventMonth（年月）由后端根据 eventStartTime 自动计算，前端无需传。
// 响应 data：保存后的 AiDevelopmentEvent 对象（含生成的 id）
export function eventSave(data) {
  return request({
    url: '/teacherDevelop/aiAnalysis/event/save',
    method: 'post',
    data
  })
}

// 1.2 删除大事件（逻辑删除）
// 参数 id（Query/Form，必填）—— 大事件id；success=true 即删除成功
export function eventDelete(id) {
  return request({
    url: '/teacherDevelop/aiAnalysis/event/delete',
    method: 'post',
    params: { id }
  })
}

// 1.3 大事件分页列表（后台管理与教师端首页共用）
// 查询条件（均可空）：termCode、categoryCode、title（模糊匹配）、currentPage / pageSize
// 按开始时间先后排列，状态自动计算，附带当前教师收藏标记，仅返回本校数据
// status：1=已结束，2=进行中，3=未开始；collectFlag：1=已收藏，2=未收藏
export function eventPageList(params) {
  return request({
    url: '/teacherDevelop/aiAnalysis/event/pageList',
    method: 'get',
    params
  })
}

// 1.4 大事件详情
// 参数 id（Query，必填）；响应 data 为 AiDevelopmentEvent 对象
export function eventDetail(id) {
  return request({
    url: '/teacherDevelop/aiAnalysis/event/detail',
    method: 'get',
    params: { id }
  })
}
