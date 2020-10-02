
import React from 'react'

const Gate = React.forwardRef(
    function ({children, title, rtl}, ref) {
        
        return (
            <div
                style={{
                    display: 'flex',
                    flexDirection: rtl ? 'row' : 'row-reverse',
                    marginBottom: 5,
                    borderRadius: 20,
                    overflow: 'hidden',
                }}
            >
                <div
                    ref={ref}
                    style={{
                        width: 60,
                        height: 40,
                        backgroundColor: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    {children}
                </div>
                <div
                    style={{
                        backgroundColor: 'white',
                        flexGrow: 1,
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        [rtl ? 'paddingRight' : 'paddingLeft']: 30,
                    }}
                >
                    <span style={{fontFamily: 'IRANSans', fontWeight: 400, color: '#666'}}>{title}</span>
                </div>
            </div>
        )
    }
)

export default Gate