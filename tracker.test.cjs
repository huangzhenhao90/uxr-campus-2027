const assert = require('node:assert/strict');
const tracker = require('./tracker.js');

function memoryStorage(initial={}){
  const values = {...initial};
  return {
    getItem:key=>Object.hasOwn(values,key) ? values[key] : null,
    setItem:(key,value)=>{values[key]=value;},
    values
  };
}

const storage = memoryStorage();
let records = tracker.load(storage);
records = tracker.update(records, 'job-1', {status:'planned', plannedDate:'2026-09-20', note:'修改作品集'}, storage, new Date('2026-09-11T08:00:00Z'));
assert.equal(records['job-1'].status, 'planned');
assert.equal(tracker.load(storage)['job-1'].note, '修改作品集');
records = tracker.update(records, 'job-2', {status:'interviewing'}, storage, new Date('2026-09-12T08:00:00Z'));
assert.deepEqual(tracker.summary(records), {recorded:2, planned:1, active:1, offer:0, ended:0});
records = tracker.remove(records, 'job-1', storage);
assert.equal(tracker.load(storage)['job-1'], undefined);

const broken = memoryStorage({[tracker.STORAGE_KEY]:'not json'});
assert.deepEqual(tracker.load(broken), {});
console.log('Application tracker checks passed: save, load, summary, remove, malformed storage.');
