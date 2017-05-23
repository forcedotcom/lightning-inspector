import React from 'react';
import _ from 'lodash';
import Spinner from '../../../core/viewer/helpers/Spinner';

export default class InsightsOverview extends React.Component {
  state = { groupScores: {} };

  _onScoreChange(overallScore, groupScores) {
    this.setState({ groupScores });
  }

  render() {
    const { AuditResult, groups } = this.props;
    let { groupScores } = this.state;

    groupScores = _.map(groups, ({ weight, description }, group) => {
      const score = groupScores[group];
      let scoreClassName;

      if (score == null) {
        scoreClassName = null;
      } else if (score >= 90) {
        scoreClassName = 'green';
      } else if (score >= 60) {
        scoreClassName = 'orange';
      } else {
        scoreClassName = 'red';
      }

      return (
        <div className='audit-result'
             key={group}
             style={{ cursor: 'default' }}>
          <div className={`audit-result-score ${scoreClassName}`}>
            { score == null ? <Spinner width={10} height={10} strokeWidth={2}/> : (Math.round(score || 0) + '%')}
          </div>
          <div className='audit-result-title'>{group}</div>
          <div style={{ marginTop: 3 }}>{description}</div>
        </div>
      )
    });

    return (
      <AuditResult onScoreChange={::this._onScoreChange}
                   hasScore={false}
                   description={<div style={{ fontSize: 12 }}>{`Insights is a framework for improving the performance of your Aura application. The system
                   runs six (6) categories of audits to identify performance issues on your page. Each category is detailed below.`}</div>}
                   title='▶ Overview'>
        {groupScores}
      </AuditResult>
    );
  }
}
