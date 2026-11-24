<template>
  <!-- 我的画像 · 教师发展画像报告：左报告目录 + 右正文七段（画像总览/目标锚点/六维解析/同辈参考/同辈对比报告/AI 研判/下一步动作） -->
  <div class="growth-portrait">
    <div v-loading="loading" element-loading-text="正在拉取档案与画像数据…" class="report-layout">
      <!-- 左：报告目录（粘性锚点导航，随滚动高亮，段落开关同步隐去对应目录项） -->
      <portrait-toc :sections="frame.sections" :peer-groups="peerGroups" />

      <!-- 右：报告正文 -->
      <div class="report">
        <!-- 报告头：标题 / 档案摘要 / 我的愿景胶囊 + 右侧数据来源与拉取时点 -->
        <div class="report-head">
          <div>
            <div class="sec-eyebrow">{{ frame.eyebrow }}</div>
            <h1>{{ teacherName }} · {{ frame.title }}</h1>
            <div class="sub">{{ profile.reportSub }}</div>
            <div class="head-goal">
              <span class="gl">我的愿景：</span>
              <template v-if="myGoals.length">
                <span v-for="item in myGoals" :key="item.iconName + item.goalName" class="gc" :class="item.chipClass">
                  <i :data-lucide="item.iconName"></i>{{ item.goalName }}
                </span>
                <a class="gc plain" @click="goVision"><i data-lucide="pencil"></i>管理</a>
              </template>
              <template v-else>
                <span class="gc plain"><i data-lucide="circle-dashed"></i>尚未设置成长愿景</span>
                <a class="gc plain" @click="goVision"><i data-lucide="arrow-right"></i>去设置</a>
              </template>
            </div>
          </div>
          <div class="head-meta">
            <div><span class="src-chip"><i data-lucide="database"></i>数据源自{{ teacherName }}个人档案</span></div>
            <div style="margin-top:6px">数据拉取于 <b>{{ pullTime }}</b><br>{{ frame.headNote }}</div>
          </div>
        </div>

        <!-- 免责声明：文案取自本校「画像报告文案设置」，AI 只做文字表述，不裁决资格、不出评审结论 -->
        <div class="disclaimer">
          <i data-lucide="shield-check"></i>
          <span>
            <template v-for="(seg, index) in disclaimerSegments">
              <b v-if="seg.bold" :key="'bold-' + index">{{ seg.text }}</b>
              <span v-else :key="'plain-' + index">{{ seg.text }}</span>
            </template>
          </span>
        </div>

        <!-- 数据时点条：档案或口径有更新只提示、不自动重算，由教师点按钮重新拉取统计 -->
        <portrait-fresh-bar :pull-time="pullTime" :stale="stale" @refresh="handleRefresh" />

        <!-- ① 画像总览：球员卡形式的综合指数、荣誉徽章与六维属性条（置于报告首段） -->
        <portrait-player-card v-show="frame.sections.card" :teacher-name="teacherName" :dim-stat="dimStat" />

        <!-- ⓪ 目标锚点：对照我的愿景看差哪几项、下一步做什么（缺口与步骤取自最近成功分析结果） -->
        <portrait-goal-anchor v-show="frame.sections.goal" :goals="myGoals" :structure="analysisStructure" />

        <!-- ② 六维解析：逐维度评分项对照 + 我的水平/可比组中位 + 差距解读与下一动作 -->
        <portrait-dimensions :enabled="frame.sections.dims" />

        <!-- ③ 同辈对比：按每个同辈条件单独圈定可比组，逐组循环展示六维雷达 + 高于/持平/低于三段结论 -->
        <portrait-peer-ref :enabled="frame.sections.peer" :groups="peerGroups" />

        <!-- ③-2 同辈对比报告：汇总全部同辈组的对比结果（逐组展开六维明细）+ 总体定位收口 -->
        <portrait-peer-report :enabled="frame.sections.peerReport" :groups="peerGroups" />

        <!-- ④ AI 综合研判：结论导语 + 达标/缺口双列 + 补齐路线（全部取自最近成功分析结果） -->
        <portrait-ai-verdict :enabled="frame.sections.ai" :goals="myGoals" :structure="analysisStructure" />

        <!-- ⑤ 下一步动作：可执行入口卡（文案按最近成功分析结果生成） -->
        <portrait-next-actions :enabled="frame.sections.use" :goals="myGoals" :structure="analysisStructure" />
      </div>
    </div>
  </div>
