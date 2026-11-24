/**
 * AI 通用会话组件常量
 * 对接「AI基础能力 / AI助手」目录下的会话管理与业务对话接口
 */

// 业务对话场景 code：创建会话时固定，组件 scene prop 由此取值
export const AI_CHAT_SCENE = {
  // 教师数据问答（默认场景）
  TEACHER_DATA: 'teacher_data'
};

// Run 执行状态：最后三种为终态
export const RUN_STATUS = {
  QUEUED: 'queued',
  RUNNING: 'running',
  CANCELLING: 'cancelling',
  SUCCEEDED: 'succeeded',
  FAILED: 'failed',
  CANCELLED: 'cancelled'
};

// 终态集合：命中后停止订阅、收尾气泡
export const RUN_FINAL_STATUSES = [
  RUN_STATUS.SUCCEEDED,
  RUN_STATUS.FAILED,
  RUN_STATUS.CANCELLED
];

// 历史消息执行状态
export const MESSAGE_STATUS = {
  QUEUED: 'queued',
  RUNNING: 'running',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled'
};

// SSE 事件类型（会话级跨任务事件流）：
// run_created 新 Run 创建；message_* 消息投递状态；queue_updated 待发送队列快照；
// text_delta 草稿、result 权威结果、done 仅结束对应 Run、error 含队列级错误
export const EVENT_TYPES = {
  RUN_CREATED: 'run_created',
  MESSAGE_ASSIGNED: 'message_assigned',
  MESSAGE_APPLIED: 'message_applied',
  MESSAGE_WITHDRAWN: 'message_withdrawn',
  QUEUE_UPDATED: 'queue_updated',
  CONTROL_UPDATED: 'control_updated',
  TEXT_DELTA: 'text_delta',
  RESULT: 'result',
  DONE: 'done',
  ERROR: 'error'
};

// 反馈评价：点赞、点踩、取消
export const FEEDBACK_RATING = {
  LIKE: 'like',
  DISLIKE: 'dislike'
};

// 问题分类 code → 中文标签（点踩时可选，可多选）
export const FEEDBACK_CATEGORIES = {
  incorrect: '内容错误',
  irrelevant: '答非所问',
  incomplete: '内容不完整',
  other: '其他'
};

// 附件约束：最多 3 个、单个 20MB，接口支持 doc/docx/pdf/xlsx/csv/txt/md
export const MAX_FILES = 3;
export const MAX_FILE_SIZE = 20 * 1024 * 1024;
export const ATTACHMENT_ACCEPT = [
  '.doc', '.docx', '.pdf', '.xlsx', '.csv', '.txt', '.md'
];

// 会话列表 / 历史消息分页大小
export const CONVERSATION_PAGE_SIZE = 20;
export const MESSAGE_PAGE_SIZE = 50;

// 单条会话保留的最大消息数（本地视图裁剪，避免无限增长）
export const MAX_MESSAGES = 200;
