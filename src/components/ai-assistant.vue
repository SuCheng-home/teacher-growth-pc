<template>
  <div>
    <button class="ai-fab" title="AI 小助手" @click="togglePanel">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 2l2.5 5 5.5.8-4 3.9.9 5.5-4.9-2.6-4.9 2.6.9-5.5-4-3.9 5.5-.8z"/></svg>
    </button>
    <div v-show="panelOpen" class="ai-panel" :class="{ fullscreen: isFullscreen }">
      <div class="ai-panel-head">
        <span class="dot"></span>
        <b>AI 小助手</b>
        <small>成长愿景 · 辅助</small>
        <div class="hbtns">
          <button class="hbtn" :class="{ on: voiceOn }" title="语音输出" @click="toggleVoice">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M11 5L6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 010 7M18.5 5.5a9 9 0 010 13"/></svg>
          </button>
          <button class="hbtn" title="全屏" @click="isFullscreen = !isFullscreen">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>
          </button>
        </div>
      </div>
      <div ref="msgs" class="ai-msgs">
        <div
          v-for="(msg, idx) in messages"
          :key="idx"
          class="msg"
          :class="msg.role"
        >
          <span v-if="msg.role === 'bot'" v-html="msg.text"></span>
          <span v-else>{{ msg.text }}</span>
          <button
            v-if="msg.role === 'bot'"
            class="speak"
            title="朗读"
            @click="speakText(msg.plain)"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M11 5L6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 010 7"/></svg>
          </button>
        </div>
      </div>
      <div class="quick-prompts">
        <button
          v-for="q in quickPrompts"
          :key="q"
          @click="handleQuick(q)"
        >{{ q }}</button>
      </div>
      <form class="ai-input" @submit.prevent="handleSend">
        <input
          ref="input"
          v-model="inputText"
          placeholder="问问资格预审相关的问题…"
          maxlength="200"
        >
        <button type="submit">发送</button>
      </form>
    </div>
  </div>
</template>

<script>
import { GAP } from '@/constants/qualification';

