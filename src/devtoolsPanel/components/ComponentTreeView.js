
import React from "react";
import ReactDOM from "react-dom";
import ComponentTreeSerializer from "../../aura/viewer/ComponentTreeSerializer.js";
import FunctionCallValueUtils from "../../aura/FunctionCallValueUtils.js";
import JsonSerializer from "../../aura/JsonSerializer.js";
import scrollIntoViewIfNeeded from 'scroll-into-view-if-needed'

export default class ComponentTreeView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            nodesMap: new Map(),
            lastSelected: null
        };

        this.handleNodeMounted = this.handleNodeMounted.bind(this);
        this.handleNodeUnmounted = this.handleNodeUnmounted.bind(this);
    }

    handleNodeMounted(createdNode) {
        const globalId = createdNode.props.globalId;
        this.state.nodesMap.set(globalId, createdNode);

        if(globalId === this.state.selectedNodeId) {
            createdNode.setSelected(true);
            delete this.state.selectedNodeId;
        }
    }

    handleNodeUnmounted(destroyedNode) {
        this.state.nodesMap.remove(destroyedNode.props.globalId);
    }

    setSelectedId(globalId) {
        if(this.state.nodesMap.has(globalId)) {
            if(this.state.lastSelected) {
                this.state.lastSelected.setSelected(false);
            }
            const node = this.state.nodesMap.get(globalId);
            node.setSelected(true);
            //node.update();

            this.state.lastSelected = node;
        } else {
            this.state.selectedNodeId = globalId;
        }
    }

    update() {
        this.forceUpdate();
    }

    // Manages if a node is collapsed or not.
    collapsed(nodeProperties, childrenLength) {
        const AUTO_EXPAND_CHILD_COUNT = 3;
        const AUTO_EXPAND_LEVEL = 3;
        // Expand All option overrides everything
        if(this.props.expandAll === true) {
            return false;
        }

        if(typeof childrenLength === "number" && childrenLength <= AUTO_EXPAND_CHILD_COUNT) {
            return false;
        }

        if(nodeProperties.depth <= AUTO_EXPAND_LEVEL) {
            return false;
        }

        return true;
    }

    render() {
        let nodes = [];
        for(let c=0;c<this.props.rootComponents.length;c++) {
            nodes.push(<ComponentTreeViewRootNode 
                        key={c} 
                        component={this.props.rootComponents[c]} 
                        showGlobalId={this.props.showGlobalIds} 
                        collapsed={this.collapsed.bind(this)}

                        // Event Handlers
                        onMount={this.handleNodeMounted}
                        onUnmount={this.handleNodeUnmounted}
                        onClick={this.props.onClick}/>);
        }
        return (<div onClick={this.handleAllClickEvents}>{nodes}</div>);
    }
}

ComponentTreeView.defaultProps = {
    rootComponents: [],
    selectedNodeId: null,
    showGlobalIds: false
};

// Slightly different as some root nodes are true DOM elements
class ComponentTreeViewRootNode extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            "collapsed": this.props.collapsed
        };

        this.handleToggleCollapse = this.handleToggleCollapse.bind(this);
    }

    handleToggleCollapse(event) {
        this.setState({
            "collapsed": !this.state.collapsed
        });
    }

    componentWillReceiveProps(newProperties) {
        this.setState({
            collapsed: newProperties.collapsed
        });
    }

    render() {
        const components = this.props.component.components;
        const nodes = [];
        if(components && components.length) {
            for(var c=0;c<components.length;c++) {
                let component = JsonSerializer.parse(components[c]);
                nodes.push(<ComponentTreeViewNode 
                                key={component.globalId}
                                globalId={component.globalId} 
                                showGlobalId={this.props.showGlobalId} 
                                collapsed={this.props.collapsed}
                                depth={1}

                                // Event handlers
                                onClick={this.props.onClick}
                                onMount={this.props.onMount}
                                onUnmount={this.props.onUnmount}/>);
            }
        }

        return (
            <ul className="tree-view collapsable">
                {nodes}
            </ul>
        );
    }
}

ComponentTreeViewRootNode.defaultProps = {
    collapsed: false
};


