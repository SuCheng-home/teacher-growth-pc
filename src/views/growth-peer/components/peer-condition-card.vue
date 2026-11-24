<template>
  <!-- 我的同辈条件 + 选择同辈组合：勾选状态与单选/多选切换逻辑均由本卡片内部自持 -->
  <section class="card">
    <div class="card-head">
      <h2>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="8" r="3.4"/><path d="M5 20c0-3.3 3.1-5.4 7-5.4s7 2.1 7 5.4"/></svg>
        我的同辈条件
      </h2>
      <span class="auto-badge">从档案中自动读取</span>
    </div>

    <!-- 档案条件胶囊：fixed 项（任教信息 / 班主任）高亮为锁定态 -->
    <div class="wb-conds">
      <span v-for="(item, index) in conditions" :key="index" class="cond" :class="{ fix: item.fixed }">
        <b>{{ item.peerShowLabel }}</b><span>{{ getFieldValue(item) }}</span>
      </span>
    </div>

    <div class="wb-divider"></div>

    <div class="card-head" style="margin-bottom:10px">
      <h2>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 7h16M4 12h16M4 17h16"/><circle cx="9" cy="7" r="1.5" fill="currentColor"/><circle cx="15" cy="12" r="1.5" fill="currentColor"/><circle cx="7" cy="17" r="1.5" fill="currentColor"/></svg>
        选择同辈组合
      </h2>
      <div class="wb-mode">
        <div class="seg" role="group" aria-label="选择方式">
          <button type="button" class="seg-btn" :class="{ on: selMode === selectMode.SINGLE }" :aria-pressed="String(selMode === selectMode.SINGLE)" @click="handleSetMode(selectMode.SINGLE)">单选</button>
          <button type="button" class="seg-btn" :class="{ on: selMode === selectMode.MULTI }" :aria-pressed="String(selMode === selectMode.MULTI)" @click="handleSetMode(selectMode.MULTI)">多选</button>
        </div>
      </div>
    </div>

    <div class="wb-bottom">
      <!-- single=圆环 / multi=方块：勾选语义随模式变化，一眼可辨 -->
      <div class="wb-toggles" :class="selMode">
        <button
          v-for="field in conditions"
          :key="field.indexFieldName"
          type="button"
          class="toggle"
          :class="{ on: checkedMap[field.indexFieldName], headteacher: field.headteacher }"
          @click="handleToggleField(field.indexFieldName)"
        ><span class="tick"></span>{{ field.peerSearchLabel }}</button>
      </div>
      <div class="wb-scope"><span class="grp">{{ groupLabel }}</span><span class="n num" v-if="showSize">共 {{ size }} 人</span></div>
    </div>

    <!-- 组内样本不足提示：仅降级态出现 -->
    <div v-if="degrade" class="wb-warn">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 3l10 18H2z"/><path d="M12 9v5M12 17v.5"/></svg>
      组内样本不足 {{ minSampleSize }} 人，分位不稳定。建议减少条件放宽样本后再看对比。
    </div>
  </section>
</template>

<script>
import { peerBindList, peerCompareRecordGetLatest } from '@/api/peer-setting';
import { getTeacherDataByCardId } from '@/api/archives';
import { computedTeacher, computedFieldValue, computedNumberRangeLabel } from '@/utils/archive';
import { isNumberFieldType } from '@/constants/peer-setting';
import { PEER_SELECT_MODE, MIN_GROUP_SAMPLE_SIZE } from '@/constants/growth-peer';
import { store as authStore } from 'auth-layout-zw';

