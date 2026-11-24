<template>
  <div class="card">
    <div class="card-head">
      <h2><i data-lucide="table-2"></i>绑定配置列表</h2>
      <span class="side">按「所属模块 + 排序号」升序 · 共 <b class="num">{{ bindList.length }}</b> 条</span>
    </div>
    <div class="card-sub">同一绑定类型可在不同所属模块分别配置（如「竞赛/获奖」在能力业绩与辐射引领各一条）；停用后画像端不再展示该槽位。</div>
    <div class="pb-filter">
      <span class="pb-lbl">所属模块</span>
      <el-select v-model="query.moduleCode" size="small" clearable placeholder="全部模块" style="width:140px">
        <el-option v-for="item in moduleOptions" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
      <span class="pb-lbl">绑定类型</span>
      <el-select v-model="query.bindType" size="small" clearable placeholder="全部类型" style="width:160px">
        <el-option v-for="item in bindTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
      <span class="pb-lbl">启用状态</span>
      <el-select v-model="query.isEnable" size="small" clearable placeholder="全部" style="width:110px">
        <el-option v-for="item in enableOptions" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
      <button class="btn sm primary" type="button" @click="loadList"><i data-lucide="search"></i>搜索</button>
      <button class="btn sm" type="button" @click="resetFilter"><i data-lucide="rotate-ccw"></i>重置</button>
    </div>
    <div class="tbl-wrap">
      <el-table
        v-loading="loading"
        :data="bindList"
        empty-text="暂无符合条件的绑定配置，可点右上角「新增绑定配置」。"
        style="width:100%"
      >
        <el-table-column label="显示名称" width="130">
          <template slot-scope="{ row }">
            <div class="item">
              <b>{{ row.showLabel }}</b>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="绑定类型" width="150">
          <template slot-scope="{ row }">
            <span class="tag mut">{{ bindTypeText(row.bindType) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="所属模块" width="100">
          <template slot-scope="{ row }">{{ moduleText(row.moduleCode) }}</template>
        </el-table-column>
        <!-- <el-table-column label="槽位标识" width="120">
          <template slot-scope="{ row }">
            <span class="mono pb-slot">{{ row.slotCode || '—' }}</span>
          </template>
        </el-table-column> -->
        <el-table-column label="绑定指标" min-width="200">
          <template slot-scope="{ row }">
            <div class="item">
              <b>{{ indexText(row.indexName) }}</b>
              <small v-if="row.specialOptionKeys">特殊：{{ row.specialOptionKeys }}</small>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="比较方式" width="160">
          <template slot-scope="{ row }">
            <span class="tag" :class="compareMethodCls(row.compareMethod)">{{ compareMethodText(row.compareMethod) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="时间字段" width="110">
          <template slot-scope="{ row }">
            <span class="mono pb-slot">{{ row.timeFieldName || '—' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="单位" width="75">
          <template slot-scope="{ row }">{{ row.unitLabel || '—' }}</template>
        </el-table-column>
        <el-table-column label="排序" width="75" align="right">
          <template slot-scope="{ row }">{{ row.sortNo }}</template>
        </el-table-column>
        <el-table-column label="启用" width="110">
          <template slot-scope="{ row }">
            <div class="pb-nowrap">
              <button
                class="pe-switch"
                :class="{ on: isEnabled(row) }"
                type="button"
                @click="$emit('toggle-enable', row)"
              >
                <span class="tick"></span>{{ isEnabled(row) ? '启用' : '停用' }}
              </button>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="140" fixed="right">
          <template slot-scope="{ row }">
            <div class="ops pb-ops pb-nowrap">
              <button class="op op-edit" type="button" @click="$emit('edit', row)">编辑</button>
              <button class="op op-remove" type="button" @click="$emit('remove', row)">删除</button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <!-- <div class="pb-note">
      <i data-lucide="database" style="width:13px;height:13px;flex-shrink:0;margin-top:3px"></i>
      <span>对应配置表：<b class="mono">ai_profile_index_bind_info</b>（bindType / moduleCode / slotCode / indexName / indexFieldName / compareMethod / timeFieldCode / fieldScopeOptions / specialOptionKeys / unitLabel / statConfig / sortNo / isEnable）。</span>
    </div> -->
  </div>
</template>

<script>
import {
  BIND_TYPE_OPTIONS,
  MODULE_OPTIONS,
  COMPARE_METHOD_OPTIONS,
  COMPARE_METHOD_TAG_CLS,
  IS_ENABLE,
  IS_ENABLE_OPTIONS,
  resolveOptionLabel
} from '@/constants/profile-index-bind';
import { profileIndexBindList } from '@/api/profile-index-bind';

export default {
  name: 'BindConfigTable',
  data() {
    return {
      // 模板消费的枚举需挂到实例上
      moduleOptions: MODULE_OPTIONS,
      bindTypeOptions: BIND_TYPE_OPTIONS,
      enableOptions: IS_ENABLE_OPTIONS,
      // 筛选条件按「搜索」按钮提交，避免下拉每次变化都请求接口
      query: {
        moduleCode: '',
        bindType: '',
        isEnable: ''
      },
      bindList: [],
      loading: false
    };
  },
  computed: {
    // 指标 name → 指标定义，用于把 indexName / indexFieldName 还原成中文
    indexMap() {
      return (this.$store.getters.teacherIndexList || []).reduce((map, indexItem) => {
        map[indexItem.name] = indexItem;
        return map;
      }, {});
    }
  },
  created() {
    this.loadList();
  },
  methods: {
    // 列表接口按 moduleCode / bindType / isEnable 筛选，空值不传表示不过滤
    async loadList() {
      const params = {};
      if (this.query.moduleCode) params.moduleCode = this.query.moduleCode;
      if (this.query.bindType) params.bindType = this.query.bindType;
      if (this.query.isEnable) params.isEnable = this.query.isEnable;
      this.loading = true;
      try {
        const res = await profileIndexBindList(params);
        this.bindList = (res && res.data) || [];
      } catch (err) {
        // 异常提示由请求拦截器统一给出，列表置空避免展示过期数据
        this.bindList = [];
      } finally {
        this.loading = false;
      }
    },
    resetFilter() {
      this.query = { moduleCode: '', bindType: '', isEnable: '' };
      this.loadList();
    },
    // 供页面在新增/编辑/删除/启停后触发重新取数
    refresh() {
      this.loadList();
    },
    bindTypeText(bindType) {
      return resolveOptionLabel(BIND_TYPE_OPTIONS, bindType) || '—';
    },
    moduleText(moduleCode) {
      return resolveOptionLabel(MODULE_OPTIONS, moduleCode) || '—';
    },
    compareMethodText(compareMethod) {
      return resolveOptionLabel(COMPARE_METHOD_OPTIONS, compareMethod) || '—';
    },
    compareMethodCls(compareMethod) {
      return COMPARE_METHOD_TAG_CLS[Number(compareMethod)] || 'mut';
    },
    indexText(indexName) {
      const indexItem = this.indexMap[indexName];
      return (indexItem && (indexItem.label || indexItem.name)) || indexName || '—';
    },
    // 绑定字段按当前指标的字段列表翻译，取不到时回退字段全名
    fieldText(record) {
      const indexItem = this.indexMap[record.indexName];
      const fieldList = (indexItem && indexItem.fields) || [];
      const field = fieldList.find((item) => item.name === record.indexFieldName);
      return (field && (field.label || field.name)) || record.indexFieldName || '—';
    },
    isEnabled(record) {
      return Number(record.isEnable) === IS_ENABLE.ENABLE;
    }
  }
};
</script>

<style scoped>
/* 表头、单元格内边距、空态文案与去底线的样式已统一在 global.scss 的 el-table 皮肤中 */

/* 开关与操作列：窄列下不允许中文折行（white-space 可被按钮继承） */
.pb-nowrap {
  white-space: nowrap;
}

/* 操作列：编辑与删除强制同一行展示 */
.pb-ops {
  flex-wrap: nowrap;
}

/* 编辑为正向操作，沿用品牌绿 */
.pb-ops .op-edit {
  color: var(--green);
  border-color: #cfe0d6;
}

.pb-ops .op-edit:hover {
  background: var(--hi-bg);
  border-color: var(--green);
}

/* 删除为危险操作，用警示红与编辑区分 */
.pb-ops .op-remove {
  color: var(--no);
  border-color: #ecc9bd;
}

.pb-ops .op-remove:hover {
  background: var(--no-bg);
  border-color: var(--no);
}

/* 筛选栏：从背景与列表隔开，与表头同宽 */
.pb-filter {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  margin-bottom: 14px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: #fafbfa;
}

/* 筛选字段标签，与下拉框同一行基线对齐 */
.pb-lbl {
  color: var(--muted);
}

/* 编码类单元格：等宽小字，避免长字段名撑破列宽 */
.pb-slot {
  font-size: 12px;
}

/* 表尾说明：与原型一致的虚线分隔 */
.pb-note {
  display: flex;
  align-items: flex-start;
  gap: 7px;
  font-size: 12px;
  color: var(--faint);
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px dashed var(--line-soft);
  line-height: 1.8;
}
</style>
