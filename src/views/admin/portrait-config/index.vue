<template>
  <div>
    <div class="page-heading">
      <div>
        <div class="eyebrow">PORTRAIT SETTINGS</div>
        <h1>我的画像设置</h1>
      </div>
      <div class="bar">
        <button class="btn sm" type="button" :disabled="loading || saving" @click="reset"><i data-lucide="rotate-ccw"></i>恢复默认</button>
        <button class="btn sm primary" type="button" :disabled="loading || saving" @click="save"><i data-lucide="save"></i>{{ saving ? '保存中…' : '保存配置' }}</button>
      </div>
    </div>

    <div class="warn-note">
      <i data-lucide="info"></i>
      <span>本页决定教师端「<b>我的画像</b>」报告的<b>表述层</b>：报告标题、英文眉题、报告头短句与免责声明。文案<b>每校一行</b>，按学校（unitCode + tenantId）隔离 —— 本校从未配置过时接口返回 <span class="pe-key">null</span>，页面按内置默认文案展示；保存即按本校配置新建或覆盖，画像页刷新后按新文案渲染。</span>
    </div>

    <div v-loading="loading" class="card">
      <div class="card-head">
        <h2><i data-lucide="layout-template"></i>报告骨架与免责</h2>
        <span class="side">{{ configSideText }}</span>
      </div>
      <div class="ev-form pt-grid">
        <label class="fld"><span>报告标题</span><el-input v-model="form.reportTitle" /></label>
        <label class="fld"><span>报告英文眉题</span><el-input v-model="form.reportEyebrow" /></label>
        <label class="fld wide"><span>报告头短句</span><el-input v-model="form.reportHeader" /></label>
        <label class="fld wide"><span>免责声明全文（支持 &lt;b&gt; 加粗）</span><el-input v-model="form.disclaimer" type="textarea" :rows="6" resize="none" /></label>
      </div>
      <div class="warn-note" style="margin:14px 0 0">
        <i data-lucide="triangle-alert"></i>
        <span><b>红线</b>：免责声明须写明「AI 不裁决资格、不修改分值、不出具评审结论」；短句与免责不得出现结论性判定词（如「符合申报条件」「通过评审」），保存时校验（对齐需求文档 3.11.4）。</span>
      </div>
    </div>

    <!--
      以下 ① 数据口径 / ③ 段落显示 / ④ 保存结果预览 三块暂不接入：
      画像报告文案接口（/teacherDevelop/aiAnalysis/profileShowSet）当前只覆盖四个文案字段，
      且接口无「恢复默认」端点（恢复默认仅回填表单、由保存接口覆盖）。
      待对应接口补齐后放开以下注释即可恢复；原 ①③④ 的本地原型逻辑
      （PTCFG_SECS / PTCFG_DEF 派生计分档案域、段落开关、sfz.pcfg 预览）
      可从 admin-data.js 的同名导出重建。
    -->

    <!-- ① 数据口径 -->
    <!--
    <div class="card">
      <div class="card-head">
        <h2><i data-lucide="database"></i>① 数据口径</h2>
        <span class="side">统计范围与口径标注</span>
      </div>
      <div class="ev-form pt-grid">
        <label class="fld wide"><span>计分档案域范围（只读 · 派生值）</span><input class="pt-ro" type="text" readonly :value="scopeText" :title="scopeTitle"></label>
        <label class="fld">
          <span>默认时间窗（写入时点条口径）</span>
          <el-select v-model="cfg.data.window" style="width:100%">
            <el-option label="近三年" value="3y" />
            <el-option label="近五年" value="5y" />
            <el-option label="全量历史" value="all" />
          </el-select>
        </label>
        <label class="fld">
          <span>时点条展示</span>
          <el-select v-model="cfg.data.showFresh" style="width:100%">
            <el-option label="显示（档案时点 / 计分口径 / 重新统计）" :value="true" />
            <el-option label="隐藏" :value="false" />
          </el-select>
        </label>
      </div>
      <div class="warn-note" style="margin:14px 0 0">
        <i data-lucide="info"></i>
        <span>计分档案域为<b>只读派生值</b> —— 它由「画像维度配置 ① 维度与档案域」的并集决定，改那里即可，不在本页重复配置（对齐需求文档 3.10.2 / 3.11.2）。</span>
      </div>
    </div>
    -->

    <!-- ③ 段落显示 -->
    <!--
    <div class="card">
      <div class="card-head">
        <h2><i data-lucide="eye"></i>③ 段落显示</h2>
        <span class="side">画像页 7 段</span>
      </div>
      <div class="pt-secs-wrap">
        <div class="pe-blocks">
          <button v-for="b in secs" :key="b.k" class="pe-switch" :class="{ on: cfg.frame.sections[b.k] }" type="button" @click="toggleSec(b.k)">
            <span class="tick"></span>{{ b.n }}
          </button>
        </div>
        <div class="pt-secs-note">关掉的段落同时从画像页左侧报告目录中隐去；全部关掉时画像页正文为空，请至少保留一段。</div>
      </div>
    </div>
    -->

    <!-- ④ 保存结果预览 -->
    <!--
    <div class="card">
      <div class="card-head">
        <h2><i data-lucide="file-json"></i>④ 保存结果预览</h2>
        <span class="side">写入 sfz.pcfg</span>
      </div>
      <div class="tbl-wrap">
        <el-table :data="preview" empty-text="暂无配置项">
          <el-table-column label="字段" min-width="200">
            <template slot-scope="{ row }">
              <div class="item">
                <b>{{ row.k }}</b>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="当前取值" min-width="240">
            <template slot-scope="{ row }">{{ row.v }}</template>
          </el-table-column>
        </el-table>
      </div>
    </div>
    -->
  </div>
