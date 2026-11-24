<template>
  <div class="ai-chat-result">
    <!-- 正文：markdown-it 渲染 + DOMPurify 消毒后的安全 HTML -->
    <div v-if="richHtml" class="acr-text" v-html="richHtml"></div>

    <!-- 口径/截断等提醒 -->
    <div v-if="result.warnings && result.warnings.length" class="acr-warnings">
      <div v-for="(w, wi) in result.warnings" :key="wi" class="acr-warning">
        <i class="acr-warn-ico">!</i>{{ w }}
      </div>
    </div>

    <!-- 结构化表格 -->
    <div v-for="(table, ti) in tables" :key="'tbl' + ti" class="acr-table-wrap">
      <div v-if="table.title" class="acr-table-title">
        {{ table.title }}
        <span v-if="table.truncated" class="acr-truncated">（结果已截断，仅展示部分）</span>
      </div>
      <table class="acr-table">
        <thead>
          <tr>
            <th v-for="col in table.columns" :key="col.key">{{ col.label }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, ri) in table.rows" :key="ri">
            <td v-for="col in table.columns" :key="col.key">{{ formatCell(row[col.key]) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 图表：由 ECharts 渲染（echarts 作为公共依赖由宿主项目安装） -->
    <div v-for="(chart, ci) in charts" :key="'cht' + ci" class="acr-chart-wrap">
      <div class="acr-chart-title">{{ chart.title }}</div>
      <div :ref="'chart' + ci" class="acr-chart"></div>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import { renderMarkdown } from './markdown'
import { getAiChatConfig } from './config'

export default {
  name: 'AiChatResult',
  props: {
    // AskData 结果对象：{ text, warnings, tables, charts, ... }
    result: {
      type: Object,
      default: () => ({})
    }
  },
  computed: {
    richHtml() {
      return renderMarkdown(this.result && this.result.text)
    },
    tables() {
      return (this.result && this.result.tables) || []
    },
    charts() {
      return (this.result && this.result.charts) || []
    }
  },
  watch: {
    result() {
      this.$nextTick(this.renderCharts)
    }
  },
  created() {
    // ECharts 实例集合为非响应式，放入 created 避免 Vue 深度代理
    this.chartInstances = []
  },
  mounted() {
    this.$nextTick(this.renderCharts)
  },
  beforeDestroy() {
    this.disposeCharts()
  },
  methods: {
    formatCell(value) {
      if (value === null || value === undefined) return ''
      if (typeof value === 'boolean') return value ? '是' : '否'
      return value
    },
    // 按 table_id + x_key/y_key 从引用表格取数渲染 ECharts
    renderCharts() {
      const charts = this.charts
      if (!charts.length) return
      const refs = this.$refs
      charts.forEach((chart, index) => {
        const domList = refs['chart' + index]
        const dom = Array.isArray(domList) ? domList[0] : domList
        if (!dom) return
        const source = this.tables.find((t) => t.id === chart.table_id) || { rows: [] }
        const categories = source.rows.map((row) => row[chart.x_key])
        const values = source.rows.map((row) => row[chart.y_key])
        const instance = echarts.init(dom)
        instance.setOption(this.buildOption(chart, categories, values))
        this.chartInstances.push(instance)
      })
    },
    buildOption(chart, categories, values) {
      // 以组件主题色作图表主色，其余取内置互补色板
      const primary = (getAiChatConfig().theme || {}).primary || '#2f7a68'
      const palette = [primary, '#5aa9d6', '#f0a35e', '#8b7fd0', '#e0836f', '#67c3a6']
      if (chart.type === 'pie') {
        return {
          color: palette,
          tooltip: { trigger: 'item' },
          series: [{
            type: 'pie',
            radius: '60%',
            data: categories.map((name, i) => ({ name, value: values[i] }))
          }]
        }
      }
      return {
        color: palette,
        tooltip: { trigger: 'axis' },
        xAxis: { type: 'category', data: categories },
        yAxis: { type: 'value' },
        series: [{ type: chart.type === 'line' ? 'line' : 'bar', data: values }]
      }
    },
    disposeCharts() {
      (this.chartInstances || []).forEach((instance) => {
        if (instance && instance.dispose) instance.dispose()
      })
      this.chartInstances = []
    }
  }
}
</script>

<style lang="scss" scoped>
.ai-chat-result {
  font-size: 12.5px;
  line-height: 1.78;
  color: #3c4b42;
  word-break: break-word;
}
.acr-text {
  min-width: 0;

  ::v-deep .acr-md {
    margin: 0;
  }
  ::v-deep .acr-md > :first-child {
    margin-top: 0;
  }
  ::v-deep .acr-md > :last-child {
    margin-bottom: 0;
  }
  ::v-deep .acr-md h1,
  ::v-deep .acr-md h2,
  ::v-deep .acr-md h3,
  ::v-deep .acr-md h4,
  ::v-deep .acr-md h5,
  ::v-deep .acr-md h6 {
    margin: 12px 0 6px;
    font-weight: 600;
    line-height: 1.5;
    color: #2b3a31;
  }
  ::v-deep .acr-md h1 {
    font-size: 16px;
  }
  ::v-deep .acr-md h2 {
    font-size: 14.5px;
  }
  ::v-deep .acr-md h3 {
    font-size: 13.5px;
  }
  ::v-deep .acr-md h4,
  ::v-deep .acr-md h5,
  ::v-deep .acr-md h6 {
    font-size: 12.5px;
  }
  ::v-deep .acr-md p {
    margin: 0 0 6px;
  }
  ::v-deep .acr-md ul,
  ::v-deep .acr-md ol {
    margin: 0 0 6px;
    padding-left: 20px;
  }
  ::v-deep .acr-md li {
    margin: 2px 0;
  }
  ::v-deep .acr-md li::marker {
    color: #8aa096;
  }
  ::v-deep .acr-md strong {
    font-weight: 600;
    color: #2b3a31;
  }
  ::v-deep .acr-md em {
    font-style: italic;
  }
  ::v-deep .acr-md a {
    color: var(--aichat-primary, #2f7a68);
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
  ::v-deep .acr-md code {
    padding: 1px 5px;
    margin: 0 2px;
    font-family: Consolas, Monaco, monospace;
    font-size: 12px;
    background: #eef3f0;
    border-radius: 4px;
  }
  ::v-deep .acr-md pre {
    padding: 10px 12px;
    margin: 0 0 8px;
    overflow-x: auto;
    background: #f5f7f6;
    border-radius: 8px;

    code {
      padding: 0;
      margin: 0;
      font-family: Consolas, Monaco, monospace;
      font-size: 12px;
      background: none;
      border-radius: 0;
    }
  }
  ::v-deep .acr-md blockquote {
    padding: 2px 0 2px 10px;
    margin: 0 0 6px;
    color: #6b7a70;
    border-left: 3px solid var(--aichat-primary, #2f7a68);
  }
  ::v-deep .acr-md hr {
    margin: 10px 0;
    border: 0;
    border-top: 1px solid #e3e9e5;
  }
  ::v-deep .acr-md table {
    width: 100%;
    margin: 8px 0;
    font-size: 12px;
    border-collapse: collapse;
  }
  ::v-deep .acr-md th,
  ::v-deep .acr-md td {
    padding: 6px 8px;
    text-align: left;
    word-break: break-word;
    border: 1px solid #e7ece8;
  }
  ::v-deep .acr-md th {
    font-weight: 600;
    color: #5b6b62;
    background: var(--aichat-primary-soft, #f4f9f6);
  }
}
.acr-warnings {
  padding: 8px 10px;
  margin: 8px 0;
  background: #fff8e6;
  border: 1px solid #f5e1a4;
  border-radius: 8px;
}
.acr-warning {
  font-size: 11.5px;
  line-height: 1.6;
  color: #8a6d1f;
}
.acr-warn-ico {
  display: inline-block;
  width: 14px;
  height: 14px;
  margin-right: 5px;
  font-style: normal;
  line-height: 14px;
  color: #fff;
  text-align: center;
  background: #e0a800;
  border-radius: 50%;
}
.acr-table-wrap {
  margin: 8px 0;
}
.acr-table-title {
  margin-bottom: 5px;
  font-size: 12px;
  font-weight: 600;
  color: var(--aichat-primary, #2f7a68);
}
.acr-truncated {
  font-weight: 400;
  color: #b26a00;
}
.acr-table {
  width: 100%;
  font-size: 12px;
  table-layout: fixed;
  border-collapse: collapse;
}
.acr-table th,
.acr-table td {
  padding: 6px 8px;
  overflow: hidden;
  text-align: left;
  text-overflow: ellipsis;
  border: 1px solid #e7ece8;
}
.acr-table th {
  font-weight: 600;
  color: #5b6b62;
  background: var(--aichat-primary-soft, #f4f9f6);
}
.acr-chart-wrap {
  margin: 10px 0;
}
.acr-chart-title {
  margin-bottom: 5px;
  font-size: 12px;
  font-weight: 600;
  color: var(--aichat-primary, #2f7a68);
}
.acr-chart {
  width: 100%;
  height: 220px;
}
</style>
