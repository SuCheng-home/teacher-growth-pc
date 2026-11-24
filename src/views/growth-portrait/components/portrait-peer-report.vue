<template>
  <!-- ③-2 同辈对比报告：汇总展示全部同辈组的对比分析结果，逐组展开六维分位明细，底部按跨组分位收口总体定位 -->
  <section v-show="enabled" id="sec-peer-report">
    <div class="card">
      <div class="sec-eyebrow">{{ cfg.eyebrow }}</div>
      <h2 class="sec-h"><i :data-lucide="cfg.icon"></i>{{ cfg.title }}</h2>
      <div class="sec-sub">{{ cfg.sub }}</div>

      <!-- 无对比结果：同辈条件未配置或六维维度统计未生成 -->
      <div v-if="!rows.length" class="goal-empty">
        <div class="ge-ico"><i data-lucide="users"></i></div>
        <h3>{{ cfg.empty.title }}</h3>
        <p>{{ cfg.empty.desc }}</p>
      </div>

      <template v-else>
        <div class="pc-wrap">
          <table class="pc-table">
            <thead>
              <tr>
                <th v-for="(col, idx) in cfg.columns" :key="col" :style="{ width: cfg.colWidths[idx] }">{{ col }}</th>
              </tr>
            </thead>
            <!-- 一个同辈组一组 tbody：汇总行 + 展开明细行，避免 template v-for 的 key 歧义 -->
            <tbody v-for="(row, index) in rows" :key="'group-' + index">
              <!-- 汇总行：一个同辈组 = 一组可比条件（含我的取值与组内规模） -->
              <tr
                class="pc-row"
                :aria-expanded="expanded[index] ? 'true' : 'false'"
                @click="toggle(index)"
              >
                <td>
                  <span class="pc-dim-in">
                    <i :data-lucide="row.icon"></i>{{ row.name }}
                    <span class="pc-caret"><i data-lucide="chevron-right"></i></span>
                  </span>
                </td>
                <td class="pc-grp">{{ row.label }} · 组内 {{ row.peerNum }} 人</td>
                <td>
                  <template v-if="row.hasStat">超过组内 <b>{{ row.totalRatio }}</b>% · 前 {{ row.rank }}%</template>
                  <span v-else class="pc-grp">暂无统计</span>
                </td>
                <td>
                  <span v-if="row.hasStat" class="pc-badge" :class="row.posKey">
                    <i :data-lucide="posMeta(row.posKey).icon"></i>{{ posMeta(row.posKey).text }}
                  </span>
                  <span v-else class="pc-grp">—</span>
                </td>
              </tr>

              <!-- 展开明细：该组六维分位条 + 各维度取分与组内标杆 -->
              <tr v-show="expanded[index]" class="pc-detail">
                <td colspan="4">
                  <div class="pc-detail-in">
                    <div v-if="row.dimensions.length" class="pc-metric">
                      <div v-for="dim in row.dimensions" :key="'m-' + dim.title" class="pc-mline">
                        <span>我 · {{ dim.title }}</span>
                        <div class="pc-mtrack"><div class="pc-mfill" :style="{ width: dim.ratio + '%' }"></div></div>
                        <b>{{ dim.ratio }}</b>
                      </div>
                      <div class="pc-mline ref">
                        <span>{{ cfg.medianLabel }}</span>
                        <div class="pc-mtrack"><div class="pc-mfill" :style="{ width: medianRatio + '%' }"></div></div>
                        <b>{{ medianRatio }}</b>
                      </div>
                    </div>

                    <ul class="pc-points">
                      <li v-if="row.hasStat"><b>综合表现：</b>综合得分 {{ row.totalScore }} 分，组内第 {{ row.totalRank }} 名（超过组内 {{ row.totalRatio }}% 的人）</li>
                      <li v-for="dim in row.dimensions" :key="'p-' + dim.title">
                        <b>{{ dim.title }}</b>：组内分位 <b>{{ dim.ratio }}%</b>｜我的得分 {{ dim.score }}／组内平均 {{ dim.avgScore }}／组内最高 {{ dim.topScore }}<template v-if="dim.topAwardName">｜组内标杆「{{ dim.topAwardName }}」{{ dim.topUserName }}</template>
                      </li>
                      <li><b>{{ cfg.strongLabel }}</b>{{ row.strong.length ? row.strong.join('、') : '暂无' }}</li>
                      <li><b>{{ cfg.weakLabel }}</b>{{ row.weak.length ? row.weak.join('、') : '暂无' }}</li>
                      <li v-if="row.smallSample"><b>样本提示：</b>{{ cfg.smallSampleTip }}</li>
                    </ul>

                    <div class="pc-src">{{ cfg.sourceNote }} ·「{{ row.name }}」组内 {{ row.peerNum }} 人</div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 总体定位：按组定位计数 + 跨组维度收口 -->
        <div class="pc-total">
          <h3><i data-lucide="gauge"></i>{{ cfg.totalTitle }}</h3>
          <div class="pc-tl">
            <span v-for="key in totalKeys" :key="key" class="pc-tag" :class="key">
              {{ cfg.totalTagLabel[key] }}<b>{{ groupCount(key) }}</b>组
            </span>
          </div>
          <ul>
            <li v-for="key in totalKeys" :key="'total-' + key"><b>{{ cfg.totalPoints[key].lead }}</b>{{ dimensionGroups[key] }}</li>
          </ul>
        </div>
      </template>
    </div>
  </section>
</template>

