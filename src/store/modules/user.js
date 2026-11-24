/**
 * 演示用户模块（当前为硬编码演示数据，后续对接后端登录态）
 */
const user = {
  namespaced: true,
  state: {
    info: {
      name: '朱斌',
      role: '高中地理',
      school: '南京市第十三中学'
    }
  },
  mutations: {
    SET_INFO: (state, info) => {
      state.info = info;
    }
  }
};

export default user;
