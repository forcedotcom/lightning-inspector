export default function (entries, ...mimeTypes) {
  return entries.filter(entry => mimeTypes.reduce((memo, type) => memo || entry.response.headers['content-type'] && entry.response.headers['content-type'].indexOf(type) > -1, false));
}