#!/usr/bin/env node
/* 帮忘记密码的用户重设密码。
 *
 *   node tools/reset-password.js --setkey              存管理员密钥（做一次就好）
 *   node tools/reset-password.js <邮箱> <新密码>        改密码
 *   node tools/reset-password.js --who <邮箱>          只查这个人的 UUID，不改任何东西
 *
 * 密钥来源（按顺序找）：环境变量 CJ_ADMIN_KEY → tools/.admin-key
 * .admin-key 已经写进 .gitignore，不会被提交。
 */
const fs=require('fs');
const path=require('path');
const readline=require('readline');

const SB='https://buxqkndyfjhajdjwbcrp.supabase.co';
const KEYFILE=path.join(__dirname,'.admin-key');

function die(msg){console.error('\n✗ '+msg+'\n');process.exit(1);}
function ok(msg){console.log(msg);}

/* 密钥长什么样：
   - 旧式 service_role 是个 JWT，能解出 role 字段，可以提前拦住贴错的 anon
   - 新式 sb_secret_... 不是 JWT，解不开，只能等服务器回话 */
function checkKeyShape(k){
  if(k.startsWith('sb_publishable_'))
    die('这是 publishable（公开）密钥，权限不够。要用 Secret keys 里的 sb_secret_... 或 legacy 的 service_role。');
  if(k.startsWith('sb_secret_'))return;
  const parts=k.split('.');
  if(parts.length!==3)return;         // 认不出的形状就放行，让服务器去判
  try{
    const p=JSON.parse(Buffer.from(parts[1].replace(/-/g,'+').replace(/_/g,'/'),'base64').toString());
    if(p.role==='anon')
      die('这是 anon（公开）密钥，权限不够 —— journal.html 里用的就是它。\n  要的是同一页 Legacy 标签下的 service_role，点 Reveal 再复制。');
    if(p.role&&p.role!=='service_role')
      die('这个密钥的角色是 '+p.role+'，不是 service_role。');
  }catch(e){}
}

function loadKey(){
  const env=process.env.CJ_ADMIN_KEY;
  if(env&&env.trim())return env.trim();
  if(fs.existsSync(KEYFILE)){
    const k=fs.readFileSync(KEYFILE,'utf8').trim();
    if(k)return k;
  }
  die('还没有存管理员密钥。\n  先跑一次：node tools/reset-password.js --setkey');
}

function askHidden(q){
  return new Promise(res=>{
    const rl=readline.createInterface({input:process.stdin,output:process.stdout,terminal:true});
    let first=true;
    rl._writeToOutput=function(s){
      if(first&&s.indexOf(q)>=0){first=false;rl.output.write(q);return;}
      if(s==='\r\n'||s==='\n'){rl.output.write(s);return;}
      rl.output.write('*');
    };
    rl.question(q,a=>{rl.close();res(a.trim());});
  });
}

async function setKey(){
  ok('');
  ok('去这里复制密钥：');
  ok('  https://supabase.com/dashboard/project/buxqkndyfjhajdjwbcrp/settings/api-keys');
  ok('');
  ok('要 Secret keys 里的 sb_secret_... ，或者 Legacy 标签下的 service_role（点 Reveal）。');
  ok('别复制 anon 或 publishable —— 那两个是公开密钥，权限不够。');
  ok('');
  const k=await askHidden('把密钥贴在这里（输入不会显示）：');
  if(!k)die('没收到东西，取消了。');
  checkKeyShape(k);
  fs.writeFileSync(KEYFILE,k+'\n',{mode:0o600});
  ok('');
  ok('✓ 存好了：tools/.admin-key');
  ok('  这个文件已经写进 .gitignore，不会被提交。');
  ok('');
  ok('以后帮人改密码就一行：');
  ok('  node tools/reset-password.js 他的邮箱 临时密码');
  ok('');
}

