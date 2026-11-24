import { request } from 'auth-layout-zw'

// ---------------------------------------------------------------------------
// 成长愿景 - 愿景分类管理（/teacherDevelop/aiAnalysis/visionCategory）
// 分类使用字典配置（前端读取字典并传入 categoryCode/categoryName，后端无字典依赖）
// 目标（AiVisionGoal）＝教师端成长愿景里的一条可选愿景，
// 目标值为教师档案指标对应的选项值
// ---------------------------------------------------------------------------

// 10.1 愿景目标列表（按分类分组）
// 参数 categoryCode（可选，空查全部分类）
// 目标按 sortNo asc,id asc 排序后按分类分组返回，preGoalIds 转 preGoalNames 展示
// 响应 data：分类分组数组 [{ categoryCode, categoryName, goalCount, goals: [AiVisionGoal] }]
export function visionCategoryGoalList(params) {
  return request({
    url: '/teacherDevelop/aiAnalysis/visionCategory/goalList',
    method: 'get',
    params
  })
}

// 10.2 新增/编辑愿景目标
// 请求体 AiVisionGoal 对象（id 为空新建，否则更新）
// categoryCode、categoryName、goalName 必填；status 不传默认 1，isEnable 不传默认 1
// 响应 data：保存后的 AiVisionGoal 对象
export function visionCategorySaveGoal(data) {
  return request({
    url: '/teacherDevelop/aiAnalysis/visionCategory/saveGoal',
    method: 'post',
    data
  })
}

// 10.3 删除愿景目标（逻辑删除 isDelete=2）
// 参数 id（必填）；响应 data 为空
export function visionCategoryDeleteGoal(id) {
  return request({
    url: '/teacherDevelop/aiAnalysis/visionCategory/deleteGoal',
    method: 'post',
    params: { id }
  })
}

// ---------------------------------------------------------------------------
// 成长愿景 - 标准管理（/teacherDevelop/aiAnalysis/visionStandard）
// 每条标准 = 分类 + 目标 + 评比文件；评比文件为空时状态自动置为「标准待补」；
// 三个提示词全部配置后状态为「已配置」
// ---------------------------------------------------------------------------

// 11.1 新增/编辑标准
// 请求体 AiVisionStandard 对象（id 为空新建，否则更新）；standardName、goalId 必填
// categoryCode/categoryName/goalName 由后端根据 goalId 自动补齐
// 本接口仅按评比文件判定状态（compareFile 为空→2，否则→1）；isEnable 不传默认 1
// 响应 data 为空（success=true）
export function visionStandardSave(data) {
  return request({
    url: '/teacherDevelop/aiAnalysis/visionStandard/save',
    method: 'post',
    data
  })
}

// 11.2 配置标准提示词
// 请求体 AiVisionStandard 对象，id 必填；提交 standardComparePrompt、itemComparePrompt、analysisReportPrompt
// 状态按已有评比文件与本次提示词完整度判定（文件空→2；文件非空且三提示词均非空→3；否则→1）
// 响应 data 为空（success=true）
export function visionStandardConfigPrompt(data) {
  return request({
    url: '/teacherDevelop/aiAnalysis/visionStandard/configPrompt',
    method: 'post',
    data
  })
}

// 11.3 删除标准（逻辑删除 isDelete=2，同时记录修改人与修改时间）
// 参数 id（必填）；响应 data 为空
export function visionStandardDelete(id) {
  return request({
    url: '/teacherDevelop/aiAnalysis/visionStandard/delete',
    method: 'post',
    params: { id }
  })
}

// 11.4 标准列表
// 参数 categoryCode（可选）、goalId（可选）
// 按 categoryCode asc,goalId asc,id asc 排序，仅查未删除数据
// 响应 data：AiVisionStandard 数组
export function visionStandardList(params) {
  return request({
    url: '/teacherDevelop/aiAnalysis/visionStandard/list',
    method: 'get',
    params
  })
}

// 11.5 标准详情
// 参数 id（必填）；响应 data：AiVisionStandard 对象
export function visionStandardDetail(id) {
  return request({
    url: '/teacherDevelop/aiAnalysis/visionStandard/detail',
    method: 'get',
    params: { id }
  })
}

// 11.6 目标下拉列表
// 参数 categoryCode（可选，空查全部）
// 按 sortNo asc,id asc 排序，仅查未删除数据；响应 data：AiVisionGoal 数组
export function visionStandardGoalOptions(params) {
  return request({
    url: '/teacherDevelop/aiAnalysis/visionStandard/goalOptions',
    method: 'get',
    params
  })
}

// 11.7 更新评比标准结构骨架（AI 解析结果保存 / 管理员手动调整）
// 请求体 AiVisionStandard 对象，id、standardCompareContent 必填
// standardCompareContent 为 JSON 字符串，格式与教师分析结果 analysisStructure 完全同构
// 响应 data 为空（success=true）
export function visionStandardUpdateCompareContent(data) {
  return request({
    url: '/teacherDevelop/aiAnalysis/visionStandard/updateCompareContent',
    method: 'post',
    data
  })
}

