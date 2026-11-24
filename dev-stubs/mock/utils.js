// 本地预览模拟数据的公共工具：确定性随机数、时间格式化、分页与自增 id

export function createRandom(seed) {
  let state = seed >>> 0;
  return function random() {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const pad = n => String(n).padStart(2, '0');

export function fmtDateTime(date) {
  const d = date instanceof Date ? date : new Date(date);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export function fmtDate(date) {
  return fmtDateTime(date).slice(0, 10);
}

export function nowText() {
  return fmtDateTime(new Date());
}

// 相对当前时间偏移若干天（可带小时），保证「进行中」类数据始终落在当前时间窗内
export function daysFromNow(days, hour = 9, minute = 0) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, minute, 0, 0);
  return fmtDateTime(d);
}

export function parseTime(text) {
  return text ? new Date(String(text).replace(/-/g, '/')).getTime() : NaN;
}

let seq = 9000;
export function nextId(prefix = '') {
  seq += 1;
  return prefix + seq;
}

export function round1(n) {
  return Math.round(n * 10) / 10;
}

export function clone(value) {
  return value === undefined ? value : JSON.parse(JSON.stringify(value));
}

// records/total 与 rows/total 两种分页口径都返回，调用方各取所需
export function paginate(list, currentPage, pageSize) {
  const page = Math.max(1, Number(currentPage) || 1);
  const size = Math.max(1, Number(pageSize) || 10);
  const slice = list.slice((page - 1) * size, page * size);
  return { records: slice, rows: slice, list: slice, total: list.length, current: page, size };
}

// 同一记录按 id 新增或覆盖
export function upsert(list, record, prefix) {
  if (record.id) {
    const idx = list.findIndex(item => String(item.id) === String(record.id));
    if (idx > -1) {
      list.splice(idx, 1, { ...list[idx], ...record, updateTime: nowText() });
      return list[idx];
    }
  }
  const created = { ...record, id: record.id || nextId(prefix), createTime: nowText(), updateTime: nowText() };
  list.push(created);
  return created;
}

export function removeById(list, id) {
  const idx = list.findIndex(item => String(item.id) === String(id));
  if (idx > -1) list.splice(idx, 1);
  return idx > -1;
}
