export function setAmortizedTimeout(func, timeout, factor = 2) {
  let tid;

  function next() {
    func();
    tid = setTimeout(next, timeout *= factor);
  }

  tid = setTimeout(next, timeout);

  return () => clearTimeout(tid);
}

export function clearAmortizedTimeout(tid) {
  if (typeof tid === 'function') {
    tid();
  }
}
