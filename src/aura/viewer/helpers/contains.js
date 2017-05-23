export default function contains(value, iteratee) {
  if (value == null) {
    return false;
  }

  if (typeof value === 'object') {
    for (const k in value) {
      if (!value.hasOwnProperty(k)) {
        continue;
      }

      if (iteratee('k', k)) {
        return true;
      }

      if (value[k] != null && typeof value[k] !== 'object') {
        if (iteratee('kv', k, value[k])) {
          return true;
        }
      }

      if (contains(value[k], iteratee)) {
        return true;
      }
    }
  } else if (value != null) {
    return iteratee('v', null, value);
  }

  return false;
}