// ---------------------------------------------------------------------------
// 成长愿景 - 教师已选愿景（/teacherDevelop/aiAnalysis/visionTeacherGoal）
// 教师端目标弹窗：点选添加 / 取消 / 我的愿景列表。
// 同一目标下不同标准可分别添加（教师 × 目标 × 标准唯一）。
// ---------------------------------------------------------------------------

// 7.1 添加愿景目标（支持批量：请求体为目标+标准组合数组 [{ goalId, standardId }]）
// 校验：目标存在且启用；标准属于该目标，同一目标下同一标准不重复添加
// 唯一性：批量内/已有记录中出现重复「目标+标准」组合会被拒绝
// 响应 data：批量写入后的 AiVisionTeacherGoal 数组（含各条生成的 id）
export function visionTeacherGoalAdd(data) {
  return request({
    url: '/teacherDevelop/aiAnalysis/visionTeacherGoal/add',
    method: 'post',
    data
  })
}

// 7.2 取消愿景目标（逻辑删除）
// 参数（Query/Form）id（必填，教师已选愿景记录 id）；响应 data 为空
export function visionTeacherGoalCancel(id) {
  return request({
    url: '/teacherDevelop/aiAnalysis/visionTeacherGoal/cancel',
    method: 'post',
    params: { id }
  })
}

// 7.3 我的愿景列表
// 当前教师已选愿景（我的发展愿景卡片），按分类、id 升序，不分页
// 响应 data：AiVisionTeacherGoal 数组
//   { id, goalId, goalName, standardId, standardName, categoryCode, categoryName,
//     pullTime, lastAnalysisTime, analysisStatus(1待分析 2分析中 3已完成 4失败) }
export function visionTeacherGoalMyList() {
  return request({
    url: '/teacherDevelop/aiAnalysis/visionTeacherGoal/myList',
    method: 'get'
  })
}

// 7.4 可选目标标准列表（目标弹窗点选添加用）
// 后端按教师档案达成情况与目标前置条件过滤出可选目标，返回这些目标下启用的标准列表
// 响应 data：AiVisionStandard 数组（按分类、目标、id 升序），元素含 id、goalId、goalName、
//   categoryCode、categoryName、standardName、compareFile、attachment、status、isEnable 等
export function visionTeacherGoalGoalOptions() {
  return request({
    url: '/teacherDevelop/aiAnalysis/visionTeacherGoal/goalOptions',
    method: 'get'
  })
}

// ---------------------------------------------------------------------------
// 成长愿景 - 分析（/teacherDevelop/aiAnalysis/visionAnalysis）
// 教师端「重新拉取并分析」：拉取档案数据→按标准结构骨架驱动 AI 异步分析→
// 硬门槛核对（资格预审）+ 评分项差距（逐条对比）落库。
// 分析采用「骨架驱动」：标准 standardCompareContent 骨架决定条目结构，AI 仅按 itemId 填值，
// 后端按 itemId 合并落库；分析结果可用 analysisStructure 获取与骨架同构的 JSON。
// ---------------------------------------------------------------------------

// 8.1 发起拉取并分析
// 参数（Query/Form）teacherGoalId（必填，教师已选愿景记录 id）
// 异步执行；所选标准停用/未配置（status≠3）或未配置结构骨架时返回失败提示；
// 同一愿景同时只允许一个分析任务（进行中提示「该愿景正在分析中」）
// 响应 data：{ analysisId }，用于轮询与查询明细
export function visionAnalysisStart(teacherGoalId) {
  return request({
    url: '/teacherDevelop/aiAnalysis/visionAnalysis/startAnalysis',
    method: 'post',
    params: { teacherGoalId }
  })
}

// 8.2 轮询分析进度
// 参数（Query）analysisId（必填）；建议定时轮询直到 isFinished=true
// 响应 data：{ analysisId, isFinished, status(1分析中 2成功 3失败), errorMsg }
export function visionAnalysisResult(analysisId) {
  return request({
    url: '/teacherDevelop/aiAnalysis/visionAnalysis/getAnalysisResult',
    method: 'get',
    params: { analysisId }
  })
}

// 8.3 分析记录详情（资格预审汇总）
// 参数（Query）analysisId（必填）
// 响应 data：AiVisionAnalysis 对象（goalName/standardName/pullTime/analyzeTime/
//   gateTotal/gateOkCount/gateWaitCount/gateNoCount/scoreTotal/scoreFull/
//   conclusion(1已达成 2具备申报资格 3待确认 4暂不具备)/aiSummary/fixPath/stateFingerprint）
export function visionAnalysisDetail(analysisId) {
  return request({
    url: '/teacherDevelop/aiAnalysis/visionAnalysis/detail',
    method: 'get',
    params: { analysisId }
  })
}

// 8.4 教师愿景最近一次成功分析记录
// 参数（Query）teacherGoalId（必填）；响应 data：AiVisionAnalysis 对象或 null
export function visionAnalysisLatest(teacherGoalId) {
  return request({
    url: '/teacherDevelop/aiAnalysis/visionAnalysis/latest',
    method: 'get',
    params: { teacherGoalId }
  })
}

