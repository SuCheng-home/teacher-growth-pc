// 教师档案：指标定义（市/区/校三级）、当前教师档案、全校教师样本池
import { createRandom, round1 } from './utils.js';

const opts = list => list.map(([key, value]) => ({ key: String(key), value }));

export const OPTIONS = {
  xb: opts([[1, '男'], [2, '女']]),
  zzmm: opts([[1, '中共党员'], [2, '中共预备党员'], [3, '共青团员'], [4, '民主党派'], [5, '群众']]),
  xl: opts([[1, '博士研究生'], [2, '硕士研究生'], [3, '大学本科'], [4, '大学专科']]),
  xd: opts([[1, '初中'], [2, '高中']]),
  xk: opts([[1, '语文'], [2, '数学'], [3, '英语'], [4, '物理'], [5, '化学'], [6, '生物'], [7, '思想政治'], [8, '历史'], [9, '地理'], [10, '信息技术'], [11, '体育与健康'], [12, '音乐'], [13, '美术']]),
  zc: opts([[1, '未定级'], [2, '二级教师'], [3, '一级教师'], [4, '高级教师'], [5, '正高级教师']]),
  gw: opts([[13, '十三级'], [12, '十二级'], [11, '十一级'], [10, '十级'], [9, '九级'], [8, '八级'], [7, '七级'], [6, '六级'], [5, '五级'], [4, '四级']]),
  zgzt: opts([[1, '在岗'], [2, '借调'], [3, '脱产进修']]),
  ch: opts([[0, '暂无称号'], [1, '区优秀青年教师'], [2, '区学科带头人'], [3, '市优秀青年教师'], [4, '市学科带头人'], [5, '江苏省特级教师']]),
  jb: opts([[1, '校级'], [2, '区级'], [3, '市级'], [4, '省级'], [5, '国家级']]),
  dj: opts([[1, '一等奖'], [2, '二等奖'], [3, '三等奖'], [4, '公开发表']]),
  js: opts([[1, '主持人'], [2, '核心成员'], [3, '参与成员']]),
  zt: opts([[1, '在研'], [2, '已结题']]),
  lx: opts([[1, '公开课'], [2, '示范课'], [3, '专题讲座']]),
  sfbzr: opts([[1, '班主任'], [2, '副班主任']]),
  xq: opts([
    ['2021-1', '2021-2022学年第一学期'], ['2021-2', '2021-2022学年第二学期'],
    ['2022-1', '2022-2023学年第一学期'], ['2022-2', '2022-2023学年第二学期'],
    ['2023-1', '2023-2024学年第一学期'], ['2023-2', '2023-2024学年第二学期'],
    ['2024-1', '2024-2025学年第一学期'], ['2024-2', '2024-2025学年第二学期'],
    ['2025-1', '2025-2026学年第一学期'], ['2025-2', '2025-2026学年第二学期'],
    ['2026-1', '2026-2027学年第一学期']
  ])
};

function field(indexName, indexCode, code, label, type, options) {
  return {
    name: `${indexName}_${code}`,
    code,
    label,
    type,
    indexCode,
    options: options || [],
    attrs: {}
  };
}

function index(level, code, name, label, type, fieldDefs, sortNo) {
  return {
    id: code,
    code,
    name,
    label,
    type,
    level,
    sortNo,
    fields: fieldDefs.map(([c, l, t, o]) => field(name, code, c, l, t, o))
  };
}

