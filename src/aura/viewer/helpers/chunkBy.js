export default function chunkBy(array, iteratee, includeDivider) {
  const chunks = [];
  const length = array.length;

  let chunk = [];
  let lastIndex = -1;
  for (let i = 0; i < length; i++) {
    if (iteratee(array[i], i, array)) {
      if (includeDivider) {
        chunk.push(array[i]);
      }

      chunks.push(chunk);
      chunk = [];
      lastIndex = i;
      continue;
    }

    chunk.push(array[i]);
  }

  if (lastIndex === -1) {
    chunks.push(array);
  } else if (lastIndex + 1 !== length) {
    chunks.push(chunk);
  }

  return chunks;
}
