
import React from 'react'

export default function Api({
    currentDatabase,
}) {

    if (!currentDatabase) {
        return null
    }

    return (
        <div
            style={{
                height: '100%',
            }}
        >
            <iframe
                style={{
                    border: 0,
                    width: '100%',
                    height: '100%',
                }}
                src={`https://api.backendy.ir/${currentDatabase.name}`}
            />
        </div>
    )
}