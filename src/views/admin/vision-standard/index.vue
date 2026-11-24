<template>
  <div>
    <div class="page-heading">
      <div>
        <div class="eyebrow">STANDARD MANAGEMENT</div>
        <h1>标准管理</h1>
      </div>
      <div class="bar">
        <button class="btn sm primary" type="button" @click="openCreate"><i data-lucide="plus"></i>新建标准</button>
      </div>
    </div>

    <div class="warn-note">
      <i data-lucide="info"></i>
      <span>每条标准 = <b>分类 + 目标 + 评比文件</b>。点「配置」进入 AI 提示词工作台，生成「解析标准 / 逐条对比 / 分析报告」三类提示词，教师端成长愿景据此做逐条对比与报告。<b>评比文件为空的条目显示「标准待补」。</b></span>
    </div>

    <div class="card">
      <div class="card-head">
        <h2><i data-lucide="list"></i>标准列表</h2>
        <span class="side">共 {{ standardList.length }} 条 · 待补 {{ waitCount }} 条</span>
      </div>
      <div class="tbl-wrap">
        <el-table v-loading="loading" :data="standardList" empty-text="暂无标准">
          <el-table-column label="分类" width="110">
            <template slot-scope="{ row }">
              <span class="src src-A">{{ row.categoryName }}</span>
            </template>
          </el-table-column>
          <el-table-column label="目标" min-width="140">
            <template slot-scope="{ row }">
              <b>{{ row.goalName }}</b>
            </template>
          </el-table-column>
          <el-table-column label="标准名称" min-width="180">
            <template slot-scope="{ row }">
              <div class="item">
                <b>{{ row.standardName }}</b>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="文件（评比 / 附件）" min-width="200">
            <template slot-scope="{ row }">
              <span v-if="row.compareFile" class="std-file">评比：{{ fileNames(row.compareFile) }}</span>
              <span v-else class="tag mut">评比未上传</span>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="100">
            <template slot-scope="{ row }">
              <span class="tag" :class="statusTagCls(row.status)">{{ statusText(row.status) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="启用" width="100">
            <template slot-scope="{ row }">
              <span class="tag" :class="enableTagCls(row.isEnable)">{{ enableText(row.isEnable) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="180">
            <template slot-scope="{ row }">
              <div class="ops">
                <button class="op" type="button" @click="openConfig(row)">配置</button>
                <button class="op" type="button" @click="openEdit(row)">编辑</button>
                <button class="op" type="button" @click="removeStandard(row)">删除</button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <standard-edit-dialog
      :visible="dialog.visible"
      :record="dialog.record"
      @close="dialog.visible = false"
      @saved="loadStandardList"
    />

    <prompt-workbench-dialog
      :visible="workbench.visible"
      :standard="workbench.standard"
      @close="workbench.visible = false"
      @saved="loadStandardList"
    />
  </div>
</template>

<script>
import StandardEditDialog from './components/standard-edit-dialog.vue';
import PromptWorkbenchDialog from './components/prompt-workbench-dialog.vue';
import { visionStandardList, visionStandardDelete } from '@/api/vision';
import { STANDARD_STATUS, STANDARD_STATUS_TAG_CLS, STANDARD_STATUS_TEXT, STANDARD_ENABLE, STANDARD_ENABLE_TAG_CLS, STANDARD_ENABLE_TEXT } from '@/constants/vision-standard';

export default {
  name: 'VisionStandard',
  components: { StandardEditDialog, PromptWorkbenchDialog },
  data() {
    return {
      // 标准列表：[AiVisionStandard]
      standardList: [],
      loading: false,
      dialog: { visible: false, record: null },
      // AI 提示词工作台弹框显隐与当前配置的标准
      workbench: { visible: false, standard: null }
    };
  },
  computed: {
    // 待补条数：评比文件为空（status=2）的标准数量
    waitCount() {
      return this.standardList.filter((standard) => Number(standard.status) === STANDARD_STATUS.WAIT_FILE).length;
    }
  },
  created() {
    this.loadStandardList();
  },
  methods: {
    loadStandardList() {
      this.loading = true;
      visionStandardList().then((res) => {
        this.standardList = (res && res.data) || [];
      }).catch(() => {
        this.standardList = [];
      }).then(() => {
        this.loading = false;
      });
    },
    statusText(status) {
      return STANDARD_STATUS_TEXT[Number(status)] || STANDARD_STATUS_TEXT[STANDARD_STATUS.WAIT_FILE];
    },
    statusTagCls(status) {
      return STANDARD_STATUS_TAG_CLS[Number(status)] || STANDARD_STATUS_TAG_CLS[STANDARD_STATUS.WAIT_FILE];
    },
    // 启用状态文案：历史数据未返回 isEnable 时按启用显示
    enableText(isEnable) {
      return STANDARD_ENABLE_TEXT[Number(isEnable)] || STANDARD_ENABLE_TEXT[STANDARD_ENABLE.YES];
    },
    enableTagCls(isEnable) {
      return STANDARD_ENABLE_TAG_CLS[Number(isEnable)] || STANDARD_ENABLE_TAG_CLS[STANDARD_ENABLE.YES];
    },
    // 文件字段存的是 FileJson 数组字符串，解析为文件名展示；多个用顿号分隔，非 JSON 历史值原样返回
    fileNames(str) {
      if (!str) return '';
      let list = null;
      try {
        list = JSON.parse(str);
      } catch (e) {
        return str;
      }
      if (!Array.isArray(list)) return str;
      return list.map((item) => item.fileName).filter(Boolean).join('、');
    },
    openCreate() {
      this.dialog.record = null;
      this.dialog.visible = true;
    },
    openEdit(standard) {
      this.dialog.record = standard;
      this.dialog.visible = true;
    },
    // 打开 AI 提示词工作台，记录当前配置的标准
    openConfig(standard) {
      this.workbench.standard = standard;
      this.workbench.visible = true;
    },
    async removeStandard(standard) {
      try {
        await this.$confirm('删除标准「' + standard.standardName + '」？', '删除标准', {
          type: 'warning',
          confirmButtonText: '确定删除',
          cancelButtonText: '取消'
        });
      } catch (err) {
        return;
      }
      try {
        await visionStandardDelete(standard.id);
        this.showToast('已删除标准');
        this.loadStandardList();
      } catch (err) {
        // 删除失败保持原列表，错误提示由请求拦截器给出
      }
    },
    showToast(message) {
      this.$message({ message, duration: 2000 });
    }
  }
};
</script>
