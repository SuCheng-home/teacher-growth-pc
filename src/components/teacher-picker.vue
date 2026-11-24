<template>
  <el-dialog
    :visible="visible"
    width="640px"
    top="8vh"
    custom-class="admin-dialog"
    :close-on-click-modal="false"
    append-to-body
    @close="$emit('close')"
  >
    <div slot="title">
      <div class="dlg-eyebrow">{{ eyebrow }}</div>
      <div class="dlg-title">{{ title }}</div>
    </div>
    <p v-if="desc" class="dlg-desc">{{ desc }}</p>

    <el-input
      v-model="keyword"
      class="tpk-search"
      placeholder="搜索姓名 / 手机号 / 身份证号…"
      clearable
      @keyup.enter.native="handleSearch"
      @clear="handleSearch"
    >
      <i slot="suffix" class="el-icon-search tpk-search__icon" @click="handleSearch"></i>
    </el-input>

    <div v-loading="loading" class="tpk-list">
      <div
        v-for="teacher in teacherList"
        :key="teacher.id"
        class="tpk-li"
        :class="{ sel: isSelected(teacher) }"
        @click="selectTeacher(teacher)"
      >
        <span class="rad" :class="{ 'rad--sq': multiple }"></span>
        <el-avatar class="tpk-avatar" :size="32" :src="teacher.avatar">{{ teacher.name }}</el-avatar>
        <b>{{ teacher.name }}</b>
        <span class="mtail">
          <span class="sub">{{ teacher.phoneNumber || '—' }}</span>
          <em>{{ teacher.cardId || '—' }}</em>
        </span>
      </div>
      <div v-if="!loading && !teacherList.length" class="tpk-empty">没有匹配的教师，换个关键词试试。</div>
    </div>

    <el-pagination
      class="tpk-pager"
      background
      layout="total, prev, pager, next, sizes"
      :current-page="pageNumber"
      :page-size="pageSize"
      :page-sizes="PAGE_SIZES"
      :total="total"
      @current-change="handlePageChange"
      @size-change="handleSizeChange"
    />

    <span slot="footer" class="dlg-foot">
      <span class="dlg-cnt">{{ footText }}</span>
      <el-button size="small" @click="$emit('close')">取消</el-button>
      <slot name="confirm-btn">
        <el-button size="small" type="primary" @click="onConfirm">确定</el-button>
      </slot>
    </span>
  </el-dialog>
</template>

<script>
/* 全局教师选人组件：分页展示本校（unitCode 取鉴权 store）教师列表，支持单选/多选，向调用方回传教师记录 */
import { fetchTeachPageList } from '@/api/common';
import { store as authStore, mixin } from 'auth-layout-zw';

const PAGE_SIZES = [10, 20, 50];

