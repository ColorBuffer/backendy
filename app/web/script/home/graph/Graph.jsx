
import React from 'react'
import useResizeObserver from 'use-resize-observer'

import SmartPhoneIcon from '../../components/icons/SmartPhoneIcon'
import WebsiteIcon from '../../components/icons/WebsiteIcon'
import DBIcon from '../../components/icons/DBIcon'
import BankIcon from '../../components/icons/BankIcon'
import SMSIcon from '../../components/icons/SMSIcon'
import MoreIcon from '../../components/icons/MoreIcon'
import Gate from './Gate'
import PipeLine from './PipeLine'
import LogoFirst from '../../components/logo/LogoFirst'

export default function Graph() {

    const a = React.useRef(null)
    const b = React.useRef(null)
    const c = React.useRef(null)

    const A = React.useRef(null)
    const B = React.useRef(null)
    const C = React.useRef(null)
    const D = React.useRef(null)

    // this rerenders the component on resize
    const main = useResizeObserver()

    const iconColor = '#9e9e9e'

    return (
        <div 
            ref={main.ref}
            style={{
                display: 'flex',
                justifyContent: 'center',
                position: 'relative',
            }}
        >
            <div style={{
                flexGrow: 1,
                maxWidth: 1000,
            }}>
                <div
                    style={{
                        paddingTop: 60,
                        paddingBottom: 60,
                    }}
                >
                    <PipeLine
                        source={a}
                        target={b}
                        parent={main.ref}
                    />
                    <PipeLine
                        source={c}
                        target={b}
                        parent={main.ref}
                    />
                    <PipeLine
                        source={b}
                        target={A}
                        parent={main.ref}
                    />
                    <PipeLine
                        source={b}
                        target={B}
                        parent={main.ref}
                    />
                    <PipeLine
                        source={b}
                        target={C}
                        parent={main.ref}
                    />
                    <PipeLine
                        source={b}
                        target={D}
                        parent={main.ref}
                    />
                    <div style={{
                        display: 'flex',
                        flexDirection: 'row',
                    }}>
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                zIndex: 9,
                            }}
                        >
                            
                            <Gate ref={a} title={'اپ موبایل'}>
                                <SmartPhoneIcon
                                    color={iconColor}
                                    style={{
                                        width: 24,
                                        height: 24,
                                    }}
                                />
                            </Gate>
                            <Gate ref={c} title={'وب سایت'}>
                                <WebsiteIcon
                                    color={iconColor}
                                    style={{
                                        width: 24,
                                        height: 24,
                                    }}
                                />
                            </Gate>
                        </div>
                        <div style={{
                            flexGrow: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 9,
                        }}>
                            <div
                                ref={b}
                                style={{
                                    border: '4px solid #7a77ff',
                                    borderRadius: 30,
                                    width: 160,
                                    height: 160,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: '#7a77ff',
                                }}
                            >
                                {/* <span
                                    style={{
                                        color: 'black',
                                        fontWeight: 'bold',
                                        fontFamily: 'monospace',
                                        fontSize: 14,
                                    }}
                                >{'backendy'}</span> */}
                                <LogoFirst
                                    bg={'transparent'}
                                    color={'rgba(255, 255, 255, 0.9)'}
                                    color2={'transparent'}
                                    style={{width: 100, height: 100}}
                                />
                            </div>
                        </div>
                        <div style={{zIndex: 9,}}>
                            <Gate ref={A} title={'دیتابیس'} rtl>
                                <DBIcon
                                    color={iconColor}
                                    style={{
                                        width: 20,
                                        height: 24,
                                    }}
                                />
                            </Gate>
                            <Gate ref={B} title={'درگاه پرداخت'} rtl>
                                <BankIcon
                                    color={iconColor}
                                    style={{
                                        width: 24,
                                        height: 24,
                                    }}
                                />
                            </Gate>
                            <Gate ref={C} title={'سرویس پیامک'} rtl>
                                <SMSIcon
                                    color={iconColor}
                                    style={{
                                        width: 20,
                                        height: 20,
                                    }}
                                />
                            </Gate>
                            <Gate ref={D} title={'سایر سرویس ها'} rtl>
                                <MoreIcon
                                    color={iconColor}
                                    style={{
                                        width: 20,
                                        height: 20,
                                    }}
                                />
                            </Gate>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}