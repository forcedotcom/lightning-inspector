import React from 'react';
import { Table, Cell, Column } from 'fixed-data-table-2';
import '../misc/FixedDataTable.scss';
import Dimensions from 'react-dimensions';

export { Column, Cell, ColumnGroup } from 'fixed-data-table-2';

const rowDropdownHeightGetter = () => 0;
const rowDropdownGetter = () => null;
class FixedDataTable extends React.PureComponent {
    render() {
        const {
            containerWidth,
            containerHeight,
            offsetWidth = 0,
            offsetHeight = 0,
            ...props
        } = this.props;

        return (
            <Table
                width={containerWidth + offsetWidth}
                height={containerHeight + offsetHeight}
                rowHeight={20}
                headerHeight={25}
                groupHeaderHeight={25}
                rowDropdownHeightGetter={rowDropdownHeightGetter}
                rowDropdownGetter={rowDropdownGetter}
                {...props}
            />
        );
    }
}

export class Text extends React.PureComponent {
    render() {
        let {
            rowIndex,
            columnKey,
            getColumnValue,
            isComparisonMode,
            append,
            align,
            className = '',
            ellipses,
            children,
            title,
            ...props
        } = this.props;
        let value = getColumnValue ? getColumnValue(rowIndex, columnKey) : children;

        if (isComparisonMode) {
            if (typeof value === 'number') {
                if (value > 0) {
                    className += ' fdt-cell-green';
                    value = `+${value}`;
                } else if (value < 0) {
                    className += ' fdt-cell-red';
                    value = String(value);
                }
            }
        }

        title = title == null && typeof value === 'string' ? value : title;

        if (value == null) {
            value = '-';
        }

        if (append) {
            value += append;
        }

        if (align === 'left') {
            className += ' fixedDataTableLayout_left';
        } else if (align === 'right') {
            className += ' fixedDataTableLayout_right';
        } else {
            className += ' fixedDataTableLayout_centered';
        }

        if (ellipses === 'left') {
            className += ' fixedDataTableLayout_ellipses_left';

            if (typeof value === 'string') {
                value = value
                    .split('')
                    .reverse()
                    .join('');
            }
        } else if (ellipses === 'right') {
            className += ' fixedDataTableLayout_ellipses_right';
        }

        return (
            <Cell className={className} title={title} {...props}>
                {value}
            </Cell>
        );
    }
}

export class Header extends React.PureComponent {
    render() {
        let {
            columnKey,
            displayName = columnKey,
            onHeaderClick,
            sortDir,
            sortColumn,
            align,
            ellipses,
            style,
            className = '',
            ...props
        } = this.props;

        if (align === 'left') {
            className += ' fixedDataTableLayout_left';
        } else if (align === 'right') {
            className += ' fixedDataTableLayout_right';
        } else {
            className += ' fixedDataTableLayout_centered';
        }

        if (ellipses === 'left') {
            className += ' fixedDataTableLayout_ellipses_left';
            displayName = displayName
                .split('')
                .reverse()
                .join('');
        } else if (ellipses === 'right') {
            className += ' fixedDataTableLayout_ellipses_right';
        }

        return (
            <Cell
                className={className}
                style={style}
                onClick={onHeaderClick ? () => onHeaderClick(columnKey) : null}
            >
                {displayName} {sortColumn === columnKey ? (sortDir === 'desc' ? '↓' : '↑') : ''}
            </Cell>
        );
    }
}

const _Table = Dimensions({ elementResize: true })(FixedDataTable);

export default _Table;

export { _Table as Table };

export class SimpleTable extends React.Component {
    state = { columnWidths: {}, rows: this.props.rows };

    _onColumnResizeEndCallback(newColumnWidth, columnKey) {
        const { columnWidths } = this.state;

        columnWidths[columnKey] = newColumnWidth;

        this.setState({ columnWidths });
    }

    componentWillReceiveProps(nextProps) {
        this.setState({ rows: nextProps.rows });
    }

    _getColumnValue(rows, rowIndex, columnKey) {
        return rows[rowIndex][columnKey];
    }

    _onRowClick(e, rowIndex) {
        if (this.props.onRowClick) {
            this.props.onRowClick(this.state.rows, rowIndex);
        }
    }

    render() {
        const { columnWidths, sortColumn, sortDir, rows } = this.state;
        const { getColumnValue = ::this._getColumnValue } = this.props;

        const columns = this.props.columns.map((columnProps, i) => (
            <Column
                key={i}
                {...columnProps}
                isResizable={true}
                header={
                    <Header
                        sortColumn={sortColumn}
                        sortDir={sortDir}
                        displayName={columnProps.displayName || columnProps.columnKey}
                        {...(columnProps.header || {})}
                    />
                }
                cell={
                    <Text
                        getColumnValue={(rowIndex, columnKey) =>
                            getColumnValue(rows, rowIndex, columnKey)
                        }
                        {...(columnProps.body || {})}
                    />
                }
                width={columnWidths[columnProps.columnKey] || columnProps.width || 50}
            />
        ));

        return (
            <_Table
                rowsCount={rows.length}
                onRowClick={::this._onRowClick}
                onColumnResizeEndCallback={::this._onColumnResizeEndCallback}
                isColumnResizing={false}
            >
                {columns}
            </_Table>
        );
    }
}

export class ObjectTable extends React.Component {
    state = { rows: Object.keys(this.props.data), columnWidths: {} };

    componentWillReceiveProps(nextProps) {
        this.setState({ rows: Object.keys(nextProps.data) });
    }

    _getColumnValue(rows, rowIndex, columnKey) {
        if (columnKey === 'key') {
            return rows[rowIndex];
        } else if (columnKey === 'value') {
            return this.props.data[rows[rowIndex]];
        }
    }

    render() {
        const { rows } = this.state;

        return (
            <SimpleTable
                rows={rows}
                getColumnValue={::this._getColumnValue}
                columns={[
                    {
                        columnKey: 'key',
                        fixed: true,
                        width: 150,
                        body: { align: 'left' },
                        header: { align: 'left' },
                        required: true
                    },
                    {
                        columnKey: 'value',
                        flexGrow: 2,
                        width: 50,
                        body: { align: 'left' },
                        header: { align: 'left' }
                    }
                ]}
            />
        );
    }
}
