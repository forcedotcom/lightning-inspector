import React from 'react';
import AnimatedNumber from 'react-animated-number';

export default class NumberTween extends React.Component {
    state = { value: this.props.value };

    setValue(value) {
        this.setState({ value });
    }

    render() {
        const { value } = this.state;

        return <AnimatedNumber {...this.props} value={value} />;
    }
}
