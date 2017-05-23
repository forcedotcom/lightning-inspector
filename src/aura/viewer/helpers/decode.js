import qs from 'qs';

const parsers = {
  qs: context => {
    const obj = qs.parse(context);

    for (const k in obj) {
      if (obj[k] === 'null' || obj[k] === 'undefined') {
        delete obj[k];
      }
    }

    return obj;
  },
  json: context => JSON.parse(context),
  default: context => context
};

function parse(content, parser) {
  try {
    return (parsers[parser] || parsers.default)(content)
  } catch (e) {
    console.error(content);
    return content;
  }
}

export function marksToTimings(marks, { contextParser = false } = {}) {
  if (!Array.isArray(marks)) {
    return [];
  }

  const timings = [];
  mainLoop: for (let i = 0, length = marks.length; i < length; i++) {
    const mark = marks[i];

    if (mark.type === 'stamp') {
      timings.push({
        ...mark,
        start: mark.ts,
        end: mark.ts,
        context: parse(mark.context, contextParser)
      });
    } else if (mark.type === 'start') {
      const { id } = mark;

      for (let j = i + 1; j < length; j++) {
        const currMark = marks[j];

        if (currMark.id === id && currMark.type === 'end') {
          timings.push({
            ...mark,
            ...currMark,
            start: mark.ts,
            end: currMark.ts,
            context: currMark.hasOwnProperty('context') ? parse(currMark.context, contextParser) : null
          });

          continue mainLoop;
        }
      }
    }
  }

  return timings;
}

export function decodeContext(arr, { contextParser = false } = {}) {
  for (const data of arr) {
    data.context = parse(data.context, contextParser);
  }

  return arr;
}

export function mergeContext(arr) {
  for (const data of arr) {
    Object.assign(data, data.context);
  }

  return arr;
}
