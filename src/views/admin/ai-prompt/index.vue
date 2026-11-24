<template>
  <div>
    <div class="page-heading">
      <div>
        <div class="eyebrow">AI PROMPTS</div>
        <h1>提示词配置</h1>
      </div>
      <div class="bar">
        <button class="btn sm" type="button" @click="resetText"><i data-lucide="rotate-ccw"></i>还原正文</button>
      </div>
    </div>

    <div class="warn-note">
      <i data-lucide="info"></i>
      <span><b>分工</b>：本页管「<b>AI 对话行为</b>」；「我的画像设置」管「画像文案」，「标准管理」管「标准细则」，三者并列、<b>互不越界</b>。四类提示词各自可配、可版本化、可回滚；提示词只影响文字表达与参数抽取，<b>不参与算分、不裁决资格</b>。</span>
    </div>

    <div class="card">
      <div class="card-head">
        <h2><i data-lucide="braces"></i>四类提示词</h2>
        <span class="side">点「配置」在下方编辑</span>
      </div>
      <div class="tbl-wrap">
        <el-table
          :data="list"
          :row-class-name="rowClassName"
          empty-text="暂无提示词配置"
        >
          <el-table-column label="提示词" min-width="160">
            <template slot-scope="{ row }">
              <div class="item">
                <b>{{ row.n }}</b>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="作用" min-width="260">
            <template slot-scope="{ row }">{{ row.use }}</template>
          </el-table-column>
          <el-table-column label="当前版本" width="110">
            <template slot-scope="{ row }">
              <span class="mono">{{ row.ver }}</span>
            </template>
          </el-table-column>
          <el-table-column label="最近更新" width="150">
            <template slot-scope="{ row }">
              <span class="mono">{{ row.at }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100">
            <template slot-scope="{ $index }">
              <div class="ops">
                <button class="op" type="button" @click="pick($index)">配置</button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <div class="card">
      <div class="card-head">
        <h2><i data-lucide="pencil-line"></i>编辑 · <span>{{ curPrompt ? curPrompt.n : '—' }}</span></h2>
        <span class="side">{{ curPrompt ? ('当前 ' + curPrompt.ver + ' · 最近更新 ' + curPrompt.at) : '—' }}</span>
      </div>
      <div class="ev-form">
        <label class="fld wide">
          <span>提示词正文</span>
          <el-input v-model="editText" type="textarea" :rows="12" resize="none" spellcheck="false" />
          <span class="hint">{{ curPrompt ? curPrompt.hint : '—' }}</span>
        </label>
      </div>
      <div class="bar" style="margin-top:14px;justify-content:flex-end">
        <button class="btn sm" type="button" @click="revert"><i data-lucide="history"></i>回滚上一版本</button>
        <button class="btn sm primary" type="button" @click="save"><i data-lucide="save"></i>保存为新版本</button>
      </div>
    </div>
  </div>
</template>

<script>
import { AI_PROMPTS } from '../admin-data';

export default {
  name: 'AdminAiPrompt',
  data() {
    return {
      list: AI_PROMPTS.map((p) => ({ ...p })),
      cur: 0,
      editText: AI_PROMPTS[0].text
    };
  },
  computed: {
    curPrompt() {
      return this.list[this.cur];
    }
  },
  methods: {
    // 选中行沿用原生表格的 std-sel 高亮
    rowClassName({ rowIndex }) {
      return this.cur === rowIndex ? 'std-sel' : '';
    },
    pick(i) {
      this.cur = i;
      this.editText = this.list[i].text;
      this.showToast('已载入「' + this.list[i].n + '」');
    },
    resetText() {
      if (this.curPrompt) this.editText = this.curPrompt.text;
      this.showToast('已将编辑框还原为当前版本正文（' + (this.curPrompt ? this.curPrompt.ver : '') + '）');
    },
    save() {
      const p = this.curPrompt;
      if (!p) return;
      const v = String(this.editText).trim();
      if (!v) { this.showToast('提示词正文不能为空'); return; }
      if (v === p.text) { this.showToast('内容没有变化，未生成新版本'); return; }
      const n = parseFloat(p.ver.replace('v', '')) + 0.1;
      p.text = this.editText;
      p.ver = 'v' + n.toFixed(1);
      p.at = this.now();
      this.showToast('已保存「' + p.n + '」 ' + p.ver + ' · 历史版本仍可回滚');
    },
    revert() {
      this.showToast('回滚需先在版本历史中选择目标版本（演示：当前为 ' + (this.curPrompt ? this.curPrompt.ver : '') + '）');
    },
    now() {
      const d = new Date();
      const p = (x) => (x < 10 ? '0' + x : '' + x);
      return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) + ' ' + p(d.getHours()) + ':' + p(d.getMinutes());
    },
    showToast(msg) {
      this.$message({ message: msg, duration: 2000 });
    }
  }
};
</script>