class ComponentTreeViewNode extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            "childNodes": [],
            "collapsed": this.props.collapsed,
            "selected": false
        };

        if(this.props.collapsed) {
            this.state.collapsed = this.props.collapsed(this.props);
        }

        this.handleToggleCollapse = this.handleToggleCollapse.bind(this);
        this.handleClickEvent = this.handleClickEvent.bind(this);

    }

    getLabel() {
        const descriptor = this.state.descriptor;

        if(!descriptor) {
            return (<span className="component-label-loading"></span>);
        }

        // Delegate to a specific type of formatting view node.
        switch(descriptor) {
            case "markup://aura:text":
                return (<TextTreeViewNode component={this.state.component} />);
            case "markup://aura:html":
                return (<HtmlTreeViewNode component={this.state.component} />);
            case "markup://aura:expression":
                return (<ExpressionTreeViewNode component={this.state.component} />);
        }

        // Just a normal component, lets use our own internal formatting
        const component = this.state.component;
        const tagName = descriptor.split("://")[1] || descriptor;

        const attributes = [];

        if(this.props.showGlobalId){
            attributes.push(<span className="component-attribute-pair" key="globalId"><span className="component-attribute">globalId</span>="{this.props.globalId}"</span>);
        }

        if(component.attributes) {
            var count_element;
            var attribute_element;
            for(var attribute in component.attributes) {
                if(attribute === "body") {
                    continue;
                }

                let current = component.attributes[attribute];

                if(current && Array.isArray(current)){
                    attributes.push(<span className="component-attribute-pair" key={attribute}><span className="component-attribute">{attribute}</span>=[{current.length||''}]</span>);
                } else if(current && typeof current === "object") {
                    attributes.push(<span className="component-attribute-pair" key={attribute}><span className="component-attribute">{attribute}</span>={'{'}{Object.keys(current).length>0?"...":''}{'}'}</span>);
                } else if(FunctionCallValueUtils.isFCV(current)) {
                    attributes.push(<span className="component-attribute-pair" key={attribute}><span className="component-attribute">{attribute}</span>={FunctionCallValueUtils.formatFCV(current)}</span>);
                } else if(component.expressions.hasOwnProperty(attribute)) {
                    current = component.expressions[attribute];
                    if(FunctionCallValueUtils.isFCV(current)) {
                        attributes.push(<span className="component-attribute-pair" key={attribute}><span className="component-attribute">{attribute}</span>="{FunctionCallValueUtils.formatFCV(current)}"</span>);
                    } else {
                        attributes.push(<span className="component-attribute-pair" key={attribute}><span className="component-attribute">{attribute}</span>="{current}"</span>);
                    }
                } else {
                    attributes.push(<span className="component-attribute-pair" key={attribute}><span className="component-attribute">{attribute}</span>="{current+''}"</span>);
                }
            }   
        }
        
        return (
            <span>
                <span className="component-tagname">&lt;{tagName}</span>
                {attributes}
                &gt;
            </span>
            );
    }

    handleToggleCollapse(event) {
        this.setState({
            "collapsed": !this.state.collapsed
        });
    }

    handleClickEvent(event) {
        if(this.props.onClick) {
            this.props.onClick.call(this, event);
        }
        
        this.setSelected(true);
    }

    componentWillReceiveProps(newProperties) {
        if(this.props.collapsed) {
            this.setState({
                collapsed: this.props.collapsed(this.props, this.state.childNodes.length)
            });
        }
    }

    componentDidMount() {

        // Update if we haven't already
        if(this.state.component === undefined) {
            // If this is a performance problem, consider wrapping it in requestIdleCallback
            // We could also try to trace if we're 2 levels deep and then don't do it till we're about to be expanded.
            // We still need to do this if we're not expanded, as we don't know if we should show the arrow or not to expand.
            this.update();
        }

        if(this.props.onMount) {
            this.props.onMount(this);
        }
    }

    componentWillUnmount() {
        if(this.props.onUnmount) {
            this.props.onUnmount(this);
        }
    }

    setSelected(isSelected) {
        this.setState({
            "selected": isSelected
        });

        const element = ReactDOM.findDOMNode(this);
        if(element) {
            scrollIntoViewIfNeeded(element);
        }
    }


    update() {
        ComponentTreeSerializer
                .getComponentWithChildren(this.props.globalId)
                .then((result) => {
                    const component = result.component;
                    const children = result.children;

                    this.setState({
                        "component": component,
                        "descriptor": component.descriptor,
                        "valid": component.valid,
                        "childNodes": children || [],
                        "collapsed": this.props.collapsed(this.props, children.length)
                    });
                });
    }

    render() {
        //console.count(this.props.globalId);
        if(Array.isArray(this.state.childNodes) && this.state.childNodes.length === 0) {
            return (
                <li key={this.props.globalId} className={this.state.selected ? 'tree-node-selected' : ''} >
                    <span className="tree-view-node" onClick={this.handleClickEvent}>{this.getLabel()}</span>
                </li>
            );
        }

        const childNodes = this.state.childNodes === null ? [] : this.state.childNodes.map(item => 
            <ComponentTreeViewNode 
                key={item.globalId} 
                globalId={item.globalId} 
                showGlobalId={this.props.showGlobalId} 
                collapsed={this.props.collapsed} 
                depth={this.props.depth+1} 

                // Event handlers
                onClick={this.props.onClick}
                onMount={this.props.onMount}
                onUnmount={this.props.onUnmount}/>
        );
        
        return (
            <li className={"tree-view-parent" + (!this.state.collapsed ? ' tree-view-expanded' : '') + (this.state.selected ? ' tree-node-selected' : '')} key={this.props.globalId}>
                <span className="tree-view-node-arrow" onClick={this.handleToggleCollapse}></span><span className="tree-view-node" onClick={this.handleClickEvent} onDoubleClick={this.handleToggleCollapse}>{this.getLabel()}</span>
                <ul>{childNodes}</ul>
            </li>
        );
    }
};

