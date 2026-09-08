const {readFileSync} = require('node:fs');
const {runInNewContext,Script} = require('node:vm');
const assert = require('node:assert/strict');
const source = readFileSync(__dirname+'/analytics.js','utf8');
function setup(host='huangzhenhao90.github.io',dnt='0',hash='') {
  const calls=[];
  const context={window:{umami:{track:(...args)=>{calls.push(args);return Promise.resolve();}}},location:{hostname:host,pathname:'/uxr-campus-2027/',hash},navigator:{doNotTrack:dnt},JOBS:[{id:'test',co:'示例',title:'用研',type:'策略'}]};
  runInNewContext(source,context);
  return {context,calls};
}
let {context,calls}=setup();
context.window.campusTrack('公司选择',{company:'示例'});
context.window.initCampusAnalytics();
context.window.initCampusAnalytics();
assert.equal(calls.length,2);
assert.equal(calls[0][0]({url:'/?v=1#job=x'}).url,'/uxr-campus-2027/');
assert.equal(calls[1][0],'公司选择');
for(const args of [['localhost','0'],['huangzhenhao90.github.io','1']]){
  const result=setup(...args); result.context.window.initCampusAnalytics(); result.context.window.campusTrack('test'); assert.equal(result.calls.length,0);
}
({context,calls}=setup(undefined,undefined,'#job=test'));
context.window.initCampusAnalytics(); assert.equal(calls[1][0],'岗位详情查看');
context.window.umami.track=()=>{throw Error('offline');};
assert.doesNotThrow(()=>context.window.campusTrack('offline'));
const html=readFileSync(__dirname+'/index.html','utf8');
for(const match of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)) new Script(match[1]);
console.log('Analytics checks passed: PV, event queue, DNT, localhost, deep link, failure isolation, inline syntax.');
