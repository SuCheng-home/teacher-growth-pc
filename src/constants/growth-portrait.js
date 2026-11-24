/**
 * 我的画像页面常量
 * 来源：portrait_v3.0_20260928.html（教师发展画像报告 v3.0）
 * 口径：本期六维分、球员卡属性、目标缺口与路线均为设计稿静态演示数值，
 * 后端「画像统计」接口就绪后，仅需替换本文件的取数来源，页面模板与样式不动。
 */
import { PROFILE_SHOW_SET_DEFAULT } from './profile-show-set';

// 报告表述层（标题 / 英文眉标 / 头部备注 / 免责声明 / 段落开关），对应原型 sfz.pcfg 的 frame 段
// 标题/眉题/头短句/免责四项默认值与管理端「画像报告文案设置」的内置默认一致，接口有本校配置时页面会覆盖
export const PORTRAIT_REPORT_FRAME = {
  eyebrow: PROFILE_SHOW_SET_DEFAULT.reportEyebrow,
  title: PROFILE_SHOW_SET_DEFAULT.reportTitle,
  headNote: PROFILE_SHOW_SET_DEFAULT.reportHeader,
  // 免责声明默认全文（支持 <b> 加粗），模板按 <b> 标签分段声明式渲染
  disclaimer: PROFILE_SHOW_SET_DEFAULT.disclaimer,
  // 段落显示开关：关掉的段落同时从左侧报告目录隐去（对应原型 frame.sections）
  sections: {
    goal: true,
    card: true,
    dims: true,
    peer: true,
    peerReport: true,
    ai: true,
    use: true
  }
};

// 报告目录：段落开关 key / 锚点 id / 主文案 / 角标小字，顺序即目录顺序
export const PORTRAIT_TOC_ITEMS = [
  { key: 'card', id: 'sec-card', label: '画像总览', note: '球员卡' },
  { key: 'goal', id: 'sec-goal', label: '目标锚点', note: '差哪几项' },
  { key: 'dims', id: 'sec-dims', label: '六维解析', note: '逐项对照' },
  { key: 'peer', id: 'sec-peer', label: '同辈参考', note: '对标' },
  { key: 'peerReport', id: 'sec-peer-report', label: '同辈对比报告', note: '分维度' },
  { key: 'ai', id: 'sec-ai', label: 'AI 综合研判', note: '结论' },
  { key: 'use', id: 'sec-use', label: '下一步动作', note: '怎么做' }
];

/**
 * 解析文案中的 **粗体** 分段，供模板以 v-for + <b> 声明式渲染（避免 v-html）
 * split 捕获组模式下奇数索引即加粗段
 * @param {string} text 含 **加粗** 标记的原始文案
 * @returns {Array<{text: string, bold: boolean}>} 分段数组
 */
export function parseRichSegments(text) {
  return String(text || '')
    .split(/\*\*(.+?)\*\*/g)
    .filter(seg => seg !== '')
    .map((seg, index) => ({ text: seg, bold: index % 2 === 1 }));
}

/**
 * 解析本校配置文案中的 <b> 加粗分段（「画像报告文案设置」的免责声明支持 <b> 加粗）
 * 同样供模板以 v-for + <b> 声明式渲染，不入 v-html；其余标签剥掉后按纯文本展示
 * @param {string} text 含 <b> 标记的原始文案
 * @returns {Array<{text: string, bold: boolean}>} 分段数组
 */
export function parseBoldSegments(text) {
  return String(text || '')
    .split(/<b>(.*?)<\/b>/gi)
    .map((seg, index) => ({ text: seg.replace(/<[^>]+>/g, ''), bold: index % 2 === 1 }))
    .filter(seg => seg.text !== '');
}

