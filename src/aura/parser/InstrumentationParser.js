import _ from 'lodash';
import Parser from './Parser';
import select from 'selectn';

export default class InstrumentationParser extends Parser {

  static PrimaryKeys = ['id', 'name', 'duration', 'type', 'start', 'end', 'depth', 'fill'];


  constructor(transactions, cycles) {
    cycles = _.map(cycles, cycle => {
      cycle.ts = cycle.start;
      cycle.cycle = cycle.name;
      cycle.name = `cycle: ${cycle.name}`;
      cycle.type = 'cycle';
      return cycle;
    });

    _.each(transactions, transaction => {
      transaction = transaction.transaction;

      if (transaction) {
        const marks = transaction.marks = transaction.marks || {};
        marks.cycles = _.filter(cycles, cycle =>
          (transaction.start <= cycle.start && cycle.end <= transaction.end) ||
          (transaction.ts <= cycle.start && cycle.end <= (transaction.ts + transaction.duration))
        );

        marks.cycles = JSON.parse(JSON.stringify(marks.cycles));
      }
    });

    super([...transactions, ...cycles]);
  }

  getParsed() {
    return super.getParsed();
  }

  /**
   * Get typeof transaction
   *
   * @param transaction
   * @returns {*}
   */
  static getType(transaction) {
    if (transaction.id === 'ltng:performance') {
      return 'ltng';
    } else if (transaction.eventType === 'performance' || 'aura:newDefs' === transaction.id) {
      return 'perf';
    } else if (transaction.ns) {
      return transaction.ns;
    } else if (transaction.type) {
      return transaction.type;
    } else if (transaction.id && transaction.id.indexOf(':') > -1) {
      let type;

      if (transaction.id === 'ltng:pageView') {
        type = 'pageView';
        transaction.name = select('page.context', transaction) || transaction.name;
      } else {
        type = transaction.id.substring(0, transaction.id.indexOf(':'));
      }

      transaction.id = transaction.id.substring(transaction.id.indexOf(':') + 1);

      return type;
    } else if (transaction.name && transaction.name.indexOf(':') > -1) {
      const type = transaction.name.substring(0, transaction.name.indexOf(':'));
      transaction.name = transaction.name.substring(transaction.name.indexOf(':') + 1);
      return type;
    }

    return 'default';
  }

  static getColor(type) {
    const colorMap = {
      default: '#7CB5EC',
      action: '#FF8000',
      api: '#4B088A',
      browser: '#9e9e9e',
      bootstrap: '#FF66FF',
      bootstrap_event: '#6633FF',
      db: 'red',
      latency: '#009999',
      cycle: '#FF9800',
      mount: 'purple',
      syntheticPageView: '#ff2c51',
      pageView: '#ff2c51',
      memcached: '#66FF33',
      queuedActions: '#FED500',
      serverActions: '#FED500',
      actions: '#FED500',
      perf: '#606060',
      sql: '#606060',
      transport: '#00B97C',
      'http-request': '#33FF33'
    };

    return colorMap[type] || colorMap.default;
  }

  /**
   * @param transaction
   * @returns {*}
   */
  getId(transaction) {
    if (transaction.type === 'actions') {
      return transaction.context.id;
    }

    if (transaction.type === 'serverPerf') {
      return transaction.context.requestId;
    }

    return super.getId();
  }

  /**
   * Validate transactions. Flattening transactions to make it more
   * accessible in later stages
   *
   * @param transaction
   * @param parentTransaction
   * @returns {*}
   */
  validate(transaction, parentTransaction, depth) {
    // flatten inset transactions
    if (transaction.transaction != null) {
      const insetTransaction = transaction.transaction;
      delete transaction.transaction;

      transaction = { ...transaction, ...insetTransaction };
    }

    // just a simple validation (for debugging)
    if (!transaction.ignoreTimeStampCheck) {
      if (transaction.ts == null) {
        console.error(transaction);

        throw Error('Invalid transaction');
      }
    }

    transaction.type = InstrumentationParser.getType(transaction);
    transaction.depth = depth;

    return transaction;
  }

