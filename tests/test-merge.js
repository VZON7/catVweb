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
  normEntries, normKey, tombWins, importBlocked, importDecide, stampOf,
  get mergeReport(){return mergeReport},
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


// ════════════════════════════════════════════════════════════════
// 第247次：两条红线 —— ① 数据不会安静地消失 ② 同一条记录永远不会出现两份
// ════════════════════════════════════════════════════════════════
const clone = o => JSON.parse(JSON.stringify(o));
const allIds = () => Object.values(A.entries).flat().map(e => String(e.id));
const noDup = () => { const ids = allIds(); return ids.length === new Set(ids).size; };
const reset = () => { A.tombs = { e: {}, p: {} }; A.projects = []; A.entries = {}; };

// ── 场景十一：日期标签没补零的记录（6/4「create journal」）──────
console.log('\n【场景十一】日期标签补零：6/4 那条不再隐形，也不会变两份');
reset();
A.projects = [{ id: 'catvweb', name: 'catVweb', updatedAt: 1790509083808 }];
const cj = { id: 1780567284018, projId: 'catvweb', title: 'create journal', updatedAt: 1780567284018 };
const r1 = { id: 1783681236539, projId: 'catvweb', title: 'Add journal mechanic', updatedAt: 1783681236539 };
const r2 = { id: 1783681257615, projId: 'catvweb', title: 'Make cat diary smarter', updatedAt: 1783681257615 };
const raw = { '2026-6-4': [clone(cj)], '2026-06-04': [clone(r1), clone(r2)] };
const n1 = A.normEntries(raw);
ok('整理后只剩补零的标签', JSON.stringify(Object.keys(n1.entries)) === '["2026-06-04"]', Object.keys(n1.entries).join(','));
ok('6/4 变成 3 条（create journal 找回来了）', n1.entries['2026-06-04'].length === 3);
ok('原本的物件没被改动', Object.keys(raw).length === 2);
ok('normKey：个位数月日补零、正确的不动、怪格式不动',
  A.normKey('2026-6-4') === '2026-06-04' && A.normKey('2026-06-04') === '2026-06-04' && A.normKey('2026-12-1') === '2026-12-01' && A.normKey('abc') === 'abc');
A.entries = clone(n1.entries);
// 云端那份还是旧格式 —— 同步一次又一次，都不能把旧标签或第二份带回来
for (let i = 0; i < 5; i++) A.doMerge({ projects: [], entries: clone(raw), palette: [], tombs: { e: {}, p: {} } });
ok('跟旧格式的云端同步 5 次后，仍然只有 3 条', allIds().length === 3, '实际 ' + allIds().length);
ok('旧标签 2026-6-4 没有被带回来', !('2026-6-4' in A.entries));
ok('没有任何编号重复', noDup());

// ── 场景十二：同一个编号只留一份 ─────────────────────────────
console.log('\n【场景十二】同一个编号永远只有一份');
const twin = A.normEntries({
  '2026-07-01': [{ id: 7001, title: '旧的', updatedAt: 100 }],
  '2026-7-2':   [{ id: 7001, title: '新的', updatedAt: 200 }]
});
const twinAll = Object.values(twin.entries).flat();
ok('本机同一编号两份 → 整理成一份', twinAll.length === 1 && twin.dup === 1);
ok('留下的是修改时间较新的那份', twinAll[0].title === '新的');
ok('跟着搬到较新那份的日期', twin.entries['2026-07-02'].length === 1 && twin.entries['2026-07-01'].length === 0);

reset();
A.projects = [{ id: 'p1', name: 'x', updatedAt: 1 }];
A.entries = { '2026-07-01': [{ id: 7101, projId: 'p1', title: '原本', updatedAt: 100 }] };
A.doMerge({ projects: [], entries: { '2026-07-05': [{ id: 7101, projId: 'p1', title: '改了日期', updatedAt: 300 }] }, palette: [], tombs: { e: {}, p: {} } });
ok('对方较新、日期不同 → 搬过去，不留两份', allIds().length === 1 && A.entries['2026-07-05'][0].title === '改了日期' && A.entries['2026-07-01'].length === 0);
A.doMerge({ projects: [], entries: { '2026-07-09': [{ id: 7101, projId: 'p1', title: '更旧的', updatedAt: 50 }] }, palette: [], tombs: { e: {}, p: {} } });
ok('对方较旧、日期不同 → 不动，也不多一份', allIds().length === 1 && A.entries['2026-07-05'][0].title === '改了日期');

