
import React from 'react'

import Tables from './Tables'
import DataGrid from './DataGrid'

export default function Data({
    currentDatabase,
}) {

    const [currentTable, setCurrentTable] = React.useState(null)

    return (
        <div
            style={{
                height: '100%',
                display: 'flex',
                flexDirection: 'row',
            }}
        >
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                <div
                    style={{
                        background: '#4CAF50',
                        height: 24,
                    }}
                ></div>
                <div
                    style={{
                        background: '#f7f6f6',
                        minWidth: 50,
                        overflowY: 'scroll',
                        flexGrow: 1,
                    }}
                >
                    <Tables 
                        database={currentDatabase}
                        currentTable={currentTable}
                        setCurrentTable={setCurrentTable}
                    />
                </div>
            </div>
            <div
                style={{
                    flexGrow: 1,
                    background: 'white',
                }}
            >
                <DataGrid 
                    database={currentDatabase}
                    table={currentTable}
                />
            </div>
        </div>
    )
}