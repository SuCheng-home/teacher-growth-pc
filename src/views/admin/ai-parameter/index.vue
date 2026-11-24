<template>
  <div>
    <div class="page-heading">
      <div>
        <div class="eyebrow">AI PARAMETERS</div>
        <h1>参数配置</h1>
      </div>
      <div class="bar">
        <button class="btn sm" type="button" @click="restoreDefault"><i data-lucide="rotate-ccw"></i>恢复默认</button>
        <button class="btn sm primary" type="button" @click="save"><i data-lucide="save"></i>保存参数</button>
      </div>
    </div>

    <div class="warn-note">
      <i data-lucide="info"></i>
      <span>本页管「<b>AI 对话行为</b>」，与「我的画像设置」管「画像文案」、「标准管理」管「标准细则」并列，互不越界。<b>模型默认火山引擎</b>；<b>不设限流阈值</b>（不计费、学校统一买单）。</span>
    </div>

    <div class="card">
      <div class="card-head">
        <h2><i data-lucide="sliders-horizontal"></i>模型与生成参数</h2>
        <span class="side">写入 sfz.aicfg</span>
      </div>
      <div class="ev-form">
        <label class="fld">
          <span>模型选择</span>
          <el-select v-model="cfg.model" style="width:100%">
            <el-option v-for="m in models" :key="m" :label="m" :value="m" />
          </el-select>
          <span class="hint">如需切换接入方式，由校端在此扩展。</span>
        </label>
        <label class="fld">
          <span>拒答策略</span>
          <el-select v-model="cfg.refuse" style="width:100%">
            <el-option v-for="r in refuseOpts" :key="r.value" :label="r.label" :value="r.value" />
          </el-select>
          <span class="hint">答不了就说答不了，不做静默降级。</span>
        </label>
        <label class="fld">
          <span>温度</span>
          <el-input-number v-model="cfg.temp" :min="0" :max="1" :step="0.1" :precision="1" controls-position="right" style="width:100%" />
          <span class="hint">解释类文字偏低，避免措辞发散。</span>
        </label>
        <label class="fld">
          <span>上下文轮数</span>
          <el-input-number v-model="cfg.ctx" :min="1" :max="20" :step="1" controls-position="right" style="width:100%" />
          <span class="hint">与教师端组件一致：最近 8 轮。</span>
        </label>
        <label class="fld">
          <span>单次输出 token 上限</span>
          <el-input-number v-model="cfg.max" :min="128" :max="4096" :step="128" controls-position="right" style="width:100%" />
        </label>
        <label class="fld">
          <span>RAG 检索 top-k</span>
          <el-input-number v-model="cfg.topk" :min="1" :max="20" :step="1" controls-position="right" style="width:100%" />
          <span class="hint">知识库每次检索返回的切片条数。</span>
        </label>
      </div>
    </div>

    <div class="card">
      <div class="card-head">
        <h2><i data-lucide="file-json"></i>当前参数取值</h2>
        <span class="side">写入 sfz.aicfg</span>
      </div>
      <div class="tbl-wrap">
        <el-table :data="preview" empty-text="暂无参数">
          <el-table-column label="字段" min-width="200">
            <template slot-scope="{ row }">
              <div class="item">
                <b>{{ row.k }}</b>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="当前取值" min-width="240">
            <template slot-scope="{ row }">
              <span class="mono">{{ row.v }}</span>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="doc-note">限制类口径固定，<b>不在本页修改</b>：<b>不设限流阈值</b>、<b>不计费</b>（学校统一买单）、不做按人 / 按角色分摊。用量仅用于观测与异常告警，见「对话审计与用量」。</div>
    </div>
  </div>
</template>

<script>
import { AP_DEF, AP_REFUSE } from '../admin-data';

export default {
  name: 'AdminAiParameter',
  data() {
    return {
      models: ['火山引擎（默认）'],
      refuseOpts: [
        { value: 'strict', label: '严格：无命中即明确拒答并给替代路径（默认）' },
        { value: 'soft', label: '宽松：允许通用知识作答，须标注「非本平台口径」' },
        { value: 'off', label: '不拒答（不推荐）' }
      ],
      saved: { ...AP_DEF },
      cfg: { ...AP_DEF }
    };
  },
  computed: {
    preview() {
      return [
        { k: 'model 模型', v: this.saved.model },
        { k: 'refuse 拒答策略', v: AP_REFUSE[this.saved.refuse] },
        { k: 'temperature 温度', v: this.saved.temp },
        { k: 'contextRounds 上下文轮数', v: this.saved.ctx },
        { k: 'maxTokens 单次输出上限', v: this.saved.max },
        { k: 'ragTopK 检索 top-k', v: this.saved.topk }
      ];
    }
  },
  methods: {
    save() {
      this.saved = { ...this.cfg };
      this.showToast('已保存参数（写入 sfz.aicfg）· 教师端助手下次对话即生效');
    },
    restoreDefault() {
      this.cfg = { ...AP_DEF };
      this.showToast('已恢复默认参数（未保存，点「保存参数」写入生效）');
    },
    showToast(msg) {
      this.$message({ message: msg, duration: 2000 });
    }
  }
};
</script>