// 教师档案静态信息（姓名取自鉴权 store，不在此处硬编码）
export const PORTRAIT_TEACHER_PROFILE = {
  school: '南京市第十三中学',
  subject: '地理',
  subjectLabel: '高中地理',
  stage: '发展期教师',
  teachYears: 5,
  title: '二级教师',
  rank: '十一级',
  // 报告头副标题：由档案字段拼接，与球员卡 meta 行口径一致
  reportSub: '高中地理 · 发展期教师（教龄 5 年） · 二级教师 / 十一级'
};

// 数据时点条的固定口径说明（时间窗 / 状态口径）与刷新按钮文案
export const PORTRAIT_FRESH_BAR = {
  timeWindow: '近三年',
  statusClause: '状态口径：已具备 / 缺口（已核实）/ 待补录（档案未录入，不代表未做到）',
  staleTag: '档案或口径有更新，建议重新统计',
  refreshIdle: '重新拉取并统计',
  refreshDone: '已按最新档案与口径重算',
  // 刷新成功态的回退延时（毫秒），与原型的 2.2s 一致
  refreshResetDelay: 2200
};

// 档位阈值与配色：≥85 优 / ≥70 良 / ≥60 中 / 其余待提升（进度条与分数取色同源）
const SCORE_TIER_MAP = [
  { min: 85, key: 'elite' },
  { min: 70, key: 'good' },
  { min: 60, key: 'mid' },
  { min: 0, key: 'low' }
];

/**
 * 按分数返回档位标识，供进度条与分数的配色类名拼接使用
 * @param {number} score 维度分（0-100）
 * @returns {string} 档位标识（elite / good / mid / low）
 */
export function scoreTier(score) {
  const value = Number(score) || 0;
  const tier = SCORE_TIER_MAP.find(item => value >= item.min);
  return tier ? tier.key : 'low';
}

/* ============ ⓪ 目标锚点 ============ */
// 目标锚点引言（三问框架）；缺口计数、关键缺口卡与补齐步骤全部由分析结果结构（8.7 analysisStructure）驱动
export const PORTRAIT_GOAL_ANCHOR = {
  introPrefix: '画像不给你排名，只回答三件事：',
  introSteps: ['我的目标是什么', '我差哪几项', '下一步做什么'],
  gapCountLabel: '项待补缺口',
  // 关键缺口卡图标轮换：按缺口分差从大到小依次取用
  gapIcons: ['flask-conical', 'file-text', 'award'],
  // 关键缺口展示上限
  gapLimit: 3
};

// 未设置愿景时的引导空态（目标锚点 / AI 研判 / 下一步动作三段共用）
export const PORTRAIT_GOAL_EMPTY = {
  title: '还没有设置成长愿景',
  desc: '设置成长愿景后，画像会对照你自己选定的目标做资格预审与差距分析——不再套用统一模板、也不再给出与本人无关的「缺口」。',
  cta: '去设置我的成长愿景',
  visionPath: '/growth/vision'
};

// 已设置愿景但尚无成功分析结果时的提示（三段共用：引导去成长愿景页发起分析）
export const PORTRAIT_ANALYSIS_EMPTY = {
  title: '愿景还没有生成分析结果',
  desc: '到「成长愿景」页对已选愿景发起一次 AI 分析，本段会自动对照你的愿景目标展示资格预审、缺口与补齐路径。',
  cta: '去成长愿景发起分析',
  visionPath: '/growth/vision'
};

// 分析结论代码 → 文案（AiVisionAnalysis.conclusion：1已达成 2具备申报资格 3待确认 4暂不具备）
export const PORTRAIT_CONCLUSION_TEXT = {
  1: '该目标已达成',
  2: '具备申报资格',
  3: '结论待确认',
  4: '暂不具备'
};

// 评分项判为缺口的默认说明（AI 未给建议时的兜底文案）
export const PORTRAIT_GAP_FALLBACK = '该项尚未拿满，按标准细则补齐对应材料即可得分。';

// 资格门槛判定代码 → 文案（structure.gates[].entries[].judge：pass符合 pending待确认 fail不符合）
export const PORTRAIT_GATE_JUDGE_TEXT = {
  pass: '符合',
  pending: '待确认',
  fail: '不符合'
};

