export default function (src) {
  const script = document.createElement('script');
  script.setAttribute('type', 'text/javascript');
  script.appendChild(document.createTextNode(src));

  const destination = document.body || document.head || document.documentElement;
  destination.appendChild(script);
}