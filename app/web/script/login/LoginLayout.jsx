
import React from 'react'
import {useDimensions, Text} from 'react-unified'
import {Input, InputFrame, Button} from 'nevisor-ui'

export default function LoginLayout() {

    const dimensions = useDimensions()
    const minimal = dimensions.width < 768

    const [email, setEmail] = React.useState('')
    const [password, setPassword] = React.useState('')

    return (
        <div
            style={{
                height: '100%',
                display: 'flex',
                flexDirection: 'row',
            }}
        >
            {minimal ? null : (
                <div
                    style={{
                        flexGrow: 1,
                        height: '100%',
                        backgroundColor: '#F3F3FB',
                    }}
                >
                    
                </div>
            )}
            <div
                style={{
                    flexGrow: minimal ? 1 : undefined,
                    width: minimal ? undefined : 400,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                }}
            >
                <div style={{
                    paddingRight: 30,
                    paddingLeft: 30,
                }}>
                    <Text style={{
                        color: '#141446',
                        textAlign: 'center',
                        fontSize: 24,
                        fontWeight: 400,
                    }}>{'ورود به حساب کاربری'}</Text>

                    <InputFrame
                        label={'ایمیل'}
                    >
                        <Input
                            value={email}
                            onValue={setEmail}
                            keyboard={Input.Keyboard.Email}
                        />
                    </InputFrame>
                    <InputFrame
                        label={'رمز'}
                    >
                        <Input
                            value={password}
                            onValue={setPassword}
                            keyboard={Input.Keyboard.Password}
                        />
                    </InputFrame>
                    <div style={{
                        display: 'flex',
                    }}>
                        <Button
                            style={{flexGrow: 1}}
                            onBtnClick={async () => {
                                
                            }} 
                            base={'primary'}
                            text={'ورود'}
                            size={'huge'}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}