/* ============ ① 画像总览（球员卡） ============ */
// 综合发展指数与类型标签
export const PORTRAIT_PLAYER_CARD = {
  overallIndex: 76,
  overallLabel: '综合发展指数',
  typeTag: '教学见长型',
  // 荣誉徽章行
  badges: [
    { icon: 'refresh-cw', text: '完成高中循环教学' },
    { icon: 'graduation-cap', text: '带过 1 届高三毕业班' },
    { icon: 'users', text: '班主任 3.5 年' },
    { icon: 'trophy', text: '指导学生全国一等奖' },
    { icon: 'medal', text: '第十届玄武区优秀青年教师' },
    { icon: 'flag', text: '中共党员' }
  ],
  // 六维属性条（静态演示数值，计分引擎接入后由接口下发）
  attrs: [
    { name: '教学实践', score: 88 },
    { name: '教研科研', score: 64 },
    { name: '德育工作', score: 85 },
    { name: '示范引领', score: 72 },
    { name: '管理履职', score: 78 },
    { name: '专业研修', score: 70 }
  ]
};

/* ============ ② 六维解析 ============ */
// 段落头（眉标 / 标题 / 副标）与标签口径图例
export const PORTRAIT_DIMENSIONS = {
  eyebrow: 'SIX DIMENSIONS',
  title: '六维解析 · 逐项对照目标',
  icon: 'layers',
  sub: '每个维度回答同一组问题：评分项（愿景要求什么）→ 我差哪项（已具备 / 缺口 / 待补录）→ 下一动作（怎么补）· 维度参照教育部教师专业标准与愿景对应标准',
  legendPrefix: '标签口径：',
  legendItems: [
    { tag: 'ok', text: '已具备', note: '档案有据' },
    { tag: 'no', text: '缺口', note: '已核实确无' },
    { tag: 'wait', text: '待补录', note: '档案未录入，不代表未做到' }
  ],
  // 评分项状态图标映射（与原型 gap-li 行保持一致）
  statusIconMap: { ok: 'check', no: 'x', wait: 'clock' },
  // 六个维度块：分数与球员卡六维属性条同源（attrs 顺序对应）
  blocks: [
    {
      name: '教学实践',
      scoreTag: '4 项全部达标',
      def: '这个维度看什么：课堂教学的量与质——课时量、循环教学、毕业班经历、教学质量检测。',
      compareTitle: '评分项对照 · 中学一级教师',
      countText: '达标 4 / 4',
      items: [
        { status: 'ok', label: '循环教学', value: '高一至高三完整循环' },
        { status: 'ok', label: '毕业班经历', value: '带过 1 届高三毕业班' },
        { status: 'ok', label: '课时量达标', value: '周课时 6 节（峰值 12 节）' },
        { status: 'ok', label: '教学质量', value: '同层次班级中较为突出' }
      ],
      peerMedian: 70,
      readSegments: '对目标 **4 项评分项全部达标**，且明显高于可比组中位——这是六维里最扎实的"基本盘"，也是申报一级教师时最有说服力的底牌。',
      suggestSegments: '**下一动作：**本维度无需额外投入。把课堂优势"作品化"——沉淀 1-2 个精品课例，为「示范引领」维度输送素材即可。'
    },
    {
      name: '教研科研',
      scoreTag: '差 2 项 · 最大短板',
      def: '这个维度看什么：课题研究与论文成果——课题立项/结题、论文发表/获奖。',
      compareTitle: '评分项对照 · 中学一级教师',
      countText: '达标 2 / 4 · 缺 2',
      items: [
        { status: 'ok', label: '课题立项', value: '在研 2 项（市级个人 + 区级主持）' },
        { status: 'no', label: '课题结题', value: '2 项均在研、均未结题' },
        { status: 'no', label: '论文公开发表', value: '正式发表 0 篇' },
        { status: 'ok', label: '论文获市级奖', value: '市级二等 1 + 三等 1' }
      ],
      peerMedian: 68,
      readSegments: '差的 2 项（课题结题 + 论文发表）**恰好压在业绩条件的硬指标上**，是职称与骨干评审的主要失分点，也是六维中唯一明显低于可比组中位的维度。',
      suggestSegments: '**下一动作：**未来 6-12 个月主攻此项——先用课题阶段成果整理 1 篇论文投省级期刊（补发表），再推动市级个人课题结题（补结题），一次投入补齐 2 项。'
    },
    {
      name: '德育工作',
      scoreTag: '3 项全部达标',
      def: '这个维度看什么：育人与班级管理——班主任经历、班集体建设、育人成效。',
      compareTitle: '评分项对照 · 中学一级教师',
      countText: '达标 3 / 3',
      items: [
        { status: 'ok', label: '班主任年限', value: '3.5 年（高一14 / 高三6 / 高二2 / 高一8）' },
        { status: 'ok', label: '班集体荣誉', value: '高三6班 · 玄武区先进学生集体' },
        { status: 'ok', label: '育人成效材料', value: '高一14班 · 校级五星班集体' }
      ],
      peerMedian: 72,
      readSegments: '对目标**全部达标**，且有区级标志性成果（先进学生集体），与教学线形成"双优"组合，是申报材料里的加分项。',
      suggestSegments: '**下一动作：**把带班方略整理成 1 个德育案例，可申报区级德育类表彰，进一步抬高层级（非必需，按精力安排）。'
    },
    {
      name: '示范引领',
      scoreTag: '差 2 项 · 待拔高',
      def: '这个维度看什么：公开课 / 讲座 / 竞赛的层级与影响——研究课、赛课、指导青年教师。',
      compareTitle: '评分项对照 · 中学一级教师',
      countText: '达标 2 / 4 · 缺 2',
      items: [
        { status: 'ok', label: '研究课/公开课', value: '市级 1 节、区级 3 节' },
        { status: 'no', label: '教学竞赛层级', value: '区级二等奖 ×3，缺市级一等' },
        { status: 'ok', label: '指导学生获奖', value: '全国地理科普大赛一等奖 ×2' },
        { status: 'no', label: '指导青年教师', value: '暂无结对记录' }
      ],
      peerMedian: 71,
      readSegments: '差 2 项——缺"市级一等奖"这一层级硬项，且尚无指导青年教师记录。**数量够、层级不够**是主要问题，目前仅与可比组中位持平。',
      suggestSegments: '**下一动作：**集中打磨 1 节课冲市级奖（比多开几节区级更划算）；指导学生国家级一等奖可单列佐证；1-2 年内争取结对带 1 名新教师补上第 2 项。'
    },
    {
      name: '管理履职',
      scoreTag: '2 项全部达标',
      def: '这个维度看什么：校内职务与团队职责——年级 / 学科管理岗位的履职情况。',
      compareTitle: '评分项对照 · 中学一级教师',
      countText: '达标 2 / 2',
      items: [
        { status: 'ok', label: '管理岗位', value: '现任高一年级组长' },
        { status: 'ok', label: '团队实绩', value: '备课组建设 / 活动组织经验' }
      ],
      peerMedian: 66,
      readSegments: '对目标**全部达标**，已进入年级管理角色，在同龄段教师中偏上，属"稳中有升"的维度。',
      suggestSegments: '**下一动作：**记录 1-2 个年级管理具体案例（备课组建设、活动组织），为骨干称号"管理履职"项积累证据。'
    },
    {
      name: '专业研修',
      scoreTag: '差 1 项 · 留痕可补',
      def: '这个维度看什么：学历学位与继续学习——学历起点、培训学时、自我提升。',
      compareTitle: '评分项对照 · 中学一级教师',
      countText: '达标 1 / 2 · 缺 1',
      items: [
        { status: 'ok', label: '学历学位', value: '硕士研究生（学科教学·地理）' },
        { status: 'wait', label: '继续教育学时', value: '已参加培训，学时 / 证书未结构化留痕（档案未录入）' }
      ],
      peerMedian: 73,
      readSegments: '学历起点高、学习意愿强，但研修成果没"留痕"，略低于可比组中位——属"有积累、没留证"，是**待补录（档案未录入，不代表未做到）**，短期即可补上。',
      suggestSegments: '**下一动作：**把近 5 年培训学时、证书结构化录入档案，并与课题方向绑定，让学习"留痕可证"。'
    }
  ]
};