</template>

<script>
import { profileShowSetGet, profileShowSetSave } from '@/api/profile-show-set';
import {
  PROFILE_SHOW_SET_DEFAULT,
  PROFILE_SHOW_REQUIRED_WORDS,
  PROFILE_SHOW_FORBIDDEN_WORDS
} from '@/constants/profile-show-set';

// 表单兜底文案：接口未配置（data 为 null）或字段为空时按内置默认文案打底
function buildDefaultForm() {
  return {
    reportTitle: PROFILE_SHOW_SET_DEFAULT.reportTitle,
    reportEyebrow: PROFILE_SHOW_SET_DEFAULT.reportEyebrow,
    reportHeader: PROFILE_SHOW_SET_DEFAULT.reportHeader,
    disclaimer: PROFILE_SHOW_SET_DEFAULT.disclaimer
  };
}

export default {
  name: 'AdminPortraitConfig',
  data() {
    return {
      loading: false,
      saving: false,
      // 最近一次读到 / 保存返回的完整配置；null 表示本校尚未配置
      record: null,
      form: buildDefaultForm()
    };
  },
  computed: {
    configSideText() {
      if (this.loading) return '正在读取本校文案…';
      if (!this.record) return '本校尚未配置 · 当前为内置默认文案';
      return (this.record.unitName || '本校') + ' · 已配置';
    }
  },
  created() {
    this.loadConfig();
  },
  methods: {
    // 查询本校文案：未配置过时 data 为 null，回落内置默认文案
    async loadConfig() {
      this.loading = true;
      try {
        const res = await profileShowSetGet();
        const record = (res && res.data) || null;
        this.record = record;
        this.form = record ? this.toForm(record) : buildDefaultForm();
      } catch (err) {
        // 错误提示由请求拦截器统一给出；读取失败时按默认文案展示，不改动后端数据
        this.record = null;
        this.form = buildDefaultForm();
      } finally {
        this.loading = false;
      }
    },
    // 接口字段为 null / 空串时回落默认文案，避免输入框拿到非字符串
    toForm(record) {
      const form = buildDefaultForm();
      Object.keys(form).forEach((key) => {
        if (record[key]) form[key] = record[key];
      });
      return form;
    },
    // 恢复内置默认：只回填表单，需点「保存配置」才写入本校配置
    reset() {
      this.form = buildDefaultForm();
      this.showToast('已回填内置默认文案，点「保存配置」后生效', 'warning');
    },
    // 红线校验：免责声明须含免责表述，且短句与免责不得含结论性判定词
    validateForm() {
      if (!this.form.reportTitle.trim()) return '报告标题不能为空';
      if (!this.form.reportEyebrow.trim()) return '报告英文眉题不能为空';
      if (!this.form.reportHeader.trim()) return '报告头短句不能为空';
      if (!this.form.disclaimer.trim()) return '免责声明不能为空';
      const missing = PROFILE_SHOW_REQUIRED_WORDS.filter((word) => this.form.disclaimer.indexOf(word) < 0);
      if (missing.length) return '免责声明须含「' + missing.join('」「') + '」，否则不得保存';
      const forbidden = PROFILE_SHOW_FORBIDDEN_WORDS.filter((word) => (this.form.reportHeader + this.form.disclaimer).indexOf(word) > -1);
      if (forbidden.length) return '报告头短句 / 免责声明不得含结论性判定词「' + forbidden.join('」「') + '」';
      return '';
    },
    // 保存（upsert）：只提交四个文案字段，学校/区/组织/租户由后端处理
    async save() {
      const errorText = this.validateForm();
      if (errorText) {
        this.showToast(errorText, 'warning');
        return;
      }
      const payload = {
        reportTitle: this.form.reportTitle.trim(),
        reportEyebrow: this.form.reportEyebrow.trim(),
        reportHeader: this.form.reportHeader.trim(),
        disclaimer: this.form.disclaimer.trim()
      };
      this.saving = true;
      try {
        const res = await profileShowSetSave(payload);
        const savedRecord = (res && res.data) || null;
        // 以接口返回的完整对象回填；未返回时用本次提交的四字段兜底
        this.record = savedRecord || Object.assign({}, this.record, payload);
        this.form = savedRecord ? this.toForm(savedRecord) : payload;
        this.showToast('已保存本校画像报告文案', 'success');
      } catch (err) {
        // 保存失败保持表单可编辑，错误提示由请求拦截器给出
      } finally {
        this.saving = false;
      }
    },
    showToast(message, type = 'success') {
      this.$message({ message, type, duration: 2000 });
    }
  }
};
</script>
