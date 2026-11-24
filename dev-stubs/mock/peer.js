// 同辈对标：档案字段绑定、维度分析设置、教师端 / 校管理员端对比统计
import { TEACHER_POOL, SELF_POOL_ROW, DIMENSIONS, findField, OPTIONS } from './archive.js';
import { round1, nowText, daysFromNow, upsert, removeById, nextId } from './utils.js';

const NUMBER_TYPES = ['number', 'int', 'integer', 'float', 'double', 'decimal'];

function bind(id, fieldName, extra) {
  const field = findField(fieldName);
  return {
    id,
    indexType: 'objectform',
    indexName: fieldName.startsWith('teacher_honor_2024') ? 'teacher_honor_2024' : 'teacher_base',
    indexCode: field.indexCode,
    indexLabel: field.indexCode === 'ZB_HONOR' ? '骨干教师称号' : '基本信息',
    indexFieldName: field.name,
    indexFieldCode: field.code,
    indexFieldLabel: field.label,
    indexFieldType: field.type,
    peerShowLabel: field.label,
    peerSearchLabel: field.label,
    isShow: 1,
    isDefaultUse: 2,
    useScope: 0,
    beginVal: '',
    stepVal: '',
    defaultVal: '',
    optionRange: '',
    isComprehensive: 0,
    comprehensiveName: '',
    comprehensiveType: '',
    comprehensiveCondition: '',
    sortNo: 10,
    createTime: '2026-09-02 14:20:00',
    ...extra
  };
}

export const peerBinds = [
  bind('PB01', 'teacher_base_xk', { peerShowLabel: '同学科', peerSearchLabel: '学科', isDefaultUse: 1, sortNo: 1 }),
  bind('PB02', 'teacher_base_xd', { peerShowLabel: '同学段', peerSearchLabel: '学段', sortNo: 2 }),
  bind('PB03', 'teacher_base_jl', { peerShowLabel: '同教龄段', peerSearchLabel: '教龄段', beginVal: 0, stepVal: 5, sortNo: 3, isComprehensive: 1, comprehensiveName: '平均教龄（年）', comprehensiveType: 2 }),
  bind('PB04', 'teacher_base_zc', { peerShowLabel: '同职称', peerSearchLabel: '职称', sortNo: 4, isComprehensive: 1, comprehensiveName: '高级及以上职称占比', comprehensiveType: 1, comprehensiveCondition: '4,5' }),
  bind('PB05', 'teacher_base_zgzt', { peerShowLabel: '在岗状态', peerSearchLabel: '在岗状态', isShow: 2, defaultVal: '1', sortNo: 5 }),
  bind('PB06', 'teacher_base_xb', { peerShowLabel: '性别', peerSearchLabel: '性别', useScope: 2, sortNo: 6 }),
  bind('PB07', 'teacher_base_zzmm', { peerShowLabel: '政治面貌', peerSearchLabel: '政治面貌', useScope: 2, sortNo: 7, isComprehensive: 1, comprehensiveName: '党员（含预备）占比', comprehensiveType: 1, comprehensiveCondition: '1,2' }),
  bind('PB08', 'teacher_base_xl', { peerShowLabel: '最高学历', peerSearchLabel: '学历', useScope: 2, sortNo: 8, isComprehensive: 1, comprehensiveName: '研究生学历占比', comprehensiveType: 1, comprehensiveCondition: '1,2' }),
  bind('PB09', 'teacher_honor_2024_ch', { peerShowLabel: '骨干称号', peerSearchLabel: '骨干称号', useScope: 2, sortNo: 9 })
];

export function peerBindListHandler(params) {
  const scope = params && params.useScope !== undefined && params.useScope !== '' ? Number(params.useScope) : null;
  return peerBinds
    .filter(item => scope === null || Number(item.useScope) === 0 || Number(item.useScope) === scope)
    .slice()
    .sort((a, b) => Number(a.sortNo) - Number(b.sortNo));
}

export function peerBindSaveHandler(data) {
  const payload = { ...data };
  if (!payload.peerShowLabel) payload.peerShowLabel = payload.indexFieldLabel;
  return upsert(peerBinds, payload, 'PB');
}

