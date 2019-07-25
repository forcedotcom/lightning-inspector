import React from 'react';

class ControlledRender extends React.PureComponent {
    shouldComponentUpdate(nextProps) {
        return this.props.requestRerender != nextProps.requestRerender;
    }

    render() {
        const { children } = this.props;

        return (
            <div style={{ width: '100%', height: '100%', position: 'relative' }}>{children}</div>
        );
    }
}

export default ControlledRender;
