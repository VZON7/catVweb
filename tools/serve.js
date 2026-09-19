#!/usr/bin/env node
/* 本地起一个静态服务器，用来在推上线之前先试改动。
 *
 *   node tools/serve.js              开 http://localhost:8080
 *   node tools/serve.js 3000         换个端口
 *
 * 不装任何依赖，Node 自带的模块就够。
 *
 * ⚠️ 一律回 Cache-Control: no-store。
 *    不这样的话，浏览器和 Service Worker 会捧着上一次的 journal.html 不放，
 *    你改完刷新看到的还是旧代码 —— 这个坑在真机上踩过好几轮，
 *    本地测试阶段宁可慢一点，也不能怀疑自己测的是哪一版。
 */
const http=require('http');
const fs=require('fs');
const path=require('path');

const ROOT=path.resolve(__dirname,'..');
const PORT=parseInt(process.argv[2]||'8080',10);

const TYPES={
  '.html':'text/html; charset=utf-8',
  '.js':'text/javascript; charset=utf-8',
  '.json':'application/json; charset=utf-8',
  '.css':'text/css; charset=utf-8',
  '.png':'image/png', '.jpg':'image/jpeg', '.jpeg':'image/jpeg',
  '.svg':'image/svg+xml', '.ico':'image/x-icon', '.webmanifest':'application/manifest+json'
};

const server=http.createServer((req,res)=>{
  let rel;
  try{ rel=decodeURIComponent(new URL(req.url,'http://x').pathname); }
  catch(e){ res.writeHead(400);return res.end('bad url'); }
  if(rel==='/')rel='/journal.html';

  // 拦住 ../ 这类往仓库外面跑的路径
  const file=path.join(ROOT,rel);
  if(!file.startsWith(ROOT)){res.writeHead(403);return res.end('forbidden');}

  fs.readFile(file,(err,buf)=>{
    if(err){
      res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});
      return res.end('找不到 '+rel);
    }
    res.writeHead(200,{
      'Content-Type':TYPES[path.extname(file).toLowerCase()]||'application/octet-stream',
      'Cache-Control':'no-store, no-cache, must-revalidate',
      'Pragma':'no-cache'
    });
    res.end(buf);
  });
});

server.listen(PORT,()=>{
  console.log('');
  console.log('  catVweb 本地服务器');
  console.log('  → http://localhost:'+PORT+'/journal.html');
  console.log('');
  console.log('  目录：'+ROOT);
  console.log('  按 Ctrl+C 停止');
  console.log('');
});

server.on('error',e=>{
  if(e.code==='EADDRINUSE'){
    console.error('端口 '+PORT+' 已经被占用了。换一个：node tools/serve.js 3000');
  }else{
    console.error(e.message);
  }
  process.exit(1);
});
