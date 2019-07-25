import React from 'react';
import JSONTree from 'react-json-tree';
import './JSONViewer.scss';

export default class JSONViewer extends React.Component {
    state = { data: this.props.data };

    static isEmptyObject(data) {
        if (data == null) {
            return true;
        }

        if (Array.isArray(data)) {
            return data.length === 0;
        } else if (typeof data === 'object') {
            return Object.keys(data).length === 0;
        }

        return false;
    }

    componentWillReceiveProps(nextProps) {
        this.setState({ data: nextProps.data });
    }

    setData(data) {
        this.setState({ data });
    }

    render() {
        const { style, ...props } = this.props;
        const { data } = this.state;

        if (JSONViewer.isEmptyObject(data)) {
            return null;
        }

        return (
            <div className="json" style={style}>
                <JSONTree {...props} data={data} />
            </div>
        );
    }
}
