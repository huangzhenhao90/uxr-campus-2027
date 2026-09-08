// Only published traffic is measured. One PV per document load; job views are events.
(() => {
  const allowed = location.hostname === 'huangzhenhao90.github.io'
    && location.pathname.startsWith('/uxr-campus-2027/')
    && navigator.doNotTrack !== '1';
  const queue = [];
  let ready = false;
  const send = (name, data) => {
    try {
      const result = window.umami.track(name, data);
      if (result && typeof result.catch === 'function') result.catch(() => {});
    } catch { /* Analytics must never interrupt browsing. */ }
  };
  window.campusTrack = (name, data = {}) => {
    if (!allowed) return;
    if (ready) send(name, data);
    else if (queue.length < 30) queue.push([name, data]);
  };
  window.initCampusAnalytics = () => {
    if (!allowed || ready || !window.umami) return;
    ready = true;
    // Strip cache-busting query strings and job hashes from the PV URL.
    send(props => ({...props, url: location.pathname}));
    for (const [name, data] of queue.splice(0)) send(name, data);
    const match = location.hash.match(/^#job=(.+)$/);
    if (match) {
      try {
        const job = JOBS.find(j => j.id === decodeURIComponent(match[1]));
        if (job) send('岗位详情查看', {company:job.co, job_id:job.id, job_title:job.title, type:job.type});
      } catch { /* Invalid deep links are handled by the main application. */ }
    }
  };
})();