export function peerBindDeleteHandler(params) {
  removeById(peerBinds, params.id);
  return true;
}

/* ---------------- 维度分析设置（维度 → 选项 → 评分档位） ---------------- */

function scoreRow(codes, score) {
  return {
    id: nextId('SC'),
    scoreCode: codes.map(c => c[0]).join('_'),
    scoreCodeJson: JSON.stringify(codes.map(([optionKey, optionValue]) => ({ optionKey, optionValue }))),
    score
  };
}

function levelScores(levels) {
  return levels.map(([key, value, score]) => scoreRow([[key, value]], score));
}

const LEVEL_LADDER = [['2', '区级', 2], ['3', '市级', 4], ['4', '省级', 6], ['5', '国家级', 8]];

export const peerDims = [
  { id: 'DIM1', title: '教学实践', showContent: '课堂教学、公开课与指导学生成果', hasHighestJx: 2, isRank: 2, rankType: 2, sortNo: 1 },
  { id: 'DIM2', title: '教研科研', showContent: '论文发表获奖与课题研究', hasHighestJx: 2, isRank: 2, rankType: 2, sortNo: 2 },
  { id: 'DIM3', title: '德育工作', showContent: '班主任及德育岗位履职', hasHighestJx: 1, isRank: 2, rankType: 1, sortNo: 3 },
  { id: 'DIM4', title: '示范引领', showContent: '骨干称号与辐射带动', hasHighestJx: 1, isRank: 2, rankType: 2, sortNo: 4 },
  { id: 'DIM5', title: '管理履职', showContent: '综合荣誉与岗位履职', hasHighestJx: 2, isRank: 2, rankType: 2, sortNo: 5 },
  { id: 'DIM6', title: '专业研修', showContent: '继续教育学时与研修项目', hasHighestJx: 1, isRank: 2, rankType: 1, sortNo: 6 }
];

