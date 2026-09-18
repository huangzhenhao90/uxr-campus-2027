const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const html=fs.readFileSync(__dirname+'/index.html','utf8');
const source=html.slice(html.indexOf('const JOBS ='),html.indexOf('/* ---------------- 状态'));
const {jobs,companies}=vm.runInNewContext(source+';({jobs:JOBS,companies:COMPANIES})');
assert.equal(jobs.length,35);
assert.equal(companies.length,62);
assert.equal(companies.filter(c=>c.status==='open').length,53);
assert.equal(new Set(jobs.map(j=>j.co)).size,23);
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
assert.equal(jobs.filter(j=>j.industry==='汽车').length,14);
assert.equal(added.filter(j=>/AI|人工智能|大模型/i.test(j.jd)).length,1);
assert(added.find(j=>j.id==='dongfeng-insights').jd.includes('符合以上任一方向即可投递'));
assert.equal(jobs.filter(j=>j.co==='长城汽车').length,0);

const added0918=jobs.filter(j=>j.checkedAt==='2026-09-18');
assert.equal(added0918.length,4);
for(const id of ['mihoyo-ur','xiaohongshu-ur','nio-hf-research','meituan-hf-research']){
  const j=jobs.find(x=>x.id===id);
  assert(j,'missing '+id);
  assert(companies.some(c=>c.name===j.co), id+' company not in pool');
  assert(j.jd.length>150 && j.analysis && j.advice && j.cohortNote, id+' incomplete');
  assert(!j.jd.includes('- generic:') && !j.jd.includes('- paragraph:'), id+' snapshot leaked');
}
assert(jobs.find(j=>j.id==='nio-hf-research').title.includes('人因研究'));
assert(!jobs.some(j=>/安全体验研发工程师/.test(j.title)));
console.log('Data checks passed: 62 companies / 53 open / 23 hiring / 35 jobs; 4 new 09-18 JDs, deduplication, AI, unknown headcounts.');
