
import React from 'react'

import {ListReversed, List} from 'react-unified'
import {useQuery, gql} from 'nevisor-ui'
import Table from './table/Table'
import Row from './table/Row'

const QUERY = gql`
    query($databaseName: String, $tableName: String) {
        columns(databaseName: $databaseName, tableName: $tableName) {
            id
            name
            type
            null
            maxCharacters
        }
        rows(databaseName: $databaseName, tableName: $tableName) {
            data
        }
    }
`

const CustomScrollbarsVirtualList = React.forwardRef(({style, ...props}, ref) => (
    <div
        ref={ref}
        style={{
            ...style,
            overflowY: 'scroll',
        }}
        {...props}
    />
))

export default function DataGrid({database, table}) {

    const query = useQuery(QUERY, {
        variables: {
            databaseName: database ? database.name : null,
            tableName: table ? table.name : null,
        }
    })
    
    const columnsWidth = !query.data ? [] : query.data.columns.map(column => {

        let maxCharacters = column.maxCharacters
        if (maxCharacters > 20) {
            return null
        }

        return maxCharacters * 7.15
    })
    
    return (
        <Table columnsWidth={columnsWidth}>
            <div
                style={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                <div
                    style={{
                        direction: 'ltr',
                        background: '#4CAF50',
                        color: 'white',
                        overflowY: 'scroll',
                    }}
                >
                    <Row>
                        {query.data && query.data.columns.map((column, i) => (
                            <div
                                key={column.id}
                                style={{
                                    fontFamily: 'monospace',
                                    padding: 5,
                                    textAlign: 'left',
                                    background: (i % 2 === 0) ? 'rgba(0, 0, 0, .05)' : 'transparent',
                                }}
                            >{column.name}</div>
                        ))}
                    </Row>
                </div>
                <div
                    style={{
                        flexGrow: 1,
                    }}
                >
                    <List
                        outerElementType={CustomScrollbarsVirtualList}
                        items={query.data ? query.data.rows : []}
                        keyExtractor={(item, i) => i}
                        loadMoreItems={length => null}
                        renderItem={(row, i) => (
                            <div
                                style={{
                                    direction: 'ltr',
                                    background: (i % 3 === 0) ? 'rgba(0, 0, 0, .05)' : 'transparent',
                                    borderBottom: '1px solid rgba(0, 0, 0, .05)',
                                    borderLeft: '1px solid rgba(0, 0, 0, .05)',
                                    overflow: 'hidden',
                                }}
                            >
                                <Row>
                                    {Object.values(JSON.parse(row.data)).map((field, j) => {

                                        return (
                                            <div
                                                key={j}
                                                style={{
                                                    whiteSpace: 'nowrap',
                                                    fontFamily: 'monospace',
                                                    padding: 10,
                                                    borderRight: '1px solid rgba(0, 0, 0, .05)',
                                                    overflow: 'hidden',
                                                    height: '100%',
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        overflow: 'hidden',
                                                    }}
                                                >
                                                    {field}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </Row>
                            </div>
                        )}
                        getItemHeight={(i) => 34}
                    />
                </div>
            </div>
        </Table>
    )
}