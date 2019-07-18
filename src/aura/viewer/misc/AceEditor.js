import React from 'react';
import ReactAce from 'react-ace';
import Dimensions from 'react-dimensions';
import 'brace/theme/tomorrow_night_eighties';
import 'brace/theme/github';
import 'brace/mode/javascript';
import 'brace/ext/searchbox';

export default class AceEditor extends React.PureComponent {
    static defaultProps = {
        showLineNumbers: true
    };

    get editor() {
        return this.refs.root.editor;
    }

    render() {
        const { theme, valueGetter, showLineNumbers, ...props } = this.props;

        if (valueGetter) {
            props.value = valueGetter();
        }

        return (
            <ReactAce
                ref="root"
                mode="javascript"
                height="100%"
                width="100%"
                enableBasicAutocompletion={true}
                enableLiveAutocompletion={true}
                setOptions={{ showLineNumbers }}
                fontSize={9}
                {...props}
                theme={theme === 'dark' ? 'tomorrow_night_eighties' : 'github'}
            />
        );
    }
}

export const ResponsiveAceEditor = Dimensions({ elementResize: true })(
    class extends React.PureComponent {
        get editor() {
            return this.refs.root.editor;
        }

        render() {
            const { containerWidth, containerHeight } = this.props;

            return (
                <AceEditor
                    {...this.props}
                    ref="root"
                    width={containerWidth + 'px'}
                    height={containerHeight + 'px'}
                />
            );
        }
    }
);
