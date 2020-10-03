
import React from 'react'
import {Modal, FontProvider} from 'react-unified'
import {ToastProvider, AppProvider} from 'nevisor-ui'
import { ApiClient, ApiProvider } from 'nevisor-api'

import {useRouter} from 'next/router'

import theme from '../script/themes/default'
import lang from '../script/langs/fa'

import 'react-unified/build/style.css'
import 'nevisor-ui-fonts/fonts/IRANSans/Farsi_numerals/webFonts/css/fontiran.css'

function createApolloClient(authToken, initialState) {
    return ApiClient({
        uri: 'http://localhost:4000/backendy/graphql',
        authToken,
        hasWS: process.browser,
        initialState,
        fragmentTypes: undefined,
        connectToDevTools: process.browser,

        // Disables forceFetch on the server (so queries are only run once)
        ssrMode: !process.browser,
    });
}

export default function MyApp({ Component, pageProps }) {

    const router = useRouter()
    const [apolloClient, setApolloClient] = React.useState(() => {
        return createApolloClient(
            null,
            null,
        )
    })

    return (
        <ApiProvider client={apolloClient}>
            <Modal.Container>
                <FontProvider
                    value={{
                        fontFamily: 'IRANSans',
                        fontSize: 14,
                        fontWeight: 400,
                        lineHeight: 1.7,
                        color: '#444',
                    }}
                >
                    <AppProvider
                        value={{
                        }}
                    >
                        <ToastProvider>
                            <div style={{
                                height: '100%',
                                backgroundColor: theme.mainBackgroundColor,
                                overflowY: !['/db'].includes(router.pathname) ? 'scroll' : undefined,
                            }}>
                                <Component {...pageProps} />
                            </div>
                        </ToastProvider>
                    </AppProvider>
                </FontProvider>
            </Modal.Container>
        </ApiProvider>
    )
}