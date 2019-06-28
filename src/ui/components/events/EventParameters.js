import React from "react";
import PropTypes from "prop-types";
import { Table, Row, Cell } from "react-lds";
import JsonSerializer from "../../../aura/JsonSerializer";
import ReactJsonTree from "react-json-tree";

export default class EventParameters extends React.PureComponent {
    static propTypes = {
        parameters: PropTypes.string.isRequired,
    };

    generateTableRows() {
        const parameters = JsonSerializer.parse(this.props.parameters);

        return Object.entries(parameters).map((parameter) => {
            return (<Row key={parameter[0]}>
                        <Cell data-label="Parameter">{parameter[0]}</Cell>
                        <Cell data-label="Value"><span>{this.formatValue(parameter[1])}</span></Cell>
                    </Row>);
        })
    }

    formatValue(value) {
        if(typeof value === "object") {
            return (<ReactJsonTree data={value} theme="tomorrow"/>);
        }
        return value;
    }

    render() {
        return (<Table flavor={["bordered", "striped"]} variation="no-row-hover">
            <thead>
                <Row head>
                    <Cell scope="col">Parameter</Cell><Cell scope="col">Value</Cell>
                </Row>
            </thead>
            <tbody>
                {this.generateTableRows()}
            </tbody>
        </Table>);
    }
}