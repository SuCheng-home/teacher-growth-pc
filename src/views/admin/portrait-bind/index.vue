<template>
  <div>
    <div class="page-heading">
      <div>
        <div class="eyebrow">PROFILE INDEX BIND</div>
        <h1>画像指标绑定设置</h1>
      </div>
      <div class="bar">
        <button class="btn sm primary" type="button" @click="openCreate"><i data-lucide="plus"></i>新增绑定配置</button>
      </div>
    </div>

    <div class="warn-note">
      <i data-lucide="info"></i>
      <span>教师画像原型按本表配置动态取数：同一<b>绑定类型</b>可在不同<b>所属模块</b>分别配置（如「竞赛/获奖」在能力业绩与辐射引领各一条）；停用后画像端不再展示该槽位；<b>比较方式</b>决定取数口径（计数 / 最大值 / 去重计数 / 直取值·最新值），<b>时间轴字段</b>用于按年度/学期统计分组及取最新记录排序；select / mulSelect 字段存选项 key，展示时按选项范围转 value。配置按<b>当前登录学校</b>隔离。</span>
    </div>

    <bind-config-table
      ref="bindTable"
      @edit="openEdit"
      @remove="removeBind"
      @toggle-enable="toggleEnable"
    />

    <bind-config-dialog
      :visible="dialogVisible"
      :record="dialogRecord"
      :saving="saving"
      @close="dialogVisible = false"
      @confirm="saveBind"
    />
  </div>
</template>

<script>
/* 页面级子组件：绑定配置列表表格、新增/编辑弹窗 */
import BindConfigTable from './components/bind-config-table.vue';
import BindConfigDialog from './components/bind-config-dialog.vue';
import {
  profileIndexBindSave,
  profileIndexBindDelete,
  profileIndexBindUpdateEnable
} from '@/api/profile-index-bind';
import { IS_ENABLE } from '@/constants/profile-index-bind';

export default {
  name: 'AdminPortraitBind',
  components: {
    BindConfigTable,
    BindConfigDialog
  },
  data() {
    return {
      saving: false,
      dialogVisible: false,
      dialogRecord: null
    };
  },
  methods: {
    // 列表与筛选由表格组件自持，写操作后触发其重新取数
    refreshBindList() {
      if (this.$refs.bindTable) this.$refs.bindTable.refresh();
    },
    openCreate() {
      this.dialogRecord = null;
      this.dialogVisible = true;
    },
    openEdit(record) {
      this.dialogRecord = record;
      this.dialogVisible = true;
    },
    // 新增与编辑共用同一个保存接口：带 id 为编辑，否则新增
    async saveBind(payload) {
      this.saving = true;
      try {
        await profileIndexBindSave(payload);
        this.showToast((payload.id ? '已保存绑定配置「' : '已新增绑定配置「') + payload.showLabel + '」', 'success');
        this.dialogVisible = false;
        this.refreshBindList();
      } catch (err) {
        // 保存失败保持弹窗可重试，错误提示由请求拦截器给出
      } finally {
        this.saving = false;
      }
    },
    async removeBind(record) {
      try {
        await this.$confirm('确定删除绑定配置「' + record.showLabel + '」吗？画像端该槽位将不再展示。', '删除绑定配置', {
          type: 'warning',
          confirmButtonText: '确定删除',
          cancelButtonText: '取消'
        });
      } catch (err) {
        return;
      }
      try {
        await profileIndexBindDelete(record.id);
        this.showToast('已删除「' + record.showLabel + '」', 'success');
        this.refreshBindList();
      } catch (err) {
        // 删除失败列表保持原样，错误提示由请求拦截器给出
      }
    },
    // 表格内开关直接落库：isEnable 仅允许 1启用 / 2停用
    async toggleEnable(record) {
      const nextIsEnable = Number(record.isEnable) === IS_ENABLE.ENABLE ? IS_ENABLE.DISABLE : IS_ENABLE.ENABLE;
      try {
        await profileIndexBindUpdateEnable(record.id, nextIsEnable);
        const isEnabled = nextIsEnable === IS_ENABLE.ENABLE;
        // 启用为正向结果给 success，停用属于警示性操作给 warning
        this.showToast('「' + record.showLabel + '」已' + (isEnabled ? '启用' : '停用'), isEnabled ? 'success' : 'warning');
        this.refreshBindList();
      } catch (err) {
        // 状态未变更时不改动列表，错误提示由请求拦截器给出
      }
    },
    showToast(message, type = 'success') {
      this.$message({ message, type, duration: 2000 });
    }
  }
};
</script>
