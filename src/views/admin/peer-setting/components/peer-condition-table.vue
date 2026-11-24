<template>
  <div class="card">
    <div class="card-head">
      <h2><i data-lucide="users"></i>同辈条件配置</h2>
      <div class="bar">
        <span class="side">共 {{ bindList.length }} 项</span>
        <button class="btn sm primary" type="button" @click="$emit('add')">
          <i data-lucide="plus"></i>添加
        </button>
      </div>
    </div>
    <div class="card-sub">字段取自教师档案的<b>对象数据</b>，既决定「我属于哪个同辈组」，也决定从对象集取哪些字段展示：<b>显示名称</b>是教师端条件标签上的文案，<b>搜索名称</b>用于教师端检索同辈。<b>数字</b>类型配置<b>开始值</b>与<b>步长</b>后把连续值切成同辈区间——如年龄：开始 20、步长 5 → 20-24、25-29……；教龄：开始 0、步长 5 → 0-4、5-9……。排序值决定教师端条件的先后顺序；<b>默认勾选</b>决定教师端进页面时该条件是否自动生效；「是否作为隐藏条件」为<b>是</b>时，该字段不再出现在教师端，仅以条件值参与同辈识别，条件值在「编辑」中配置。</div>
    <div class="tbl-wrap">
      <el-table
        v-loading="loading"
        :data="bindList"
        empty-text="还没有同辈条件字段，点右上角「添加」从教师档案字段中选择。"
      >
        <el-table-column label="档案字段" min-width="150">
          <template slot-scope="{ row }">
            <div class="item">
              <b>{{ row.indexFieldLabel || row.indexFieldName }}</b>
              <small>{{ row.indexLabel }}</small>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="类型" width="100">
          <template slot-scope="{ row }">{{ row.indexFieldType }}</template>
        </el-table-column>
        <el-table-column label="显示名称 / 取值规则" min-width="180">
          <template slot-scope="{ row }">
            {{ row.peerShowLabel }}
            <small v-if="isNumberField(row.indexFieldType)" style="color:var(--muted)">
              （开始 {{ row.beginVal }}、步长 {{ row.stepVal }}）
            </small>
          </template>
        </el-table-column>
        <el-table-column label="搜索名称" min-width="110">
          <template slot-scope="{ row }">{{ row.peerSearchLabel || '—' }}</template>
        </el-table-column>
        <el-table-column label="排序值" width="90" align="right">
          <template slot-scope="{ row }">{{ row.sortNo }}</template>
        </el-table-column>
        <el-table-column label="使用范围" min-width="110">
          <template slot-scope="{ row }">{{ useScopeText(row) }}</template>
        </el-table-column>
        <el-table-column label="是否作为隐藏条件" min-width="150">
          <template slot-scope="{ row }">
            {{ isHiddenCondition(row) ? '是' : '否' }}
            <div v-if="isHiddenCondition(row)" class="pe-cond-tip">{{ conditionText(row) }}</div>
          </template>
        </el-table-column>
        <el-table-column label="默认勾选" width="130">
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
  resolveCriteriaName,
  resolveConditionValueText,
  USE_SCOPE,
  USE_SCOPE_LABEL,
  IS_DEFAULT_USE
} from '@/constants/peer-setting';

export default {
  name: 'PeerConditionTable',
  props: {
    // 档案字段绑定列表，元素结构与接口 AiPeerCompareArchiveBind 一致（useScope 为 0、1）
    bindList: { type: Array, default: () => [] },
    loading: { type: Boolean, default: false },
    // 字段名 → 枚举候选项，用于把隐藏条件值翻译成中文
    fieldOptionMap: { type: Object, default: () => ({}) }
  },
  methods: {
    isNumberField(indexFieldType) {
      return isNumberFieldType(indexFieldType);
    },
    // 接口 isShow：1=显示，2=隐藏，隐藏即作为隐藏条件
    isHiddenCondition(bindRecord) {
      return !isBindRecordShown(bindRecord);
    },
    // 接口未返 useScope 时按默认的「通用」展示
    useScopeText(bindRecord) {
      return USE_SCOPE_LABEL[Number(bindRecord.useScope)] || USE_SCOPE_LABEL[USE_SCOPE.COMMON];
    },
    // 教师端进入同辈对标时是否默认勾选该条件，对应接口 isDefaultUse：1=默认选中，2=不勾选
    isDefaultChecked(bindRecord) {
      return Number(bindRecord.isDefaultUse) === IS_DEFAULT_USE.YES;
    },
    // 隐藏态下的条件摘要，如「隐藏条件：等于【女】」
    conditionText(bindRecord) {
      const valueText = resolveConditionValueText(bindRecord.defaultVal, this.fieldOptionMap[bindRecord.indexFieldName]);
      return '隐藏条件：' + resolveCriteriaName(bindRecord.criteriaType) + '【' + (valueText || '未设置') + '】';
    }
  }
};
</script>

<style scoped>
/* 隐藏条件的取值表达式：排在「是 / 否」下方的辅助说明 */
.pe-cond-tip {
  font-size: 11.5px;
  color: var(--muted);
  margin-top: 3px;
}
</style>
