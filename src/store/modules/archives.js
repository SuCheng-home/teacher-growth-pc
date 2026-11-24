import { store as authStore } from "auth-layout-zw";
import { teacherIndexList } from "@/api/archives";

const user = {
  namespaced: true,
  state: {
    initArchives: false,
    teacherIndexList: [],
    teacherIndexFieldList: []
  },
  mutations: {
    SET_INIT_ARCHIVES: (state, initArchives) => {
      state.initArchives = initArchives;
    },
    SET_TEACHER_INDEX_LIST: (state, teacherIndexList) => {
      state.teacherIndexList = teacherIndexList;
    },
    SET_TEACHER_INDEX_FIELD_LIST: (state, teacherIndexFieldList) => {
      state.teacherIndexFieldList = teacherIndexFieldList;
    }
  },
  
  actions: {
    async initIndexList({ commit, state }) {
      if (state.initArchives) return; // 避免重复请求
      const dataArr = await Promise.all([
        teacherIndexList({
          level: 0, // 0市1区2校
          isShowBase: 1,
          cityCode: authStore.getters.city.code
        }),
        teacherIndexList({
          level: 1, // 0市1区2校
          areaCode: authStore.getters.area.code
        }),
        teacherIndexList({
          level: 2, // 0市1区2校
          unitCode: authStore.getters.unit.code
        })
      ])

      const data = [...dataArr[0].data, ...dataArr[1].data, ...dataArr[2].data]
      const allFields = data.reduce((p, c) => {
        if (c.fields) {
          p.push(...c.fields)
        }
        return p
      }, [])
      commit('SET_TEACHER_INDEX_LIST', data)
      commit('SET_TEACHER_INDEX_FIELD_LIST', allFields)
      commit('SET_INIT_ARCHIVES', true)
    }
  }
};

export default user;
