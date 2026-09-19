(function(root, factory){
  const api = factory();
  if(typeof module === "object" && module.exports) module.exports = api;
  if(root) root.CampusTracker = api;
})(typeof window !== "undefined" ? window : globalThis, function(){
  "use strict";

  const STORAGE_KEY = "uxr-campus-application-tracker.v1";
  const STATUS_OPTIONS = [
    {value:"", label:"未记录"},
    {value:"planned", label:"计划投递"},
    {value:"applied", label:"已投递"},
    {value:"assessment", label:"笔试 / 测评"},
    {value:"interviewing", label:"面试中"},
    {value:"offer", label:"已录用"},
    {value:"ended", label:"已结束"}
  ];
  const VALID_STATUSES = new Set(STATUS_OPTIONS.map(item=>item.value));

  function cleanRecord(record){
    if(!record || typeof record !== "object") return null;
    const status = VALID_STATUSES.has(record.status) ? record.status : "";
    const cleaned = {
      status,
      plannedDate: typeof record.plannedDate === "string" ? record.plannedDate.slice(0,10) : "",
      appliedDate: typeof record.appliedDate === "string" ? record.appliedDate.slice(0,10) : "",
      note: typeof record.note === "string" ? record.note.slice(0,2000) : "",
      updatedAt: typeof record.updatedAt === "string" ? record.updatedAt : ""
    };
    return cleaned.status || cleaned.plannedDate || cleaned.appliedDate || cleaned.note ? cleaned : null;
  }

  function load(storage){
    try{
      const parsed = JSON.parse(storage.getItem(STORAGE_KEY) || "{}");
      if(!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
      return Object.fromEntries(Object.entries(parsed).flatMap(([id, record])=>{
        const cleaned = cleanRecord(record);
        return cleaned ? [[id, cleaned]] : [];
      }));
    }catch{
      return {};
    }
  }

  function persist(records, storage){
    try{
      storage.setItem(STORAGE_KEY, JSON.stringify(records));
      return true;
    }catch{
      return false;
    }
  }

  function update(records, id, patch, storage, now=new Date()){
    const next = {...records};
    const current = next[id] || {};
    const cleaned = cleanRecord({...current, ...patch, updatedAt:now.toISOString()});
    if(cleaned) next[id] = cleaned;
    else delete next[id];
    persist(next, storage);
    return next;
  }

  function remove(records, id, storage){
    const next = {...records};
    delete next[id];
    persist(next, storage);
    return next;
  }

  function statusLabel(status){
    return STATUS_OPTIONS.find(item=>item.value===status)?.label || "未记录";
  }

  function summary(records){
    const values = Object.values(records);
    return {
      recorded: values.length,
      planned: values.filter(item=>item.status==="planned").length,
      active: values.filter(item=>["applied","assessment","interviewing"].includes(item.status)).length,
      offer: values.filter(item=>item.status==="offer").length,
      ended: values.filter(item=>item.status==="ended").length
    };
  }

  return {STORAGE_KEY, STATUS_OPTIONS, load, persist, update, remove, statusLabel, summary};
});
