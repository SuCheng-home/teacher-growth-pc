<template>
  <el-dialog
    :visible="visible"
    width="920px"
    top="6vh"
    custom-class="admin-dialog wf-dialog"
    :close-on-click-modal="false"
    append-to-body
    @close="$emit('close')"
  >
    <div slot="title">
      <div class="dlg-eyebrow">AI WORKBENCH</div>
      <div class="dlg-title">AI 提示词工作台</div>
      <p class="dlg-desc">{{ subtitle }}</p>
    </div>

    <div v-loading="loading">
      <!-- 一、解析标准：把评比文件解析成指标 -->
      <div class="pe-fld">
        <div class="pe-fld-head">
          <h3><i data-lucide="scan-search"></i>解析标准</h3>
          <span class="wf-num">1</span>
          <span class="side">把评比文件解析成指标、再用指标对比教师档案数据</span>
        </div>
        <ai-prompt-config :system-prompt="analysisFilePrevPrompt"
          v-model="form.standardCompareFilePrompt"
          title="解析评比标准的提示词"
          placeholder="请输入解析评比标准的提示词"
          tip="驱动 AI 将评比文件解析为逐条指标（标准要求 / 标准原文 / 计分规则）。"
          :testing="fileParseTesting">
          <template #action="{ fullscreen }">
            <button class="btn sm" type="button" :disabled="fileParseTesting" @click="handleTestAnalysisFile">
              <i data-lucide="flask-conical"></i>{{ fileParseTesting ? '解析中…' : '输出解析结果' }}
            </button>
            <button v-if="!fullscreen && Object.keys(form.standardCompareContent).length" class="btn sm primary" type="button" @click="parseViewVisible = true">
              <i data-lucide="eye"></i>查看解析结果
            </button>
            <button class="btn sm primary" type="button" @click="savePrompts('standardCompareFilePrompt')">
              <i data-lucide="save"></i>保存
            </button>
          </template>
          <!-- 测试后右侧展示解析结果，左侧输入框宽度带过渡自动撑开 -->
          <parse-preview-panel v-model="parseResult"
            @save="handleSaveParseResult"
          />
        </ai-prompt-config>
        <ai-prompt-config
          ref="standardCompareConfig"
          v-model="form.standardComparePrompt"
          title="评比用户的提示词"
          placeholder="请输入评比用户的提示词"
          tip="驱动 AI 将评比标准对比用户教师档案数据。"
          :testing="standardCompareTesting">
          <template #action>
            <button class="btn sm primary" type="button" @click="openComparePreview('standardComparePrompt')">
              <i data-lucide="user-check"></i>选择模拟测试用户
            </button>
            <button class="btn sm primary" type="button" @click="savePrompts('standardComparePrompt')">
              <i data-lucide="save"></i>保存
            </button>
          </template>
          <!-- 右侧展示评比用户预览：顶部选人、下方页面预览（插槽传入规则渲染），选人后触发对比测试 -->
          <compare-user-preview-panel
            ref="standardComparePrompt"
            :loading="standardCompareTesting"
            :error="standardCompareError"
            @choose="(teacher) => handleTestCompareUser(teacher, 'standardComparePrompt')"
            @reanalyze="(teacher) => handleReanalyze(teacher, 'standardComparePrompt')"
          >
            <rule-render :data="compareResult" />
          </compare-user-preview-panel>
        </ai-prompt-config>
      </div>

      <!-- 二、逐条对比：按档案字段逐条比对 -->
      <div class="pe-fld">
        <div class="pe-fld-head">
          <h3><i data-lucide="git-compare"></i>逐条对比</h3>
          <span class="wf-num">2</span>
          <span class="side">按档案字段逐条比对</span>
        </div>
        <ai-prompt-config
          ref="itemCompareConfig"
          v-model="form.itemComparePrompt"
          title="逐条对比结果的提示词"
          placeholder="请输入逐条对比的提示词"
          tip="按「指标 ↔ 档案字段」绑定关系逐条比对，材料起始时间取「获得本级时间」。"
        >
          <template #action>
            <button class="btn sm primary" type="button" @click="openComparePreview('itemComparePrompt')">
              <i data-lucide="user-check"></i>选择模拟测试用户
            </button>
            <button class="btn sm primary" type="button" @click="savePrompts('itemComparePrompt')">
              <i data-lucide="save"></i>保存
            </button>
          </template>
          <!-- 右侧展示评比用户预览：顶部选人、下方页面预览（插槽传入逐条比对面板），选人后触发对比测试 -->
          <compare-user-preview-panel
            ref="itemComparePrompt"
            :loading="itemCompareTesting"
            :error="itemCompareError"
            @choose="(teacher) => handleTestCompareUser(teacher, 'itemComparePrompt')"
            @reanalyze="(teacher) => handleReanalyze(teacher, 'itemComparePrompt')"
          >
            <pane-cmp :structure="itemCompareResult" :loading="itemCompareLoading" />
          </compare-user-preview-panel>
        </ai-prompt-config>
      </div>

      <!-- 三、分析报告：生成个人分析报告 -->
      <div class="pe-fld">
        <div class="pe-fld-head">
          <h3><i data-lucide="file-text"></i>分析报告</h3>
          <span class="wf-num">3</span>
          <span class="side">生成个人分析报告</span>
        </div>
        <ai-prompt-config
          v-model="form.analysisReportPrompt"
          title="分析报告的提示词"
          placeholder="请输入分析报告的提示词"
          tip="基于逐条对比结果生成个人成长分析报告：逐项依据、达标/差距、材料补齐路径与整体建议。"
        >
          <template #action>
            <button class="btn sm primary" type="button" @click="savePrompts('analysisReportPrompt')">
              <i data-lucide="save"></i>保存
            </button>
          </template>
        </ai-prompt-config>
      </div>
    </div>

    <span slot="footer" class="dlg-foot">
      <span class="dlg-cnt">三类提示词全部配置后，标准状态更新为「已配置」</span>
      <el-button size="small" @click="$emit('close')">关闭</el-button>
    </span>

    <!-- 解析结果查看弹框 -->
    <el-dialog
      :visible="parseViewVisible"
      fullscreen
      custom-class="admin-dialog parse-result-dialog"
      title="解析结果预览"
      append-to-body
      @close="parseViewVisible = false"
    >
      <parse-preview-panel v-model="form.standardCompareContent"
        @save="handleSaveParseResult"/>
    </el-dialog>

  </el-dialog>
