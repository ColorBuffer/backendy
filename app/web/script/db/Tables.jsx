
import React from 'react'

import {useQuery, gql} from 'nevisor-ui'
import TableIcon from '../components/icons/TableIcon'

const QUERY = gql`
    query($databaseName: String) {
        tables(databaseName: $databaseName) {
            id
            name
        }
    }
`

export default function Tables({database, currentTable, setCurrentTable}) {

    const query = useQuery(QUERY, {
        variables: {
            databaseName: database ? database.name : null,
        }
    })
    
    return (
        <div>
            {query.data && query.data.tables.map(table => (
                <div
                    key={table.id}
                    onClick={() => {
                        setCurrentTable(table)
                    }}
                    style={{
                        fontFamily: 'monospace',
                        padding: 5,
                        cursor: 'pointer',
                        background: (currentTable && currentTable.name === table.name) ? 'rgba(0,0 , 0, .1)' : 'transparent',
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <TableIcon color={'#666'} style={{width: 20, height: 20}} />
                    <div style={{
                        flexGrow: 1,
                        paddingLeft: 5,
                    }}>{table.name}</div>
                </div>
            ))}
        </div>
    )
}