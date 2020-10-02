
import React from 'react'
import useQueryHistory from './useQueryHistory'

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { coy } from 'react-syntax-highlighter/dist/cjs/styles/prism'

export default function History({
    currentDatabase,
}) {

    if (!currentDatabase) {
        return null
    }

    const history = useQueryHistory()

    return (
        <div
            style={{
                height: '100%',
            }}
        >
            <table style={{fontFamily: 'monospace'}}>
                <style>{`pre{margin: 0 !important; padding: 0 !important; background-color: transparent !important;}`}</style>
                <thead>
                    <th>{'count'}</th>
                    <th>{'ms'}</th>
                    <th>{'query'}</th>
                    <th>{'values'}</th>
                </thead>
                {history.map((item, i) => (
                    <tr style={{
                        backgroundColor: (i % 3 === 2) ? 'whitesmoke' : 'white',
                    }}>
                        <td>{item.count}</td>
                        <td>{item.duration}</td>
                        <td>
                            <SyntaxHighlighter language="sql" style={coy}>
                                {item.query}
                            </SyntaxHighlighter>
                        </td>
                        <td>{item.values}</td>
                    </tr>
                ))}
            </table>
        </div>
    )
}