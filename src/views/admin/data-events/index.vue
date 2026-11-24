<template>
  <div>
    <div class="page-heading">
      <div>
        <div class="eyebrow">DEVELOPMENT EVENTS</div>
        <h1>发展大事件管理</h1>
      </div>
      <div class="bar">
        <button class="btn sm primary" type="button" @click="openCreate"><i data-lucide="plus"></i>发布大事件</button>
      </div>
    </div>

    <div class="warn-note">
      <i data-lucide="info"></i>
      <span>此处发布的条目，与教师端首页「<b>学校教师发展大事件</b>」同源。状态不再手工标注，一律由「<b>开始 / 结束时间</b>」自动判定：结束时间早于当前＝<b>已结束</b>（灰色置底显示）、处于时间区间内＝<b>进行中</b>、开始时间晚于当前＝<b>未开始</b>。</span>
    </div>

    <div class="card">
      <div class="card-head">
        <h2><i data-lucide="list"></i>大事件列表</h2>
        <span class="side">{{ countText }}</span>
      </div>
      <div class="card-sub">按开始时间先后排列，教师端首页取用同一份数据；已结束的条目在教师端呈灰色。</div>
      <div class="tbl-wrap">
        <el-table
          v-loading="loading"
          :data="list"
          :row-class-name="rowClassName"
          empty-text="暂无大事件"
        >
          <el-table-column label="#" width="70">
            <template slot-scope="{ $index }">
              <span class="de-no">{{ (page.currentPage - 1) * page.pageSize + $index + 1 }}</span>
            </template>
          </el-table-column>
          <el-table-column label="大事件标题" min-width="260">
            <template slot-scope="{ row }">
              <div class="item"><b>{{ row.title }}</b></div>
            </template>
          </el-table-column>
          <el-table-column label="时间" width="180">
            <template slot-scope="{ row }"><span class="de-num">{{ timeText(row) }}</span></template>
          </el-table-column>
          <el-table-column label="所属分类" width="150">
            <template slot-scope="{ row }"><span class="tag mut">{{ row.categoryName || '—' }}</span></template>
          </el-table-column>
          <el-table-column label="所属学年" width="120">
            <template slot-scope="{ row }"><span class="de-year">{{ row.termYear || '—' }}</span></template>
          </el-table-column>
          <el-table-column label="状态" width="100">
            <template slot-scope="{ row }">
              <span class="tag" :class="stateTagCls(row.status)">{{ stateText(row.status) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="130" fixed="right">
            <template slot-scope="{ row }">
              <div class="ops">
                <button class="op" type="button" @click="openEdit(row)">编辑</button>
                <button class="op" type="button" @click="del(row)">删除</button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div v-if="total > page.pageSize" class="card-foot">
        <el-pagination
          small
          layout="prev, pager, next"
          :current-page="page.currentPage"
          :page-size="page.pageSize"
          :total="total"
          @current-change="handlePageChange"
        />
      </div>
    </div>

    <!-- 发布 / 编辑大事件：el-dialog -->
    <el-dialog
      :visible.sync="modal.visible"
      width="850px"
      top="8vh"
      custom-class="admin-dialog"
      :close-on-click-modal="false"
      append-to-body
    >
      <div slot="title">
        <div class="dlg-eyebrow">{{ modal.isEdit ? 'EDIT EVENT' : 'NEW EVENT' }}</div>
        <div class="dlg-title">{{ modal.isEdit ? '编辑大事件' : '发布大事件' }}</div>
      </div>
      <p class="dlg-desc">发布后与教师端首页「学校教师发展大事件」同源。状态由「开始 / 结束时间」自动判定：结束时间早于当前＝已结束（灰色置底显示）、处于区间内＝进行中、开始时间晚于当前＝未开始。</p>
      <el-form ref="evForm" :model="form" :rules="rules" label-position="top" size="small">
        <el-form-item label="大事件标题" prop="title">
          <el-input v-model="form.title" placeholder="如：市优秀青年教师评选工作" />
        </el-form-item>
        <el-form-item label="时间范围" prop="timeRange">
          <el-date-picker
            v-model="form.timeRange"
            type="datetimerange"
            value-format="yyyy-MM-dd HH:mm:ss"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            style="width:100%"
          />
        </el-form-item>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="所属分类" prop="categoryCode">
              <el-select v-model="form.categoryCode" style="width:100%" placeholder="请选择分类">
                <el-option v-for="c in categories" :key="c.code" :label="c.name" :value="c.code" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="所属学年" prop="termCode">
              <el-select v-model="form.termCode" style="width:100%" placeholder="请选择学年">
                <el-option v-for="y in years" :key="y.code" :label="y.name" :value="y.code" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="内容说明（选填）">
          <RichTextEditor v-model="form.content" :min-height="400" placeholder="填写事件说明，教师端点击标题可弹窗查看" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dlg-foot">
        <span class="dlg-cnt">带 * 为必填</span>
        <el-button size="small" @click="close">取消</el-button>
        <el-button size="small" type="primary" :loading="saving" @click="save">{{ modal.isEdit ? '保存修改' : '发布大事件' }}</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
// 事件分类字典常量 ID
const EVENT_CATEGORY_CONSTANT_ID = '113701';
// 状态：后端自动计算，1=已结束，2=进行中，3=未开始
const STATUS_TEXT = { 1: '已结束', 2: '进行中', 3: '未开始' };
const STATUS_TAG_CLS = { 1: 'mut', 2: 'ok', 3: 'bl' };

import RichTextEditor from 'auth-zw-components/vue/RichTextEditor';
import { getDictList, getYearList } from '@/api/common';
import { eventSave, eventDelete, eventPageList } from '@/api/event';

export default {
  name: 'AdminDataEvents',
  components: {
    RichTextEditor
  },
  data() {
    return {
      list: [],
      total: 0,
      loading: false,
      saving: false,
      page: { currentPage: 1, pageSize: 10 },
      categories: [],
      years: [],
      modal: { visible: false, isEdit: false },
      form: this.emptyForm(),
      rules: {
        title: [{ required: true, whitespace: true, message: '请填写大事件标题', trigger: 'blur' }],
        timeRange: [{
          validator: (rule, value, callback) => {
            if (!value || !value.length || !value[0]) callback(new Error('请选择时间范围'));
            else callback();
          },
          trigger: 'change'
        }],
        categoryCode: [{ required: true, message: '请选择所属分类', trigger: 'change' }],
        termCode: [{ required: true, message: '请选择所属学年', trigger: 'change' }]
      }
    };
  },
  computed: {
    countText() {
      return `共 ${this.total} 条`;
    }
  },
  created() {
    this.loadCategories();
    this.loadYears();
    this.loadList();
  },
  methods: {
    emptyForm() {
      return { id: '', title: '', timeRange: [], categoryCode: '', termCode: '', content: '' };
    },
    // 字典 / 学年项字段兼容：编码
    pickCode(item) {
      return item.code ?? item.value ?? item.dictCode ?? item.termCode ?? item.constantValue ?? '';
    },
    // 字典 / 学年项字段兼容：名称
    pickName(item) {
      return item.name ?? item.label ?? item.dictName ?? item.termYear ?? item.categoryName ?? '';
    },
    loadCategories() {
      getDictList(EVENT_CATEGORY_CONSTANT_ID).then((res) => {
        const arr = (res && res.data) || [];
        this.categories = arr.map((it) => ({ code: this.pickCode(it), name: this.pickName(it) }));
      }).catch(() => {});
    },
    loadYears() {
      getYearList().then((res) => {
        const arr = (res && res.data) || [];
        this.years = arr.map((it) => ({ code: this.pickCode(it), name: this.pickName(it) }));
      }).catch(() => {});
    },
    loadList() {
      this.loading = true;
      const params = { currentPage: this.page.currentPage, pageSize: this.page.pageSize };
      eventPageList(params).then((res) => {
        const data = (res && res.data) || {};
        this.list = data.records || [];
        this.total = data.total || 0;
      }).catch(() => {}).then(() => {
        this.loading = false;
      });
    },
    handlePageChange(cur) {
      this.page.currentPage = cur;
      this.loadList();
    },
    timeText(e) {
      const fmt = (s) => (s ? String(s).slice(0, 10) : '');
      const start = fmt(e.eventStartTime);
      const end = fmt(e.eventEndTime);
      if (start && end) return start + ' ~ ' + end;
      return start || end || '—';
    },
    stateText(status) {
      return STATUS_TEXT[status] || '—';
    },
    stateTagCls(status) {
      return STATUS_TAG_CLS[status] || 'mut';
    },
    /* 已结束的大事件整行置灰，与教师端首页展示一致 */
    rowClassName({ row }) {
      return row.status === 1 ? 'de-done' : '';
    },
    /* 列表预览：富文本去标签取纯文本摘要 */
    plainText(html) {
      return String(html || '').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim();
    },
    /* 保存归一：wangEditor 空内容回传 <p><br></p>，视同未填存空串 */
    normalizeContent(html) {
      const text = this.plainText(html);
      return text ? String(html || '').trim() : '';
    },
    openCreate() {
      this.modal.isEdit = false;
      this.form = this.emptyForm();
      this.modal.visible = true;
      this.resetValidate();
    },
    openEdit(row) {
      this.modal.isEdit = true;
      this.form = {
        id: row.id,
        title: row.title || '',
        timeRange: row.eventStartTime ? [row.eventStartTime, row.eventEndTime || ''] : [],
        categoryCode: row.categoryCode || '',
        termCode: row.termCode || '',
        content: row.content || ''
      };
      this.modal.visible = true;
      this.resetValidate();
    },
    resetValidate() {
      this.$nextTick(() => {
        if (this.$refs.evForm) this.$refs.evForm.clearValidate();
      });
    },
    close() {
      this.modal.visible = false;
    },
    save() {
      this.$refs.evForm.validate((valid) => {
        if (!valid) return;
        const range = this.form.timeRange || [];
        const cat = this.categories.find((c) => c.code === this.form.categoryCode) || {};
        const yr = this.years.find((y) => y.code === this.form.termCode) || {};
        const payload = {
          title: String(this.form.title).trim(),
          eventStartTime: range[0] || '',
          eventEndTime: range[1] || '',
          categoryCode: this.form.categoryCode,
          categoryName: cat.name || '',
          termCode: this.form.termCode,
          termYear: yr.name || '',
          content: this.normalizeContent(this.form.content)
        };
        if (this.form.id) payload.id = this.form.id;
        this.saving = true;
        eventSave(payload).then(() => {
          this.showToast(this.modal.isEdit ? '已保存修改' : '已发布大事件 · 教师端首页同步显示');
          this.close();
          this.loadList();
        }).catch(() => {}).then(() => {
          this.saving = false;
        });
      });
    },
    del(row) {
      if (!window.confirm('删除大事件「' + row.title + '」？')) return;
      eventDelete(row.id).then(() => {
        this.showToast('已删除大事件');
        this.loadList();
      }).catch(() => {});
    },
    showToast(msg) {
      this.$message({ message: msg, duration: 2000 });
    }
  }
};
</script>

<style scoped>
.card-foot {
  display: flex;
  justify-content: flex-end;
  margin-top: 14px;
}

.de-no {
  color: var(--faint);
}

.de-num {
  font-variant-numeric: tabular-nums;
}

.de-year {
  font-size: 11.5px;
}

/* 已结束条目置灰（原 table.t tr.done 的 el-table 等价实现） */
::v-deep .el-table__row.de-done td {
  color: #9aa59c;
}

::v-deep .el-table__row.de-done .item b {
  color: #8a978f;
}
</style>
