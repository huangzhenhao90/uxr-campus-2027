const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const html=fs.readFileSync(__dirname+'/index.html','utf8');
const source=html.slice(html.indexOf('const JOBS ='),html.indexOf('/* ---------------- 状态'));
const {jobs,companies,archived}=vm.runInNewContext(source+';({jobs:JOBS,companies:COMPANIES,archived:ARCHIVED_JOBS})');
assert.equal(jobs.length,40);
assert.equal(companies.length,71);
assert.equal(companies.filter(c=>c.status==='open').length,62);
assert.equal(new Set(jobs.map(j=>j.co)).size,31);
assert.equal(new Set(jobs.map(j=>j.id)).size,jobs.length);
assert.equal(new Set(jobs.map(j=>j.url)).size,jobs.length);
const added=jobs.filter(j=>j.checkedAt==='2026-09-09');
assert.equal(added.length,12);
for(const j of added){
  assert(companies.some(c=>c.name===j.co));
  assert(j.jd.length>150 && j.analysis && j.advice && j.cohortNote);
  assert(!j.jd.includes('- generic:') && !j.jd.includes('- paragraph:'));
  assert(['未公开','若干'].includes(j.num));
}
assert.equal(jobs.filter(j=>j.industry==='汽车').length,12);
assert.equal(added.filter(j=>/AI|人工智能|大模型/i.test(j.jd)).length,1);
assert(added.find(j=>j.id==='dongfeng-insights').jd.includes('符合以上任一方向即可投递'));
assert.equal(jobs.filter(j=>j.co==='长城汽车').length,0);

const allJobs=[...jobs,...archived];
const added0918=allJobs.filter(j=>j.checkedAt==='2026-09-18');
assert.equal(added0918.length,4);
for(const id of ['mihoyo-ur','xiaohongshu-ur','nio-hf-research','meituan-hf-research']){
  const j=allJobs.find(x=>x.id===id);
  assert(j,'missing '+id);
  assert(companies.some(c=>c.name===j.co), id+' company not in pool');
  assert(j.jd.length>150 && j.analysis && j.advice && j.cohortNote, id+' incomplete');
  assert(!j.jd.includes('- generic:') && !j.jd.includes('- paragraph:'), id+' snapshot leaked');
}
assert(allJobs.find(j=>j.id==='nio-hf-research').title.includes('人因研究'));
assert(!jobs.some(j=>/安全体验研发工程师/.test(j.title)));
const november = jobs.filter(j=>j.checkedAt==='2026-11-03' && j.id!=='jd-ur');
assert.equal(november.length,13);
for(const j of november){
  assert(companies.some(c=>c.name===j.co && c.industry===j.industry));
  assert(j.jd && j.analysis && j.advice && j.cohortNote);
}
assert.deepEqual(Array.from(archived,j=>j.id).sort(),['intsig-ur-closed','lenovo-ur','nio-hf-research','vivo-hfe','vivo-insight-design','vivo-uxe','vivo-uxm','vivo-uxm2','xpeng-ur']);
assert(archived.every(j=>j.closed && !jobs.some(active=>active.id===j.id)));
assert(!jobs.some(j=>j.id==='rastar-game-ur'));
assert.equal(new Set(allJobs.map(j=>j.id)).size,49);
assert(allJobs.every(j=>j.statusCheckedAt==='2026-11-04'));
assert(jobs.every(j=>!j.closed));
assert(allJobs.find(j=>j.id==='lenovo-ur').url.endsWith('detail?id=2397'));
console.log('Data checks passed: 71 companies, 62 campus programs, 31 companies with 40 research jobs, 9 archived jobs.');
