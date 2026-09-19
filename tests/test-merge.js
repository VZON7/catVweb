/* 把 journal.html 里的真实代码抽出来跑验收场景。
   注意：抽的是文件里的原文，不是我重写的副本 —— 测的是真货。 */
const fs = require('fs');
const src = fs.readFileSync(require('path').join(__dirname,'..','journal.html'), 'utf8');

function slice(from, to, label) {
  const s = src.indexOf(from), e = src.indexOf(to, s);
  if (s < 0 || e < 0) throw new Error('抽取失败: ' + label);
  return src.slice(s, e);
}

// 这一段涵盖墓碑辅助函数 + 合并引擎 mergeIncoming()
const helpers = slice('function loadTombs(){', 'function saveData(){', '数据层辅助函数');
if (!/function mergeIncoming\(/.test(helpers)) throw new Error('抽取失败: 没抓到 mergeIncoming');
// 上传安全闸（在云端同步模块里）
const guard = slice('function cntRecords(o){', 'async function cloudSync(', '上传安全闸');
if (!/function wouldLoseRecords\(/.test(guard)) throw new Error('抽取失败: 没抓到 wouldLoseRecords');

// 「有改动没传上去」这个标记的落盘逻辑
const dirty = slice('function setDirty(on){', 'function schedulePush(){', 'setDirty');
if (!/localStorage\.setItem\('cj_dirty'/.test(dirty)) throw new Error('抽取失败: setDirty 没写 cj_dirty');

const harness = `
let _ls={},_lsFail=false;
const localStorage={
  getItem:k=>(k in _ls?_ls[k]:null),
  setItem:(k,v)=>{if(_lsFail)throw new Error('quota');_ls[k]=String(v)},
  removeItem:k=>{if(_lsFail)throw new Error('quota');delete _ls[k]}
};
let _dirty=false;
${dirty}
function _lsPeek(k){return (k in _ls?_ls[k]:null)}
function _lsBreak(on){_lsFail=on}
function _getDirty(){return _dirty}
const TOMB_KEEP_DAYS=180;
let projects=[],entries={},tombs={e:{},p:{}},cpMyPalette=[],bkRenamed=0,totalCoins=0;
function t(){return 'imported'}
function calcCoins(e,k){let c=(e.title&&e.title.trim())?1:0;if(e.note)c+=1;return c}
function recalcTotalCoins(){totalCoins=Object.entries(entries).reduce((s,[k,arr])=>s+arr.reduce((ss,e)=>ss+calcCoins(e,k),0),0)}
${helpers}
${guard}
function doMerge(inc){ return mergeIncoming(backfillStamps(inc)); }
function snapshot(){return JSON.parse(JSON.stringify({projects,entries,totalCoins,palette:cpMyPalette,tombs}))}
module.exports={
  get projects(){return projects}, set projects(v){projects=v},
  get entries(){return entries}, set entries(v){entries=v},
  get tombs(){return tombs},     set tombs(v){tombs=v},
  get totalCoins(){return totalCoins},
  doMerge, snapshot, tombEntry, untombEntry, isTombedEntry, tombProj, isTombedProj,
  purgeTombed, backfillStamps, newEntryId, gcTombs, syncMode, wouldLoseRecords, cntRecords,
  wouldLoseDetail, cntProjects,
  setDirty, _lsPeek, _lsBreak, _getDirty
};`;

const M = new module.constructor();
M._compile(harness, 'harness.js');
const A = M.exports;

let pass = 0, fail = 0;
const ok = (name, cond, extra) => {
  if (cond) { console.log('  ✓ ' + name); pass++; }
  else { console.log('  ✗ ' + name + (extra ? '  → ' + extra : '')); fail++; }
};
const count = () => Object.values(A.entries).reduce((n, a) => n + a.length, 0);

// ── 场景一：导出 → 删一条 → 导入同一份备份 → 不能复活 ─────────
console.log('\n【场景一】删掉的记录不能被旧备份复活');
A.projects = [{ id: 'p1', name: 'Duolingo', updatedAt: 1000 }];
A.entries = {
  '2026-07-01': [
    { id: 1001, projId: 'p1', title: '第一条', note: '', updatedAt: 1001 },
    { id: 1002, projId: 'p1', title: '第二条', note: '', updatedAt: 1002 }
  ]
};
const backup = A.snapshot();                    // 导出
A.entries['2026-07-01'] = A.entries['2026-07-01'].filter(e => e.id !== 1002);
A.tombEntry(1002);                              // 删掉第二条
ok('删完只剩 1 条', count() === 1, '实际 ' + count());
A.doMerge(JSON.parse(JSON.stringify(backup)));  // 导入旧备份
ok('导入后依然只有 1 条（没复活）', count() === 1, '实际 ' + count());
ok('第二条确实不在了', !A.entries['2026-07-01'].some(e => e.id === 1002));

// ── 场景二：两边都有同一条，新的赢 ─────────────────────────
console.log('\n【场景二】两边都改过同一条，新旧记号决定谁赢');
A.tombs = { e: {}, p: {} };
A.projects = [{ id: 'p1', name: 'Duolingo', updatedAt: 1000 }];
A.entries = { '2026-07-01': [{ id: 2001, projId: 'p1', title: '旧标题', note: '修了个bug', updatedAt: 5000 }] };
A.doMerge({ projects: [], entries: { '2026-07-01': [{ id: 2001, projId: 'p1', title: '新标题', note: '修好了暗色模式', updatedAt: 9000 }] }, palette: [], tombs: { e: {}, p: {} } });
ok('新的覆盖旧的', A.entries['2026-07-01'][0].title === '新标题', '实际 ' + A.entries['2026-07-01'][0].title);
ok('note 也跟着更新', A.entries['2026-07-01'][0].note === '修好了暗色模式');
ok('没有变成两条', count() === 1, '实际 ' + count());

A.doMerge({ projects: [], entries: { '2026-07-01': [{ id: 2001, projId: 'p1', title: '更旧的', updatedAt: 100 }] }, palette: [], tombs: { e: {}, p: {} } });
ok('更旧的进不来', A.entries['2026-07-01'][0].title === '新标题');

// ── 场景三：对方删了项目，我这边跟着删（含 200 条记录）──────
console.log('\n【场景三】对方删掉项目，我这边跟着清，不会复活');
A.tombs = { e: {}, p: {} };
A.projects = [{ id: 'pA', name: 'Duolingo', updatedAt: 1 }, { id: 'pB', name: 'catVweb', updatedAt: 1 }];
A.entries = { '2026-07-02': [] };
for (let i = 0; i < 200; i++) A.entries['2026-07-02'].push({ id: 3000 + i, projId: 'pA', title: 'r' + i, updatedAt: 1 });
A.entries['2026-07-02'].push({ id: 9999, projId: 'pB', title: '别动我', updatedAt: 1 });
ok('起始 201 条', count() === 201, '实际 ' + count());
const otherTombs = { e: {}, p: { pA: Date.now() } };
for (let i = 0; i < 200; i++) otherTombs.e[String(3000 + i)] = Date.now();
A.doMerge({ projects: [], entries: {}, palette: [], tombs: otherTombs });
ok('pA 项目被清掉', !A.projects.some(p => p.id === 'pA'));
ok('pA 的 200 条记录被清掉', count() === 1, '实际 ' + count());
ok('pB 的记录没被误伤', A.entries['2026-07-02'][0].id === 9999);

// ── 场景四：撤销删除后，记录要能回来 ───────────────────────
console.log('\n【场景四】撤销删除后，记录必须能回来（名单要撤销）');
A.tombs = { e: {}, p: {} };
A.entries = { '2026-07-03': [{ id: 4001, title: 'x', updatedAt: 1 }] };
A.tombEntry(4001);
A.entries['2026-07-03'] = [];
ok('删除后名单里有它', A.isTombedEntry(4001));
A.untombEntry(4001);
A.entries['2026-07-03'].push({ id: 4001, title: 'x', updatedAt: 1 });
ok('撤销后名单里没有了', !A.isTombedEntry(4001));
A.purgeTombed();
ok('撤销回来的记录不会被清掉', count() === 1, '实际 ' + count());

// ── 场景五：老数据没有新旧记号，回填要稳定且跨设备一致 ────────
console.log('\n【场景五】老数据回填新旧记号');
const old = { projects: [{ id: 'p1719000000000', name: 'x' }], entries: { '2026-01-01': [{ id: 1719000000123, title: 'y' }] } };
const f1 = A.backfillStamps(JSON.parse(JSON.stringify(old)));
const f2 = A.backfillStamps(JSON.parse(JSON.stringify(old)));
ok('记录拿到记号', f1.entries['2026-01-01'][0].updatedAt === 1719000000123);
ok('项目拿到记号', f1.projects[0].updatedAt === 1719000000000);
ok('两台设备算出来一样（不会互相打架）', f1.entries['2026-01-01'][0].updatedAt === f2.entries['2026-01-01'][0].updatedAt);

// ── 场景六：id 防撞 ────────────────────────────────────────
console.log('\n【场景六】新 id 仍是数字、单调递增、同毫秒不撞');
const ids = []; for (let i = 0; i < 50000; i++) ids.push(A.newEntryId());
ok('全是数字', ids.every(i => typeof i === 'number'));
ok('没超出安全整数', ids.every(i => Number.isSafeInteger(i)));
ok('严格递增（排序靠 a.id-b.id）', ids.every((v, i) => i === 0 || v > ids[i - 1]));
const dup = ids.length - new Set(ids).size;
ok('本机连续生成 5 万个，重复数 = 0', dup === 0, '重复 ' + dup);
ok('比旧格式大（新记录排在后面）', ids[0] > Date.now());
// 跨设备：两台机器在同一毫秒各记一条，撞号概率应 < 1%
let clash = 0, TRIES = 20000;
for (let i = 0; i < TRIES; i++) {
  const ms = 1760000000000 + i;
  if ((ms * 1000 + Math.floor(Math.random() * 1000)) === (ms * 1000 + Math.floor(Math.random() * 1000))) clash++;
}
ok('跨设备同毫秒撞号率 < 1%', clash / TRIES < 0.01, (clash / TRIES * 100).toFixed(2) + '%');

// ── 场景七：换账号登录，不能把上一个账号的记录带过去 ────────
console.log('\n【场景七】换账号保护（防数据串账）');
ok('从没同步过 → 合并（认领本机已有记录）', A.syncMode('', 'userA') === 'merge');
ok('同一个账号 → 合并（正常同步）', A.syncMode('userA', 'userA') === 'merge');
ok('换了账号 → 覆盖，不合并', A.syncMode('userA', 'userB') === 'replace');
ok('登出后换人登录 → 覆盖', A.syncMode('userA', '') === 'replace');

// ── 场景八：上传安全闸（整包同步最致命的缺陷）─────────────
console.log('\n【场景八】上传安全闸：空客户端不能清空云端');
const cloud = { entries: { '2026-09-06': [{ id: 1 }, { id: 2 }, { id: 3 }] } };
A.tombs = { e: {}, p: {} };

ok('本地空 → 会弄丢 3 条 → 必须拦下',
  A.wouldLoseRecords(cloud, { entries: {} }) === 3);
ok('本地有全部 3 条 → 放行',
  A.wouldLoseRecords(cloud, cloud) === 0);
ok('本地多一条新的 → 放行',
  A.wouldLoseRecords(cloud, { entries: { '2026-09-06': [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }] } }) === 0);

A.tombEntry(2);
ok('自己删掉的记录不算弄丢 → 放行',
  A.wouldLoseRecords(cloud, { entries: { '2026-09-06': [{ id: 1 }, { id: 3 }] } }) === 0);
ok('删了 1 条但另有 1 条没见过 → 仍要拦',
  A.wouldLoseRecords(cloud, { entries: { '2026-09-06': [{ id: 1 }] } }) === 1);

A.tombs = { e: {}, p: {} };
ok('云端是空的 → 无所谓，放行', A.wouldLoseRecords({ entries: {} }, { entries: {} }) === 0);
ok('云端没数据(null) → 放行', A.wouldLoseRecords(null, { entries: {} }) === 0);

// ── 场景十：安全闸也要守住「项目」────────────────────────
// 以前只数 entries，于是「只动了项目、没动记录」的改动完全不受保护：
// 新建一个还没记东西的空项目、改名、改颜色，都能被另一台设备无声抹掉。
console.log('\n【场景十】安全闸：项目也不能被悄悄抹掉');
A.tombs = { e: {}, p: {} };
A.projects = [];
const cloudP = {
  entries: { '2026-09-06': [{ id: 1 }] },
  projects: [{ id: 'p1', name: '读书' }, { id: 'p2', name: '健身' }]
};

ok('云端有 2 个项目、本地一个都没有 → 拦下',
  A.wouldLoseDetail(cloudP, { entries: { '2026-09-06': [{ id: 1 }] }, projects: [] }).p === 2);
ok('两个项目都在 → 放行',
  A.wouldLoseDetail(cloudP, cloudP).p === 0);
ok('本地多一个新项目 → 放行',
  A.wouldLoseDetail(cloudP, { entries: cloudP.entries, projects: cloudP.projects.concat([{ id: 'p3', name: '新的' }]) }).p === 0);

A.tombProj('p2');
ok('自己删掉的项目不算弄丢 → 放行',
  A.wouldLoseDetail(cloudP, { entries: cloudP.entries, projects: [{ id: 'p1', name: '读书' }] }).p === 0);
ok('删了 p2 但 p1 也没见过 → 仍要拦',
  A.wouldLoseDetail(cloudP, { entries: cloudP.entries, projects: [] }).p === 1);
A.tombs = { e: {}, p: {} };

// 这是最要命的一种：一条记录都没少，只有项目没了 —— 旧版会完全看不见
ok('⚠️ 记录一条没少、只丢项目 → 旧版数出来是 0，新版必须拦下',
  A.wouldLoseRecords(cloudP, { entries: { '2026-09-06': [{ id: 1 }] }, projects: [] }) === 2);
ok('项目字段（名字/颜色）不参与判断，只看 id 在不在',
  A.wouldLoseDetail(cloudP, { entries: cloudP.entries, projects: [{ id: 'p1', name: '改过名' }, { id: 'p2', name: 'x' }] }).p === 0);
ok('云端没有 projects 字段 → 不误报', A.wouldLoseDetail({ entries: {} }, { entries: {} }).p === 0);
ok('cntProjects 数得对', A.cntProjects(cloudP) === 2 && A.cntProjects(null) === 0 && A.cntProjects({}) === 0);

// ── 场景九：「有改动没传上去」这个标记必须落盘 ─────────────
// 手机 App 被系统回收后重新打开，程序要知道自己还欠着东西 ——
// 登出时那道「没推成功就不准清本机」的保护正是看这个标记。
console.log('\n【场景九】待上传标记落盘（手机被回收也不会忘）');
A.setDirty(true);
ok('标记打上 → 内存里是 true', A._getDirty() === true);
ok('标记打上 → 写进了 localStorage', A._lsPeek('cj_dirty') === '1');
A.setDirty(false);
ok('推成功 → 内存里是 false', A._getDirty() === false);
ok('推成功 → localStorage 里清掉了', A._lsPeek('cj_dirty') === null);

// 无痕模式 / 存储被禁用时 localStorage 会抛错，绝不能因此崩掉整个应用
A._lsBreak(true);
let threw = false;
try { A.setDirty(true); } catch (e) { threw = true; }
A._lsBreak(false);
ok('localStorage 抛错 → 不往外抛，应用照常跑', threw === false);
ok('localStorage 抛错 → 内存里的标记仍然正确', A._getDirty() === true);
A.setDirty(false);

console.log('\n' + '─'.repeat(46));
console.log(fail === 0 ? `全部通过：${pass} 项 ✅` : `通过 ${pass}，失败 ${fail} ❌`);
process.exit(fail === 0 ? 0 : 1);