export const peerDimOptions = [
  { id: 'OPT11', dimensionId: 'DIM1', optionName: '公开课与讲座', indexName: 'teacher_gkk', filterFieldCode: 'teacher_gkk_sj', filterFieldName: '时间', filterRecentYear: 3, hasScoreDj: 2, scoreFieldNames: 'teacher_gkk_jb', hasHighestJx: 2, highestFieldCode: 'teacher_gkk_mc', highestFieldName: 'teacher_gkk_mc', highestFieldLabel: '课题/讲座名称', sortNo: 1, scoreList: levelScores([['1', '校级', 1], ...LEVEL_LADDER]) },
  { id: 'OPT12', dimensionId: 'DIM1', optionName: '指导学生获奖', indexName: 'teacher_zdxs', filterFieldCode: 'teacher_zdxs_sj', filterFieldName: '获奖时间', filterRecentYear: 3, hasScoreDj: 2, scoreFieldNames: 'teacher_zdxs_jb,teacher_zdxs_dj', hasHighestJx: 2, highestFieldCode: 'teacher_zdxs_ss', highestFieldName: 'teacher_zdxs_ss', highestFieldLabel: '赛事名称', sortNo: 2, scoreList: [
    scoreRow([['2', '区级'], ['1', '一等奖']], 3), scoreRow([['2', '区级'], ['2', '二等奖']], 2),
    scoreRow([['3', '市级'], ['1', '一等奖']], 5), scoreRow([['3', '市级'], ['2', '二等奖']], 4),
    scoreRow([['4', '省级'], ['1', '一等奖']], 8)
  ] },
  { id: 'OPT21', dimensionId: 'DIM2', optionName: '论文发表与获奖', indexName: 'teacher_lw', filterFieldCode: 'teacher_lw_sj', filterFieldName: '时间', filterRecentYear: 5, hasScoreDj: 2, scoreFieldNames: 'teacher_lw_jb,teacher_lw_dj', hasHighestJx: 2, highestFieldCode: 'teacher_lw_tm', highestFieldName: 'teacher_lw_tm', highestFieldLabel: '论文题目', sortNo: 1, scoreList: [
    scoreRow([['2', '区级'], ['1', '一等奖']], 3), scoreRow([['2', '区级'], ['2', '二等奖']], 2),
    scoreRow([['3', '市级'], ['1', '一等奖']], 5), scoreRow([['3', '市级'], ['4', '公开发表']], 4),
    scoreRow([['4', '省级'], ['4', '公开发表']], 6)
  ] },
  { id: 'OPT22', dimensionId: 'DIM2', optionName: '课题研究', indexName: 'teacher_kt', filterFieldCode: 'teacher_kt_lxsj', filterFieldName: '立项时间', filterRecentYear: 5, hasScoreDj: 2, scoreFieldNames: 'teacher_kt_jb,teacher_kt_js', hasHighestJx: 1, highestFieldCode: '', highestFieldName: '', highestFieldLabel: '', sortNo: 2, scoreList: [
    scoreRow([['1', '校级'], ['1', '主持人']], 2), scoreRow([['2', '区级'], ['1', '主持人']], 4),
    scoreRow([['2', '区级'], ['2', '核心成员']], 2), scoreRow([['3', '市级'], ['1', '主持人']], 6),
    scoreRow([['3', '市级'], ['2', '核心成员']], 3)
  ] },
  { id: 'OPT31', dimensionId: 'DIM3', optionName: '班主任工作', indexName: 'teacher_bzr', filterFieldCode: '', filterFieldName: '', filterRecentYear: '', hasScoreDj: 1, scoreFieldNames: '', hasHighestJx: 1, highestFieldCode: '', highestFieldName: '', highestFieldLabel: '', sortNo: 1, scoreList: [] },
  { id: 'OPT41', dimensionId: 'DIM4', optionName: '骨干教师称号', indexName: 'teacher_honor_2024', filterFieldCode: '', filterFieldName: '', filterRecentYear: '', hasScoreDj: 2, scoreFieldNames: 'teacher_honor_2024_ch', hasHighestJx: 1, highestFieldCode: '', highestFieldName: '', highestFieldLabel: '', sortNo: 1, scoreList: levelScores([['1', '区优秀青年教师', 3], ['2', '区学科带头人', 5], ['3', '市优秀青年教师', 6], ['4', '市学科带头人', 8], ['5', '江苏省特级教师', 10]]) },
  { id: 'OPT51', dimensionId: 'DIM5', optionName: '综合荣誉', indexName: 'teacher_zhry', filterFieldCode: 'teacher_zhry_hjsj', filterFieldName: '获得时间', filterRecentYear: 5, hasScoreDj: 2, scoreFieldNames: 'teacher_zhry_jb', hasHighestJx: 2, highestFieldCode: 'teacher_zhry_mc', highestFieldName: 'teacher_zhry_mc', highestFieldLabel: '荣誉名称', sortNo: 1, scoreList: levelScores([['1', '校级', 1], ...LEVEL_LADDER]) },
  { id: 'OPT61', dimensionId: 'DIM6', optionName: '继续教育学时', indexName: 'teacher_jxjy', filterFieldCode: '', filterFieldName: '', filterRecentYear: 5, hasScoreDj: 1, scoreFieldNames: '', hasHighestJx: 1, highestFieldCode: '', highestFieldName: '', highestFieldLabel: '', sortNo: 1, scoreList: [] }
];

const withScoreList = option => ({ ...option, scoreList: option.scoreList || [] });

export function peerDimListHandler(params) {
  const withOption = params && Number(params.withOption) === 1;
  return peerDims
    .slice()
    .sort((a, b) => a.sortNo - b.sortNo)
    .map(dim => ({
      ...dim,
      optionList: withOption
        ? peerDimOptions.filter(o => o.dimensionId === dim.id).map(o => ({ ...o, scoreList: undefined }))
        : undefined
    }));
}

export function peerDimSaveHandler(data) {
  return upsert(peerDims, { ...data, sortNo: Number(data.sortNo) || peerDims.length + 1 }, 'DIM');
}

export function peerDimDeleteHandler(params) {
  removeById(peerDims, params.id);
  for (let i = peerDimOptions.length - 1; i >= 0; i -= 1) {
    if (String(peerDimOptions[i].dimensionId) === String(params.id)) peerDimOptions.splice(i, 1);
  }
  return true;
}

