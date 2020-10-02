
import React from 'react'
import Feature from './Feature'
import FeatureGrid from './FeatureGrid'
import {CenterGrid} from 'nevisor-ui'

export default function Features({

}) {

    return (
        <div>
            <CenterGrid size={14}>
                <FeatureGrid cols={3} minimal={false}>
                    <Feature
                        title={'ایجاد API خودکار'}
                        description={'بعد از آپلود دیتابیس API آن بطور خودکار ایجاد می شود. بعد از آپدیت ساختار دیتابیس API بروز می شود.'}
                    >
                        
                    </Feature>
                    <Feature
                        title={'بک آپ اتوماتیک'}
                        description={''}
                    >

                    </Feature>
                    <Feature
                        title={'امنیت و پایداری'}
                        description={''}
                    >
                        
                    </Feature>
                </FeatureGrid>
            </CenterGrid>
        </div>
    )
}