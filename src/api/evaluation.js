import { request } from 'auth-layout-zw'

// ---------------------------------------------------------------------------
// 校级评选（/assessment/project）：与师慧评台「活动申报」同源接口，教师端首页只读取列表
// ---------------------------------------------------------------------------

// 活动申报分页列表
// 查询条件（均可空）：title 活动标题模糊、status 活动状态、createUserName 发布人、
//                    reportType 参评对象、pageNumber 页码（默认1）、pageSize 每页条数
// 响应 data：分页对象 { records, total }
// status：0 草稿 / 1 申报中 / 2 已结束 / 3 未开始 / 4 评审中；reportType：1 学校 / 2 教师
export function evaluationReportList(params) {
  return request({
    url: '/assessment/project/reportList',
    method: 'get',
    params
  })
}