export function peerDimOptionListHandler(params) {
  return peerDimOptions
    .filter(o => !params || !params.dimensionId || String(o.dimensionId) === String(params.dimensionId))
    .sort((a, b) => a.sortNo - b.sortNo)
    .map(withScoreList);
}

export function peerDimOptionSaveHandler(data) {
  const payload = { ...data };
  const scores = payload.scoreList || payload.scores;
  if (Array.isArray(scores)) {
    payload.scoreList = scores.map(s => ({
      id: s.id || nextId('SC'),
      scoreCode: s.scoreCode,
      scoreCodeJson: typeof s.scoreCodeJson === 'string' ? s.scoreCodeJson : JSON.stringify(s.scoreCodeJson || []),
      score: s.score
    }));
  }
  delete payload.scores;
  if (Array.isArray(payload.scoreFieldNames)) payload.scoreFieldNames = payload.scoreFieldNames.join(',');
  return upsert(peerDimOptions, payload, 'OPT');
}

export function peerDimOptionDeleteHandler(params) {
  removeById(peerDimOptions, params.id);
  return true;
}

/* ---------------- 对比统计 ---------------- */

function isNumberField(fieldName) {
  const field = findField(fieldName);
  return field && NUMBER_TYPES.indexOf(String(field.type).toLowerCase()) > -1;
}

function criteriaList(condition) {
  if (!condition) return [];
  if (condition.queryType === 'criteria') return [condition];
  return (condition.conditions || []).reduce((acc, c) => acc.concat(criteriaList(c)), []);
}

function matchCriteria(row, criteria) {
  const fieldName = criteria.fieldName;
  const raw = row.teacher[fieldName];
  const value = criteria.value;
  if (value === undefined || value === null || value === '' || value === '-') return true;
  if (isNumberField(fieldName)) {
    const text = String(value);
    const num = Number(raw);
    if (text.indexOf('~') > -1) {
      const [low, high] = text.split('~').map(Number);
      return num >= low && num < high;
    }
    if (text.indexOf('以下') > -1) return num < parseFloat(text);
    return String(raw) === text;
  }
  const accepted = (Array.isArray(value) ? value : String(value).split(',')).map(v => String(v).trim()).filter(Boolean);
  return !accepted.length || accepted.indexOf(String(raw)) > -1;
}

function filterPool(queryCondition) {
  const list = criteriaList(queryCondition);
  return TEACHER_POOL.filter(row => list.every(c => matchCriteria(row, c)));
}

const TOP_AWARDS = [
  '南京市中小学优质课评比一等奖',
  '江苏省教育科研论文评比一等奖',
  '南京市优秀班主任',
  '南京市学科带头人',
  '江苏省优秀教育工作者',
  '南京市骨干教师高级研修班结业（优秀学员）'
];

const maskName = name => name.charAt(0) + '老师';

function dimensionStatsFor(row, group) {
  return DIMENSIONS.map((dim, i) => {
    const scores = group.map(r => r.scores[i]);
    const self = row.scores[i];
    const others = group.filter(r => r !== row);
    const lower = others.filter(r => r.scores[i] < self).length;
    const top = group.reduce((best, r) => (r.scores[i] > best.scores[i] ? r : best), group[0]);
    return {
      dimensionId: dim.id,
      dimensionTitle: dim.title,
      title: dim.title,
      score: self,
      topScore: top.scores[i],
      fullScore: dim.full,
      avgScore: round1(scores.reduce((a, b) => a + b, 0) / scores.length),
      ratio: others.length ? Math.min(95, Math.round((lower / others.length) * 100)) : 95,
      rank: 1 + others.filter(r => r.scores[i] > self).length,
      rankNo: 1 + others.filter(r => r.scores[i] > self).length,
      topUserName: maskName(top.userName),
      topAwardName: TOP_AWARDS[i]
    };
  });
}

const totalOf = row => round1(row.scores.reduce((a, b) => a + b, 0));

