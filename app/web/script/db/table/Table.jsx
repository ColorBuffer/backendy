
import React from 'react'
import TableContext from './TableContext'

export default function Table({
    children,
    columnsWidth,
}) {
    
    return (
        <TableContext.Provider
            value={columnsWidth}
        >
            {children}
        </TableContext.Provider>
    )
}
