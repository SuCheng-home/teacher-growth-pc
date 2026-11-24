import { request } from 'auth-layout-zw'

// 同辈对比 - 档案字段绑定列表
// 查询条件 useScope：传 1 返回 useScope 为 0、1 的数据，传 2 返回 0、2 的数据，不传返回全部
// 查询条件 onlyShow：传 1 只返回显示项（isShow=1），不传返回全部；结果按 sortNo、id 升序
export function peerBindList(params) {
  return request({
    url: '/teacherDevelop/aiAnalysis/peerBind/list',
    method: 'get',
    params
  })
}

// 同辈对比 - 批量新增/编辑绑定（数组，每项 id 为空新建、否则更新）
export function peerBindSave(data) {
  return request({
    url: '/teacherDevelop/aiAnalysis/peerBind/save',
    method: 'post',
    data
  })
}

// 同辈对比 - 删除绑定
export function peerBindDelete(id) {
  return request({
    url: '/teacherDevelop/aiAnalysis/peerBind/delete',
    method: 'post',
    params: { id }
  })
}

// ---------------------------------------------------------------------------
// 同辈对比 - 数据分析（/teacherDevelop/aiAnalysis/peerCompare）
// 后端代码统计、同步返回（非 AI 分析、不发起任务、不轮询）；
// 结果同时写入同辈对比记录表，教师/管理员可经 getLatest/getSchoolLatest 回看
// ---------------------------------------------------------------------------

// 5.4 获取同辈对比数据-教师个人（维度统计，代码处理）
// 请求体 CustomQueryQO：cardId 为加密串（不传默认当前登录教师本人），
// queryCondition/queryCriteria 圈定对比组；组内教师按身份证号去重重新计算
// 前置条件：维度统计数据已由定时器生成，否则 success=false（msg="未查询到维度统计数据，请先生成维度数据！"）
// 响应 data：{ peerNum, statData }；statData：{ taskId, peerNum, totalScore, totalRank, totalRatio,
//   dimensions:[{ dimensionId, dimensionTitle, score, avgScore, rankNo, ratio, topScore, topUserName, topAwardName }],
//   strongDimensions, weakDimensions }（综合分位/维度分位/强弱项/组内最高奖项，雷达图数据源）
export function getPeerCompareDataForTh(data) {
  return request({
    url: '/teacherDevelop/aiAnalysis/peerCompare/getPeerCompareDataForTh',
    method: 'post',
    data
  })
}

// 5.5 获取同辈对比数据-校管理员（代码统计，同步返回）
// 请求体 CustomQueryQO：管理员视角 cardId 不传，queryCondition/queryCriteria 圈定命中组
// 校验：开启综合分析的绑定指标未配置返回 success=false；命中组为空返回"根据条件未查询到相关数据！"
// 响应 data：{ peerNum, schoolTeacherNum(排除后勤、仅在岗；查询失败降级为 0), statData }
// statData 结构同全校统计（summary 综合分析汇总 / structure 结构分布 / teacherList 教师明细，taskId=本次统计记录id）
export function getSchoolCompareDataForAdmin(data) {
  return request({
    url: '/teacherDevelop/aiAnalysis/peerCompare/getSchoolCompareDataForAdmin',
    method: 'post',
    data
  })
}

// ---------------------------------------------------------------------------
// 同辈对比 - 记录查询（/teacherDevelop/aiAnalysis/peerCompareRecord）
// 记录由分析流程自动写入，本模块仅提供查询
// ---------------------------------------------------------------------------

// 5-1.1 查询当前教师最近一次对比记录（个人、本人操作、成功，返回单个对象或 null）
export function peerCompareRecordGetLatest() {
  return request({
    url: '/teacherDevelop/aiAnalysis/peerCompareRecord/getLatest',
    method: 'get'
  })
}

// 5-1.2 查询本校最近一次全校对比分析记录（学校管理员，返回单个对象或 null）
export function peerCompareRecordGetSchoolLatest() {
  return request({
    url: '/teacherDevelop/aiAnalysis/peerCompareRecord/getSchoolLatest',
    method: 'get'
  })
}

// 5-1.3 对比记录详情
export function peerCompareRecordDetail(id) {
  return request({
    url: '/teacherDevelop/aiAnalysis/peerCompareRecord/detail',
    method: 'get',
    params: { id }
  })
}
