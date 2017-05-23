import React from 'react';
import ReactDOM from 'react-dom';
import _ from 'lodash';
import './Audits.scss';
import Spinner from './helpers/Spinner';
import Placeholder from './helpers/Placeholder';
import NumberTween from './helpers/NumberTween';
import SplitPane from './helpers/SplitPane';

export class Audit extends React.Component {
  render() {
    throw Error('Should never render');
  }
}

function getPropsProxy(callback) {
  return class ProxyProp extends React.PureComponent {
    componentDidUpdate() {
      callback(this.props);
    }

    componentDidMount = this.componentDidUpdate;

    render() {
      return null;
    }
  }
}

class RenderChildren extends React.Component {
  state = { children: this.props.children };

  setChildren(children) {
    this.setState({ children });
  }

  render() {
    const { children } = this.state;
    const { className } = this.props;

    if (children === null) {
      return null;
    }

    return (
      <div className={className}>
        {children}
      </div>
    );
  }
}

export default class Audits extends React.Component {
  state = { context: null, scores: {} };
  auditResults = {};

  setScore(key, score) {
    const { scores } = this.state;
    const { groups: groupDesc } = this.props;
    const { groups } = this.auditResults[key];

    score = score == null ? score : isNaN(score) ? 100 : Math.max(score, 0);

    const totalWeight = _.reduce(_.map(groupDesc, ({ weight }) => weight), (memo, a) => a + memo, 0);

    if (score != null) {
      for (const group of groups) {
        if (!scores[group]) {
          scores[group] = {};
        }

        scores[group][key] = score;
      }
    }

    const auditScore = this.refs[`auditScore-${key}`];
    const scoreNode = ReactDOM.findDOMNode(auditScore);

    auditScore.setChildren(`${Math.round(score)}%`);

    if (score == null) {
      scoreNode.classList.remove('green', 'orange', 'red');
      auditScore.setChildren(<Spinner width={10} height={10} strokeWidth={2}/>);
    } else if (score >= 90) {
      scoreNode.classList.add('green');
    } else if (score >= 60) {
      scoreNode.classList.add('orange');
    } else {
      scoreNode.classList.add('red');
    }

    let overallScore = 0;
    let scoreByGroups = {};
    for (const group in scores) {
      if (!scores.hasOwnProperty(group)) {
        continue;
      }

      const groupScores = _.values(scores[group]);
      const score = _.reduce(groupScores, (memo, a) => a + memo, 0) / groupScores.length;

      scoreByGroups[group] = score;

      overallScore += score * (groupDesc[group].weight || 1) / totalWeight;
    }

    for (const k in this.auditResults) {
      if (this.auditResults[k].onScoreChange) {
        this.auditResults[k].onScoreChange(overallScore, scoreByGroups, scores);
      }
    }

    this.refs.overallScore.setValue(overallScore);
  }

  updateAuditResult(key, auditResult) {
    this.auditResults[key] = auditResult;

    if (this.activeAuditKey != null) {
      this.setActiveAudit(this.activeAuditKey);
    }

    let { groups } = auditResult;

    groups = _.map(groups, (group, i) => {
      return (
        <div key={i}
             className='audit-group'>{group}</div>
      );
    });

    this.refs[`auditGroups-${key}`].setChildren(groups);

    if (auditResult.hasScore === false) {
      this.refs[`auditTitle-${key}`].setChildren(auditResult.title);
      this.refs[`auditScore-${key}`].setChildren(null);

      return;
    }

    if (auditResult.status === true) {
      this.refs[`auditTitle-${key}`].setChildren(auditResult.title);
      this.setScore(key, auditResult.score);
    } else if (auditResult.status) {
      this.refs[`auditTitle-${key}`].setChildren(auditResult.status);
      this.setScore(key);
    } else {
      this.refs[`auditTitle-${key}`].setChildren(`${auditResult.title} (running)`);
      this.setScore(key);
    }
  }

  setActiveAudit(key) {
    const lastNode = ReactDOM.findDOMNode(this.refs[`auditItem-${this.activeAuditKey}`]);

    if (lastNode != null) {
      lastNode.classList.remove('selected');
    }

    this.activeAuditKey = key;

    const node = ReactDOM.findDOMNode(this.refs[`auditItem-${key}`]);

    if (node) {
      node.classList.add('selected');
    }

    const auditResult = this.auditResults[key];

    if (auditResult) {
      this.refs.auditOutput.setChildren(auditResult.children);
      this.refs.auditDescription.setChildren(auditResult.description);
    }
  }

  componentDidMount() {
    this.setActiveAudit(this.activeAuditKey);
  }

  componentWillReceiveProps() {
    this.setState({ scores: {} });

    this.auditResults = {};
  }

  render() {
    const { children, groups } = this.props;

    const audits = React.Children.map(children, (component, key) => {
      if (this.activeAuditKey == null) {
        this.activeAuditKey = key;
      }

      return (
        <div className='audit-result'
             onClick={() => this.setActiveAudit(key)}
             ref={`auditItem-${key}`}
             key={key}>
          <RenderChildren className='audit-result-score'
                          ref={`auditScore-${key}`}>
            <Spinner height={10}
                     width={10}
                     strokeWidth={2}/>
          </RenderChildren>
          <div className='audit-result-title'>
            <RenderChildren ref={`auditTitle-${key}`}>
              Running audit...
            </RenderChildren>
          </div>
          <div style={{ position: 'relative', marginTop: 2 }}>
            <RenderChildren ref={`auditGroups-${key}`}/>
          </div>
        </div>
      );
    });

    const runners = React.Children.map(children, (component, key) => {
      return React.cloneElement(component.props.content, {
        key: key,
        groups,
        AuditResult: getPropsProxy(props => this.updateAuditResult(key, props))
      });
    });

    return (
      <div className='audits'>
        <div className='audits-header'>
          <div className='audits-toolbar'>
            <span className='audits-score'>
              <NumberTween ref='overallScore'
                           formatValue={n => Math.round(n)}
                           value={0}/>%
            </span>
            <span className='audits-score-label'>Overall<br/>Score</span>
          </div>
        </div>
        <div className='audits-body'>
          <SplitPane defaultSize={250}
                     minSize={100}
                     maxSize={-500}>
            <div style={{ width: '100%', height: '100%', overflowY: 'scroll' }}>
              {audits}
            </div>
            <div style={{ padding: 10, overflowY: 'scroll', height: '100%' }}>
              <RenderChildren ref='auditDescription'/>
              <div className='audit-result-response'>
                <RenderChildren ref='auditOutput'>
                  <Placeholder>
                    <Spinner/>
                  </Placeholder>
                </RenderChildren>
              </div>
            </div>
          </SplitPane>
        </div>
        <div style={{ display: 'none' }}>
          {runners}
        </div>
      </div>
    );
  }
}