</template>

<script>
import { store as authStore } from 'auth-layout-zw';
import { visionTeacherGoalMyList, visionAnalysisLatest, visionAnalysisStructure } from '@/api/vision';
import { peerBindList, getPeerCompareDataForTh } from '@/api/peer-setting';
import { getTeacherDataByCardId } from '@/api/archives';
import { personalProfileGetProfile, personalProfileGetDimensionStat } from '@/api/personal-profile';
import { profileShowSetGet } from '@/api/profile-show-set';
import { computedTeacher, computedFieldValue, computedNumberRangeLabel } from '@/utils/archive';
import { isNumberFieldType } from '@/constants/peer-setting';
import { fmtTime } from '@/utils/format';
import { PORTRAIT_REPORT_FRAME, PORTRAIT_TEACHER_PROFILE, parseBoldSegments } from '@/constants/growth-portrait';
import { buildProfileSlots } from '@/constants/profile-index-bind';
import PortraitFreshBar from './components/portrait-fresh-bar.vue';
import PortraitGoalAnchor from './components/portrait-goal-anchor.vue';
import PortraitPlayerCard from './components/portrait-player-card.vue';
import PortraitToc from './components/portrait-toc.vue';
import PortraitDimensions from './components/portrait-dimensions.vue';
import PortraitPeerRef from './components/portrait-peer-ref.vue';
import PortraitPeerReport from './components/portrait-peer-report.vue';
import PortraitAiVerdict from './components/portrait-ai-verdict.vue';
import PortraitNextActions from './components/portrait-next-actions.vue';