  /**
   * Parsing transactions
   *
   * @param transaction
   * @param parentTransaction
   * @returns {{primary, secondary}}
   */
  parse(transaction, parentTransaction) {
    if (transaction.id === 'ltng:performance') {
      const eventSource = `${transaction.eventSource}`;
      transaction.id = transaction.name = eventSource.replace(/^synthetic-/, '');

      if (transaction.attributes && transaction.attributes.name) {
        transaction.attributeName = transaction.attributes.name;

        delete transaction.attributes.name;
      }
    }

    // legacy names
    if (transaction.context && transaction.context.defName) {
      transaction.name = transaction.context.defName;
    }

    if (transaction.type === 'transport') {
      transaction.start = transaction.ts;
      transaction.end = transaction.ts;

      if (transaction.context.xhrDuration != null) {
        transaction.end += transaction.context.xhrDuration;
      } else if (transaction.duration != null) {
        transaction.end += transaction.duration;
      }

      if (transaction.context.xhrLatency != null) {
        transaction.end += transaction.context.xhrLatency;
      }

      if (transaction.context.xhrDelay != null) {
        transaction.end += transaction.context.xhrDelay;
      }

      if (transaction.context.auraXHRId != null) {
        transaction.name = `aura?r=${transaction.context.auraXHRId}`;
      }
    }

    if (transaction.type === 'bootReqs' || transaction.type === 'bootExecs') {
      transaction.start = transaction.ts;
    }

    if (!transaction.ignoreParseTime) {
      if (!parentTransaction) {
        if (transaction.start == null) {
          transaction.start = transaction.ts;
        }
      } else {
        if (transaction.type === 'serverCallTree') {
          if (parentTransaction.type === 'serverPerf') {
            // server started before the parentTransaction was created
            transaction.start = parentTransaction.start;
          } else if (parentTransaction.type === 'serverCallTree') {
            const timeBetweenCalls = transaction.startTime - parentTransaction.startTime;
            transaction.start = parentTransaction.start + timeBetweenCalls;
          }
        } else if (transaction.start == null && transaction.ts != null) {
          transaction.start = transaction.ts;
        } else if (transaction.start == null && parentTransaction != null && parentTransaction.ts != null) {
          transaction.start = parentTransaction.ts;
        }
      }

      if (transaction.end == null) {
        if (transaction.type === 'serverCallTree') {
          if (parentTransaction.type === 'serverPerf') {
            // assume transaction finished when the parentTransaction
            transaction.end = transaction.start + transaction.totalTime;
            parentTransaction.end = Math.min(parentTransaction.end, transaction.end);
          } else if (parentTransaction.type === 'serverCallTree') {
            transaction.end = transaction.start + transaction.totalTime;
          }
        } else if (transaction.duration != null) {
          transaction.end = transaction.start + transaction.duration;
        } else if (transaction.enqueueWait != null) {
          transaction.end = transaction.start + transaction.enqueueWait;
        } else {
          transaction.end = transaction.ts;
        }
      }

      if (transaction.ept != null) {
        transaction.end = transaction.start + transaction.ept;
      }
    }

    if (transaction.type === 'serverPerf') {
      // prefer the server time because serverPerf is not always 'inside' transport
      const waitTimeToStart = (parentTransaction.context.requestStart - parentTransaction.context.startTime) || 0;
      const delay = parentTransaction.context.xhrDelay || parentTransaction.context.xhrLatency || 0;
      const approxTTFB = parentTransaction.context.ttfb == null ? parentTransaction.context.xhrDuration || 0 : parentTransaction.context.ttfb;

      transaction.start = parentTransaction.start + delay + waitTimeToStart;
      transaction.end = transaction.start + approxTTFB;
    }


    if (typeof transaction.attachment === 'object') {
      if (transaction.attachment.sql) {
        transaction.type = 'sql';
        transaction.name = transaction.attachment.sql;
      } else if (transaction.attachment.api) {
        transaction.type = 'api';
        transaction.name = transaction.attachment.api;
      }
    }

    if (transaction.type === 'actions') {
      if (transaction.context && typeof transaction.context.def === 'string') {
        transaction.name = /\$(.+?)$/g.exec(transaction.context.def)[1];
      }
    }

    transaction.fill = InstrumentationParser.getColor(transaction.type);

    if (transaction.end != null && transaction.start != null) {
      transaction.duration = transaction.end - transaction.start;
    }

    const context = transaction.context || transaction;

    if (context != null) {
      if (context.hasOwnProperty('transfer')) {
        // 206 / 208
        const background = context.background;
        const status = context.status || 'N/A';
        const delay = context.xhrDelay || 0;
        const redirect = Math.max(context.fetchStart - (context.startTime || (transaction.ts + delay)), 0);
        const dns = context.dns;
        const tcp = context.tcp;
        const ttfb = context.ttfb;
        const transfer = context.transfer;
        const responseLength = context.responseLength || 0;
        const requestLength = context.requestLength || 0;
        const networkSpeed = responseLength * (1 - 0.4215) / transfer;

        transaction.parsed = {
          version: 206,
          background,
          status,
          delay,
          redirect,
          dns,
          tcp,
          ttfb,
          transfer,
          responseLength,
          requestLength,
          networkSpeed
        };
      } else if (context.hasOwnProperty('background') || context.hasOwnProperty('responseLength')) {
        // 204
        const background = context.background;
        const totalTime = context.xhrDuration || transaction.duration;
        const latency = context.xhrLatency || context.xhrDelay || 0;
        const responseLength = context.responseLength;
        const requestLength = context.requestLength;

        transaction.parsed = {
          version: 204,
          background,
          totalTime,
          latency,
          responseLength,
          requestLength
        };
      }
    }

    if (transaction.type === 'syntheticPageView') {
      transaction.end = transaction.start + 1;
      transaction.duration = 1;
      transaction.id = transaction.name = `currentPage (${transaction.context.count})`;
    }

    return transaction;
  }