function teacherStatData(group) {
  const self = SELF_POOL_ROW;
  const dimensions = dimensionStatsFor(self, group);
  const others = group.filter(r => r !== self);
  const selfTotal = totalOf(self);
  const strong = dimensions.filter(d => d.ratio >= 70).map(d => d.dimensionTitle);
  let weak = dimensions.filter(d => d.ratio < 45).map(d => d.dimensionTitle);
  if (!weak.length) {
    weak = [dimensions.slice().sort((a, b) => a.ratio - b.ratio)[0].dimensionTitle];
  }
  return {
    totalScore: selfTotal,
    totalRatio: others.length ? Math.round((others.filter(r => totalOf(r) < selfTotal).length / others.length) * 100) : 100,
    totalRank: 1 + others.filter(r => totalOf(r) > selfTotal).length,
    strongDimensions: strong.length ? strong : [dimensions.slice().sort((a, b) => b.ratio - a.ratio)[0].dimensionTitle],
    weakDimensions: weak,
    dimensions
  };
}

export function teacherCompareHandler(data) {
  const queryCondition = (data && data.queryCondition) || {};
  const group = filterPool(queryCondition);
  if (group.indexOf(SELF_POOL_ROW) < 0) group.unshift(SELF_POOL_ROW);
  // 画像页会按单条件逐组调用本接口，最近对比记录只保留同辈对标页的默认口径，避免被逐组调用覆盖
  return { peerNum: group.length, statData: { peerNum: group.length, ...teacherStatData(group) } };
}

const DEFAULT_TEACHER_CONDITION = {
  conditionType: 'and',
  queryType: 'condition',
  conditions: [
    { criteriaType: 'eq', queryType: 'criteria', indexName: 'teacher_base', indexType: 'objectform', fieldType: 'select', fieldName: 'teacher_base_xk', fieldLabel: '主教学科', value: '9' },
    { criteriaType: 'eq', queryType: 'criteria', indexName: 'teacher_base', indexType: 'objectform', fieldType: 'select', fieldName: 'teacher_base_zgzt', fieldLabel: '在岗状态', value: '1' }
  ]
};

const teacherLatestRecord = (() => {
  const group = filterPool(DEFAULT_TEACHER_CONDITION);
  return {
    id: 'PCR0001',
    compareParam: JSON.stringify({ queryCondition: DEFAULT_TEACHER_CONDITION }),
    statData: JSON.stringify({ peerNum: group.length, ...teacherStatData(group) }),
    peerNum: group.length,
    compareTime: daysFromNow(-3, 16, 22)
  };
})();

export function teacherLatestHandler() {
  return teacherLatestRecord;
}

/* ---------------- 校管理员 · 全校同辈对标 ---------------- */

const STRUCTURE_ICON = {
  teacher_base_xk: 'book-open',
  teacher_base_xd: 'layers',
  teacher_base_jl: 'hourglass',
  teacher_base_zc: 'award',
  teacher_base_xb: 'users',
  teacher_base_zzmm: 'flag',
  teacher_base_xl: 'graduation-cap',
  teacher_honor_2024_ch: 'star'
};

function summaryOf(group, total) {
  return peerBinds
    .filter(b => Number(b.isComprehensive) === 1 && Number(b.useScope) !== 1)
    .map(b => {
      const type = Number(b.comprehensiveType);
      const values = group.map(r => r.teacher[b.indexFieldName]);
      if (type === 1) {
        const accepted = String(b.comprehensiveCondition || '').split(',').filter(Boolean);
        const matchNum = values.filter(v => accepted.indexOf(String(v)) > -1).length;
        return { name: b.comprehensiveName, comprehensiveType: 1, icon: STRUCTURE_ICON[b.indexFieldName], value: group.length ? round1((matchNum / group.length) * 100) : null, matchNum, totalNum: group.length };
      }
      const nums = values.map(Number).filter(n => isFinite(n));
      const value = nums.length ? (type === 3 ? Math.max(...nums) : round1(nums.reduce((a, c) => a + c, 0) / nums.length)) : null;
      return { name: b.comprehensiveName, comprehensiveType: type, icon: STRUCTURE_ICON[b.indexFieldName], value, validNum: nums.length, totalNum: group.length };
    });
}

