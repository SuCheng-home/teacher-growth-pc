// 本地预览接口路由：按请求路径分派到各业务模块，返回与后端一致的 { code, msg, data } 结构
import * as vision from './vision.js';
import * as peer from './peer.js';
import * as misc from './misc.js';

const AI = '/teacherDevelop/aiAnalysis';

const routes = {
  /* 档案与首页 */
  '/teacherDevelop/teacherIndex/list': ({ params }) => misc.teacherIndexListHandler(params),
  '/teacherDevelop/teacher/data/getTeacherDataByCardId': () => misc.teacherDataHandler(),
  '/teacherDevelop/teacherIndex/record/page': ({ params }) => misc.archiveRecordPageHandler(params),
  '/teacherDevelop/teacherIndex/record/myStatusNum': () => misc.archiveStatusNumHandler(),
  '/teacherDevelop/teacherArchive/task/myTaskPage': ({ params }) => misc.archiveTaskPageHandler(params),
  '/assessment/project/reportList': ({ params }) => misc.evaluationListHandler(params),

  /* 公共 */
  '/uc/sysUserTeacher/tenant/page': ({ params }) => misc.teacherPageHandler(params),
  '/common/dict/tenant/city/listByConstantId': ({ params }) => misc.dictListHandler(params),
  '/common/dict/tenant/area/listByConstantId': ({ params }) => misc.dictListHandler(params),
  '/common/dict/tenant/unit/listByConstantId': ({ params }) => misc.dictListHandler(params),
  '/common/term/termYear/listByOrg': () => misc.yearListHandler(),
  '/ai/generate': ({ data }) => misc.aiGenerateHandler(data),

  /* 大事件 */
  [`${AI}/event/save`]: ({ data }) => misc.eventSaveHandler(data),
  [`${AI}/event/delete`]: ({ params }) => misc.eventDeleteHandler(params),
  [`${AI}/event/pageList`]: ({ params }) => misc.eventPageHandler(params),
  [`${AI}/event/detail`]: ({ params }) => misc.eventDetailHandler(params),

  /* 提示词配置 */
  [`${AI}/promptConfig/save`]: ({ data }) => misc.promptSaveHandler(data),
  [`${AI}/promptConfig/delete`]: ({ params }) => misc.promptDeleteHandler(params),
  [`${AI}/promptConfig/list`]: ({ params }) => misc.promptListHandler(params),
  [`${AI}/promptConfig/getByType`]: ({ params }) => misc.promptGetByTypeHandler(params),

  /* 同辈对标 · 维度分析 */
  [`${AI}/peerCompareDimension/list`]: ({ params }) => peer.peerDimListHandler(params),
  [`${AI}/peerCompareDimension/save`]: ({ data }) => peer.peerDimSaveHandler(data),
  [`${AI}/peerCompareDimension/delete`]: ({ params }) => peer.peerDimDeleteHandler(params),
  [`${AI}/peerCompareDimensionOption/list`]: ({ params }) => peer.peerDimOptionListHandler(params),
  [`${AI}/peerCompareDimensionOption/save`]: ({ data }) => peer.peerDimOptionSaveHandler(data),
  [`${AI}/peerCompareDimensionOption/delete`]: ({ params }) => peer.peerDimOptionDeleteHandler(params),

  /* 同辈对标 · 字段绑定与对比 */
  [`${AI}/peerBind/list`]: ({ params }) => peer.peerBindListHandler(params),
  [`${AI}/peerBind/save`]: ({ data }) => peer.peerBindSaveHandler(data),
  [`${AI}/peerBind/delete`]: ({ params }) => peer.peerBindDeleteHandler(params),
  [`${AI}/peerCompare/getPeerCompareDataForTh`]: ({ data }) => peer.teacherCompareHandler(data),
  [`${AI}/peerCompare/getSchoolCompareDataForAdmin`]: ({ data }) => peer.schoolCompareHandler(data),
  [`${AI}/peerCompareRecord/getLatest`]: () => peer.teacherLatestHandler(),
  [`${AI}/peerCompareRecord/getSchoolLatest`]: () => peer.schoolLatestHandler(),
  [`${AI}/peerCompareRecord/detail`]: ({ params }) => peer.compareRecordDetailHandler(params),

  /* 个人画像 */
  [`${AI}/personalProfile/getProfile`]: ({ data }) => misc.personalProfileHandler(data),
  [`${AI}/personalProfile/getDimensionStat`]: () => peer.dimensionStatHandler(),
  [`${AI}/profileIndexBind/save`]: ({ data }) => misc.profileBindSaveHandler(data),
  [`${AI}/profileIndexBind/delete`]: ({ params }) => misc.profileBindDeleteHandler(params),
  [`${AI}/profileIndexBind/updateEnable`]: ({ params }) => misc.profileBindUpdateEnableHandler(params),
  [`${AI}/profileIndexBind/list`]: ({ params }) => misc.profileBindListHandler(params),
  [`${AI}/profileIndexBind/enabledList`]: () => misc.profileBindEnabledListHandler(),
  [`${AI}/profileScoreTypeSet/save`]: ({ data }) => misc.scoreTypeSaveHandler(data),
  [`${AI}/profileScoreTypeSet/delete`]: ({ params }) => misc.scoreTypeDeleteHandler(params),
  [`${AI}/profileScoreTypeSet/updateEnable`]: ({ params }) => misc.scoreTypeUpdateEnableHandler(params),
  [`${AI}/profileScoreTypeSet/list`]: () => misc.scoreTypeListHandler(),
  [`${AI}/profileScoreTypeSet/enabledList`]: () => misc.scoreTypeEnabledListHandler(),
  [`${AI}/profileScoreTypeSet/matchType`]: ({ params }) => misc.scoreTypeMatchHandler(params),
  [`${AI}/profileShowSet/get`]: () => misc.showSetGetHandler(),
  [`${AI}/profileShowSet/save`]: ({ data }) => misc.showSetSaveHandler(data),

  /* 成长愿景 · 分类与标准 */
  [`${AI}/visionCategory/goalList`]: () => vision.goalListHandler(),
  [`${AI}/visionCategory/saveGoal`]: ({ data }) => vision.saveGoalHandler(data),
  [`${AI}/visionCategory/deleteGoal`]: ({ params }) => vision.deleteGoalHandler(params),
  [`${AI}/visionStandard/save`]: ({ data }) => vision.standardSaveHandler(data),
  [`${AI}/visionStandard/configPrompt`]: ({ data }) => vision.standardConfigPromptHandler(data),
  [`${AI}/visionStandard/delete`]: ({ params }) => vision.standardDeleteHandler(params),
  [`${AI}/visionStandard/list`]: ({ params }) => vision.standardListHandler(params),
  [`${AI}/visionStandard/detail`]: ({ params }) => vision.standardDetailHandler(params),
  [`${AI}/visionStandard/goalOptions`]: ({ params }) => vision.standardGoalOptionsHandler(params),
  [`${AI}/visionStandard/updateCompareContent`]: ({ data }) => vision.standardUpdateCompareContentHandler(data),

  /* 成长愿景 · 教师愿景、分析与报告 */
  [`${AI}/visionTeacherGoal/add`]: ({ data }) => vision.teacherGoalAddHandler(data),
  [`${AI}/visionTeacherGoal/cancel`]: ({ params }) => vision.teacherGoalCancelHandler(params),
  [`${AI}/visionTeacherGoal/myList`]: () => vision.myListHandler(),
  [`${AI}/visionTeacherGoal/goalOptions`]: () => vision.teacherGoalOptionsHandler(),
  [`${AI}/visionAnalysis/startAnalysis`]: ({ params }) => vision.startAnalysisHandler(params),
  [`${AI}/visionAnalysis/getAnalysisResult`]: ({ params }) => vision.analysisResultHandler(params),
  [`${AI}/visionAnalysis/detail`]: ({ params }) => vision.analysisDetailHandler(params),
  [`${AI}/visionAnalysis/latest`]: ({ params }) => vision.analysisLatestHandler(params),
  [`${AI}/visionAnalysis/gateList`]: ({ params }) => vision.gateListHandler(params),
  [`${AI}/visionAnalysis/itemList`]: ({ params }) => vision.itemListHandler(params),
  [`${AI}/visionAnalysis/analysisStructure`]: ({ params }) => vision.analysisStructureHandler(params),
  [`${AI}/visionAnalysis/confirmItem`]: () => true,
  [`${AI}/visionAnalysis/mockAnalysis`]: ({ params }) => vision.mockAnalysisHandler(params),
  [`${AI}/visionAnalysis/getMockResult`]: ({ params }) => vision.mockResultHandler(params),
  [`${AI}/visionReport/generate`]: ({ params }) => vision.reportGenerateHandler(params),
  [`${AI}/visionReport/latest`]: ({ params }) => vision.reportLatestHandler(params)
};

function normalizePath(url) {
  const path = String(url || '').replace(/^https?:\/\/[^/]+/, '').split('?')[0];
  return path.startsWith('/') ? path : '/' + path;
}

const RESPONSE_DELAY_MS = 180;

export function mockRequest(config = {}) {
  const path = normalizePath(config.url);
  const handler = routes[path];
  const params = config.params || {};
  let data = config.data;
  if (typeof data === 'string') {
    try {
      data = JSON.parse(data);
    } catch (err) {
      // 非 JSON 请求体原样交给处理函数
    }
  }
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!handler) {
        console.warn('[dev-stub] 未配置模拟数据的接口:', path);
        resolve({ code: 200, msg: 'ok', data: null });
        return;
      }
      try {
        resolve({ code: 200, msg: 'ok', data: handler({ params, data: data || {}, config }) });
      } catch (err) {
        console.error('[dev-stub] 模拟接口处理失败:', path, err);
        reject({ code: 500, msg: err.message, message: err.message });
      }
    }, RESPONSE_DELAY_MS);
  });
}

export const MOCK_ROUTE_COUNT = Object.keys(routes).length;
