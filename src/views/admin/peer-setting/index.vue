<template>
  <div>
    <div class="page-heading">
      <div>
        <div class="eyebrow">PEER BENCHMARK SETTINGS</div>
        <h1>同辈对标设置</h1>
      </div>
    </div>

    <div class="warn-note">
      <i data-lucide="info"></i>
      <span>本页决定教师端「<b>同辈对标</b>」的取数口径与输出文案：<b>同辈条件</b>识别「谁与我同辈」并决定从对象集取哪些字段，<b>输出格式配置</b>决定雷达图与各项文案如何生成。<b>AI 只生成解释文字，分位计算一律走规则引擎。</b></span>
    </div>

    <peer-sub-tabs :active-sub-tab="activeSubTab" @change="activeSubTab = $event" />

    <!-- ===== 个人同辈对标 ===== -->
    <div v-show="activeSubTab === subTab.PERSONAL">
      <!-- （1）同辈条件配置：档案字段绑定 -->
      <peer-condition-table
        :bind-list="peerConditionList"
        :loading="peerBindLoading"
        :field-option-map="peerFieldOptionMap"
        @add="openFieldDialog(fieldDialogMode.PEER)"
        @edit="openFieldDialog(fieldDialogMode.PEER, $event)"
        @remove="removeBind($event, fieldDialogMode.PEER)"
        @toggle-default="toggleBindDefault"
      />
    </div>

    <!-- ===== 全校同辈对标 ===== -->
    <div v-show="activeSubTab === subTab.SCHOOL">
      <school-dimension-table
        :dimension-list="schoolFilterDimensionList"
        :loading="schoolBindLoading"
        @add="openFieldDialog(fieldDialogMode.SCHOOL)"
        @edit="openFieldDialog(fieldDialogMode.SCHOOL, $event)"
        @remove="removeBind($event, fieldDialogMode.SCHOOL)"
        @toggle-default="toggleBindDefault"
      />
    </div>

    <!-- 选择档案字段：个人与全校共用绑定接口，按 useScope 区分归属 -->
    <field-bind-dialog
      :visible="fieldDialog.visible"
      :record="fieldDialog.record"
      :mode="fieldDialog.mode"
      :index-options="fieldDialogIndexOptions"
      :saving="peerBindSaving"
      @close="fieldDialog.visible = false"
      @confirm="saveBind"
    />
  </div>
</template>

<script>
/* 页面级子组件：页签、同辈条件表格、全校维度、字段弹窗 */
import PeerSubTabs from './components/peer-sub-tabs.vue';
import PeerConditionTable from './components/peer-condition-table.vue';
import SchoolDimensionTable from './components/school-dimension-table.vue';
import FieldBindDialog from './components/field-bind-dialog.vue';
import { peerBindList, peerBindSave, peerBindDelete } from '@/api/peer-setting';
import {
  SUB_TAB,
  FIELD_DIALOG_MODE,
  USE_SCOPE,
  IS_DEFAULT_USE
} from '@/constants/peer-setting';

