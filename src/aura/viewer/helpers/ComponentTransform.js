import esprima from 'esprima';
import escodegen from 'escodegen';
import _ from 'lodash';
import stringify from 'json-stringify-pretty-compact';

// TODO review comments handling
export class ObjectDefinition {
  constructor(data) {
    this.data = data;

    if (data.hasOwnProperty('componentClass')) {
      let componentClass;

      componentClass = data.componentClass;
      componentClass = componentClass.trim();
      componentClass = componentClass.replace(/^function\s*?\(/, 'function temp(');

      const ast = this.ast = esprima.parse(componentClass, { range: true, tokens: true, comment: true });

      escodegen.attachComments(ast, ast.comments, ast.tokens);
    } else {
      console.info('No componentClass attribute', data);
    }
  }

  meta() {
    const { data } = this;

    const _data = Object.assign({}, data);
    delete _data.componentClass;

    return stringify(_data, null, { maxLength: 200, indent: 2 });
  }

  code() {
    let { ast } = this;

    if (ast == null) {
      return '';
    }

    return escodegen.generate(
      _.find(ast.body[0].body.body, a => a.type === 'ExpressionStatement'),
      { comment: true }
    );
  }

  decode(meta, code) {
    const data = Object.assign({}, this.data, JSON.parse(meta));

    if (this.data.hasOwnProperty('componentClass')) {
      data.componentClass = `function () { ${code} }`;
    }

    return data;
  }
}

export class FunctionDefinition {
  constructor(data, commentCode = true) {
    this.data = data;
    this.commentCode = commentCode || data.indexOf('/*$A') > -1; // TODO ask @jparadis

    data = data.trim();
    data = data.replace('/*', '');
    data = data.replace('*/', ''); // TODO get last comment end-marker
    data = data.replace(/^function\s*?\(/, 'function temp(');

    const ast = this.ast = esprima.parse(data, { range: true, tokens: true, comment: true });

    escodegen.attachComments(ast, ast.comments, ast.tokens); // NOTE attached once
  }

  meta() {
    const { ast } = this;

    const literal = escodegen.generate(
      _.find(ast.body[0].body.body, a => a.type === 'ReturnStatement').argument,
      {
        format: {
          quotes: 'double',
          indent: {
            style: '  '
          }
        }
      }, { comment: true });

    return literal.trim();
  }

  code() {
    let { ast } = this;

    return escodegen.generate(
      _.find(ast.body[0].body.body, a => a.type === 'ExpressionStatement'),
      { comment: true }
    );
  }

  decode(meta, code) {
    const { commentCode } = this;

    if (commentCode) {
      return `function() { /*${code}; return ${meta};*/ }`;
    }

    return `function() { ${code}; return ${meta}; }`;
  }
}
