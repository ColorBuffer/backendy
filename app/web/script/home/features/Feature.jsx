
import React from 'react'
import {Text} from 'react-unified'

export default function Feature({
    title,
    description,
    children,
}) {

    return (
        <div>
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                {children}
            </div>
            <div>
                <Text textRole={'h3'}>{title}</Text>
                <Text>{description}</Text>
            </div>
        </div>
    )
}