async function call(method,url,key,body){
  const r=await fetch(url,{
    method,
    headers:{
      'apikey':key,
      'Authorization':'Bearer '+key,
      'Content-Type':'application/json'
    },
    body:body?JSON.stringify(body):undefined
  });
  let data=null;
  try{data=await r.json();}catch(e){}
  return{status:r.status,data:data};
}

function explain(status,data){
  const m=(data&&(data.msg||data.message||data.error_description||data.error))||'';
  if(status===401)return'密钥不对或者没被接受。确认贴的是 service_role / sb_secret_...，不是 anon。';
  if(status===403)return'这个密钥权限不够（'+m+'）。要用 service_role 或 sb_secret_... 那个。';
  if(status===404)return'找不到这个用户（UUID 可能不对）。';
  if(status===422||status===400){
    if(/at least/i.test(m))return'密码太短了，至少 6 位。';
    return'请求被拒：'+m;
  }
  if(status>=500)return'Supabase 那边出错了（'+status+'）。项目可能被自动暂停了，去后台看看是不是要点 Restore。';
  return'没预料到的返回：'+status+' '+m;
}

async function findUser(key,email){
  const want=email.trim().toLowerCase();
  /* 用户不多，一页就能全拉下来，本地找。
     （真到几百人以上再改成分页，你这个规模用不着） */
  const r=await call('GET',SB+'/auth/v1/admin/users?page=1&per_page=1000',key);
  if(r.status!==200)die(explain(r.status,r.data));
  const list=(r.data&&(r.data.users||r.data))||[];
  if(!Array.isArray(list))die('用户列表格式看不懂，没敢往下做。');
  const hit=list.find(u=>u&&typeof u.email==='string'&&u.email.toLowerCase()===want);
  if(!hit){
    ok('');
    ok('✗ 用户列表里没有 '+email);
    ok('  现在一共 '+list.length+' 个账号：');
    list.forEach(u=>ok('    · '+(u.email||'(没有邮箱)')));
    ok('');
    ok('  确认一下拼写，或者去后台核对：');
    ok('  https://supabase.com/dashboard/project/buxqkndyfjhajdjwbcrp/auth/users');
    ok('');
    process.exit(1);
  }
  return hit;
}

async function main(){
  const args=process.argv.slice(2);
  if(args.length===0||args[0]==='--help'||args[0]==='-h'){
    ok('');
    ok('帮忘记密码的用户重设密码');
    ok('');
    ok('  node tools/reset-password.js --setkey            存管理员密钥（做一次就好）');
    ok('  node tools/reset-password.js <邮箱> <新密码>      改密码');
    ok('  node tools/reset-password.js --who <邮箱>        只查 UUID，不改任何东西');
    ok('');
    return;
  }
  if(args[0]==='--setkey')return setKey();

  const key=loadKey();
  checkKeyShape(key);

  if(args[0]==='--who'){
    if(!args[1])die('要给个邮箱：node tools/reset-password.js --who 某人@邮箱');
    const u=await findUser(key,args[1]);
    ok('');
    ok('邮箱：'+u.email);
    ok('UUID：'+u.id);
    ok('注册于：'+(u.created_at||'?'));
    ok('');
    return;
  }

  const email=args[0],pw=args[1];
  if(!email||email.indexOf('@')<0)die('第一个参数要是邮箱。');
  if(!pw)die('要给个新密码：node tools/reset-password.js '+email+' 临时密码123');
  if(pw.length<6)die('密码至少 6 位（Supabase 的硬性要求）。');

  const u=await findUser(key,email);
  ok('');
  ok('找到用户 '+u.email+'（'+u.id+'）');

  const r=await call('PUT',SB+'/auth/v1/admin/users/'+u.id,key,{password:pw});
  if(r.status!==200)die(explain(r.status,r.data));

  ok('');
  ok('✓ 密码已经改成：'+pw);
  ok('');
  ok('  把这个私下告诉他（别发公开群），');
  ok('  让他登录后自己进「改密码」换成他要的。');
  ok('  他的日记数据一条都没动。');
  ok('');
}

main().catch(e=>die(e&&e.message?e.message:String(e)));
