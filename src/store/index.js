import Vue from 'vue';
import Vuex from 'vuex';
import user from './modules/user';
import archives from './modules/archives';


Vue.use(Vuex);

export default new Vuex.Store({
  modules: { user, archives },
  getters: {
    userName: state => state.user.info.name,
    userRole: state => state.user.info.role,
    schoolName: state => state.user.info.school,
    teacherIndexList: state => state.archives.teacherIndexList,
    teacherIndexFieldList: state => state.archives.teacherIndexFieldList
  }
});
