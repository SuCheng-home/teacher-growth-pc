import { request } from 'auth-layout-zw'

// 指标列表
export function teacherIndexList(params) {
  return request({
    url: '/teacherDevelop/teacherIndex/list',
    method: 'get',
    params
  })
}

// 查看用户所有的档案数据
// 参数cardId和tenantId   如果身份证号传空，从当前登录信息中获取
export function getTeacherDataByCardId(query) {
  return request({
    url: '/teacherDevelop/teacher/data/getTeacherDataByCardId',
    method: 'get',
    params: query
  })
}

// 我的修改记录分页（教师端首页/档案个人中心同源）
// 查询条件 currentPage/pageSize（可选 approvalStatus 筛选）；当前教师由登录态识别，无需传 userCode
// 响应 data：{ rows: [记录], total }；行字段 index(指标定义)/createTime/operationType/afterValue/approvalStatus/approvalDescribe
export function teacherArchiveRecordPage(params) {
  return request({
    url: '/teacherDevelop/teacherIndex/record/page',
    method: 'get',
    params
  })
}

// 我的修改记录状态统计：响应 data { pendingNum 待审批, passNum 通过, backNum 退回 }
export function teacherStatusNum(params) {
  return request({
    url: '/teacherDevelop/teacherIndex/record/myStatusNum',
    method: 'get',
    params
  })
}

// 教师填报任务分页（上报档案批次列表）
// orgType：1 区数据 / 3 校，本校教师端默认 3，可由调用方覆盖
// 响应 data：{ rows: [任务], total }；任务字段 title/teacherReportStartTime/teacherReportEndTime/code/year
export function teacherArchiveTaskMyTaskPage(params) {
  return request({
    url: '/teacherDevelop/teacherArchive/task/myTaskPage',
    method: 'get',
    params: { orgType: 3, ...params }
  })
}