export default {
  name: 'AiAssistant',
  props: {
    context: { type: Object, default: () => ({}) }
  },
  data() {
    return {
      panelOpen: false,
      isFullscreen: false,
      voiceOn: false,
      inputText: '',
      messages: [],
      quickPrompts: [
        '我能不能报一级教师？',
        'AI 分析会有误差吗？',
        '数据是什么时候拉的？'
      ]
    };
  },
  beforeDestroy() {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  },
  methods: {
    togglePanel() {
      this.panelOpen = !this.panelOpen;
      if (this.panelOpen) {
        this.$nextTick(() => {
          if (this.$refs.input) this.$refs.input.focus();
        });
        if (!this.messages.length) {
          this.addBot('你好，我在成长愿景页提供协助。可询问「我能不能报」「AI 分析会有误差吗」「数据是什么时候拉的」。');
        }
      }
    },
    toggleVoice() {
      this.voiceOn = !this.voiceOn;
      if (!this.voiceOn && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      this.addBot(this.voiceOn ? '语音输出已开启，后续回答将自动朗读。' : '语音输出已关闭。');
    },
    addUser(text) {
      this.messages.push({ role: 'user', text, plain: text });
      this.scrollToBottom();
    },
    addBot(html, allowSpeak = true) {
      const plain = html.replace(/<[^>]*>/g, '');
      this.messages.push({ role: 'bot', text: html, plain });
      this.scrollToBottom();
      if (allowSpeak && this.voiceOn) this.speakText(plain);
    },
    scrollToBottom() {
      this.$nextTick(() => {
        if (this.$refs.msgs) {
          this.$refs.msgs.scrollTop = this.$refs.msgs.scrollHeight;
        }
      });
    },
    speakText(text) {
      if (!('speechSynthesis' in window)) return;
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'zh-CN';
        utterance.rate = 1;
        window.speechSynthesis.speak(utterance);
      } catch (e) { /* 静默降级 */ }
    },
    handleQuick(q) {
      this.addUser(q);
      this.addBot(this.answer(q));
    },
    handleSend() {
      const q = this.inputText.trim();
      if (!q) return;
      this.addUser(q);
      this.inputText = '';
      setTimeout(() => {
        this.addBot(this.answer(q));
      }, 200);
    },
    answer(q) {
      const ctx = this.context || {};
      const targetName = ctx.targetName || '';
      const gaps = ctx.gaps || {};
      const totals = ctx.totals || {};

      if (!ctx.targetKey) {
        return '尚未设置成长愿景，请先点「添加我的成长愿景」完成设置，再进行资格预审与差距分析。<span class="src">机制：空状态引导</span>';
      }
      if (totals.done) {
        return `「${targetName}」已达成，无需进行差距分析。可点卡片上的「编辑」更换目标，或点「添加我的成长愿景」新增更高目标，系统按新目标重新预审。`;
      }
      if (/误差|准不准|可信|对不对|靠谱/.test(q)) {
        return '三道防线控制误差：①资格判定由规则引擎按细则逐条执行，不走模型；②每条判定可展开「依据」，核对标准条款与档案记录；③AI 解读文字附误差声明，最终以标准文件原文与学校评审为准。如发现数据不符，请先在电子档案袋更正，再点「重新拉取并分析」。<span class="src">规则：判定走规则不走模型</span>';
      }
      if (/什么时候|数据.*拉|时点|时间|更新/.test(q)) {
        const time = ctx.pullTime || '最近一次';
        return `本次分析基于 ${time} 拉取的档案数据（页面顶部数据时点条常驻显示）。之后档案如有更新，时点条会提示「档案有更新，建议重新分析」，点「重新拉取并分析」即按最新数据重算。<span class="src">机制：数据时点记录</span>`;
      }
      if (/目标|修改|添加|放弃|学科带头人|删除|同类型/.test(q)) {
        return '目标由本人确认、可增删改：首次进入时 AI 按「成长愿景」推荐，本人可勾选、放弃或从标准库单独添加（如区学科带头人）。目标可修改为同类型其他目标（如一级教师改二级教师）、可删除（支持全部删除，删空后进入空状态）；新增目标与已有目标同类型时，系统会提示「已有一个同类型目标，需要更新该目标的数据吗」。改完基于最新数据时点自动重新分析。<span class="src">机制：目标自选 + 增删改 + 同类型冲突提示 + 自动重算</span>';
      }
      if (/能不能报|资格|预审|能不能评/.test(q)) {
        const g = { ok: gaps.ok || 0, wait: gaps.wait || 0, no: gaps.no || 0 };
        const ver = ctx.ver || '当前标准';
        if (g.no) {
          const firstNo = gaps.firstNoItem || '存在不符合项';
          return `按「${targetName}」标准，本人有 ${g.no} 项硬门槛不符合（${firstNo}），暂不具备申报资格。<span class="src">口径：${ver}</span>`;
        }
        if (g.wait) {
          return `按「${targetName}」标准，${g.ok} 项符合、${g.wait} 项待确认，补录档案字段后自动重判。<span class="src">口径：${ver}</span>`;
        }
        return `按「${targetName}」标准，${g.ok} 项硬门槛全部符合，具备申报资格。<span class="src">口径：${ver}</span>`;
      }
      if (/论文|课题|差多少|短板|差距/.test(q)) {
        if (!totals.total && totals.total !== 0) {
          return '当前目标资格预审未通过，先看补齐路径。<span class="src">规则：任一不符合不出分数</span>';
        }
        const worst = ctx.worstItem;
        if (!worst) {
          return '各评分项均已达标。';
        }
        const gapLabel = GAP[worst.type] || worst.type || '';
        return `「${targetName}」材料分 ${totals.total}/${totals.full}，最大缺口「${worst.n}」：${worst.score}/${worst.full}（${gapLabel}）。建议：${worst.sug}。<span class="src">口径：系统材料分 · 不含人工评审 20 分</span>`;
      }
      return '可询问「我能不能报」「AI 分析会有误差吗」「数据是什么时候拉的」「怎么编辑愿景」。当前为预设回答演示，未连接大模型。<span class="src">来源：v1.4 概要设计 5.4 · 示例数据</span>';
    }
  }
};
</script>
