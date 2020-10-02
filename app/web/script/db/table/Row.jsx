
import React from 'react'
import TableContext from './TableContext'

export default function Row({
    children,
}) {
    
    const columnsWidth = React.useContext(TableContext)
    const childrenArray = React.Children.toArray(children)
    
    return (
        <div
            style={{
                display: 'flex',
            }}
        >
            {childrenArray.map((content, i) => {

                const columnWidth = columnsWidth[i]
                return (
                    <div
                        key={i}
                        style={{
                            flexGrow: !columnWidth ? 1 : undefined,
                            flexBasis: !columnWidth ? 0 : undefined,
                            width: !columnWidth ? undefined : columnWidth,
                        }}
                    >
                        {content}
                    </div>
                )
            })}
        </div>
    )
}