export const TEACHER_INDEXES = [
  index(0, 'ZB_BASE', 'teacher_base', '基本信息', 'objectform', [
    ['xm', '姓名', 'input'],
    ['xb', '性别', 'select', OPTIONS.xb],
    ['csrq', '出生日期', 'date'],
    ['zzmm', '政治面貌', 'select', OPTIONS.zzmm],
    ['xl', '最高学历', 'select', OPTIONS.xl],
    ['byyx', '毕业院校及专业', 'input'],
    ['xd', '任教学段', 'select', OPTIONS.xd],
    ['xk', '主教学科', 'select', OPTIONS.xk],
    ['rjsj', '参加工作时间', 'date'],
    ['jl', '教龄', 'number'],
    ['zc', '专业技术职称', 'select', OPTIONS.zc],
    ['zcsj', '取得现职称时间', 'date'],
    ['gw', '专业技术岗位', 'select', OPTIONS.gw],
    ['rzrj', '任职任教', 'input'],
    ['zgzt', '在岗状态', 'select', OPTIONS.zgzt]
  ], 1),
  index(0, 'ZB_HONOR', 'teacher_honor_2024', '骨干教师称号', 'objectform', [
    ['ch', '骨干教师称号', 'select', OPTIONS.ch],
    ['rdsj', '认定时间', 'date']
  ], 2),
  index(1, 'ZB_ZHRY', 'teacher_zhry', '综合荣誉', 'arrayform', [
    ['mc', '荣誉名称', 'input'],
    ['jb', '级别', 'select', OPTIONS.jb],
    ['hjsj', '获得时间', 'date']
  ], 3),
  index(1, 'ZB_LW', 'teacher_lw', '论文发表与获奖', 'arrayform', [
    ['tm', '论文题目', 'input'],
    ['kw', '刊物/评比名称', 'input'],
    ['jb', '级别', 'select', OPTIONS.jb],
    ['dj', '等第', 'select', OPTIONS.dj],
    ['sj', '时间', 'date']
  ], 4),
  index(1, 'ZB_KT', 'teacher_kt', '课题研究', 'arrayform', [
    ['mc', '课题名称', 'input'],
    ['jb', '级别', 'select', OPTIONS.jb],
    ['js', '本人角色', 'select', OPTIONS.js],
    ['zt', '研究状态', 'select', OPTIONS.zt],
    ['lxsj', '立项时间', 'date']
  ], 5),
  index(1, 'ZB_GKK', 'teacher_gkk', '公开课与讲座', 'arrayform', [
    ['mc', '课题/讲座名称', 'input'],
    ['jb', '级别', 'select', OPTIONS.jb],
    ['lx', '类型', 'select', OPTIONS.lx],
    ['sj', '时间', 'date']
  ], 6),
  index(2, 'ZB_BZR', 'teacher_bzr', '班主任工作', 'arrayform', [
    ['xq', '学期', 'select', OPTIONS.xq],
    ['bj', '班级', 'input'],
    ['sfbzr', '岗位', 'select', OPTIONS.sfbzr]
  ], 7),
  index(2, 'ZB_ZDXS', 'teacher_zdxs', '指导学生获奖', 'arrayform', [
    ['xsxm', '学生姓名', 'input'],
    ['ss', '赛事名称', 'input'],
    ['jb', '级别', 'select', OPTIONS.jb],
    ['dj', '等第', 'select', OPTIONS.dj],
    ['sj', '获奖时间', 'date']
  ], 8),
  index(2, 'ZB_JXJY', 'teacher_jxjy', '继续教育', 'arrayform', [
    ['mc', '培训项目', 'input'],
    ['xs', '学时', 'number'],
    ['nd', '年度', 'input']
  ], 9)
];

export const ALL_FIELDS = TEACHER_INDEXES.reduce((acc, idx) => acc.concat(idx.fields), []);

export function findField(fieldName) {
  return ALL_FIELDS.find(f => f.name === fieldName) || null;
}

export function optionText(optionList, key) {
  const hit = (optionList || []).find(o => String(o.key) === String(key));
  return hit ? hit.value : '';
}

let dataSeq = 100;
const rows = list => list.map(row => ({ dataId: 'D' + (dataSeq += 1), createTime: '2025-09-01 10:00:00', ...row }));