  /**
   * Return the structure which is then extended to an aggregation.
   * Arrays will be merged
   *
   * @param id
   * @param transaction
   * @param childrenIds
   * @param parentId
   * @param parentTransaction
   * @returns {{primary: {}, secondary: {}, children: {}}}
   */
  map(id, transaction, childrenIds, parentId, parentTransaction) {
    if (!transaction.ignoreParseTime) {
      if (transaction.start == null && transaction.end == null && parentTransaction != null) {
        transaction.start = parentTransaction.start;
        transaction.end = parentTransaction.start;
      }
    }

    const primary = _.fromPairs(
      _.map(
        InstrumentationParser.PrimaryKeys,
        attr => [attr, transaction[attr]]
      )
    );

    const secondaryKeys = _.filter(
      _.keys(transaction),
      attr => !InstrumentationParser.PrimaryKeys.includes(attr)
    );

    let context = _.fromPairs(
      _.map(
        secondaryKeys,
        attr => [attr, transaction[attr]]
      )
    );

    if (typeof context.context === 'object' && context.context != null) {
      context = {
        ...context.context,
        ...context
      };

      delete context.context;
    }

    if (typeof context.attributes === 'object' && context.attributes != null) {
      context = {
        ...context.attributes,
        ...context
      };

      delete context.attributes;
    }

    Object.assign(primary, _.fromPairs(
      _.compact(_.map(
        ['id', 'name'],
        attr => context[attr] != null && [attr, context[attr]]
      ))
    ));

    return {
      primary: { [id]: primary },
      context: { [id]: context },
      children: { [id]: childrenIds }
    };
  }