/* ============ ③ 同辈参考 ============ */
// 雷达与对比结论：我的六维分位取自球员卡 attrs÷100，可比组中位为静态演示值
export const PORTRAIT_PEER_REF = {
  eyebrow: 'PEER REFERENCE',
  title: '同辈参考',
  icon: 'chart-no-axes-combined',
  sub: '同学科 · 同教龄段可比组 · 分位示意，非官方评分 · 小样本降级处理（仅作"我在哪一档"的参考，不排名）',
  // 可比组六维中位（与球员卡 attrs 同序，供雷达虚线圈与对比报告共用）
  medianValues: [0.70, 0.68, 0.72, 0.71, 0.66, 0.73],
  legend: [
    { type: 'm', text: '我的六维' },
    { type: 'r', text: '可比组中位' }
  ],
  notes: [
    { icon: 'trending-up', lead: '高于同辈：', text: '教学实践、德育工作、管理履职三项均高于可比组中位，是你的"稳态优势"，申报时优先作为主线陈述。' },
    { icon: 'minus', lead: '基本持平：', text: '示范引领与中位相当，属"跟着走"——靠 1 节市级精品课即可拉开。' },
    { icon: 'trending-down', lead: '低于同辈：', text: '教研科研（差 2 项硬指标）、专业研修（差 1 项留痕）——前者必须投入，后者顺手补齐。' }
  ]
};