export default {
  name: 'PeerConditionCard',
  data() {
    return {
      conditions: [],
      hideConditions: [],
      defaultCheckedKeys: [],
      selectMode: PEER_SELECT_MODE,
      selMode: PEER_SELECT_MODE.SINGLE,
      minSampleSize: MIN_GROUP_SAMPLE_SIZE,
      // 勾选态与选择方式为本卡片内部业务状态，不再由容器传入
      checkedMap: {},
      size: 0,
      showSize: false,
      // 教师档案数据（内部获取，不再依赖父级 prop）
      archiveData: {}
    };
  },
  computed: {
    // 已勾选维度数量：用于「至少保留一项」的切换约束
    checkedFieldCount() {
      return Object.values(this.checkedMap).filter(Boolean).length;
    },
    groupLabel() {
      return this.conditions.filter(condition => this.checkedMap[condition.indexFieldName])
        .map(condition => this.getFieldValue(condition))
        .join(' · ')
    },
    degrade() {
      return this.showSize && this.size < this.minSampleSize
    }
  },
  async created() {
    this.fetchTeacherArchive();
    await this.getBindList();
    this.fetchLatestCompareRecord();
  },
  methods: {
    setTotal(total) {
      this.size = total;
      this.showSize = true
    },
    getCriteriaByCondition(condition) {
      const field = this.$store.getters.teacherIndexFieldList.find(item => item.name === condition.indexFieldName);
      const index = this.$store.getters.teacherIndexList.find(item => item.code === field.indexCode);
      const criteria = {
        criteriaType: 'eq',
        queryType: 'criteria',
        indexName: index.name,
        indexType: 'objectform',
        fieldType: field.type,
        fieldName: field.name,
        fieldLabel: field.label
      }
      criteria.value = this.archiveData[condition.indexFieldName]
      // 数值字段按同辈配置的「开始值 + 步长」归入对应区间展示，而非直接展示原始值
      if (isNumberFieldType(field.type)) {
        criteria.value = computedNumberRangeLabel(criteria.value, condition.beginVal, condition.stepVal);
      }
      return criteria;
    },
    getQueryCondition() {
      const queryCondition = {
        conditionType: 'and',
        queryType: 'condition'
      }
      queryCondition.conditions = this.conditions.filter(condition => this.checkedMap[condition.indexFieldName])
        .map(condition => this.getCriteriaByCondition(condition));
      const hideConditions = this.hideConditions.map(condition => this.getCriteriaByCondition(condition));
      queryCondition.conditions.push(...hideConditions)
      return queryCondition
    },
    // 向父级上抛当前查询条件，驱动同辈对比分析（勾选切换、模式切换时触发）
    notifyConditionChange() {
      if (!Object.keys(this.checkedMap).length) return
      this.$emit('condition-change', this.getQueryCondition());
    },
    // 切换某维度勾选：单选互斥直切、多选复选叠加，两种模式均「至少保留一项」
    handleToggleField(key) {
      if (this.selMode === PEER_SELECT_MODE.SINGLE) {
        if (this.checkedMap[key]) return; // 已是当前唯一选中项，保持不变
        Object.keys(this.checkedMap).forEach(checkedKey => {
          this.$set(this.checkedMap, checkedKey, false);
        });
        this.$set(this.checkedMap, key, true);
      } else {
        if (this.checkedMap[key] && this.checkedFieldCount <= 1) return; // 最后一项不可取消
        this.$set(this.checkedMap, key, !this.checkedMap[key]);
      }
      this.notifyConditionChange();
    },
    // 切换单选/多选：多选转单选仅保留首个已勾选项
    handleSetMode(mode) {
      this.selMode = mode === PEER_SELECT_MODE.MULTI ? PEER_SELECT_MODE.MULTI : PEER_SELECT_MODE.SINGLE;
      if (this.selMode === PEER_SELECT_MODE.SINGLE && this.checkedFieldCount > 1) {
        const keepKey = Object.keys(this.checkedMap).find(checkedKey => this.checkedMap[checkedKey]);
        Object.keys(this.checkedMap).forEach(checkedKey => {
          this.$set(this.checkedMap, checkedKey, checkedKey === keepKey);
        });
      }
      this.notifyConditionChange();
    },
    async getBindList() {
      try {
        const { data } = await peerBindList({ useScope: 1 });
        this.conditions = data.filter(item => item.isShow === 1);
        this.hideConditions = data.filter(item => item.isShow === 2);
        this.defaultCheckedKeys = this.conditions
          .filter(i => i.isDefaultUse === 1)
          .map(i => i.indexFieldName);
        this.checkedMap = {}
        this.defaultCheckedKeys.forEach(key => {
          this.$set(this.checkedMap, key, true);
        });
        // 默认勾选就绪后不自动触发对比分析（由用户手动变更条件时再发起）
      } catch (err) {
        console.error(err)
      }
    },
    // 调用档案接口获取当前教师档案数据（内联到本组件）
    async fetchTeacherArchive() {
      try {
        const res = await getTeacherDataByCardId({
          tenantId: authStore.getters.tenantId
        });
        const payload = (res && res.data) || null;
        if (payload && payload.teacher) {
          this.archiveData = computedTeacher(payload.teacher);
        } else {
          this.archiveData = {};
        }
      } catch (err) {
        console.error('获取教师档案数据失败：', err);
      }
    },
    // 查询最近一次同辈对比记录，回显上次选中条件与分析结果，不触发新的分析
    async fetchLatestCompareRecord() {
      try {
        const { data } = await peerCompareRecordGetLatest();
        if (!data) return;
        // statData 为 JSON 字符串，解析后与实时分析结果结构一致
        const statData = data.statData ? JSON.parse(data.statData) : null;
        if (!statData) return;
        // 回显上次选中项：从 compareParam 解析出当时勾选的可见条件字段
        this.restoreCheckedFromRecord(data.compareParam);
        // compareTime 作为记录时间标记，父组件可据此展示"上次分析时间"
        this.$emit('latest-record', {
          statData,
          peerNum: data.peerNum || 0,
          compareTime: data.compareTime || ''
        });
      } catch (err) {
        console.error('获取最近对比记录失败：', err);
      }
    },
    // 从对比记录的 compareParam 中还原勾选状态（仅匹配可见条件，忽略隐藏条件）
    restoreCheckedFromRecord(compareParam) {
      if (!compareParam) return;
      try {
        const param = typeof compareParam === 'string' ? JSON.parse(compareParam) : compareParam;
        const queryCondition = (param && param.queryCondition) || {};
        // 取可见条件中命中的 fieldName（排除隐藏条件）
        const visibleKeys = this.conditions.map(c => c.indexFieldName);
        const checkedKeys = (queryCondition.conditions || [])
          .filter(c => visibleKeys.includes(c.fieldName))
          .map(c => c.fieldName);
        console.log('checkedKeys:', checkedKeys, visibleKeys, queryCondition.conditions);
        if (!checkedKeys.length) return;
        // 还原勾选态
        this.checkedMap = {};
        checkedKeys.forEach(key => {
          this.$set(this.checkedMap, key, true);
        });
        // 多项勾选时切换为多选模式
        if (checkedKeys.length > 1) {
          this.selMode = PEER_SELECT_MODE.MULTI;
        }
      } catch (err) {
        console.error('解析历史对比参数失败：', err);
      }
    },
    getFieldValue(condition) {
      const field = this.$store.getters.teacherIndexFieldList.find(item => item.name === condition.indexFieldName);
      if (!field) return '-';
      const rawValue = this.archiveData[condition.indexFieldName];
      // 数值字段按同辈配置的「开始值 + 步长」归入对应区间展示，而非直接展示原始值
      if (isNumberFieldType(field.type)) {
        return computedNumberRangeLabel(rawValue, condition.beginVal, condition.stepVal);
      }
      return computedFieldValue(field, rawValue) || '-';
    }
  }
};
</script>
