<template>
  <div class="pe-subtabs">
    <button
      v-for="tab in tabList"
      :key="tab.tabKey"
      class="pe-subtab"
      :class="{ on: activeSubTab === tab.tabKey }"
      type="button"
      @click="$emit('change', tab.tabKey)"
    >{{ tab.tabName }}</button>
  </div>
</template>

<script>
import { SUB_TAB } from '@/constants/peer-setting';

export default {
  name: 'PeerSubTabs',
  props: {
    activeSubTab: { type: String, default: SUB_TAB.PERSONAL }
  },
  data() {
    return {
      tabList: [
        { tabKey: SUB_TAB.PERSONAL, tabName: '个人同辈对标' },
        { tabKey: SUB_TAB.SCHOOL, tabName: '全校同辈对标' }
      ]
    };
  }
};
</script>