export default {
  name: 'GrowthPortrait',
  components: {
    PortraitFreshBar,
    PortraitGoalAnchor,
    PortraitPlayerCard,
    PortraitToc,
    PortraitDimensions,
    PortraitPeerRef,
    PortraitPeerReport,
    PortraitAiVerdict,
    PortraitNextActions
  },
  data() {
    return {
      // 报告表述层：内置默认文案打底，读到本校「画像报告文案设置」后覆盖标题/英文眉题/头短句/免责
      frame: { ...PORTRAIT_REPORT_FRAME, sections: { ...PORTRAIT_REPORT_FRAME.sections } },
      profile: PORTRAIT_TEACHER_PROFILE,
      // 我的愿景列表（真实接口 7.3 myList），决定报告头胶囊与目标锚点两态
      myGoals: [],
      // 最近一次成功分析记录 id 与分析详细结构（8.4 latest → 8.7 analysisStructure）：目标锚点 / AI 研判 / 下一步三段的唯一数据源
      analysisId: '',
      analysisStructure: null,
      // 同辈对比分组：可见条件逐个拆分、逐组调用对比接口取回的六维对照结果，供六维解析循环展示
      peerGroups: [],
      // 教师档案数据（构建同辈查询条件与取值展示用）
      archiveData: {},
      // 六维统计（personalProfile/getDimensionStat 的 data）：球员卡属性条与综合发展指数数据源
      dimStat: null,
      // 档案信息（personalProfile/getProfile 的 data）：{ teacherData, bindList }
      profileData: null,
      // 教师档案（teacherData.teacher 经 computedTeacher 扁平化的字段全名 → 值）
      profileArchiveData: {},
      // 画像槽位展示值（按 getProfile 的 bindList 口径算出，键为 slotCode）
      profileSlots: {},
      // 页面取数遮罩：进入页面与点「重新拉取并统计」期间统一置位
      loading: false,
      // 档案数据时点与「看的时候才统计」的基准愿景指纹：指纹变化即提示重新统计，不自动重算
      pullTime: '—',
      baseFingerprint: ''
    };
  },
  computed: {
    // 教师姓名取自鉴权 store，报告头与球员卡共用
    teacherName() {
      return authStore.getters.name || '';
    },
    // 当前愿景指纹：以目标标准 id 集合标识「档案口径」是否变化
    currentFingerprint() {
      return this.myGoals.map(item => String(item.standardId || item.goalId || item.id)).join(',');
    },
    // 过期标记：已完成过一次统计且愿景口径与基准不一致时提示重新统计
    stale() {
      return !!this.baseFingerprint && this.baseFingerprint !== this.currentFingerprint;
    },
    // 免责声明分段：本校配置支持 <b> 加粗，按段声明式渲染（避免 v-html）
    disclaimerSegments() {
      return parseBoldSegments(this.frame.disclaimer);
    }
  },
  created() {
    this.loadPortraitData();
  },
  methods: {
    /* ---------------- 页面取数 ---------------- */
    // 统一取数入口：先取报告文案与愿景（分析结构依赖愿景），再依次拉取分析结构、同辈分组与画像数据
    async loadPortraitData() {
      this.loading = true;
      // 报告文案与愿景互不依赖，并行拉取以缩短首屏等待
      await Promise.all([this.fetchReportFrame(), this.fetchMyGoals()]);
      await this.fetchAnalysisStructure();
      await this.loadPeerCompareGroups();
      await this.fetchPersonalProfile();
      this.loading = false;
    },
    /* ---------------- 报告文案取数：本校「画像报告文案设置」 ---------------- */
    // 未配置（data 为 null）或取数失败时沿用内置默认文案，只覆盖四个文案字段，段落开关仍取常量
    async fetchReportFrame() {
      try {
        const res = await profileShowSetGet();
        const record = (res && res.data) || null;
        if (!record) return;
        this.frame = {
          ...this.frame,
          title: record.reportTitle || this.frame.title,
          eyebrow: record.reportEyebrow || this.frame.eyebrow,
          headNote: record.reportHeader || this.frame.headNote,
          disclaimer: record.disclaimer || this.frame.disclaimer
        };
      } catch (err) {
        // 接口异常已由请求拦截器统一提示，报告头与免责声明回落内置默认文案
      }
    },
    /* ---------------- 球员卡取数：档案信息与六维统计 ---------------- */
    // cardId 为加密串，传空默认当前登录教师本人；六维统计回落球员卡展示，档案信息按绑定口径算成槽位值
    async fetchPersonalProfile() {
      const enc = '';
      try {
        const [profileRes, dimStatRes] = await Promise.all([
          personalProfileGetProfile({ cardId: enc, indexNameList: ['teacher_base', 'teacher_honor_2024'] }),
          personalProfileGetDimensionStat({ cardId: enc })
        ]);
        const payload = (profileRes && profileRes.data) || null;
        this.profileData = payload;
        // 档案数据与首页同口径：取 teacherData.teacher 后用 computedTeacher 拼成「teacher_指标_字段」的扁平字段名
        const teacherData = payload && payload.teacherData;
        if (teacherData && teacherData.teacher) {
          this.profileArchiveData = computedTeacher(teacherData.teacher);
        } else {
          this.profileArchiveData = {};
        }
        // 槽位口径：绑定配置在设置页调整后 getProfile 即时生效，前端不写死字段与算法
        this.profileSlots = buildProfileSlots(payload && payload.bindList, this.profileArchiveData);
        console.log('profileSlots', this.profileSlots);
        this.dimStat = (dimStatRes && dimStatRes.data) || null;
      } catch (err) {
        // 接口异常已由请求拦截器统一提示，球员卡回落静态演示数据
        this.profileData = null;
        this.profileArchiveData = {};
        this.profileSlots = {};
        this.dimStat = null;
      }
    },
    /* ---------------- 愿景取数 ---------------- */
    // 拉取我的愿景并补充胶囊展示字段（图标按分类判断：骨干称号类用星形，其余用学位帽）
    fetchMyGoals() {
      return visionTeacherGoalMyList()
        .then(res => {
          const list = (res && res.data) || [];
          this.myGoals = list.map(item => ({
            ...item,
            iconName: this.isTitleCategory(item) ? 'star' : 'graduation-cap',
            chipClass: this.isTitleCategory(item) ? 'blue' : ''
          }));
        })
        .catch(() => {
          // 接口异常已由请求拦截器统一提示，本页回落为「未设置愿景」空态
          this.myGoals = [];
        });
    },
    // 骨干称号类判定：分类名或标准名含「称号」即视为荣誉类
    isTitleCategory(item) {
      return /称号/.test((item.categoryName || '') + (item.standardName || ''));
    },
    /* ---------------- 分析结果取数：最近一次成功分析记录 → 分析详细结构 ---------------- */
    // 逐条愿景调 8.4 latest，命中第一条有分析记录的愿景即停（无愿景或全未分析返回 null）
    async fetchLatestAnalysis() {
      for (let idx = 0; idx < this.myGoals.length; idx += 1) {
        const goalId = this.myGoals[idx].id;
        if (!goalId) continue;
        try {
          const res = await visionAnalysisLatest(goalId);
          const analysis = (res && res.data) || null;
          if (analysis && (analysis.id || analysis.analysisId)) return analysis;
        } catch (err) {
          // 单条愿景取数失败不影响其余愿景（接口异常已由请求拦截器统一提示）
        }
      }
      return null;
    },
    // 分析结构取数：先用 8.4 latest 拿最近一次成功分析记录与 analysisId，再拉 8.7 全量结构
    // 无成功分析记录时置空，由目标锚点 / AI 研判 / 下一步动作三段展示「尚无分析结果」引导态
    async fetchAnalysisStructure() {
      this.analysisId = '';
      this.analysisStructure = null;
      const analysis = await this.fetchLatestAnalysis();
      const analysisId = analysis && (analysis.id || analysis.analysisId);
      if (!analysisId) return;
      this.analysisId = analysisId;
      try {
        const res = await visionAnalysisStructure(analysisId);
        this.analysisStructure = this.parseStructure(res && res.data);
      } catch (err) {
        // 接口异常已由请求拦截器统一提示，三个段落回落为「暂无分析结果」引导态
        this.analysisStructure = null;
      }
    },
    // 结构数据容错解析：后端可能返回 JSON 字符串或已序列化对象，统一转为对象
    parseStructure(raw) {
      if (!raw) return null;
      if (typeof raw === 'string') {
        try {
          return JSON.parse(raw);
        } catch (err) {
          return null;
        }
      }
      return typeof raw === 'object' ? raw : null;
    },
    /* ---------------- 同辈对比取数（拆分条件、逐组循环调用对比接口） ---------------- */
    // 拉取全部同辈条件：可见条件逐个拆分为单条件查询，隐藏条件作为固定圈定范围并入每次查询
    async loadPeerCompareGroups() {
      this.peerGroups = [];
      try {
        const [bindRes] = await Promise.all([peerBindList({ useScope: 1 }), this.fetchTeacherArchive()]);
        const list = (bindRes && bindRes.data) || [];
        const visible = list.filter(item => item.isShow === 1);
        const hideCriteria = list.filter(item => item.isShow === 2)
          .map(item => this.getCriteriaByCondition(item))
          .filter(Boolean);
        // 每个可见条件单独成组并发请求，结果按条件顺序回填
        const groups = await Promise.all(visible.map(async condition => {
          const name = condition.peerSearchLabel || condition.peerShowLabel;
          const label = this.getGroupLabel(condition);
          const selfCriteria = this.getCriteriaByCondition(condition);
          if (!selfCriteria) return this.buildEmptyGroup(name, label);
          const queryCondition = {
            conditionType: 'and',
            queryType: 'condition',
            conditions: [selfCriteria, ...hideCriteria]
          };
          try {
            const { data } = await getPeerCompareDataForTh({ queryCondition });
            const stat = (data && data.statData) || null;
            return {
              name,
              label,
              peerNum: (data && data.peerNum) || 0,
              // totalRatio 为「超过组内 X%」，无统计结果时为 null 以区分降级态
              totalRatio: stat ? (stat.totalRatio || 0) : null,
              // 综合得分与组内排名：供同辈对比报告汇总行的分位展示
              totalScore: stat ? (stat.totalScore || 0) : null,
              totalRank: stat ? (stat.totalRank || 0) : null,
              // 强弱项维度名（后端判定）与六维明细，均由同辈对比报告汇总展示
              strongDimensions: (stat && stat.strongDimensions) || [],
              weakDimensions: (stat && stat.weakDimensions) || [],
              dimensions: (stat && stat.dimensions) || []
            };
          } catch (err) {
            // 单组失败不影响其余分组展示（拦截器已统一提示）
            return this.buildEmptyGroup(name, label);
          }
        }));
        this.peerGroups = groups;
      } catch (err) {
        console.error('获取同辈对比分组失败：', err);
        this.peerGroups = [];
      }
    },
    // 单组降级结果：字段缺失或接口失败时仍保留组名与取值，报告段按「暂无统计」展示
    buildEmptyGroup(name, label) {
      return {
        name,
        label,
        peerNum: 0,
        totalRatio: null,
        totalScore: null,
        totalRank: null,
        strongDimensions: [],
        weakDimensions: [],
        dimensions: []
      };
    },
    // 调用档案接口获取当前教师档案数据（供条件取值与查询参数构建使用）
    async fetchTeacherArchive() {
      try {
        const res = await getTeacherDataByCardId({ tenantId: authStore.getters.tenantId });
        const payload = (res && res.data) || null;
        this.archiveData = payload && payload.teacher ? computedTeacher(payload.teacher) : {};
      } catch (err) {
        console.error('获取教师档案数据失败：', err);
        this.archiveData = {};
      }
    },
    // 单个同辈条件 → 后端查询条件（与同辈对标条件卡口径一致；字段缺失返回 null 由调用方过滤）
    getCriteriaByCondition(condition) {
      const field = this.$store.getters.teacherIndexFieldList.find(item => item.name === condition.indexFieldName);
      if (!field) return null;
      const index = this.$store.getters.teacherIndexList.find(item => item.code === field.indexCode);
      if (!index) return null;
      const criteria = {
        criteriaType: 'eq',
        queryType: 'criteria',
        indexName: index.name,
        indexType: 'objectform',
        fieldType: field.type,
        fieldName: field.name,
        fieldLabel: field.label
      };
      criteria.value = this.archiveData[condition.indexFieldName];
      // 数值字段按同辈配置的「开始值 + 步长」归入对应区间，而非直接展示原始值
      if (isNumberFieldType(field.type)) {
        criteria.value = computedNumberRangeLabel(criteria.value, condition.beginVal, condition.stepVal);
      }
      return criteria;
    },
    // 分组标题：条件展示名 + 当前教师该字段取值
    getGroupLabel(condition) {
      return `${condition.peerShowLabel} · ${this.getFieldValue(condition)}`;
    },
    // 取字段展示值：数值字段按区间归档，其余按字段类型格式化
    getFieldValue(condition) {
      const field = this.$store.getters.teacherIndexFieldList.find(item => item.name === condition.indexFieldName);
      if (!field) return '-';
      const rawValue = this.archiveData[condition.indexFieldName];
      if (isNumberFieldType(field.type)) {
        return computedNumberRangeLabel(rawValue, condition.beginVal, condition.stepVal);
      }
      return computedFieldValue(field, rawValue) || '-';
    },
    /* ---------------- 数据时点与重新统计 ---------------- */
    // 重新拉取并统计：重取愿景、更新时点、重置基准指纹，成功后回调子组件展示提示态
    handleRefresh(done) {
      this.loadPortraitData().then(() => {
        this.recordSnapshot();
        if (typeof done === 'function') done();
      });
    },
    // 记录本次统计基准（时点 + 愿景指纹），后续指纹变化只提示、不自动重算
    recordSnapshot() {
      this.pullTime = fmtTime(new Date());
      this.baseFingerprint = this.currentFingerprint;
    },
    /* ---------------- 页面跳转 ---------------- */
    // 报告头「管理 / 去设置」入口：跳成长愿景页维护目标
    goVision() {
      this.$router.push('/growth/vision');
    }
  }
};
</script>
