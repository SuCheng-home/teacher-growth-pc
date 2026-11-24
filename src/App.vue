<template>
  <div id="app">
    <router-view />

    <!-- AI 助手悬浮球（数字人形象）：成长首页自带助手面板，故首页不展示，避开两个入口重叠 -->
    <ai-dh-fab v-if="!isGrowthIndex" @open="openAiChat" />

    <ai-chat-dialog ref="aiChatDialog"
      :show-fab="false"
      :enable-voice="false"
      title="教师发展 AI 助手"
      context-label="成长首页 · 张老师"
      :quick-prompts="quickPrompts"
      :files.sync="chatFiles"
      :on-upload="openChatPicker" />

    <!-- AI 会话附件上传引擎：隐藏渲染，仅承担文件选择与上传，结果经 chatFiles 回传弹窗待发展示 -->
    <FileUploader
      ref="chatUploader"
      v-show="false"
      v-model="chatFiles"
      mode="attachment"
      multiple
      :show-file-list="false"
      :params="chatUploadParams"
      :accept="ATTACHMENT_ACCEPT"
      :max-count="MAX_FILES"
      :max-size="CHAT_MAX_SIZE_MB" />
  </div>
</template>

<script>
import AiDhFab from '@/components/ai-dh-fab.vue';
import FileUploader from 'auth-zw-components/vue/FileUploader';
import bizEnroll from '@/utils/bizEnroll';
import { MAX_FILES, MAX_FILE_SIZE, ATTACHMENT_ACCEPT } from '@/components/ai-chat/constants';

// AI 会话附件上传业务标识（bizEnroll 注册表键名）
const CHAT_UPLOAD_BIZ_MARK = 'teacherGrowth-ai-chat-file';

// FileUploader 单文件大小上限以 MB 计量，组件常量以字节定义，此处换算
const CHAT_MAX_SIZE_MB = MAX_FILE_SIZE / 1024 / 1024;

export default {
  name: 'App',
  components: { FileUploader, AiDhFab },
  data() {
    return {
      // 模板内引用的附件约束常量
      MAX_FILES,
      ATTACHMENT_ACCEPT,
      CHAT_MAX_SIZE_MB,
      quickPrompts: [
        '我的职称还差什么？',
        '我的档案还缺哪些材料？',
        '六维分怎么算？'
      ],
      // AI 会话待发送附件：FileUploader 上传成功后写入，经 .sync 回传弹窗展示并随消息提交
      chatFiles: [],
      // 上传业务参数（bizCode/bizId），App 生命周期内保持稳定
      chatUploadParams: bizEnroll(CHAT_UPLOAD_BIZ_MARK)
    };
  },
  computed: {
    // 是否成长首页：该页已有整块 AI 助手面板，不需要右下角悬浮球
    isGrowthIndex() {
      return this.$route.name === 'growthIndex';
    }
  },
  mounted() {
    // 监听业务页面发起的 AI 提问事件（如成长首页助手面板），唤起全局会话弹窗并带入问题
    this.$root.$on('ai-chat-ask', this.onAiChatAsk);
  },
  beforeDestroy() {
    this.$root.$off('ai-chat-ask', this.onAiChatAsk);
  },
  methods: {
    // 悬浮球点击：唤起全局会话弹窗
    openAiChat() {
      const dialog = this.$refs.aiChatDialog;
      if (dialog) dialog.open();
    },
    // 收到页面提问事件：转交会话弹窗打开并发送；空问题仅打开会话
    onAiChatAsk(question) {
      const dialog = this.$refs.aiChatDialog;
      if (dialog) dialog.openAsk(question);
    },
    // 弹窗附件按钮点击：唤起隐藏的 FileUploader 文件选择框
    openChatPicker() {
      const uploader = this.$refs.chatUploader;
      if (uploader) uploader.handleTriggerClick();
    }
  }
};
</script>
