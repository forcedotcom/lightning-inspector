// https://github.com/forcedotcom/aura/blob/master/aura-impl/src/main/resources/aura/locker/InlineSafeEval.js
const _evalReturnableEx = /^(\s*)([{(\["']|function\s*\()/;
const _evalTrimFirstMultilineCommentEx = /^\/\*([\s\S]*?)\*\//;
const _evalTrimFirstLineCommentEx = /^\/\/.*\n?/;
const _evalHookfn = '__eval__';

function evalAddLexicalScopesToSource(src, options) {
  if (options.skipPreprocessing !== true) {
    // removing first line CSFR protection and other comments to facilitate
    // the detection of returnable code
    src = src.replace(_evalTrimFirstMultilineCommentEx, '');
    src = src.replace(_evalTrimFirstLineCommentEx, '');
    // only add return statement if source it starts with [, {, or (
    const match = src.match(_evalReturnableEx);
    if (match) {
      src = src.replace(match[1], 'return ');
    }
  }

  if (options.useStrict) {
    // forcing strict mode
    src = '"use strict";\n' + src;
  }

  src = 'return (function(window){\n' + src + '\n}).call(arguments[0], arguments[0])';

  for (let i = 0; i < options.levels; i++) {
    src = 'with(arguments[' + i + ']||{}){' + src + '}';
  }

  let code = 'function ' + _evalHookfn + '(){' + src + '}';
  if (options.sourceURL) {
    code += '\n//# sourceURL=' + options.sourceURL;
  }

  return code;
}

function _evalAndReturn(src) {
  const script = document.createElement('script');
  script.type = 'text/javascript';
  window[_evalHookfn] = undefined;
  script.appendChild(document.createTextNode(src));
  document.body.appendChild(script);
  document.body.removeChild(script);
  const result = window[_evalHookfn];
  window[_evalHookfn] = undefined;
  return result;
}

export default function (src, { useStrict = false, sourceURL = null, skipPreprocessing = true } = {}, ...args) {
  if ('$$safe-eval$$' in window) {
    return window['$$safe-eval$$'](src, sourceURL, skipPreprocessing, ...args);
  } else {
    const code = evalAddLexicalScopesToSource(src, {
      levels: args.length, useStrict, sourceURL, skipPreprocessing
    });

    const fn = _evalAndReturn(code);

    return fn.apply(undefined, args);
  }
};
