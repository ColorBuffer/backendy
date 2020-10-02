
import React from 'react'

function chunkArray(array, chunkSize) {
    return [].concat.apply([],
        array.map((elem, i) => i % chunkSize ? [] : [array.slice(i, i + chunkSize)])
    );
}

export default function FeatureGrid({
    minimal,
    cols,
    children,
}) {
    const cols2 = cols - 1;
    const childrenArray = React.Children.toArray(children);
    const first = childrenArray[0];
    const rest = childrenArray.slice(1);
    const chunks = chunkArray(rest, cols2);
    return (
        <div style={{
            marginBottom: minimal ? 0 : ((cols - 1) * 150),
        }}>
            {chunks.map((chunk, i) => {
                const reverse = !!(i % 2);
                return (
                    <div
                        key={i}
                        style={{
                            display: 'flex',
                            flexDirection: minimal ? 'column' : 'row',
                            direction: reverse ? 'ltr' : 'rtl',
                        }}
                    >
                        {(i === 0) ? (
                            <div
                                style={{
                                    flexGrow: 1,
                                    flexBasis: 0,
                                }}
                            >
                                {first}
                            </div>
                        ) : (
                            <div
                                style={{
                                    flexGrow: 1,
                                    flexBasis: 0,
                                }}
                            />
                        )}
                        {chunk.map((cell, j) => (
                            <div
                                key={j}
                                style={{
                                    flexGrow: 1,
                                    flexBasis: 0,
                                    transform: minimal ? undefined : `translateY(${150 * (j + 1)}px)`,
                                }}
                            >
                                {cell}
                            </div>
                        ))}
                    </div>
                );
            })}
        </div>
    )
}