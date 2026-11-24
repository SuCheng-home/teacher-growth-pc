import { request } from 'auth-layout-zw'

// 球员卡 - 档案信息 + 六维得分（含归一分母）
// 请求体：cardId 为加密串（不传默认当前登录教师本人）；indexNameList 为需要返回的档案指标名列表
// 响应 data：档案信息（含各维度得分与归一分母），供雷达「我的六维」与球员卡展示
export function personalProfileGetProfile(data) {
  return request({
    url: '/teacherDevelop/aiAnalysis/personalProfile/getProfile',
    method: 'post',
    data
  })
}

// 球员卡 - 六维统计（综合发展指数与归一分母）
// 请求体：cardId 为加密串（不传默认当前登录教师本人）
// 响应 data：{ totalScore, totalTopScore, dimensions:[{ score, topScore, ... }] }
export function personalProfileGetDimensionStat(data) {
  return request({
    url: '/teacherDevelop/aiAnalysis/personalProfile/getDimensionStat',
    method: 'post',
    data
  })
}
