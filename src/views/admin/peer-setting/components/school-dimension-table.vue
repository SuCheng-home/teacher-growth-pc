<template>
  <div class="card">
    <div class="card-head">
      <h2><i data-lucide="building-2"></i>全校可筛选维度</h2>
      <div class="bar">
        <span class="side">共 {{ dimensionList.length }} 项</span>
        <button class="btn sm primary" type="button" @click="$emit('add')">
          <i data-lucide="plus"></i>添加
        </button>
      </div>
    </div>
    <div class="card-sub">与同辈条件共用同一套档案字段绑定，按<b>使用范围</b>区分归属：「仅校管理员使用」只在本页生效，「通用」同时出现在同辈条件配置。决定校管理员「同辈对标 · 全校分析」页开放哪些筛选维度、进页面时默认勾选哪些。<b>数字</b>类型配步长值与起始值切成区间；<b>枚举</b>类型可框定取值范围，「是否对校管理员开放」在维度「编辑」中设置。点「添加」从档案字段中选维度。</div>
    <div class="tbl-wrap">
      <el-table
        v-loading="loading"
        :data="dimensionList"
        empty-text="还没有全校可筛选维度，点右上角「添加」从教师档案字段中选择。"
      >
        <el-table-column label="字段名称" min-width="150">
          <template slot-scope="{ row }">
            <div class="item">
              <b>{{ row.indexFieldLabel || row.indexFieldName }}</b>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="类型" width="100">
          <template slot-scope="{ row }">{{ row.indexFieldType }}</template>
        </el-table-column>
        <el-table-column label="取值方式" min-width="180">
          <template slot-scope="{ row }">
            <span v-if="isNumberField(row.indexFieldType)">
              区间（开始 {{ row.beginVal }}、步长 {{ row.stepVal }}）
            </span>
            <span v-else>{{ optionRangeText(row) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="排序值" width="90" align="right">
          <template slot-scope="{ row }">{{ row.sortNo }}</template>
        </el-table-column>
        <el-table-column label="使用范围" min-width="110">
          <template slot-scope="{ row }">{{ useScopeText(row) }}</template>
        </el-table-column>
        <el-table-column label="是否作为隐藏条件" min-width="150">
          <template slot-scope="{ row }">{{ isOpenToAdmin(row) ? '是' : '否' }}</template>
        </el-table-column>
        <el-table-column label="校管理员端默认" width="150">
          <template slot-scope="{ row }">
            <button
              class="pe-switch"
              :class="{ on: isDefaultChecked(row) }"
              type="button"
              @click="$emit('toggle-default', row)"
            >
              <span class="tick"></span>{{ isDefaultChecked(row) ? '默认勾选' : '不勾选' }}
            </button>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template slot-scope="{ row }">
            <div class="ops">
              <button class="op" type="button" @click="$emit('edit', row)">编辑</button>
              <button class="op" type="button" @click="$emit('remove', row)">删除</button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
import {
  isNumberFieldType,
  isBindRecordShown,
  parseOptionRange,
  USE_SCOPE,
  USE_SCOPE_LABEL,
  IS_DEFAULT_USE
} from '@/constants/peer-setting';

export default {
  name: 'SchoolDimensionTable',
  props: {
    // 全校可筛选维度，与同辈条件共用接口 AiPeerCompareArchiveBind，useScope 为 0、2
    dimensionList: { type: Array, default: () => [] },
    loading: { type: Boolean, default: false }
  },
  methods: {
    isNumberField(indexFieldType) {
      return isNumberFieldType(indexFieldType);
    },
    // 枚举维度若配了选项范围，只展示范围内的选项
    optionRangeText(bindRecord) {
      const optionList = parseOptionRange(bindRecord.optionRange);
      if (!optionList.length) return '下拉枚举';
      return '下拉枚举（限定 ' + optionList.map((option) => option.value).join('、') + '）';
    },
    // 接口未返 useScope 时按默认的「通用」展示
    useScopeText(bindRecord) {
      return USE_SCOPE_LABEL[Number(bindRecord.useScope)] || USE_SCOPE_LABEL[USE_SCOPE.COMMON];
    },
    // 「对校管理员开放」对应接口 isShow：1=显示即开放，2=隐藏
    isOpenToAdmin(bindRecord) {
      return !isBindRecordShown(bindRecord);
    },
    // 「校管理员端默认」对应接口 isDefaultUse：1=默认选中，2=不勾选
    isDefaultChecked(bindRecord) {
      return Number(bindRecord.isDefaultUse) === IS_DEFAULT_USE.YES;
    }
  }
};
</script>