  /**
   * Return an object of transaction children
   *
   * @param transaction
   * @param parentTransaction
   * @returns {{marks}}
   */
  getChildren(transaction, parentTransaction) {
    const children = {
      marks: _.flatten(
        _.map(
          transaction.marks, (marks, mark) => mark === 'server' ? [] : marks
        )
      )
    };

    if (transaction.type === 'transport') {
      // make an action transaction object (mimic the basic contents)
      children.actions = _.map(
        transaction.context.actionDefs,
        actionId => ({
          actionId,
          ns: 'actions',
          context: { id: actionId },
          ignoreParseTime: true, // ignore parsing because if another action of same id exists, then prefer its data
          ignoreTimeStampCheck: true
        }));

      // find matching server action for each transport
      if (transaction.context && transaction.context.requestId) {
        const { requestId, auraXHRId } = transaction.context;
        const serverActions = parentTransaction.marks.server;

        const serverAction = _.find(
          serverActions,
          serverAction => serverAction.context && (serverAction.context.requestId == requestId || serverAction.context.id == auraXHRId)
        );

        if (serverAction) {
          children.serverActions = [{
            requestId,
            auraXHRId,
            ignoreTimeStampCheck: true,
            ...serverAction,
            ns: 'serverPerf'
          }];
        }
      }
    }

    if (transaction.type === 'serverPerf' && transaction.context && transaction.context.perf) {
      children.server = _.map(
        transaction.context.perf.calltree,
        call => ({
          ...call,
          type: 'serverCallTree',
          ignoreTimeStampCheck: true
        }));
    }

    if (Array.isArray(transaction.children)) {
      children.server = _.map(
        transaction.children,
        child => ({
          ...child,
          type: 'serverCallTree',
          ignoreTimeStampCheck: true
        }));
    }

    if (transaction.id === 'bootstrap' && transaction.attributes != null) {
      const requestExecMap = {
        requestAppCss: null,
        requestEncryptionKeyJs: null,
        requestAuraLibsJs: 'execLibsJs',
        requestAuraJs: 'execAuraJs',
        requestAppJs: 'execAppJs',
        requestInlineJs: 'execInlineJs',
        requestBootstrapJs: 'execBootstrapJs',
        lightningGetCurrentApp: null
      };

      const bootStrapRequests = [];
      let bootstrapExecs = [];
      let minRequestStartTime = Number.MAX_SAFE_INTEGER;

      _.each(
        requestExecMap,
        (execName, requestName) => {
          const request = transaction.attributes[requestName];

          if (request == null) {
            return null;
          }

          const requestTransaction = {
            type: 'bootReqs',
            background: false,
            status: 200,
            name: request.name || requestName,
            ts: request.startTime || transaction.ts,
            ...request
          };

          minRequestStartTime = Math.min(requestTransaction.ts, minRequestStartTime);

          let execTransaction;

          if (execName != null) {
            const exec = transaction.attributes[execName];

            if (exec != null) {
              const requestEndTime = requestTransaction.ts + requestTransaction.duration;

              execTransaction = {
                type: 'bootExecs',
                name: exec.name || execName,
                ts: requestEndTime,
                end: exec
              };
            }
          }

          if (requestTransaction != null) {
            bootStrapRequests.push(requestTransaction);
          }

          if (execTransaction != null) {
            bootstrapExecs.push(execTransaction);
          }
        });


      bootstrapExecs = _.sortBy(bootstrapExecs, exec => exec.end);

      let lastExec;

      _.each(bootstrapExecs, exec => {
        if (lastExec && lastExec.end > exec.ts) {
          exec.ts = lastExec.end
        }

        if (exec.ts > exec.end) {
          exec.ts = exec.end;
        }

        lastExec = exec;
      });

      children.bootstrapRequests = bootStrapRequests;
      children.bootstrapExecs = bootstrapExecs;

      if (lastExec) {
        children.bootstrapBpt = [{
          type: 'mount',
          name: 'auraPageLayout',
          ts: lastExec.end,
          start: lastExec.end,
          end: transaction.end
        }];
      }

      if (minRequestStartTime !== Number.MAX_SAFE_INTEGER && minRequestStartTime > 0) {
        children.documentFetch = [{
          type: 'browser',
          name: 'documentFetch',
          ts: transaction.ts,
          start: transaction.ts,
          end: minRequestStartTime
        }];
      }
    }

    return children;
  }
}
