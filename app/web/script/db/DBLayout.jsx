
import React from 'react'

import {useQuery, gql} from 'nevisor-api'
import Data from './Data'
import Api from './Api'
import History from './History'

const QUERY = gql`
    query {
        databases {
            id
            name
        }
    }
`

export default function DBLayout() {

    const query = useQuery(QUERY)
    const [currentDatabase, setCurrentDatabase] = React.useState(null)
    const [activeTab, setActiveTab] = React.useState('data')

    React.useEffect(() => {

        if (!currentDatabase) return;

    }, [currentDatabase])

    return (
        <div
            style={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            <style>
                {`
                ::-webkit-scrollbar {
                    width: 10px;
                    padding: 2px;
                }
                
                /* Track */
                ::-webkit-scrollbar-track {
                    background: transparent; 
                }
                
                /* Handle */
                ::-webkit-scrollbar-thumb {
                    background: #888; 
                }
                
                /* Handle on hover */
                ::-webkit-scrollbar-thumb:hover {
                    background: #555; 
                }
                select {
                    -webkit-appearance: none;
                    -moz-appearance: none;
                }
                `}
            </style>
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'row',
                }}
            >
                <select
                    value={currentDatabase ? currentDatabase.name : 0}
                    onChange={e => {
                        setCurrentDatabase(e.target.value ? (query.data && query.data.databases).find(db => db.name === e.target.value) : null)
                    }}
                    style={{
                        backgroundColor: 'transparent',
                        fontFamily: 'monospace',
                        padding: 5,
                        border: 0,
                        outline: 'none',
                        cursor: 'pointer',
                    }}
                >
                    <option
                        key={-1}
                        value={0}
                        disabled
                        style={{
                            fontFamily: 'monospace',
                            padding: 5,
                        }}
                    >{'database'}</option>
                    {query.data && query.data.databases.map(database => (
                        <option
                            key={database.id}
                            value={database.name}
                            style={{
                                fontFamily: 'monospace',
                                padding: 5,
                                cursor: 'pointer',
                            }}
                        >{database.name}</option>
                    ))}
                </select>
                <Tab
                    separated
                    active={activeTab === 'data'}
                    onSelect={() => setActiveTab('data')}
                >
                    {'Data'}
                </Tab>
                <Tab
                    active={activeTab === 'api'}
                    onSelect={() => setActiveTab('api')}
                >
                    {'Api'}
                </Tab>
                <Tab
                    active={activeTab === 'history'}
                    onSelect={() => setActiveTab('history')}
                >
                    {'history'}
                </Tab>
            </div>
            <div
                style={{
                    flexGrow: 1,
                }}
            >
                {activeTab === 'data' ? (
                    <Data currentDatabase={currentDatabase} />
                ) : activeTab === 'api' ? (
                    <Api currentDatabase={currentDatabase} />
                ) : (
                    <History currentDatabase={currentDatabase} />
                )}
            </div>
        </div>
    )
}

function Tab({
    children,
    separated,
    active,
    onSelect,
}) {
    return (
        <div
            style={{
                height: '100%',
                marginLeft: separated ? 15 : 0,
                backgroundColor: active ? 'rgba(0, 0, 0, 0.08)' : 'transparent',
                paddingLeft: 15,
                paddingRight: 15,
                fontFamily: 'monospace',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
            }}
            onClick={() => onSelect()}
        >
            <span>{children}</span>
        </div>
    )
}