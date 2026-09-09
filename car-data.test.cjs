const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const html=fs.readFileSync(__dirname+'/index.html','utf8');
const source=html.slice(html.indexOf('const JOBS ='),html.indexOf('/* ---------------- 状态'));
const {jobs,companies}=vm.runInNewContext(source+';({jobs:JOBS,companies:COMPANIES})');
assert.equal(jobs.length,31);
assert.equal(companies.length,62);
assert.equal(companies.filter(c=>c.status==='open').length,51);
assert.equal(new Set(jobs.map(j=>j.co)).size,19);
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
assert.equal(jobs.filter(j=>j.industry==='汽车').length,13);
assert.equal(added.filter(j=>/AI|人工智能|大模型/i.test(j.jd)).length,1);
assert(added.find(j=>j.id==='dongfeng-insights').jd.includes('符合以上任一方向即可投递'));
assert.equal(jobs.filter(j=>j.co==='长城汽车').length,0);
console.log('Car data checks passed: 62 companies / 51 open / 19 hiring / 31 jobs; 12 new JDs, deduplication, AI, unknown headcounts.');
