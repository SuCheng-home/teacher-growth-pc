/**
 * 格式化工具函数（迁移自原始 demo <script> 工具段）
 */

/**
 * 格式化日期时间为 "YYYY-MM-DD HH:mm"
 * @param {Date} d
 * @returns {string}
 */
export function fmtTime(d) {
  const p = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}