reset();
const file13 = { projects: [{ id: 'p1', name: 'x', updatedAt: 10 }], entries: { '2026-05-22': [{ id: 1, projId: 'p1', title: 'a', updatedAt: 10 }, { id: 2, projId: 'p1', title: 'b', updatedAt: 10 }] }, palette: [], tombs: { e: {}, p: {} } };
A.doMerge(clone(file13));
ok('第一次导入：新增 2 条', A.mergeReport.eAdd === 2 && allIds().length === 2);
A.doMerge(clone(file13)); A.doMerge(clone(file13));
ok('同一份文件再导入两次：还是 2 条', allIds().length === 2, '实际 ' + allIds().length);
ok('第三次的报告：新增 0、本来就一样 2', A.mergeReport.eAdd === 0 && A.mergeReport.eSame === 2);
ok('项目也没有变两个', A.projects.length === 1);

// ── 场景十三：最后一个动作算数 ───────────────────────────────
console.log('\n【场景十三】删除 vs 修改：较晚的那个动作算数');
reset();
A.tombs.e['8001'] = 5000;
A.doMerge({ projects: [], entries: { '2026-08-01': [{ id: 8001, title: '删之前的版本', updatedAt: 4000 }] }, palette: [], tombs: { e: {}, p: {} } });
ok('删除比修改晚 → 不复活', allIds().length === 0 && A.mergeReport.skipped === 1);
A.doMerge({ projects: [], entries: { '2026-08-01': [{ id: 8001, title: '删了之后又改过', updatedAt: 6000 }] }, palette: [], tombs: { e: {}, p: {} } });
ok('修改比删除晚 → 留下', allIds().length === 1 && A.entries['2026-08-01'][0].title === '删了之后又改过');
ok('留下之后，删除名单那一笔作废', !A.isTombedEntry(8001) && A.mergeReport.revived === 1);

reset();
A.entries = { '2026-08-02': [{ id: 8002, title: '我后来又改过', updatedAt: 7000 }] };
A.doMerge({ projects: [], entries: {}, palette: [], tombs: { e: { '8002': 6000 }, p: {} } });
ok('对方较早删、我较晚改 → 我的留着（不安静消失）', allIds().length === 1);
A.entries = { '2026-08-02': [{ id: 8003, title: '没再改过', updatedAt: 5000 }] };
A.tombs = { e: {}, p: {} };
A.doMerge({ projects: [], entries: {}, palette: [], tombs: { e: { '8003': 6000 }, p: {} } });
ok('对方较晚删、我没再改 → 跟着删', allIds().length === 0);
ok('删掉的那一笔留在删除名单里（不会被别台复活）', A.isTombedEntry(8003));

reset();
A.tombs.e['8004'] = 3000;
A.doMerge({ projects: [], entries: {}, palette: [], tombs: { e: { '8004': 8000 }, p: {} } });
ok('两边都删过 → 留较晚的删除时间', A.tombs.e['8004'] === 8000);
A.doMerge({ projects: [], entries: {}, palette: [], tombs: { e: { '8004': 1000 }, p: {} } });
ok('较早的删除时间不会盖掉较晚的', A.tombs.e['8004'] === 8000);
A.tombs.e['8005'] = 5000;
A.doMerge({ projects: [], entries: { '2026-08-05': [{ id: 8005, updatedAt: 5000 }] }, palette: [], tombs: { e: {}, p: {} } });
ok('同一毫秒（删除 = 修改）→ 算删掉', allIds().length === 0);

// ── 场景十四：手动导入删过的项目（测试账号 catVweb 的真实情况）──
console.log('\n【场景十四】导入删过的项目：先问，恢复就整组回来，跳过就一条都不进来');
const T0 = 1790600000000;   // 测试账号删掉 catvweb 的时间（比项目最后修改 1790509083808 晚）
const realFile = () => {
  const f = { projects: [{ id: 'catvweb', name: 'catVweb', updatedAt: 1790509083808 }], entries: {}, palette: [], tombs: { e: {}, p: {} } };
  for (let i = 0; i < 25; i++) { const k = '2026-06-' + String(i + 1).padStart(2, '0'); (f.entries[k] = f.entries[k] || []).push({ id: 1783000000000 + i, projId: 'catvweb', title: 't' + i, updatedAt: 1783000000000 + i }); }
  f.entries['2026-6-4'] = [{ id: 1780567284018, projId: 'catvweb', title: 'create journal', updatedAt: 1780567284018 }];
  return f;
};
reset(); A.tombs.p.catvweb = T0;
const b14 = A.importBlocked(A.backfillStamps(realFile()));
ok('找得出被挡的：1 个项目、底下 26 条记录', b14.P.length === 1 && b14.underP === 26 && b14.E.length === 0);

