// 画像报告文案设置（表 ai_profile_show_set）：教师个人画像报告的标题/英文眉题/报告头短句/免责声明
// 每校一行，按 unitCode + tenantId 隔离；接口未配置过时返回 null，前端按此内置默认文案展示
export const PROFILE_SHOW_SET_DEFAULT = {
  reportTitle: '教师发展画像报告',
  reportEyebrow: 'TEACHER DEVELOPMENT PORTRAIT REPORT',
  reportHeader: 'AI 生成解读 · 不构成评审结论',
  disclaimer: '<b>免责声明</b>：本报告由系统按既定计分口径与档案数据自动生成，AI 仅参与文字表述，不裁决资格、不修改分值、不出具评审结论。报告中的每一项判定与数据均可回溯至档案原文与标准细则；最终以档案原文及学校、区正式评审结论为准。'
};

// 免责声明红线：必须写明的免责表述（缺一不可保存）
export const PROFILE_SHOW_REQUIRED_WORDS = ['不裁决资格', '不出具评审结论'];

// 报告头短句与免责声明中禁止出现的结论性判定词（命中即不得保存）
export const PROFILE_SHOW_FORBIDDEN_WORDS = ['符合申报条件', '通过评审'];
