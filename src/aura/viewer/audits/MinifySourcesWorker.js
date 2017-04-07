onmessage = function (event) {
  const componentDefinitions = JSON.parse(event.data);
  const failedComponentNames = [];

  for (const k in componentDefinitions) {
    const stringify = JSON.stringify(componentDefinitions[k]);
    if (/function\(\s*?(cmp|component)\s*?,\s*?(event|helper)/g.test(stringify)) {
      failedComponentNames.push(k);
    }
  }

  postMessage(JSON.stringify(failedComponentNames));
};

