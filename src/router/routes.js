// 布局壳为父路由立即渲染，保持同步引入；各业务页面按需懒加载，实现路由级代码分割
import GrowthLayout from '@/components/layout/growth-layout.vue';
const GrowthIndex = () => import('@/views/growth-index/index.vue');
const GrowthPortrait = () => import('@/views/growth-portrait/index.vue');
const GrowthVision = () => import('@/views/growth-vision/index.vue');
const GrowthPeer = () => import('@/views/growth-peer/index.vue');
const VisionCategory = () => import('@/views/admin/vision-category/index.vue');
const VisionStandard = () => import('@/views/admin/vision-standard/index.vue');
const AdminPortraitDimension = () => import('@/views/admin/portrait-dimension/index.vue');
const AdminPortraitConfig = () => import('@/views/admin/portrait-config/index.vue');
const AdminPortraitBind = () => import('@/views/admin/portrait-bind/index.vue');
const AdminPortraitScoreType = () => import('@/views/admin/portrait-score-type/index.vue');
const AdminPeerSetting = () => import('@/views/admin/peer-setting/index.vue');
const AdminPeerDimAnalysis = () => import('@/views/admin/peer-dim-analysis/index.vue');
const AdminTeamPeerAnalysis = () => import('@/views/admin/team-analysis/index.vue');
const AdminDataEvents = () => import('@/views/admin/data-events/index.vue');
const AdminDataTrial = () => import('@/views/admin/data-trial/index.vue');
const AdminDataQuality = () => import('@/views/admin/data-quality/index.vue');
const AdminDataReport = () => import('@/views/admin/data-report/index.vue');
const AdminAiKnowledge = () => import('@/views/admin/ai-knowledge/index.vue');
const AdminAiPrompt = () => import('@/views/admin/ai-prompt/index.vue');
const AdminAiParameter = () => import('@/views/admin/ai-parameter/index.vue');
const AdminAiAudit = () => import('@/views/admin/ai-audit/index.vue');
const Placeholder = () => import('@/views/Placeholder.vue');
const NotFound = () => import('@/views/NotFound.vue');

const routes = [
  {
    path: '/',
    redirect: '/growth/index'
  },
  {
    path: '/growth',
    component: GrowthLayout,
    redirect: '/growth/index',
    children: [
      {
        path: 'index',
        name: 'growthIndex',
        component: GrowthIndex,
        meta: { title: '成长首页' }
      },
      {
        path: 'portrait',
        name: 'growthPortrait',
        component: GrowthPortrait,
        meta: { title: '我的画像' }
      },
      {
        path: 'archive',
        name: 'growthArchive',
        component: Placeholder,
        meta: { title: '电子档案袋' }
      },
      {
        path: 'vision',
        name: 'growthVision',
        component: GrowthVision,
        meta: { title: '成长愿景' }
      },
      {
        path: 'peer',
        name: 'growthPeer',
        component: GrowthPeer,
        meta: { title: '同辈对标' }
      },
      {
        path: 'evaluation',
        name: 'growthEvaluation',
        component: Placeholder,
        meta: { title: '校级评选' }
      }
    ]
  },
  {
    path: '/admin',
    component: GrowthLayout,
    redirect: '/admin/vision/category',
    meta: { workspace: 'admin' },
    children: [
      // 成长愿景设置
      {
        path: 'vision/category',
        name: 'adminVisionCategory',
        component: VisionCategory,
        meta: { title: '愿景分类管理' }
      },
      {
        path: 'vision/standard',
        name: 'adminVisionStandard',
        component: VisionStandard,
        meta: { title: '标准管理' }
      },
      // 教师画像设置
      {
        path: 'portrait/dimension',
        name: 'adminPortraitDimension',
        component: AdminPortraitDimension,
        meta: { title: '画像维度配置' }
      },
      {
        path: 'portrait/config',
        name: 'adminPortraitConfig',
        component: AdminPortraitConfig,
        meta: { title: '画像报告文案设置' }
      },
      {
        path: 'portrait/bind',
        name: 'adminPortraitBind',
        component: AdminPortraitBind,
        meta: { title: '画像指标绑定设置' }
      },
      {
        path: 'portrait/score-type',
        name: 'adminPortraitScoreType',
        component: AdminPortraitScoreType,
        meta: { title: '分数段类型设置' }
      },
      // 同辈对标设置
      {
        path: 'peer/setting',
        name: 'adminPeerSetting',
        component: AdminPeerSetting,
        meta: { title: '同辈对标设置' }
      },
      {
        path: 'peer/dim-analysis',
        name: 'adminPeerDimAnalysis',
        component: AdminPeerDimAnalysis,
        meta: { title: '维度分析设置' }
      },
      // 队伍分析（全校）
      {
        path: 'team/overview',
        name: 'adminTeamOverview',
        component: Placeholder,
        meta: { title: '队伍全景' }
      },
      {
        path: 'team/peer',
        name: 'adminTeamPeer',
        component: AdminTeamPeerAnalysis,
        meta: { title: '同辈对标' }
      },
      // 数据与校验
      {
        path: 'data/events',
        name: 'adminDataEvents',
        component: AdminDataEvents,
        meta: { title: '发展大事件管理' }
      },
      {
        path: 'data/trial',
        name: 'adminDataTrial',
        component: AdminDataTrial,
        meta: { title: '试算与校验' }
      },
      {
        path: 'data/quality',
        name: 'adminDataQuality',
        component: AdminDataQuality,
        meta: { title: '数据质量看板' }
      },
      {
        path: 'data/report',
        name: 'adminDataReport',
        component: AdminDataReport,
        meta: { title: '报告口径' }
      },
      // AI 助手
      {
        path: 'ai/knowledge',
        name: 'adminAiKnowledge',
        component: AdminAiKnowledge,
        meta: { title: '知识库文件' }
      },
      {
        path: 'ai/prompt',
        name: 'adminAiPrompt',
        component: AdminAiPrompt,
        meta: { title: '提示词配置' }
      },
      {
        path: 'ai/parameter',
        name: 'adminAiParameter',
        component: AdminAiParameter,
        meta: { title: '参数配置' }
      },
      {
        path: 'ai/audit',
        name: 'adminAiAudit',
        component: AdminAiAudit,
        meta: { title: '对话审计与用量' }
      }
    ]
  },
  {
    path: '*',
    name: 'notFound',
    component: NotFound
  }
];

export default routes;
