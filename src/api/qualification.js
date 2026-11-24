/**
 * 成长愿景 · 资格预审 API 封装
 * 当前为演示数据（直接返回 constants 中的 mock），后续对接后端时替换为真实请求。
 */

import { TARGETS, NOWPOST, GOAL_TYPE, GOAL_TYPE_LABEL, GOAL_VER } from '@/constants/qualification';

/**
 * 获取目标列表（全部 9 个目标定义）
 * 演示数据，后续对接后端
 * @returns {Promise<Object>}
 */
export function getTargetList() {
  return Promise.resolve({ data: TARGETS });
}

/**
 * 获取单个目标的评分明细
 * 演示数据，后续对接后端
 * @param {string} targetKey - 目标 key
 * @returns {Promise<Object>}
 */
export function getScoreDetail(targetKey) {
  const target = TARGETS[targetKey] || null;
  return Promise.resolve({ data: target });
}

/**
 * 提交教师对某评分项的改动（修改/剔除）
 * 演示数据，后续对接后端
 * @param {Object} payload - { id, score, value, del, reason }
 * @returns {Promise<Object>}
 */
export function submitOverride(payload) {
  return Promise.resolve({ success: true, data: payload });
}

/**
 * 重新拉取档案并分析
 * 演示数据，后续对接后端
 * @param {string} targetKey - 目标 key（可选，为空则全量刷新）
 * @returns {Promise<Object>}
 */
export function refetchArchive(targetKey) {
  return Promise.resolve({ success: true, targetKey, time: new Date().toISOString() });
}

/**
 * 生成分析报告
 * 演示数据，后续对接后端
 * @param {Object} params - { targetKey, ov }
 * @returns {Promise<Object>}
 */
export function generateReport(params) {
  return Promise.resolve({ success: true, reportId: 'rpt-' + Date.now(), params });
}

/**
 * 获取当前任职信息
 * 演示数据，后续对接后端
 * @returns {Promise<Object>}
 */
export function getNowPost() {
  return Promise.resolve({ data: NOWPOST });
}

/**
 * 获取各目标当前适用的标准版本（年份 / 批次口径）
 * 演示数据，后续对接后端
 * @returns {Promise<Object>}
 */
export function getGoalVerMap() {
  return Promise.resolve({ data: GOAL_VER });
}

/**
 * 获取目标类型映射
 * 演示数据，后续对接后端
 * @returns {Promise<Object>}
 */
export function getGoalTypeMap() {
  return Promise.resolve({ data: { GOAL_TYPE, GOAL_TYPE_LABEL } });
}