// 当前登录教师档案（getTeacherDataByCardId 的 teacher 节点，键为指标名去掉 teacher_ 前缀）
export const SELF_TEACHER = {
  base: {
    xm: '朱晓雯',
    xb: '2',
    csrq: '1996-03-08',
    zzmm: '1',
    xl: '2',
    byyx: '南京师范大学 · 学科教学（地理）',
    xd: '2',
    xk: '9',
    rjsj: '2021-08-28',
    jl: 5,
    zc: '2',
    zcsj: '2022-09-01',
    gw: '11',
    rzrj: '高二(4)班、高二(6)班地理 · 高二(4)班班主任',
    zgzt: '1'
  },
  honor_2024: { ch: '0', rdsj: '' },
  zhry: rows([
    { mc: '玄武区优秀班主任', jb: '2', hjsj: '2024-09-10' },
    { mc: '南京市第十三中学优秀教育工作者', jb: '1', hjsj: '2023-09-08' },
    { mc: '学校青年教师赛课一等奖', jb: '1', hjsj: '2022-12-20' }
  ]),
  lw: rows([
    { tm: '基于真实情境的高中地理问题式教学实践', kw: '玄武区教育教学论文评比', jb: '2', dj: '2', sj: '2024-12-15' },
    { tm: '核心素养导向下的高中地理单元作业设计', kw: '《中学地理教学参考》', jb: '3', dj: '4', sj: '2025-06-01' }
  ]),
  kt: rows([
    { mc: '高中地理野外考察课程的开发与实施', jb: '1', js: '1', zt: '1', lxsj: '2025-03-01' }
  ]),
  gkk: rows([
    { mc: '《城镇化》区级研究课', jb: '2', lx: '1', sj: '2025-04-17' },
    { mc: '《大气受热过程》校级展示课', jb: '1', lx: '2', sj: '2023-11-09' }
  ]),
  bzr: rows([
    { xq: '2023-1', bj: '高一(4)班', sfbzr: '1' },
    { xq: '2023-2', bj: '高一(4)班', sfbzr: '1' },
    { xq: '2024-1', bj: '高二(4)班', sfbzr: '1' },
    { xq: '2024-2', bj: '高二(4)班', sfbzr: '1' },
    { xq: '2025-1', bj: '高三(4)班', sfbzr: '1' },
    { xq: '2025-2', bj: '高三(4)班', sfbzr: '1' },
    { xq: '2026-1', bj: '高二(4)班', sfbzr: '1' }
  ]),
  zdxs: rows([
    { xsxm: '陈思源', ss: '南京市中学生地理知识竞赛', jb: '3', dj: '2', sj: '2025-05-20' },
    { xsxm: '李沐阳', ss: '玄武区中学生地理小论文评比', jb: '2', dj: '1', sj: '2024-06-12' }
  ]),
  jxjy: rows([
    { mc: '新教师规范化培训', xs: 120, nd: '2021' },
    { mc: '信息技术应用能力提升工程 2.0', xs: 24, nd: '2023' },
    { mc: '暑期全员培训', xs: 48, nd: '2024' },
    { mc: '南京市高中地理青年教师研修班', xs: 72, nd: '2025' },
    { mc: '暑期全员培训', xs: 48, nd: '2025' }
  ])
};

/* ---------------- 全校教师样本池（同辈对比 / 全校分析 / 选人弹窗共用） ---------------- */

export const DIMENSIONS = [
  { id: 'DIM1', title: '教学实践', full: 30 },
  { id: 'DIM2', title: '教研科研', full: 25 },
  { id: 'DIM3', title: '德育工作', full: 15 },
  { id: 'DIM4', title: '示范引领', full: 10 },
  { id: 'DIM5', title: '管理履职', full: 10 },
  { id: 'DIM6', title: '专业研修', full: 10 }
];

const SELF_SCORES = [24.5, 11.5, 13.0, 4.5, 6.0, 8.5];

const SURNAMES = ['王', '李', '张', '刘', '陈', '杨', '黄', '赵', '吴', '周', '徐', '孙', '马', '胡', '郭', '何', '林', '高', '罗', '郑', '梁', '谢', '宋', '唐', '许', '韩', '冯', '邓', '曹', '沈'];
const GIVEN = ['婧', '晨', '磊', '静', '涛', '敏', '欣怡', '子涵', '浩然', '雨轩', '思远', '佳琪', '文博', '晓东', '丽娟', '建华', '海燕', '志强', '秀英', '俊杰', '雅琴', '明轩', '诗涵', '宇航', '慧敏', '振华', '雪梅', '立新', '春燕', '国栋', '亚楠', '一鸣', '书瑶', '天佑', '若彤'];
// 学科分布按高完中常见师资配比给定，地理组含当前教师共 9 人
const SUBJECT_PLAN = [['1', 16], ['2', 16], ['3', 15], ['4', 10], ['5', 9], ['6', 8], ['7', 8], ['8', 8], ['9', 8], ['10', 6], ['11', 10], ['12', 4], ['13', 7]];
const SCHOOL_TEACHER_TOTAL = 126;

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

