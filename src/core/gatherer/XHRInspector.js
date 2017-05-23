const XMLHttpRequest = window.XMLHttpRequest;
const requests = new WeakMap();
const events = {
  beforeRequest: [],
  done: [],
  open: []
};

function globalReadyStateChange() {
  if (this.readyState == 4) {
    const request = requests.get(this);

    for (let arr = events.done, length = arr.length, i = 0; i < length; i++) {
      arr[i](this, request);
    }
  }
}

const open = XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open = function (method, url, async = true, user, password) {
  const request = {
    method,
    url,
    async,
    user,
    password,
    body: null,
    headers: {}
  };

  requests.set(this, request);

  for (let arr = events.open, length = arr.length, i = 0; i < length; i++) {
    arr[i](this, request);
  }
};

const setRequestHeader = XMLHttpRequest.prototype.setRequestHeader;
XMLHttpRequest.prototype.setRequestHeader = function (header, value) {
  const headers = requests.get(this).headers;
  headers[header] = value;
};

const send = XMLHttpRequest.prototype.send;
XMLHttpRequest.prototype.send = function (body) {
  const request = requests.get(this);

  request.body = body;

  for (let arr = events.beforeRequest, length = arr.length, i = 0; i < length; i++) {
    arr[i](this, request);
  }

  const { method, async, user, password, url, headers } = request;

  open.call(this, method, url, async, user, password);

  for (const header in headers) {
    if (headers.hasOwnProperty(header)) {
      setRequestHeader.call(this, header, headers[header]);
    }
  }

  this.addEventListener('readystatechange', globalReadyStateChange, false);

  send.call(this, request.body);
};

export function on(event, callback) {
  events[event].push(callback);
}

export function off(event, callback) {
  throw Error('Not implemented');
}