A.doMerge(A.importDecide(realFile(), false));
ok('选「跳过」→ 项目没进来', A.projects.length === 0);
ok('选「跳过」→ 记录也一条都没进来（不留「?」孤儿）', allIds().length === 0, '实际 ' + allIds().length);

reset(); A.tombs.p.catvweb = T0;
A.doMerge(A.importDecide(realFile(), true));
ok('选「恢复」→ 项目回来了', A.projects.length === 1 && A.projects[0].name === 'catVweb');
ok('选「恢复」→ 26 条全部进来', allIds().length === 26, '实际 ' + allIds().length);
ok('选「恢复」→ 删除名单那一笔作废', !A.isTombedProj('catvweb'));
ok('6/4 那条也整理到补零的标签底下', A.entries['2026-06-04'].some(e => e.title === 'create journal') && !('2026-6-4' in A.entries));
// 其他设备 / 云端还记着那笔旧的删除 —— 同步回来不能再把项目删掉
A.doMerge({ projects: [], entries: {}, palette: [], tombs: { e: {}, p: { catvweb: T0 } } });
ok('云端带着旧的删除名单同步回来 → 项目不会再被删', A.projects.length === 1 && allIds().length === 26);
A.doMerge(A.importDecide(realFile(), true));
ok('同一份再恢复导入一次 → 还是 26 条、1 个项目', allIds().length === 26 && A.projects.length === 1 && noDup());

// 删过的是记录本身
reset(); A.projects = [{ id: 'p9', name: 'x', updatedAt: 1 }];
A.tombs.e['9001'] = T0;
const f15 = { projects: [], entries: { '2026-09-01': [{ id: 9001, projId: 'p9', title: '删过的', updatedAt: 100 }, { id: 9002, projId: 'p9', title: '没删过的', updatedAt: 100 }] }, palette: [], tombs: { e: {}, p: {} } };
const b15 = A.importBlocked(clone(f15));
ok('删过的记录也会被问到', b15.E.length === 1 && b15.P.length === 0);
A.doMerge(A.importDecide(clone(f15), false));
ok('跳过 → 删过的不进来、没删过的照常进来', allIds().length === 1 && allIds()[0] === '9002');
A.doMerge(A.importDecide(clone(f15), true));
ok('再恢复 → 两条都在、不重复', allIds().length === 2 && noDup());

// ── 场景十五：新格式编号当时间 ───────────────────────────────
console.log('\n【场景十五】新格式编号回填时间，不能变成几万年后');
ok('新格式编号除回毫秒', A.stampOf(1788698788677002) === 1788698788677);
ok('旧格式编号不变', A.stampOf(1719000000123) === 1719000000123);
ok('字串编号照旧', A.stampOf('p1788687058667') === 1788687058667);
reset();
A.tombs.e['1788698788677002'] = 1790000000000;   // 9 月删的
A.doMerge({ projects: [], entries: { '2026-09-05': [{ id: 1788698788677002, title: 'test（没有修改时间）' }] }, palette: [], tombs: { e: {}, p: {} } });
ok('没带修改时间的新格式记录，删掉之后不会复活', allIds().length === 0);

// ── 场景十六：安全闸不分日期标签 ─────────────────────────────
console.log('\n【场景十六】安全闸认编号不认日期标签（补零之后不能卡住上传）');
A.tombs = { e: {}, p: {} };
ok('云端旧标签、本机补零标签，同一条 → 放行',
  A.wouldLoseRecords({ entries: { '2026-6-4': [{ id: 9 }] } }, { entries: { '2026-06-04': [{ id: 9 }] } }) === 0);
ok('云端有、本机真的没有 → 照样拦',
  A.wouldLoseRecords({ entries: { '2026-6-4': [{ id: 9 }, { id: 10 }] } }, { entries: { '2026-06-04': [{ id: 9 }] } }) === 1);