</template>

<script>
/* AI 提示词工作台：三类提示词（解析标准 / 逐条对比 / 分析报告）的查看与配置，数据自持 */
import { aiGenerate } from '@/api/common';
import { mixin } from 'auth-layout-zw';
import AiPromptConfig from '@/components/ai-prompt-config';
import RuleRender from '@/components/rule-render';
import PaneCmp from '@/views/growth-vision/components/pane-cmp';
import ParsePreviewPanel from './parse-preview-panel';
import CompareUserPreviewPanel from './compare-user-preview-panel';
import { analysisFilePrevPrompt } from '@/constants/prompt';
import { visionStandardDetail, visionStandardConfigPrompt, visionStandardUpdateCompareContent, visionAnalysisMockAnalysis, visionAnalysisGetMockResult } from '@/api/vision';

// 模拟分析结果轮询间隔（毫秒）：发起 mockAnalysis 后定时查询，直到 isFinished=true
const MOCK_ANALYSIS_POLL_INTERVAL = 2500;

export default {
  name: 'PromptWorkbenchDialog',
  components: { AiPromptConfig, RuleRender, PaneCmp, ParsePreviewPanel, CompareUserPreviewPanel },
  props: {
    visible: { type: Boolean, default: false },
    // 当前配置的标准（AiVisionStandard），依 id 拉取详情回填三类提示词
    standard: { type: Object, default: null }
  },
  data() {
    return {
      analysisFilePrevPrompt,
      loading: false,
      // 解析文件测试中：驱动解析标准区块的 loading 遮罩与按钮文案
      fileParseTesting: false,
      // 评比用户对比测试中：驱动 standardComparePrompt 面板 loading
      standardCompareTesting: false,
      // 逐条对比测试中：驱动 itemComparePrompt 面板 loading
      itemCompareTesting: false,
      // 测试解析结果数据
      parseResult: null,
      // 评比用户对比预览结果数据（规则渲染结构）
      compareResult: {},
      // 逐条比对结果结构（与 analysisStructure 同构：{ gates, scoreItems }，pane-cmp 直接消费），模拟分析回填
      itemCompareResult: null,
      // 逐条比对列表加载中标记
      itemCompareLoading: false,
      // 模拟分析失败原因（按预览面板隔离，非空时面板展示失败态）
      standardCompareError: '',
      itemCompareError: '',
      parseViewVisible: false,
      compareFile: [],
      // 模拟分析轮询定时器（按提示词字段隔离，standardComparePrompt / itemComparePrompt 各一个）
      mockTimerMap: { standardComparePrompt: null, itemComparePrompt: null },
      // 详情回拉的愿景目标 id（列表记录缺 goalId 时作为模拟分析入参回退）
      standardGoalId: '',
      // 三类提示词正文，字段名与接口 AiVisionStandard 一一对应
      form: {
        standardCompareFilePrompt: '',
        standardComparePrompt: '',
        itemComparePrompt: '',
        analysisReportPrompt: '',
        standardCompareContent: {}
      }
    };
  },
  computed: {
    // 弹框抬头副标题：分类 · 目标 · 标准名称
    subtitle() {
      const standard = this.standard || {};
      return [standard.categoryName, standard.goalName, standard.standardName].filter(Boolean).join(' · ');
    }
  },
  watch: {
    visible(val) {
      if (val) this.loadDetail();
    }
  },
  beforeDestroy() {
    // 组件销毁时清理模拟分析轮询定时器，避免离开后继续请求
    Object.keys(this.mockTimerMap).forEach(field => this.clearMockPoll(field));
  },
  methods: {
    // 测试解析文件提示词
    handleTestAnalysisFile() {
      if (!this.compareFile.length) {
        this.$message.warning('请先上传评比文件');
        return;
      }
      if (!this.form.standardCompareFilePrompt) {
        this.$message.warning('请先输入解析标准的提示词');
        return;
      }
      const files = this.compareFile.map(i => ({
        url: mixin.getDownloadUrlByAttachmentKey(i.attachmentKey),
        name: i.fileName
      }))
      this.fileParseTesting = true;
      aiGenerate({
        "files": files,
        "output_format": "json",
        "save_conversation": false,
        "stream": false,
        "system_prompt": analysisFilePrevPrompt,
        "tools": [],
        "user_input": this.form.standardCompareFilePrompt
      })
        .then(({ data }) => {
          this.parseResult = data.output;
        })
        .catch(() => {
          this.$message.error('测试解析失败，请重试');
        })
        .then(() => {
          this.fileParseTesting = false;
        });
    },
    // 点击“选择模拟测试用户”：按提示词字段定位对应的 ai-prompt-config 与预览面板，先展开全屏再唤起该面板的选人弹框
    openComparePreview(field) {
      const config = this.$refs[field.replace('Prompt', 'Config')];
      if (config) config.enterFullscreen();
      this.$nextTick(() => {
        const panel = this.$refs[field];
        if (panel) panel.openTeacherPicker();
      });
    },
    // 重新分析：先保存当前提示词，保存成功后按最新提示词重新发起模拟分析
    handleReanalyze(teacher, field) {
      this.savePrompts(field).then(() => {
        this.handleTestCompareUser(teacher, field);
      }).catch(() => {});
    },
    // 评比用户对比测试：选中模拟教师后发起模拟分析（不入库）并轮询结果回填预览
    // standardComparePrompt → analysisType 1（门槛骨架，回填 compareResult 供 rule-render）；
    // itemComparePrompt → analysisType 2（评分项骨架，回填 itemCompareResult 供 pane-cmp）
    handleTestCompareUser(teacher, field) {
      if (!teacher || !teacher.cardId) {
        this.$message.warning('未获取到模拟教师身份证号，无法发起模拟分析');
        return;
      }
      const standard = this.standard || {};
      const goalId = standard.goalId || this.standardGoalId;
      if (!standard.id || !goalId) {
        this.$message.warning('缺少愿景目标或评比标准信息，无法发起模拟分析');
        return;
      }
      const isStandardCompare = field === 'standardComparePrompt';
      const testingKey = field.replace('Prompt', 'Testing');
      const errorKey = field.replace('Prompt', 'Error');
      this.clearMockPoll(field);
      this[testingKey] = true;
      this[errorKey] = '';
      if (!isStandardCompare) this.itemCompareLoading = true;
      visionAnalysisMockAnalysis({
        goalId,
        standardId: standard.id,
        cardId: teacher.enCardId,
        analysisType: isStandardCompare ? 1 : 2
      })
        .then((res) => {
          const mockId = (res && res.data && res.data.mockId) || '';
          if (!mockId) throw new Error('未获取到模拟分析任务 ID');
          this.pollMockResult(field, mockId);
        })
        .catch((err) => {
          this[testingKey] = false;
          if (!isStandardCompare) this.itemCompareLoading = false;
          // 发起失败（目标/标准不存在、未配置骨架、类型不合法等）：拦截器已弹框，同时在面板展示失败态
          this[errorKey] = (err && (err.msg || err.message)) || '模拟分析发起失败，请检查提示词与标准配置';
        });
    },
    // 轮询模拟分析结果：isFinished 前持续轮询；status=2 回填预览、status=3 提示失败
    pollMockResult(field, mockId) {
      const isStandardCompare = field === 'standardComparePrompt';
      const testingKey = field.replace('Prompt', 'Testing');
      const errorKey = field.replace('Prompt', 'Error');
      this.mockTimerMap[field] = setTimeout(() => {
        visionAnalysisGetMockResult(mockId)
          .then((res) => {
            const data = (res && res.data) || {};
            if (!data.isFinished) {
              this.pollMockResult(field, mockId);
              return;
            }
            this[testingKey] = false;
            if (!isStandardCompare) this.itemCompareLoading = false;
            if (Number(data.status) === 2) {
              if (isStandardCompare) {
                // 类型1：mockResult 与骨架同构（gates + 空 scoreItems），rule-render 直接消费
                this.compareResult = data.mockResult || null;
              } else {
                // 类型2：mockResult 与 analysisStructure 同构（scoreItems 按 category 分组），pane-cmp 直接消费
                this.itemCompareResult = data.mockResult || null;
              }
            } else {
              // status=3 分析失败：将失败原因回写至对应预览面板展示
              this[errorKey] = data.errorMsg || '模拟分析失败，请检查提示词与标准配置';
            }
          })
          .catch(() => {
            this[testingKey] = false;
            if (!isStandardCompare) this.itemCompareLoading = false;
            this[errorKey] = '模拟分析结果查询失败，请重试';
          });
      }, MOCK_ANALYSIS_POLL_INTERVAL);
    },
    clearMockPoll(field) {
      clearTimeout(this.mockTimerMap[field]);
      this.mockTimerMap[field] = null;
    },
    // 保存解析结果骨架
    handleSaveParseResult(value) {
      if (!this.standard || !this.standard.id || !value) return;
      visionStandardUpdateCompareContent({
        id: this.standard.id,
        standardCompareContent: JSON.stringify(value)
      }).then(() => {
        this.$message.success('解析结果已保存');
        visionStandardDetail(this.standard.id).then((res) => {
          const detail = (res && res.data) || {};
          this.form.standardCompareContent = JSON.parse(detail.standardCompareContent || '{}');
        })
      }).catch(() => {});
    },
    // 打开时按标准 id 拉取详情，回填三类提示词
    loadDetail() {
      this.standardGoalId = '';
      this.form = { standardCompareFilePrompt: '', standardComparePrompt: '', itemComparePrompt: '', analysisReportPrompt: '', standardCompareContent: {} };
      if (!this.standard || !this.standard.id) return;
      this.loading = true;
      visionStandardDetail(this.standard.id).then((res) => {
        const detail = (res && res.data) || {};
        this.standardGoalId = detail.goalId || '';
        this.form.standardCompareFilePrompt = detail.standardCompareFilePrompt || '';
        this.form.standardComparePrompt = detail.standardComparePrompt || '';
        this.form.itemComparePrompt = detail.itemComparePrompt || '';
        this.form.analysisReportPrompt = detail.analysisReportPrompt || '';
        this.form.standardCompareContent = JSON.parse(detail.standardCompareContent || '{}');
        this.compareFile = JSON.parse(detail.compareFile || '[]');
        console.log('detail', this.form);
      }).catch(() => {
        // 详情加载失败保持空态可手动编辑，错误提示由请求拦截器给出
      }).then(() => {
        this.loading = false;
      });
    },
    // 单个提示词保存（返回 Promise 供“重新分析”等需保存后继续的流程链式调用）
    savePrompts(field) {
      if (!this.standard || !this.standard.id) return Promise.resolve();
      const payload = { id: this.standard.id };
      payload[field] = this.form[field];
      return visionStandardConfigPrompt(payload).then(() => {
        this.$message.success('已保存');
      })
    }
  }
};
</script>

<style scoped>
.wf-num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--hi-bg);
  color: var(--hi);
  font-size: 11px;
  font-weight: 600;
}
::v-deep .parse-result-dialog {
  border-radius: 0;
}
::v-deep .parse-result-dialog .el-dialog__body {
  height: calc(100vh - 60px);
  overflow-y: auto;
}
</style>