function titleByYears(years, random) {
  if (years <= 1) return '1';
  if (years <= 4) return '2';
  if (years <= 9) return random() < 0.3 ? '2' : '3';
  if (years <= 18) return random() < 0.35 ? '3' : '4';
  return random() < 0.06 ? '5' : '4';
}

function gradeByTitle(title, random) {
  const pick = list => list[Math.floor(random() * list.length)];
  return { 1: '13', 2: pick(['12', '11']), 3: pick(['10', '9', '8']), 4: pick(['7', '6', '5']), 5: '4' }[title];
}

function honorByYears(years, random) {
  if (years < 4) return '0';
  const r = random();
  if (years >= 20 && r < 0.12) return '4';
  if (years >= 12 && r < 0.25) return random() < 0.5 ? '2' : '3';
  if (years >= 5 && r < 0.35) return '1';
  return '0';
}

function buildPool() {
  const random = createRandom(20261124);
  const subjects = [];
  SUBJECT_PLAN.forEach(([key, count]) => {
    for (let i = 0; i < count; i += 1) subjects.push(key);
  });
  const usedNames = new Set(['朱晓雯']);
  const pool = [];
  for (let i = 0; i < SCHOOL_TEACHER_TOTAL - 1; i += 1) {
    let name = '';
    do {
      name = SURNAMES[Math.floor(random() * SURNAMES.length)] + GIVEN[Math.floor(random() * GIVEN.length)];
    } while (usedNames.has(name));
    usedNames.add(name);
    const years = Math.max(1, Math.round(Math.pow(random(), 1.15) * 32));
    const title = titleByYears(years, random);
    const exp = Math.min(1, years / 20);
    const isHeadTeacher = random() < 0.42;
    const noise = () => (random() - 0.5) * 2;
    const scores = [
      clamp(13 + 12 * exp + noise() * 4, 6, 30),
      clamp(3 + 15 * exp + noise() * 5, 0, 25),
      clamp((isHeadTeacher ? 9 : 4) + 3 * random() + noise(), 1, 15),
      clamp(0.5 + 7 * exp + noise() * 1.5, 0, 10),
      clamp(2.5 + 5 * exp + noise() * 1.5, 0, 10),
      clamp(5 + 3 * random() + noise(), 2, 10)
    ].map(round1);
    pool.push({
      id: 'T' + String(1001 + i),
      userName: name,
      cardId: `32010${2 + (i % 5)}${2026 - 23 - years}${String(1 + (i % 12)).padStart(2, '0')}${String(1 + (i % 27)).padStart(2, '0')}${String(1000 + i * 37).slice(-4)}`,
      phoneNumber: `1${['38', '39', '51', '58', '86', '77'][i % 6]}${String(25810000 + i * 4021).slice(-8)}`,
      teacher: {
        teacher_base_xm: name,
        teacher_base_xb: random() < 0.62 ? '2' : '1',
        teacher_base_zzmm: random() < 0.46 ? '1' : (random() < 0.15 ? '4' : '5'),
        teacher_base_xl: random() < 0.03 ? '1' : (random() < 0.38 ? '2' : '3'),
        teacher_base_xd: random() < 0.55 ? '2' : '1',
        teacher_base_xk: subjects[i % subjects.length],
        teacher_base_jl: years,
        teacher_base_zc: title,
        teacher_base_gw: gradeByTitle(title, random),
        teacher_base_zgzt: random() < 0.95 ? '1' : (random() < 0.5 ? '2' : '3'),
        teacher_honor_2024_ch: honorByYears(years, random)
      },
      scores
    });
  }
  const selfBase = {};
  Object.keys(SELF_TEACHER.base).forEach(key => { selfBase[`teacher_base_${key}`] = SELF_TEACHER.base[key]; });
  pool.unshift({
    id: 'T1000',
    userName: '朱晓雯',
    isSelf: true,
    cardId: '320102199603083526',
    phoneNumber: '13851726630',
    teacher: { ...selfBase, teacher_honor_2024_ch: SELF_TEACHER.honor_2024.ch },
    scores: SELF_SCORES
  });
  return pool;
}

export const TEACHER_POOL = buildPool();
export const SELF_POOL_ROW = TEACHER_POOL[0];
