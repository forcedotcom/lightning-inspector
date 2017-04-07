export default function flattenDeep(list, iterator) {
  const flattened = [];
  for (const element of list) {
    const children = flattenDeep(iterator(element) || [], iterator);
    flattened.push(element);
    flattened.push(...children);
  }

  return flattened;
}
