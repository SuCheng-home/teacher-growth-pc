/**
 * 成长首页（教师端）演示数据常量
 * 逐项抄自原型 index_v1.4_20260928.html + app_v1.4_20260928.js；
 * 成长愿景区块已对接 visionTeacherGoal 接口，不再依赖 constants/qualification 本地目标定义。
 */

// 成长愿景页入口路由（原型跳 qualification 静态页，本项目对应成长愿景路由）
export const VISION_ROUTE = '/growth/vision';

// 近一年新增成果条数（演示数据）
export const YEAR_NEW_COUNT = '7';

// 评选活动 status → [文案, 样式类]：0 草稿 1 申报中 2 已结束 3 未开始 4 评审中（与活动申报列表同口径）
export const EVAL_STATUS_TEXT = {
  0: ['未发布', 'soon'],
  1: ['申报中', 'live'],
  2: ['已结束', 'done'],
  3: ['未开始', 'soon'],
  4: ['评审中', 'judge']
};

// 大事件接口 status → [文案, 样式类]：1 已结束 / 2 进行中 / 3 未开始（首页日历与详情弹框共用）
export const EVENT_STATUS_TEXT = { 1: ['已结束', 'done'], 2: ['进行中', 'doing'], 3: ['未开始', 'todo'] };

// 我的画像 · 六维（与「我的画像」页同辈参考逐值一致的演示口径）
export const DIM_NAMES = ['教学实践', '教研科研', '德育工作', '示范引领', '管理履职', '专业研修'];
export const DIM_VALUES = [0.89, 0.65, 0.86, 0.71, 0.75, 0.75];
export const DIM_REF = [0.70, 0.68, 0.72, 0.71, 0.66, 0.73];
