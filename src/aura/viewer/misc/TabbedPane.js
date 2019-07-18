import React from 'react';
import ReactDOM from 'react-dom';

function setTransform(element, transform) {
    element.style.webkitTransform = transform;
    element.style.mozTransform = transform;
    element.style.msTransform = transform;
    element.style.oTransform = transform;
    element.style.transform = transform;
}

class TabbedPane extends React.Component {
    activeTab = this.props.activeTab || this.props.tabs[0];
    state = { [this.props.tabs[0]]: true };

    static defaultProps = {
        showClose: false
    };

    setActiveTab(tab) {
        const index = this.props.tabs.indexOf(tab);
        if (index > -1) {
            if (this.activeTab) {
                const activeTabNode = ReactDOM.findDOMNode(this.refs[`button${this.activeTab}`]);

                if (activeTabNode) {
                    activeTabNode.classList.remove('selected');
                }
            }

            const tabNode = ReactDOM.findDOMNode(this.refs[`button${tab}`]);

            if (tabNode) {
                tabNode.classList.add('selected');
            }

            setTransform(
                ReactDOM.findDOMNode(this.refs.pane),
                `translate3d(-${(index / this.props.tabs.length) * 100}%, 0, 0)`
            );

            this.activeTab = tab;

            if (!this.state[tab]) {
                this.setState({ [tab]: true });
            }
        }
    }

    componentWillReceiveProps(nextProps) {
        if (
            Array.isArray(nextProps.tabs) &&
            nextProps.tabs.length &&
            nextProps.tabs.indexOf(this.activeTab) == -1
        ) {
            this.activeTab = nextProps.tabs[0];
        } else if (this.activeTab !== nextProps.activeTab) {
            this.setActiveTab(nextProps.activeTab);
        }
    }

    componentDidMount() {
        this.setActiveTab(this.activeTab);
    }

    componentDidUpdate() {
        this.setActiveTab(this.activeTab);
    }

    render() {
        const count = this.props.tabs.length;
        const children = this.props.tabs.map(tab => (
            <div
                key={tab}
                ref={tab}
                style={{
                    height: '100%',
                    display: 'inline-block',
                    verticalAlign: 'top',
                    width: `${(1 / count) * 100}%`,
                    overflow: 'hidden',
                    position: 'relative'
                }}
            >
                {this.state[tab] ? this.props[tab] : null}
            </div>
        ));

        const { onSelectTab, onClose, showClose } = this.props;
        const tabStyles = this.props.tabStyles || {};
        const tabNames = this.props.tabNames || {};
        const onClick = tab =>
            typeof onSelectTab === 'function' ? onSelectTab(tab) : this.setActiveTab(tab);

        const tabs = this.props.tabs.map(tab => (
            <div
                key={tab}
                onClick={() => onClick(tab)}
                style={tabStyles[tab]}
                className={`tab ${this.props.spread ? 'box' : null}`}
                ref={`button${tab}`}
            >
                {tabNames[tab] || tab}
            </div>
        ));

        const style = this.props.style || {};

        style.position = 'relative';
        style.overflow = 'hidden';

        return (
            <div className="full flex vertical">
                <div
                    className={`tabs ${this.props.spread ? 'spread flex' : 'scroll scroll-x'}`}
                    style={{
                        whiteSpace: 'nowrap',
                        display: this.props.hideTabsOnOne && tabs.length === 1 ? 'none' : ''
                    }}
                >
                    {showClose ? (
                        <div className="tab tab-close" onClick={onClose}>
                            ✕
                        </div>
                    ) : null}
                    {tabs}
                </div>
                <div className="full" style={style}>
                    <div
                        className="full-abs animate"
                        ref="pane"
                        style={{ width: `${count * 100}%` }}
                    >
                        {children}
                    </div>
                </div>
            </div>
        );
    }
}

export default TabbedPane;
