<template>
  <div>
    <div class="page-heading">
      <div>
        <div class="eyebrow">AI KNOWLEDGE BASE</div>
        <h1>知识库文件</h1>
      </div>
      <div class="bar">
        <button class="btn sm" type="button" @click="syncStd"><i data-lucide="refresh-cw"></i>同步标准库</button>
        <button class="btn sm primary" type="button" @click="upload"><i data-lucide="upload"></i>上传文件</button>
      </div>
    </div>

    <div class="warn-note">
      <i data-lucide="info"></i>
      <span>本页决定 AI 助手<b>回答时引用什么</b>：文件经<b>火山模型</b>识别解析 → 切片 → 向量化入库、<b>带版本</b>；命中知识库的回答自动附「来源文件名 + 版本」。<b>下方清单直接读「标准管理」同一份标准文件表，不两处维护</b>；<b>标准待补或文件缺失的标准无法入库</b>，补齐后点「同步标准库」即可。</span>
    </div>

    <div class="card">
      <div class="card-head">
        <h2><i data-lucide="database"></i>知识库文件清单</h2>
        <span class="side">{{ srcText }}</span>
      </div>
      <div class="tbl-wrap">
        <el-table :data="rows" empty-text="暂无知识库文件">
          <el-table-column label="标准文件" min-width="200">
            <template slot-scope="{ row }">
              <div class="item">
                <b>{{ row.n }}</b>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="类别" width="110">
            <template slot-scope="{ row }">{{ row.cat }}</template>
          </el-table-column>
          <el-table-column label="级别" width="90">
            <template slot-scope="{ row }">{{ row.lv || '—' }}</template>
          </el-table-column>
          <el-table-column label="版本" width="90">
            <template slot-scope="{ row }">{{ row.ver || '—' }}</template>
          </el-table-column>
          <el-table-column label="标准状态" width="110">
            <template slot-scope="{ row }">
              <span class="tag" :class="stdTagCls(row.st)">{{ stdText(row.st) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="知识库" width="110">
            <template slot-scope="{ row }">
              <span class="tag" :class="kbTagCls(row.kb)">{{ kbText(row.kb) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="160">
            <template slot-scope="{ row, $index }">
              <div class="ops">
                <span v-if="row.locked" class="op" style="cursor:not-allowed;opacity:.5">补齐后可入库</span>
                <button v-else class="op" type="button" @click="toggle($index)">{{ row.kb === 'in' ? '移出知识库' : '纳入知识库' }}</button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="doc-note">「标准状态」取自标准管理（现行 / 待补 / 文件缺失）；「知识库」是本站是否把该文件纳入回答引用范围。<b>历史归档版本（4 份）不纳入知识库</b>——仅用于历史报告溯源，不参与现行回答。</div>
    </div>

    <div class="card">
      <div class="card-head">
        <h2><i data-lucide="settings-2"></i>入库规则</h2>
        <span class="side">演示默认值 · 上线前由校端确认</span>
      </div>
      <div class="tbl-wrap">
        <el-table :data="ruleList" :show-header="false" empty-text="暂无入库规则">
          <el-table-column width="180">
            <template slot-scope="{ row }">
              <div class="item">
                <b>{{ row.label }}</b>
              </div>
            </template>
          </el-table-column>
          <el-table-column>
            <template slot-scope="{ row }">{{ row.value }}</template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script>
import { FILES } from '../admin-data';

// 入库规则为静态展示项，迁到数据源供 el-table 渲染
const RULE_LIST = [
  { label: '可接收格式', value: 'doc / docx / pdf / txt；扫描件由火山模型 OCR 识别' },
  { label: '单文件上限', value: '20 MB' },
  { label: '切片策略', value: '按章节标题切分，单切片 500—800 字，相邻切片重叠 10%' },
  { label: '引用要求', value: '命中知识库的回答须附「来源文件名 + 版本」；未命中时按「参数配置 · 拒答策略」处理，不得编造来源' }
];

export default {
  name: 'AdminAiKnowledge',
  data() {
    return {
      list: FILES.map((f) => ({ ...f, ov: null })),
      ruleList: RULE_LIST
    };
  },
  computed: {
    rows() {
      return this.list.map((f) => {
        const base = f.st === 'cur' ? 'in' : 'wait';
        const kb = base === 'wait' ? (f.ov === 'in' ? 'in' : 'wait') : (f.ov === 'off' ? 'off' : 'in');
        return { ...f, kb, locked: base === 'wait' };
      });
    },
    srcText() {
      const cur = this.list.filter((f) => f.st === 'cur').length;
      const wait = this.list.filter((f) => f.st === 'wait').length;
      const miss = this.list.filter((f) => f.st === 'miss').length;
      const inN = this.rows.filter((r) => r.kb === 'in').length;
      return `标准文件 ${this.list.length} 份（现行 ${cur} · 待补 ${wait} · 文件缺失 ${miss}）· 已入库 ${inN} 份 · 历史归档 4 份不纳入`;
    }
  },
  methods: {
    stdTagCls(st) {
      return { cur: 'ok', wait: 'wt', miss: 'err' }[st] || 'mut';
    },
    stdText(st) {
      return { cur: '现行', wait: '待补', miss: '文件缺失' }[st] || '历史归档';
    },
    kbTagCls(kb) {
      return { in: 'ok', wait: 'wt', off: 'mut' }[kb];
    },
    kbText(kb) {
      return { in: '已入库', wait: '未入库', off: '已移除' }[kb];
    },
    toggle(i) {
      const r = this.rows[i];
      this.list[i].ov = r.kb === 'in' ? 'off' : 'in';
      this.showToast(r.kb === 'in' ? '已移出知识库「' + r.n + '」' : '已纳入知识库「' + r.n + '」· 火山模型解析切片中');
    },
    syncStd() {
      this.list.forEach((f) => { f.ov = null; });
      this.showToast('已按「标准管理」最新清单同步：人工覆盖已清除');
    },
    upload() {
      this.showToast('上传入口（演示）：支持 doc / docx / pdf / txt，单文件 ≤ 20 MB');
    },
    showToast(msg) {
      this.$message({ message: msg, duration: 2000 });
    }
  }
};
</script>
