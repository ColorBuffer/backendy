
import React from 'react'

function centerOfElement(el, parent) {
    const rect = el.getBoundingClientRect()
    const rect2 = parent.getBoundingClientRect()
    return {
        x: rect.left + rect.width / 2 - rect2.left,
        y: rect.top + rect.height / 2 - rect2.top,
    }
}


export default function PipeLine({source, target, parent}) {

    const [mounted, setMounted] = React.useState(false)
    const [totalLength, setTotalLength] = React.useState(0)
    React.useEffect(() => setMounted(true), [])

    const extra = 5
    
    // https://lmgonzalves.github.io/2015/10/26/animating-svg-path-segments/
    const begin = 20
    const length = 10

    if (!mounted) return null

    const c1 = centerOfElement(source.current, parent.current)
    const c2 = centerOfElement(target.current, parent.current)

    const x1 = c1.x
    const y1 = c1.y
    const x2 = c2.x
    const y2 = c2.y

    const width  = Math.abs(x1 - x2)
    const height = Math.abs(y1 - y2)
    const left   = Math.min(x1, x2)
    const top    = Math.min(y1, y2)

    const X1 = x1 < x2 ? 0 : width
    const Y1 = y1 < y2 ? 0 : height
    const X2 = x1 > x2 ? 0 : width
    const Y2 = y1 > y2 ? 0 : height
    
    const d = `M${X1},${Y1} C${(2 * X1 + X2) / 3},${Y1} ${(X1 + 2 * X2) / 3},${Y2} ${X2},${Y2}`
    return (
        <svg
            style={{
                position: 'absolute',
                left: left - extra,
                top: top - extra,
                width: width + 2 * extra,
                height: height + 2 * extra,
            }}
        >
            <g
                transform={`translate(${extra}, ${extra})`}
            >
                <path
                    ref={c => {
                        if (!c) return;
                        setTotalLength(c.getTotalLength())
                    }}
                    d={d}
                    strokeWidth={2}
                    stroke={'rgba(0, 0, 0, .1)'}
                    fill="none"
                />
                <path
                    d={d}
                    strokeWidth={2}
                    stroke={'#2196F3'}
                    fill="none"
                    strokeDasharray={`${totalLength}, ${begin}, ${length}`}
                    strokeDashoffset={totalLength}
                />
            </g>
        </svg>
    )
}