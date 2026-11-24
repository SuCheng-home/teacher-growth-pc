<template>
  <!-- 我的画像：六维雷达（canvas）+ 同辈分位差结论文案，图表与文案同源 -->
  <section class="section portrait-section">
    <div class="section-heading">
      <h2><i data-lucide="chart-no-axes-combined"></i>我的画像</h2>
      <router-link class="text-button" to="/growth/portrait">进入我的画像<i data-lucide="arrow-right"></i></router-link>
    </div>
    <div class="section-subtitle">综合画像 · 学科/德育双轨仅在骨干称号发展路径下区分</div>
    <div ref="radarWrap" class="radar-wrap">
      <canvas ref="radar" aria-label="六维画像雷达图"></canvas>
    </div>
    <div class="radar-legend"><span></span>我的六维 <span></span>可比组中位</div>
    <div class="portrait-note">
      <i data-lucide="sparkles"></i>
      <div class="pn-list">
        <span v-for="line in portraitLines" :key="line.title" class="pn"><b>{{ line.title }}</b>{{ line.text }}</span>
      </div>
    </div>
    <p class="data-note">同学科 · 同教龄段 · 非官方评分</p>
  </section>
</template>

<script>
import { DIM_NAMES, DIM_VALUES, DIM_REF } from '@/constants/growth-index';

export default {
  name: 'GiPortraitSection',
  computed: {
    // 分档规则与内页「同辈对比报告」同源：分位差四舍五入后 ≥+3 高于 / ≤−3 低于 / 其余持平
    portraitLines() {
      const diff = DIM_VALUES.map((v, i) => Math.round((v - DIM_REF[i]) * 100));
      const up = DIM_NAMES.filter((_, i) => diff[i] >= 3);
      const flat = DIM_NAMES.filter((_, i) => diff[i] > -3 && diff[i] < 3);
      const down = DIM_NAMES.filter((_, i) => diff[i] <= -3);
      const lines = [];
      if (up.length) lines.push({ title: '高于同辈：', text: up.join('、') });
      if (flat.length) lines.push({ title: '基本持平：', text: flat.join('、') });
      if (down.length) lines.push({ title: '低于同辈：', text: down.join('、') + (down.includes('教研科研') ? '（差 2 项硬指标）' : '') });
      return lines;
    }
  },
  mounted() {
    this.drawRadar();
    // 容器尺寸变化时重绘（原型为 ResizeObserver(drawRadar).observe(.radar-wrap)）
    this.resizeObserver = new ResizeObserver(() => this.drawRadar());
    if (this.$refs.radarWrap) this.resizeObserver.observe(this.$refs.radarWrap);
  },
  beforeDestroy() {
    if (this.resizeObserver) this.resizeObserver.disconnect();
  },
  methods: {
    // 六维雷达绘制：网格环 → 轴线 → 虚线参考多边形 → 实线得分多边形 + 顶点 → 象限偏移标签
    drawRadar() {
      const canvas = this.$refs.radar;
      if (!canvas) return;
      const box = canvas.getBoundingClientRect();
      if (!box.width || !box.height) return;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = box.width * dpr;
      canvas.height = box.height * dpr;
      const ctx = canvas.getContext('2d');
      ctx.scale(dpr, dpr);
      const cx = box.width / 2;
      const cy = box.height / 2 + 1;
      const r = Math.min(box.width / 2 - 54, box.height / 2 - 30);
      const pt = (i, v) => [cx + Math.cos((i * Math.PI) / 3 - Math.PI / 2) * r * v, cy + Math.sin((i * Math.PI) / 3 - Math.PI / 2) * r * v];
      const polygon = (values, stroke, fill) => {
        ctx.beginPath();
        values.forEach((v, i) => {
          const [x, y] = pt(i, v);
          if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y);
        });
        ctx.closePath();
        ctx.strokeStyle = stroke;
        ctx.stroke();
        if (fill) {
          ctx.fillStyle = fill;
          ctx.fill();
        }
      };
      [0.25, 0.5, 0.75, 1].forEach((v) => polygon(Array(6).fill(v), '#e3eae2'));
      for (let i = 0; i < 6; i++) {
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(...pt(i, 1));
        ctx.stroke();
      }
      ctx.setLineDash([3, 3]);
      polygon(DIM_REF, '#bac8b7', '#cbd7c111');
      ctx.setLineDash([]);
      polygon(DIM_VALUES, '#628c6b', '#749b752b');
      DIM_VALUES.forEach((v, i) => {
        ctx.beginPath();
        ctx.arc(...pt(i, v), 2.5, 0, Math.PI * 2);
        ctx.fillStyle = '#648d6b';
        ctx.fill();
      });
      ctx.fillStyle = '#83927f';
      ctx.font = '10px Microsoft YaHei';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      DIM_NAMES.forEach((t, i) => {
        let [x, y] = pt(i, 1);
        x += i === 1 || i === 2 ? 26 : i === 4 || i === 5 ? -26 : 0;
        y += i === 0 ? -15 : i === 3 ? 15 : 0;
        ctx.fillText(t, x, y);
      });
    }
  }
};
</script>
