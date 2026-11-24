<template>
  <!-- 成长首页容器：抬头 + 助手/日历 + 中部三卡 + 愿景/画像/评选 + 页脚；AI 会话经 $root 事件唤起全局弹窗 -->
  <div class="growth-index">
    <!-- 页面抬头 -->
    <section class="page-heading">
      <div>
        <div class="eyebrow">GROWTH IS A CONTINUOUS JOURNEY</div>
        <h1>成长首页<span>让每一份耕耘，都被看见。</span></h1>
      </div>
    </section>

    <!-- 顶部：AI 助手面板 + 大事件日历 -->
    <section class="intro-grid">
      <gi-assistant-panel :archiveData="archiveData" @ask="onAsk" />
      <gi-calendar-panel />
    </section>

    <!-- 中部：上报档案 / 新增成果 / 修改记录 -->
    <gi-mid-area />

    <!-- 下部三卡：成长愿景 / 我的画像 / 校级评选 -->
    <div class="dashboard-grid">
      <gi-vision-section :archiveData="archiveData" />
      <gi-portrait-section />
      <gi-eval-section />
    </div>

    <div class="gi-footer">
      <span>南京市第十三中学 · 教师发展平台</span>
      <span>同源数据 · 多维发展 · 智慧赋能</span>
    </div>
  </div>
</template>

<script>
import { store } from 'auth-layout-zw'
import { computedTeacher } from '@/utils/archive';
import { getTeacherDataByCardId } from '@/api/archives';
import GiAssistantPanel from './components/gi-assistant-panel.vue';
import GiCalendarPanel from './components/gi-calendar-panel.vue';
import GiMidArea from './components/gi-mid-area.vue';
import GiVisionSection from './components/gi-vision-section.vue';
import GiPortraitSection from './components/gi-portrait-section.vue';
import GiEvalSection from './components/gi-eval-section.vue';

export default {
  name: 'GrowthIndex',
  components: {
    GiAssistantPanel,
    GiCalendarPanel,
    GiMidArea,
    GiVisionSection,
    GiPortraitSection,
    GiEvalSection
  },
  data() {
    return {
      // 当前任职（职称/岗位/骨干称号），供助手面板与愿阶梯「当前」侧展示
      archiveData: {}
    };
  },
  created() {
    this.getTeacherData();
  },
  methods: {
    getTeacherData() {
      getTeacherDataByCardId({
        tenantId: store.getters.tenantId
      }).then((res) => {
        const payload = (res && res.data) || null;
        if (payload && payload.teacher) {
          this.archiveData = computedTeacher(payload.teacher);
        } else {
          this.archiveData = {};
        }
      });
    },
    // 助手面板提问：经 $root 事件通道唤起全局 AI 会话弹窗并带入问题；空串仅打开会话
    onAsk(question) {
      this.$root.$emit('ai-chat-ask', question || '');
    }
  }
};
</script>