function structureOf(group) {
  return peerBinds
    .filter(b => Number(b.isShow) === 1 && Number(b.useScope) !== 1)
    .map(b => {
      const field = findField(b.indexFieldName);
      const isNum = isNumberField(b.indexFieldName);
      const counter = {};
      const order = [];
      group.forEach(r => {
        const raw = r.teacher[b.indexFieldName];
        let label;
        if (isNum) {
          const step = Number(b.stepVal) || 5;
          const start = Number(b.beginVal) || 0;
          const low = start + Math.floor((Number(raw) - start) / step) * step;
          label = `${low}-${low + step - 1}`;
        } else {
          label = ((field && field.options) || []).find(o => String(o.key) === String(raw));
          label = label ? label.value : '';
        }
        if (!(label in counter)) {
          counter[label] = 0;
          order.push(label);
        }
        counter[label] += 1;
      });
      const items = order.map(label => ({ label, num: counter[label], pct: group.length ? round1((counter[label] / group.length) * 100) : 0 }));
      if (isNum) items.sort((a, b2) => parseInt(a.label, 10) - parseInt(b2.label, 10));
      else items.sort((a, b2) => b2.num - a.num);
      return {
        name: b.peerShowLabel,
        fieldName: b.indexFieldName,
        icon: STRUCTURE_ICON[b.indexFieldName] || 'pie-chart',
        totalNum: group.length,
        segType: isNum ? 1 : 0,
        items
      };
    });
}

function schoolStatData(group) {
  const teacherList = group.map(row => ({
    id: row.id,
    userName: row.userName,
    teacher: row.teacher,
    totalScore: totalOf(row),
    dimensionDataList: dimensionStatsFor(row, group).map(d => ({
      dimensionId: d.dimensionId,
      dimensionTitle: d.dimensionTitle,
      score: d.score,
      ratio: d.ratio,
      rankNo: d.rankNo
    }))
  }));
  teacherList.sort((a, b) => b.totalScore - a.totalScore);
  return { summary: summaryOf(group, TEACHER_POOL.length), structure: structureOf(group), teacherList };
}

export function schoolCompareHandler(data) {
  const queryCondition = (data && data.queryCondition) || {};
  const group = filterPool(queryCondition);
  const result = { peerNum: group.length, schoolTeacherNum: TEACHER_POOL.length, statData: schoolStatData(group) };
  schoolLatestRecord = {
    id: nextId('SCR'),
    compareParam: JSON.stringify({ queryCondition }),
    statData: JSON.stringify(result.statData),
    peerNum: result.peerNum,
    schoolTeacherNum: result.schoolTeacherNum,
    compareTime: nowText()
  };
  return result;
}

const DEFAULT_SCHOOL_CONDITION = {
  conditionType: 'and',
  queryType: 'condition',
  conditions: [
    { criteriaType: 'eq', queryType: 'criteria', indexName: 'teacher_base', indexType: 'objectform', fieldType: 'select', fieldName: 'teacher_base_zgzt', fieldLabel: '在岗状态', value: '1' }
  ]
};

let schoolLatestRecord = (() => {
  const group = filterPool(DEFAULT_SCHOOL_CONDITION);
  return {
    id: 'SCR0001',
    compareParam: JSON.stringify({ queryCondition: DEFAULT_SCHOOL_CONDITION }),
    statData: JSON.stringify(schoolStatData(group)),
    peerNum: group.length,
    schoolTeacherNum: TEACHER_POOL.length,
    compareTime: daysFromNow(-1, 10, 8)
  };
})();

export function schoolLatestHandler() {
  return schoolLatestRecord;
}

export function compareRecordDetailHandler(params) {
  const id = params && params.id;
  if (String(schoolLatestRecord.id) === String(id)) return schoolLatestRecord;
  return teacherLatestRecord;
}

/* ---------------- 个人画像六维统计 ---------------- */

export function dimensionStatHandler() {
  const dimensions = DIMENSIONS.map((dim, i) => ({
    dimensionId: dim.id,
    dimensionTitle: dim.title,
    score: SELF_POOL_ROW.scores[i],
    topScore: dim.full
  }));
  return {
    dimensions,
    totalScore: round1(dimensions.reduce((a, d) => a + d.score, 0)),
    totalTopScore: DIMENSIONS.reduce((a, d) => a + d.full, 0)
  };
}

export { OPTIONS };