ComponentTreeViewNode.defaultProps = {
    globalId: "",
    descriptor: "",
    component: {},
    collapsed: function(){}
};

class HtmlTreeViewNode extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const component = this.props.component;
        const tagName = component.tagName || component.attributes && component.attributes.tag || "wtf";
        const attributes = [];

        if(this.props.showGlobalId) {
            attributes.push(<span className="component-attribute-pair" key="globalId"><span className="component-attribute">globalId</span>="{component.globalId}"</span>);
        }

        // Why do I only do this for aura:id html elements?
        const localId = component.attributes["aura:id"] || component.localId;
        if(localId) {
            attributes.push(<span className="component-attribute-pair" key="aura:id"><span className="component-attribute">aura:id</span>="{localId}"</span>);
        }

        for(let attribute in component.attributes.HTMLAttributes) {
            let value = component.attributes.HTMLAttributes[attribute];
            if(FunctionCallValueUtils.isFCV(value)) {
                attributes.push(<span className="component-attribute-pair" key={attribute}><span className="component-attribute">{attribute}</span>="{FunctionCallValueUtils.formatFCV(value)}"</span>);
            } else {
                attributes.push(<span className="component-attribute-pair" key={attribute}><span className="component-attribute">{attribute}</span>="{value}"</span>);
            }
        }

        return (
            <span key={this.props.component.globalId}>
                <span className="component-tagname">&lt;{tagName}</span>
                {attributes}
                &gt;
            </span>
        );
    }
};

class TextTreeViewNode extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        let text = this.props.component.attributes.value;
        if(!text || text.trim().length === 0) {
            return (
                <span>""</span>
            );
        }

        return (
            <span key={this.props.component.globalId}>"{text}"</span>
        );
    }
};

class ExpressionTreeViewNode extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        if(this.props.component.expressions) {
            const expression = this.props.component.expressions.value;

            // ByReference {!...}
            if(expression) { 
                if(FunctionCallValueUtils.isFCV(expression)) {
                    return (<span key={this.props.globalId}>{FunctionCallValueUtils.formatFCV(expression)}</span>);
                }
                return (<span key={this.props.globalId}>{expression}</span>);
            }
        }

        const attributeValue = this.props.component.attributes.value;

        // ByValue {#...}
        return (<span key={this.props.component.globalId}>{attributeValue}</span>);
    }
};