/* ============ ③-2 同辈对比报告 ============ */
// 全组合汇总表：每一行是一个同辈组（可比条件 + 我的取值），行内数据全部来自同辈对比接口，不再内置演示行
// 定位按综合分位与组内中位（50%）的分位差判定（≥ +3 高于 / ≤ −3 低于 / 其余持平）
export const PORTRAIT_PEER_REPORT = {
  eyebrow: 'PEER BENCHMARK REPORT',
  title: '同辈对比报告 · 全组合汇总',
  icon: 'table-2',
  sub: '汇总全部同辈对比的分析结果：每一行是一个同辈组（可比条件 + 我的取值），点任意一行展开该组的六维分位明细与组内标杆；底部按跨组分位收口总体定位。定位按分位差判定（≥ +3 高于 / ≤ −3 低于 / 其余持平），分位示意，非官方评分，不排名。',
  columns: ['同辈组', '我的取值 · 组内规模', '综合分位', '组内定位'],
  colWidths: ['24%', '30%', '28%', '18%'],
  // 分位差定位阈值与标签（与原型 pos() 判定一致）
  posThreshold: 3,
  posMeta: {
    up: { icon: 'trending-up', text: '高于' },
    flat: { icon: 'minus', text: '持平' },
    down: { icon: 'trending-down', text: '低于' }
  },
  // 分组图标：条件名命中关键字即取对应图标，未命中回落到通用人群图标
  groupIcons: [
    { key: '学科', icon: 'book-open' },
    { key: '班主任', icon: 'users' },
    { key: '教龄', icon: 'hourglass' },
    { key: '年龄', icon: 'cake' },
    { key: '称号', icon: 'award' },
    { key: '职称', icon: 'graduation-cap' },
    { key: '年级', icon: 'layers' },
    { key: '性别', icon: 'venetian-mask' }
  ],
  defaultGroupIcon: 'users',
  // 展开明细里的固定文案
  medianLabel: '组内中位基准',
  strongLabel: '强于组内多数：',
  weakLabel: '弱于组内多数：',
  smallSampleTip: '组内样本偏小，分位稳定性有限，建议放宽条件后再看。',
  sourceNote: '数据来源：同辈对比统计（按同辈条件 + 隐藏条件圈定）· 分位口径「超过组内 xx% 的人」· 非官方评分，不排名',
  totalTitle: '总体定位 · 全部同辈组收口',
  totalTagLabel: { up: '高于同辈', flat: '持平', down: '低于同辈' },
  // 收口三条结论：lead 为引导语，suffix 为结论定调，维度名与平均分位由组件按跨组分位拼接
  totalPoints: {
    up: { lead: '跨组优势维度：', suffix: ' —— 各组口径下均高于中位，可作为申报主线证据。' },
    flat: { lead: '跨组持平维度：', suffix: ' —— 与中位相当，补 1 项标志性成果即可拉开身位。' },
    down: { lead: '跨组差距维度：', suffix: ' —— 属需优先投入项，与目标申报的硬指标重叠。' }
  },
  noneText: '暂无可汇总的维度数据',
  // 无对比结果时的空态（同辈条件未配置 / 维度统计未生成）
  empty: {
    title: '暂无可汇总的同辈对比数据',
    desc: '同辈条件尚未配置或六维维度统计尚未生成，配置完成后本段会自动汇总全部同辈组的分析结果。'
  }
};

