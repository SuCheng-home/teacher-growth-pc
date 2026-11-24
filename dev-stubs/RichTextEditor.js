// 本地预览替身：auth-zw-components/vue/RichTextEditor，以普通多行文本框代替
export default {
  name: 'RichTextEditor',
  props: {
    value: { type: String, default: '' },
    minHeight: { type: Number, default: 200 },
    placeholder: { type: String, default: '' }
  },
  render(h) {
    return h('textarea', {
      style: { width: '100%', minHeight: `${this.minHeight}px`, padding: '8px', boxSizing: 'border-box' },
      attrs: { placeholder: this.placeholder },
      domProps: { value: this.value },
      on: { input: e => this.$emit('input', e.target.value) }
    });
  }
};
