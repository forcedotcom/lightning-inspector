import Immutable from "immutable";
import PropTypes from "prop-types";
import React, { PureComponent } from "react";

//import { Accordion, AccordionSection } from "react-lds";
import { ExpandableSection } from "react-lds";

export default class EventCardList extends React.Component {

    constructor(props, context) {
        super(props, context);
    }

    render() {        
        return (<div>{
            this.props.listItems.map(item => {
                return (
                    <div key={item.props.id} title={item.props.title} className="slds-border_bottom">
                        {item}
                    </div>
                );
            })
        }</div>);
    }

}
