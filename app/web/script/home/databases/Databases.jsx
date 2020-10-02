
import React from 'react'
import {CenterGrid} from 'nevisor-ui'
import {Text} from 'react-unified'
import MysqlIcon from './MysqlIcon'
import PostgresIcon from './PostgresIcon'

export default function Databases({

}) {

    return (
        <div
            style={{
                backgroundColor: '#F3F3FB',
                paddingTop: 45,
                paddingBottom: 45,
            }}
        >
            <CenterGrid size={14}>
                <Text style={{
                    color: '#141446',
                    textAlign: 'center',
                    fontSize: 24,
                    fontWeight: 400,
                }}>{'دیتابیس های پشتیبانی شده'}</Text>

                <div
                    style={{
                        marginTop: 15,
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <MysqlIcon
                        style={{
                            width: 140,
                            height: 140,
                        }}
                    />
                    <PostgresIcon
                        style={{
                            width: 140,
                            height: 140,
                        }}
                    />
                </div>
                <Text style={{
                    color: '#141446',
                    textAlign: 'center',
                    fontSize: 18,
                    fontWeight: 300,
                }}>{'و بزودی سایر دیتابیس ها'}</Text>
            </CenterGrid>
        </div>
    )
}