export default {
  name: 'AdminPeerSetting',
  components: {
    PeerSubTabs,
    PeerConditionTable,
    SchoolDimensionTable,
    FieldBindDialog
  },
  data() {
    return {
      subTab: Object.freeze({ ...SUB_TAB }),
      fieldDialogMode: Object.freeze({ ...FIELD_DIALOG_MODE }),
      activeSubTab: SUB_TAB.PERSONAL,
      // 同辈条件字段绑定列表（useScope 为 0、1），取自 /teacherDevelop/aiAnalysis/peerBind/list
      peerConditionList: [],
      peerBindLoading: false,
      peerBindSaving: false,
      fieldDialog: {
        visible: false,
        mode: FIELD_DIALOG_MODE.PEER,
        record: null
      },
      // 全校可筛选维度列表（useScope 为 0、2），与同辈条件同一张绑定表
      schoolFilterDimensionList: [],
      schoolBindLoading: false
    };
  },
  computed: {
    // 弹窗级联选项：对象数据指标 → 指标下字段，新增态剔除已绑定的字段
    fieldDialogIndexOptions() {
      // 编辑态级联不可修改，保留全量字段供弹窗回查该字段的枚举选项与扩展属性
      if (this.fieldDialog.record) return this.buildIndexOptions([]);
      // 同辈条件与全校维度共用一张绑定表，一个档案字段只能有一条绑定，两个场景都已用的字段一律剔除
      const usedFieldNameList = this.peerConditionList
        .concat(this.schoolFilterDimensionList)
        .map((record) => record.indexFieldName);
      return this.buildIndexOptions(usedFieldNameList);
    },
    // 字段名 → 枚举候选项，用于把隐藏条件值翻译成中文展示
    peerFieldOptionMap() {
      const fieldOptionMap = {};
      this.$store.getters.teacherIndexList.forEach((indexItem) => {
        (indexItem.fields || []).forEach((field) => {
          if (field.options && field.options.length) fieldOptionMap[field.name] = field.options;
        });
      });
      return fieldOptionMap;
    }
  },
  created() {
    this.getPeerConditionList();
    this.getSchoolDimensionList();
  },
  methods: {
    buildIndexOptions(usedFieldNameList) {
      return this.$store.getters.teacherIndexList
        .filter((indexItem) => indexItem.type === 'objectform')
        .map((indexItem) => {
          const fieldList = (indexItem.fields || []).filter((field) => usedFieldNameList.indexOf(field.name) < 0);
          return { ...indexItem, fields: fieldList };
        })
        .filter((indexItem) => indexItem.fields.length);
    },
    /* ---------------- 档案字段绑定（个人与全校共用接口，按 useScope 区分） ---------------- */
    // 列表接口的 useScope 过滤：传 1 取「通用 + 教师个人」，传 2 取「通用 + 校管理员」
    async getBindList(useScope) {
      const res = await peerBindList({ useScope });
      return (res && res.data) || [];
    },
    async getPeerConditionList() {
      this.peerBindLoading = true;
      try {
        this.peerConditionList = await this.getBindList(USE_SCOPE.TEACHER_ONLY);
      } catch (err) {
        this.peerConditionList = [];
      } finally {
        this.peerBindLoading = false;
      }
    },
    async getSchoolDimensionList() {
      this.schoolBindLoading = true;
      try {
        this.schoolFilterDimensionList = await this.getBindList(USE_SCOPE.ADMIN_ONLY);
      } catch (err) {
        this.schoolFilterDimensionList = [];
      } finally {
        this.schoolBindLoading = false;
      }
    },
    // 变更后两张表都要刷新：「通用」的记录同时属于两个场景
    refreshBindList() {
      this.getPeerConditionList();
      this.getSchoolDimensionList();
    },
    // mode 决定弹窗文案与使用范围可选项，record 为空表示新增
    openFieldDialog(mode, record) {
      this.fieldDialog.mode = mode;
      this.fieldDialog.record = record || null;
      this.fieldDialog.visible = true;
    },
    // 新增与编辑共用批量保存接口，记录归属由表单里的 useScope 决定
    async saveBind(bindForm, mode) {
      this.peerBindSaving = true;
      try {
        await peerBindSave([bindForm]);
        const fieldLabel = bindForm.peerShowLabel || bindForm.indexFieldLabel;
        const actionText = bindForm.id ? '已保存字段绑定' : (mode === FIELD_DIALOG_MODE.SCHOOL ? '已添加筛选维度' : '已添加同辈条件字段');
        this.showToast(actionText + '「' + fieldLabel + '」');
        this.fieldDialog.visible = false;
        this.refreshBindList();
      } catch (err) {
        // 接口异常已由请求拦截器统一提示，此处保持弹窗可重试
      } finally {
        this.peerBindSaving = false;
      }
    },
    async removeBind(record, mode) {
      const fieldLabel = record.indexFieldLabel || record.indexFieldName;
      const confirmText = mode === FIELD_DIALOG_MODE.SCHOOL
        ? '确定删除筛选维度「' + fieldLabel + '」吗？全校分析将不再提供该维度。'
        : '确定删除字段绑定「' + fieldLabel + '」吗？教师端同辈对标将不再取用该字段。';
      try {
        await this.$confirm(confirmText, '删除绑定', {
          type: 'warning',
          confirmButtonText: '确定删除',
          cancelButtonText: '取消'
        });
      } catch (err) {
        return;
      }
      try {
        await peerBindDelete(record.id);
        this.showToast('已删除「' + fieldLabel + '」');
        this.refreshBindList();
      } catch (err) {
        // 删除失败时列表保持原样，错误提示由请求拦截器给出
      }
    },
    // 表格内开关直接落库：在原记录上覆盖指定字段后整体保存
    async saveBindSwitch(record, fieldPatch) {
      try {
        await peerBindSave([{ ...record, ...fieldPatch }]);
        this.refreshBindList();
      } catch (err) {
        // 保存失败时列表保持原样，错误提示由请求拦截器给出
      }
    },
    // 「默认勾选」对应接口 isDefaultUse：1=默认选中，2=不勾选，教师端与校管理员端共用同一字段
    toggleBindDefault(record) {
      const nextIsDefaultUse = Number(record.isDefaultUse) === IS_DEFAULT_USE.YES ? IS_DEFAULT_USE.NO : IS_DEFAULT_USE.YES;
      this.saveBindSwitch(record, { isDefaultUse: nextIsDefaultUse });
    },
    showToast(message) {
      this.$message({ message, duration: 2000 });
    }
  }
};
</script>
