
import React from 'react'
import {CenterGrid} from 'nevisor-ui'
import LogoFirst from '../../components/logo/LogoFirst'
import {Text} from 'react-unified'

export default function Header({

}) {

    return (
        <div
            style={{
                height: 80,
            }}
        >
            <CenterGrid size={14}>
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                    }}
                >
                    <LogoFirst
                        bg={'transparent'}
                        color={'#7a77ff'}
                        color2={'transparent'}
                        style={{width: 80, height: 80}}
                    />
                    <Text
                        style={{
                            color: '#7a77ff',
                            fontSize: 24,
                            fontFamily: 'sans-serif',
                            fontStyle: 'italic',
                            fontWeight: 'bold',
                            marginLeft: 5,
                        }}
                    >{'Backendy'}</Text>
                </div>
            </CenterGrid>
        </div>
    )
}