// 8.5 硬门槛核对结果列表（资格预审 tab）
// 参数（Query）analysisId（必填）
// 响应 data：AiVisionAnalysisGate 数组（standardItemId/groupName/itemName/requirement/
//   teacherValue/judge(1符合 2待确认 3不符合)/fixSuggestion/standardBasis/archiveBasis/records）
// 条目与排序以标准骨架为准，AI 漏填条目判定为待确认
export function visionAnalysisGateList(analysisId) {
  return request({
    url: '/teacherDevelop/aiAnalysis/visionAnalysis/gateList',
    method: 'get',
    params: { analysisId }
  })
}

// 8.6 评分项差距明细列表（逐条对比 tab）
// 参数（Query）analysisId（必填）
// 响应 data：AiVisionAnalysisItem 数组（standardItemId/categoryName/categorySub/itemName/
//   fullScore/score/gap/gapType/suggestion/standardOriginal/plainRule/howToScore/dataSource/
//   dataSourceFrom/teacherAction/actionTip/records/gapDetail/teacherConfirm/isSum(1是 2否)）
export function visionAnalysisItemList(analysisId) {
  return request({
    url: '/teacherDevelop/aiAnalysis/visionAnalysis/itemList',
    method: 'get',
    params: { analysisId }
  })
}

// 8.7 分析结果结构 JSON（与骨架同构）
// 参数（Query）analysisId（必填）
// 返回该次分析结果的分组嵌套结构 JSON，与标准结构骨架格式、字段完全一致（英文字段），
// 顶层含 summary/fixPath/gates（按 group 分组）/scoreItems（按 category 分组）
// 前端可用与骨架预览相同的组件渲染；分析记录不存在返回「分析记录不存在！」
export function visionAnalysisStructure(analysisId) {
  return request({
    url: '/teacherDevelop/aiAnalysis/visionAnalysis/analysisStructure',
    method: 'get',
    params: { analysisId }
  })
}

// 8.8 教师确认评分项结果
// 参数（Query/Form）id（必填，评分项明细 id）、teacherConfirm（必填，确认结果 JSON）
// 更新后自动重算分析记录状态指纹（报告据此判断过期）；响应 data 为空
export function visionAnalysisConfirmItem(params) {
  return request({
    url: '/teacherDevelop/aiAnalysis/visionAnalysis/confirmItem',
    method: 'post',
    params
  })
}

// 8.12 模拟分析（不入库，调试提示词用）
// 参数（Query/Form）goalId、standardId、cardId（加密串）必填；
// analysisType 可选：1 评比标准（仅门槛骨架，返回 summary/fixPath/gates）
//   2 逐条对比（仅评分项骨架，返回 scoreExcludeNote/scoreItems）3或不传=汇总对比（完整结构）
// 异步执行、所有数据不入库，仅结果写 redis；响应 data：{ mockId }，用于轮询
export function visionAnalysisMockAnalysis(params) {
  return request({
    url: '/teacherDevelop/aiAnalysis/visionAnalysis/mockAnalysis',
    method: 'post',
    params
  })
}

// 8.13 轮询模拟分析结果
// 参数（Query）mockId（必填）；建议定时轮询直到 isFinished=true
// 响应 data：{ mockId, isFinished, status(1分析中 2成功 3失败), errorMsg,
//   progress(0-100), progressText, mockResult(status=2 时，与骨架同构) }
export function visionAnalysisGetMockResult(mockId) {
  return request({
    url: '/teacherDevelop/aiAnalysis/visionAnalysis/getMockResult',
    method: 'get',
    params: { mockId }
  })
}

// ---------------------------------------------------------------------------
// 成长愿景 - 分析报告快照（/teacherDevelop/aiAnalysis/visionReport）
// 教师端分析报告 tab：按标准的分析报告提示词生成 HTML 快照并冻结；
// 状态指纹与分析记录不一致即过期。
// ---------------------------------------------------------------------------

// 9.1 生成分析报告
// 参数（Query/Form）teacherGoalId（必填）
// 依据该愿景最近一次成功分析记录生成（同步调用 AI）；标准未配置分析报告提示词、
// 无成功分析记录时返回失败提示；重新生成覆盖旧快照（旧记录逻辑删除）
// 响应 data：AiVisionReport 对象（含 reportContent HTML）
export function visionReportGenerate(teacherGoalId) {
  return request({
    url: '/teacherDevelop/aiAnalysis/visionReport/generate',
    method: 'post',
    params: { teacherGoalId }
  })
}

// 9.2 查询最新报告快照
// 参数（Query）teacherGoalId（必填）；返回最新有效快照
// expired=true 表示生成后档案/确认结果已变化，前端提示「建议重新生成」
// 响应 data：{ reportContent, generateTime, pullTime, expired }
export function visionReportLatest(teacherGoalId) {
  return request({
    url: '/teacherDevelop/aiAnalysis/visionReport/latest',
    method: 'get',
    params: { teacherGoalId }
  })
}
