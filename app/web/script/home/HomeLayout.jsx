
import React from 'react'

import Graph from './graph/Graph'
import Features from './features/Features'
import Databases from './databases/Databases'
import Header from './header/Header'

export default function HomeLayout() {

    return (
        <div>
            <Header />
            <Graph />
            <Features />
            <Databases />

        </div>
    )
}