<script>
import { PORTRAIT_PEER_REPORT } from '@/constants/growth-portrait';
import { MIN_GROUP_SAMPLE_SIZE } from '@/constants/growth-peer';
import { GROUP_MEDIAN_RATIO } from '@/utils/peer-benchmark';

// 组内中位分位（50）：各维度分位与它比较得出高于 / 持平 / 低于
const MEDIAN_RATIO = Math.round(GROUP_MEDIAN_RATIO * 100);

export default {
  name: 'PortraitPeerReport',
  props: {
    /* 段落是否显示（父组件按 frame.sections.peerReport 传入） */
    enabled: { type: Boolean, default: true },
    /* 全部同辈组对比结果：每项 { name, label, peerNum, totalRatio, totalRank, strongDimensions, weakDimensions, dimensions } */
    groups: { type: Array, default: () => [] }
  },
  data() {
    return {
      cfg: PORTRAIT_PEER_REPORT,
      medianRatio: MEDIAN_RATIO,
      // 收口标签与结论的固定顺序：高于 / 持平 / 低于
      totalKeys: ['up', 'flat', 'down'],
      // 行展开态：键为行序号，允许多行同时展开
      expanded: {}
    };
  },
  computed: {
    // 汇总行：一个同辈组一行，综合分位取组内超过比例，定位按与中位的分位差判定
    rows() {
      return (this.groups || []).map(group => {
        const hasStat = group.totalRatio !== null && group.totalRatio !== undefined;
        const totalRatio = hasStat ? Math.round(group.totalRatio) : 0;
        return {
          name: group.name || '未命名组',
          label: group.label || '—',
          icon: this.iconOf(group.name),
          peerNum: group.peerNum || 0,
          smallSample: (group.peerNum || 0) < MIN_GROUP_SAMPLE_SIZE,
          hasStat,
          totalRatio,
          totalScore: this.numText(group.totalScore),
          totalRank: group.totalRank === null || group.totalRank === undefined ? '—' : group.totalRank,
          rank: hasStat ? Math.round(100 - totalRatio) : null,
          posKey: hasStat ? this.posOf(totalRatio, MEDIAN_RATIO) : 'flat',
          dimensions: this.normalizeDimensions(group.dimensions),
          strong: group.strongDimensions || [],
          weak: group.weakDimensions || []
        };
      });
    },
    // 跨组维度收口：同一维度名在各组的分位求均值，再判定高于 / 持平 / 低于
    dimensionSummary() {
      const map = {};
      const list = [];
      this.rows.forEach(row => {
        row.dimensions.forEach(dim => {
          if (!map[dim.title]) {
            map[dim.title] = { title: dim.title, ratios: [] };
            list.push(map[dim.title]);
          }
          map[dim.title].ratios.push(dim.ratio);
        });
      });
      return list.map(item => {
        const avgRatio = Math.round(this.avg(item.ratios));
        return { title: item.title, groupCount: item.ratios.length, avgRatio, posKey: this.posOf(avgRatio, MEDIAN_RATIO) };
      }).sort((a, b) => b.avgRatio - a.avgRatio);
    },
    // 收口结论：按跨组平均分位归档维度名，附带平均分位与结论定调
    dimensionGroups() {
      return this.totalKeys.reduce((acc, key) => {
        const list = this.dimensionSummary.filter(item => item.posKey === key);
        const names = list.map(item => `${item.title}（平均分位 ${item.avgRatio}%）`).join('、');
        acc[key] = names ? names + this.cfg.totalPoints[key].suffix : this.cfg.noneText;
        return acc;
      }, {});
    }
  },
  watch: {
    // 数据重拉后行数可能变化，展开态按序号重置，避免错行展开
    groups() {
      this.expanded = {};
    }
  },
  methods: {
    avg(arr) {
      if (!arr.length) return 0;
      return arr.reduce((sum, n) => sum + n, 0) / arr.length;
    },
    // 先四舍五入到整数百分点再比阈值，避免浮点误差把 ±3 误判为持平
    posOf(mine, ref) {
      const diff = Math.round(mine - ref);
      if (diff >= this.cfg.posThreshold) {
        return 'up';
      }
      if (diff <= -this.cfg.posThreshold) {
        return 'down';
      }
      return 'flat';
    },
    posMeta(key) {
      return this.cfg.posMeta[key];
    },
    // 分组图标：按条件名关键字匹配，未命中回落通用人群图标
    iconOf(name) {
      const text = name || '';
      const hit = this.cfg.groupIcons.find(item => text.indexOf(item.key) > -1);
      return hit ? hit.icon : this.cfg.defaultGroupIcon;
    },
    // 维度明细归一：分位取整（0-100），得分为一位小数，缺失以 — 占位
    normalizeDimensions(dimensions) {
      return (dimensions || []).map(dim => ({
        title: dim.dimensionTitle || '未命名维度',
        ratio: Math.round(dim.ratio || 0),
        score: this.numText(dim.score),
        avgScore: this.numText(dim.avgScore),
        topScore: this.numText(dim.topScore),
        topAwardName: dim.topAwardName || '',
        topUserName: dim.topUserName || ''
      }));
    },
    numText(value) {
      if (value === null || value === undefined || value === '') return '—';
      return Math.round((Number(value) || 0) * 10) / 10;
    },
    // 定位计数：某定位下的同辈组数
    groupCount(key) {
      return this.rows.filter(row => row.hasStat && row.posKey === key).length;
    },
    toggle(index) {
      this.$set(this.expanded, index, !this.expanded[index]);
    }
  }
};
</script>