export default {
  name: 'TeacherPicker',
  props: {
    visible: { type: Boolean, default: false },
    // 弹窗头部小标（英文 eyebrow），与后台其他弹窗风格保持一致
    eyebrow: { type: String, default: 'TEACHER PICKER' },
    title: { type: String, default: '选人' },
    // 弹窗说明文案，传空字符串则不展示
    desc: { type: String, default: '从学校教师中选择一位，选中结果会回传给调用方处理。' },
    // 选择模式：false=单选（回传单个教师对象），true=多选（回传教师对象数组）
    multiple: { type: Boolean, default: false }
  },
  data() {
    return {
      PAGE_SIZES,
      keyword: '',
      teacherList: [],
      pageNumber: 1,
      pageSize: PAGE_SIZES[0],
      total: 0,
      loading: false,
      // 已选教师记录集合，存完整对象以支持跨分页保持选中态与多选
      selectedList: []
    };
  },
  computed: {
    footText() {
      if (!this.selectedList.length) return '共 ' + this.total + ' 人';
      if (this.multiple) return '已选 ' + this.selectedList.length + ' 人';
      return '已选：' + this.selectedList[0].name;
    }
  },
  watch: {
    visible(val) {
      if (!val) return;
      this.keyword = '';
      this.pageNumber = 1;
      this.selectedList = [];
      this.fetchList();
    }
  },
  methods: {
    async fetchList() {
      this.loading = true;
      try {
        const res = await fetchTeachPageList({
          pageNumber: this.pageNumber,
          pageSize: this.pageSize,
          unitCode: authStore.getters.unit.code,
          name: this.keyword || undefined
        });
        const pageData = (res && res.data) || {};
        this.teacherList = (pageData.records || pageData.list || []).map(i => {
          i.avatar = mixin.showImageComputed(i.avatar)
          return i
        });
        this.total = Number(pageData.total) || 0;
      } finally {
        this.loading = false;
      }
    },
    handleSearch() {
      this.pageNumber = 1;
      this.fetchList();
    },
    handlePageChange(pageNumber) {
      this.pageNumber = pageNumber;
      this.fetchList();
    },
    handleSizeChange(pageSize) {
      this.pageSize = pageSize;
      this.pageNumber = 1;
      this.fetchList();
    },
    isSelected(teacher) {
      return this.selectedList.some((item) => item.id === teacher.id);
    },
    // 单选直接替换为当前项；多选在已选集合中按 id 切换增删
    selectTeacher(teacher) {
      if (!this.multiple) {
        this.selectedList = [teacher];
        return;
      }
      const index = this.selectedList.findIndex((item) => item.id === teacher.id);
      if (index > -1) {
        this.selectedList.splice(index, 1);
      } else {
        this.selectedList.push(teacher);
      }
    },
    onConfirm() {
      if (!this.selectedList.length) {
        this.$message({ message: this.multiple ? '请先选择教师' : '请先选择一位教师', duration: 2000 });
        return;
      }
      this.$emit('confirm', this.multiple ? this.selectedList : this.selectedList[0]);
    }
  }
};
</script>

<style scoped>
.tpk-search {
  margin-bottom: 10px;
}
.tpk-search__icon {
  cursor: pointer;
  line-height: 40px;
  color: var(--muted);
}
.tpk-list {
  border: 1px solid var(--line);
  border-radius: 9px;
  max-height: 320px;
  min-height: 120px;
  overflow: auto;
}
.tpk-li {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 8px 12px;
  border-bottom: 1px solid var(--line-soft);
  font-size: 12px;
  cursor: pointer;
  min-width: 0;
}
.tpk-li:last-child {
  border-bottom: 0;
}
.tpk-li:hover {
  background: #f5f9f6;
}
.tpk-li.sel {
  background: var(--hi-bg);
}
.tpk-li .rad {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 1.5px solid #c6d2cb;
  flex-shrink: 0;
  position: relative;
}
.tpk-li.sel .rad {
  border-color: var(--green);
}
.tpk-li.sel .rad::after {
  content: '';
  position: absolute;
  inset: 3px;
  border-radius: 50%;
  background: var(--green);
}
.tpk-li .rad--sq {
  border-radius: 4px;
}
.tpk-li.sel .rad--sq::after {
  inset: 2px;
  border-radius: 2px;
}
.tpk-li b {
  color: var(--ink);
  font-weight: 600;
  white-space: nowrap;
}
.tpk-li .tpk-avatar {
  flex-shrink: 0;
  background: linear-gradient(135deg, #2f7a68, #245f51);
  color: #fff;
}
.tpk-li .mtail {
  display: flex;
  align-items: center;
  gap: 30px;
  margin-left: auto;
  min-width: 0;
  flex-wrap: wrap;
  justify-content: flex-end;
}
.tpk-li .mtail em {
  font-style: normal;
  font-size: 10px;
  color: var(--muted);
  white-space: nowrap;
}
.tpk-li .sub {
  font-size: 11.5px;
  color: var(--body);
  white-space: nowrap;
}
.tpk-empty {
  padding: 8px 12px;
  font-size: 12px;
  color: var(--muted);
}
.tpk-pager {
  margin-top: 10px;
  text-align: right;
}
</style>
