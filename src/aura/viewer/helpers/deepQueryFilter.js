import minimatch from 'minimatch';
import contains from './contains';

export const operators = {
  text: (mode, key, value, query) => {
    if (mode === 'k') {
      return String(key).toLowerCase().indexOf(query) > -1;
    }

    if (value == null) {
      return false;
    }

    try {
      return decodeURI(String(value)).toLowerCase().indexOf(query) > -1;
    } catch (e) {
      return String(value).toLowerCase().indexOf(query) > -1;
    }
  },
  '=': (mode, key, value, keyQuery, valueQuery) => minimatch(String(key), keyQuery) && minimatch(String(value), valueQuery),
  '==': (mode, key, value, keyQuery, valueQuery) => minimatch(String(key), keyQuery) && String(value) == valueQuery,
  '!=': (mode, key, value, keyQuery, valueQuery) => minimatch(String(key), keyQuery) && String(value) != valueQuery,
  '<=': (mode, key, value, keyQuery, valueQuery) => minimatch(String(key), keyQuery) && value <= +valueQuery,
  '>=': (mode, key, value, keyQuery, valueQuery) => minimatch(String(key), keyQuery) && value >= +valueQuery,
  '>': (mode, key, value, keyQuery, valueQuery) => minimatch(String(key), keyQuery) && value > +valueQuery,
  '<': (mode, key, value, keyQuery, valueQuery) => minimatch(String(key), keyQuery) && value < +valueQuery,
};


export default function deepQueryFilter(array, query, ignoreCase = true) {
  if (query && query.trim()) {
    query.split(' ').forEach(str => {
      let filter = str.trim();

      if (filter.length === 0) {
        return;
      }

      let performFullText = true;
      let match = filter.match(/q:(.+?)([<>=!][<>=]?)(.+?)$/);

      if (match) {
        const keyQuery = ignoreCase ? match[1].toLowerCase().trim() : match[1].trim();
        const operator = match[2];
        const valueQuery = match[3].trim();

        if (operators[operator]) {
          performFullText = false;
          array = array.filter(row => contains(row, (mode, key, value) => operators[operator](mode, ignoreCase && key ? key.toLowerCase() : key, value, keyQuery, valueQuery)));
        }
      }

      if (performFullText) {
        let casedQuery = ignoreCase ? filter.toLowerCase() : filter;
        array = array.filter(row => contains(row, (mode, key, value) => operators.text(mode, ignoreCase && key ? key.toLowerCase() : key, value, casedQuery)));
      }
    });
  }

  return array;
}