// ── 场景十七：随机轰炸 ───────────────────────────────────────
// 每一轮随机造出「本机」和「对方」两份：同编号跨日期重复、新旧日期格式混用、
// 两边各自删过或改过、删除时间和修改时间撞在同一刻……合并后逐条核对两条红线。
console.log('\n【场景十七】随机轰炸 3000 轮：逐条核对「不安静消失」和「不重复」');
let seed = 20260927;
const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed % n; };
const KEYS = ['2026-6-4', '2026-06-04', '2026-7-1', '2026-07-01', '2026-07-02', '2026-12-31'];
let bad = { dup: 0, lost: 0, zombie: 0, stale: 0, tombLeft: 0, pdup: 0, plost: 0 }, firstBad = '';
const side = () => {
  const entries = {}, tombs = { e: {}, p: {} }, projects = [];
  for (let id = 1; id <= 30; id++) {
    const copies = rnd(4) === 0 ? 2 : (rnd(3) ? 1 : 0);           // 有时同一编号放两份
    for (let c = 0; c < copies; c++) { const k = KEYS[rnd(KEYS.length)]; (entries[k] = entries[k] || []).push({ id, projId: 'p' + (id % 3), updatedAt: 1 + rnd(60) }); }
    if (rnd(4) === 0) tombs.e[String(id)] = 1 + rnd(60);
  }
  for (let i = 0; i < 3; i++) { if (rnd(3)) projects.push({ id: 'p' + i, name: 'n' + i, updatedAt: 1 + rnd(60) }); if (rnd(4) === 0) tombs.p['p' + i] = 1 + rnd(60); }
  return { entries, tombs, projects };
};
for (let round = 0; round < 3000; round++) {
  const L = side(), R = side();
  A.entries = clone(L.entries); A.tombs = clone(L.tombs); A.projects = clone(L.projects);
  A.doMerge({ projects: clone(R.projects), entries: clone(R.entries), palette: [], tombs: clone(R.tombs) });
  // 期望：某个编号的最终命运 = 两边所有版本里最新的修改时间 vs 两边最晚的删除时间
  const exp = new Map();
  [L, R].forEach(S => Object.values(S.entries).flat().forEach(e => { const k = String(e.id); exp.set(k, Math.max(exp.get(k) || 0, e.updatedAt)); }));
  const tomb = id => Math.max(L.tombs.e[id] || 0, R.tombs.e[id] || 0) || undefined;
  const got = new Map(); Object.values(A.entries).flat().forEach(e => { const k = String(e.id); got.set(k, (got.get(k) || []).concat(e)); });
  got.forEach((arr, id) => { if (arr.length > 1) { bad.dup++; firstBad = firstBad || ('第' + round + '轮 编号 ' + id + ' 有 ' + arr.length + ' 份'); } });
  exp.forEach((u, id) => {
    const T = tomb(id), alive = T === undefined || u > T, has = got.has(id);
    if (alive && !has) { bad.lost++; firstBad = firstBad || ('第' + round + '轮 编号 ' + id + ' 该留却不见了'); }
    if (!alive && has) { bad.zombie++; firstBad = firstBad || ('第' + round + '轮 编号 ' + id + ' 该删却还在'); }
    if (alive && has && got.get(id)[0].updatedAt !== u) { bad.stale++; firstBad = firstBad || ('第' + round + '轮 编号 ' + id + ' 留下的不是最新版'); }
    if (has && A.isTombedEntry(id)) bad.tombLeft++;
  });
  // 项目也照同样的规矩
  const pexp = new Map(); [L, R].forEach(S => S.projects.forEach(p => pexp.set(p.id, Math.max(pexp.get(p.id) || 0, p.updatedAt))));
  const pids = A.projects.map(p => p.id);
  if (pids.length !== new Set(pids).size) bad.pdup++;
  pexp.forEach((u, id) => { const T = Math.max(L.tombs.p[id] || 0, R.tombs.p[id] || 0) || undefined; if ((T === undefined || u > T) && !pids.includes(id)) bad.plost++; });
}
ok('3000 轮：没有任何一条记录出现两份', bad.dup === 0, bad.dup + ' 次 ' + firstBad);
ok('3000 轮：该留下的一条都没消失', bad.lost === 0, bad.lost + ' 次 ' + firstBad);
ok('3000 轮：该删的一条都没复活', bad.zombie === 0, bad.zombie + ' 次 ' + firstBad);
ok('3000 轮：留下的永远是最新那一版', bad.stale === 0, bad.stale + ' 次 ' + firstBad);
ok('3000 轮：留下的东西不会同时挂在删除名单上', bad.tombLeft === 0, bad.tombLeft + ' 次');
ok('3000 轮：项目不重复、该留的项目都在', bad.pdup === 0 && bad.plost === 0, 'dup ' + bad.pdup + ' lost ' + bad.plost);
reset();

console.log('\n' + '─'.repeat(46));
console.log(fail === 0 ? `全部通过：${pass} 项 ✅` : `通过 ${pass}，失败 ${fail} ❌`);
process.exit(fail === 0 ? 0 : 1);
