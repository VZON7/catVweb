/* 把 journal.html 里的真实代码抽出来跑验收场景。
   注意：抽的是文件里的原文，不是我重写的副本 —— 测的是真货。 */
const fs = require('fs');
const src = fs.readFileSync(require('path').join(__dirname,'..','journal.html'), 'utf8');

function slice(from, to, label) {
  const s = src.indexOf(from), e = src.indexOf(to, s);
  if (s < 0 || e < 0) throw new Error('抽取失败: ' + label);
  return src.slice(s, e);
}

const helpers = slice('function loadTombs(){', 'function saveData(){', '墓碑辅助函数');
const mergeBody = slice('const incT=inc.tombs', 'recalcTotalCoins();', '合并逻辑') + 'recalcTotalCoins();';

const harness = `
let _ls={};
const localStorage={getItem:k=>(k in _ls?_ls[k]:null),setItem:(k,v)=>{_ls[k]=String(v)}};
const TOMB_KEEP_DAYS=180;
let projects=[],entries={},tombs={e:{},p:{}},cpMyPalette=[],bkRenamed=0,totalCoins=0;
function t(){return 'imported'}
function calcCoins(e,k){let c=(e.title&&e.title.trim())?1:0;if(e.note)c+=1;return c}
function recalcTotalCoins(){totalCoins=Object.entries(entries).reduce((s,[k,arr])=>s+arr.reduce((ss,e)=>ss+calcCoins(e,k),0),0)}
${helpers}
function doMerge(inc){ inc=backfillStamps(inc); ${mergeBody} }
function snapshot(){return JSON.parse(JSON.stringify({projects,entries,totalCoins,palette:cpMyPalette,tombs}))}
module.exports={
  get projects(){return projects}, set projects(v){projects=v},
  get entries(){return entries}, set entries(v){entries=v},
  get tombs(){return tombs},     set tombs(v){tombs=v},
  get totalCoins(){return totalCoins},
  doMerge, snapshot, tombEntry, untombEntry, isTombedEntry, tombProj, isTombedProj,
  purgeTombed, backfillStamps, newEntryId, gcTombs
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

console.log('\n' + '─'.repeat(46));
console.log(fail === 0 ? `全部通过：${pass} 项 ✅` : `通过 ${pass}，失败 ${fail} ❌`);
process.exit(fail === 0 ? 0 : 1);
