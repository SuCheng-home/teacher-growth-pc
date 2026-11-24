/**
 * 文件系统 bizCode / bizId 统一注册中心（参照 yuhuaAIPlatform/utils/bizEnroll.js）
 * 键名规则：app前缀-模块_业务内部标识
 * bizCode 规则：app前缀-模块-唯一键（调用时自动追加主键后缀）
 * bizId 规则：业务内部标识
 */

// 生成不重复 ID：时间戳 36 进制 + 随机串
export function GenNonDuplicateID(randomLength = 6) {
  let idStr = Date.now().toString(36);
  idStr += Math.random().toString(36).substr(3, randomLength);
  return idStr;
}

const bizObjs = {
  // 愿景标准-评比细则文件
  'teacherGrowth-vision-compare-file': {
    bizCode: 'teacherGrowth-vision-compare-file',
    bizId: 'file'
  },
  // 愿景标准-其他附件
  'teacherGrowth-vision-other-file': {
    bizCode: 'teacherGrowth-vision-other-file',
    bizId: 'file'
  },
  // AI 会话-提问附件
  'teacherGrowth-ai-chat-file': {
    bizCode: 'teacherGrowth-ai-chat-file',
    bizId: 'file'
  }
};

/**
 * 获取上传组件所需的业务参数
 * @param {String} bizMark 注册表键名，必填
 * @param {String} myId 主键 ID，非必填，不填时会生成随机 ID 拼入 bizCode
 * @returns {Object} { bizCode, bizId }
 */
export default function bizEnroll(bizMark = '', myId = '') {
  if (!bizMark) return 'bizMark为必填参数';
  if (typeof bizObjs[bizMark] !== 'object') {
    return `bizMark(${bizMark})在注册表中不存在，请正确传参`;
  }
  const o = JSON.parse(JSON.stringify(bizObjs[bizMark]));
  const mainId = myId || GenNonDuplicateID();
  o.bizCode = o.bizCode.endsWith('-')
    ? o.bizCode + mainId
    : o.bizCode + '-' + mainId;
  return o;
}
