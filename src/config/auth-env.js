/**
 * auth-layout-zw 鉴权初始化环境配置
 *
 * 从 Vite 环境变量（import.meta.env.VITE_*）集中读取并组装为
 * registryEnvVariables() 所需的参数对象，避免配置散落在 main.js 中。
 *
 * 各变量占位值定义在 .env.dev_test / .env.build_test / .env.production，
 * 接入真实环境前请逐项替换（详见各 .env 文件中的 TODO 注释）。
 */

// APP_LEVEL 缺省兜底值：2=校级（演示主体为“南京市第十三中学”）
// 等级含义：0=市级 1=区级 2=校级
const DEFAULT_APP_LEVEL = 2;

/**
 * 将 APP_LEVEL 环境变量安全转换为 number
 * 说明：技能参数表要求 APP_LEVEL 为 number；此处需保留合法的 0（市级），
 * 故不能用 `Number(x) || fallback`（0 会被短路误判为缺省）。
 * @param {string|undefined} rawLevel 原始环境变量字符串
 * @returns {number} 转换后的应用等级，非法/缺失时回退默认校级
 */
function resolveAppLevel(rawLevel) {
  if (rawLevel === undefined || rawLevel === '') {
    return DEFAULT_APP_LEVEL;
  }
  const parsedLevel = Number(rawLevel);
  return Number.isNaN(parsedLevel) ? DEFAULT_APP_LEVEL : parsedLevel;
}

/**
 * 组装 auth-layout-zw 环境变量注册参数
 * @returns {{
 *   APP_PREFIX: string,
 *   APP_ORIGIN: string,
 *   APP_CODE: string,
 *   APP_LEVEL: number,
 *   BASE_API_URL: string,
 *   ENV_CONFIG: string
 * }} registryEnvVariables 所需参数对象
 */
export function getAuthEnvConfig() {
  const env = import.meta.env;

  return {
    // 应用前缀：缺失时回退占位默认值 teacher_growth
    APP_PREFIX: env.VITE_APP_PREFIX || 'teacher_growth',
    // 应用来源标识：TODO 替换为真实值，缺失时为空串
    APP_ORIGIN: env.VITE_APP_ORIGIN || '',
    // 应用编码：TODO 必填真实值，缺失时为空串
    APP_CODE: env.VITE_APP_CODE || '',
    // 应用等级：number 类型（0=市 1=区 2=校），见 resolveAppLevel 说明
    APP_LEVEL: resolveAppLevel(env.VITE_APP_LEVEL),
    // 基础 API 地址：TODO 替换为真实接口地址，缺失时为空串
    BASE_API_URL: env.VITE_BASE_API_URL || '',
    // 环境标识：dev / joint / prod，由各 .env 按环境映射，缺失时回退 dev
    ENV_CONFIG: env.VITE_ENV_CONFIG || 'dev',
    ENV_CONFIG_X_CALLER: env.VITE_ENV_CONFIG_X_CALLER || '',
  };
}
