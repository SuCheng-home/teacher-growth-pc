// 本地预览替身：auth-zw-components/vue/FileUploader（上传在预览环境中不可用）
export default {
  name: 'FileUploader',
  props: {
    value: { type: Array, default: () => [] }
  },
  methods: {
    handleTriggerClick() {
      this.$message && this.$message.info('本地预览环境暂不支持文件上传');
    }
  },
  render(h) {
    return h('div', { on: { click: this.handleTriggerClick } }, this.$slots.default);
  }
};