/* ============ ④ AI 综合研判 ============ */
// 段落头与双列标题固定；结论导语、达标/缺口清单与补齐路线均由分析结果结构（8.7）驱动
export const PORTRAIT_AI_VERDICT = {
  eyebrow: 'AI SYNTHESIS',
  title: 'AI 综合研判 · 对照目标',
  icon: 'sparkles',
  sub: 'AI 只做解释与建议，不做裁决 · 一切以档案与学校正式评审为准',
  leadIcon: 'compass',
  okTitle: '达标项（保持即可）',
  okIcon: 'shield-check',
  gapTitle: '缺口项（须补）',
  gapIcon: 'alert-triangle',
  mainTitle: '补齐路径（按顺序办理）：',
  // 双列清单展示上限与缺数据时的兜底文案
  okLimit: 5,
  gapLimit: 6,
  noOkText: '本次分析未返回已达标的资格门槛与评分项。',
  noGapText: '资格门槛与评分项均已达标，保持现有节奏即可。',
  noFixText: '本次分析未给出需本人办理的事项，其余各项由系统读取档案自动计分。'
};

/* ============ ⑤ 下一步动作 ============ */
// 四张可执行入口卡：标题 / 入口文案 / 路由固定，正文由分析结果结构（8.7）按 key 生成
// （资格预审与待办 → 成长愿景、同辈 → 同辈对标，与原型的页面迁移保持一致）
export const PORTRAIT_NEXT_ACTIONS = {
  eyebrow: 'NEXT ACTIONS',
  title: '下一步动作 · 照着做就行',
  icon: 'map',
  sub: '画像不只"看一看"——直接给你可执行入口',
  cards: [
    { key: 'gate', icon: 'award', title: '评职称前，先看"够不够"', cta: '去做资格预审', path: '/growth/vision' },
    { key: 'gap', icon: 'file-text', title: '补缺口，先补影响最大的', cta: '看缺口排序', path: '/growth/vision' },
    { key: 'todo', icon: 'list-checks', title: '待办事项，按顺序办理', cta: '看待办清单', path: '/growth/vision' },
    { key: 'peer', icon: 'presentation', title: '同辈位置，随时对照', cta: '看同辈怎么分布', path: '/growth/peer' }
  ],
  // 同辈卡正文与数据无关，固定文案
  peerText: '同辈对比会按你的同辈条件逐组圈定可比范围——**先看清自己在组内的真实位置**，再决定精力往哪投。'
};
