import React from 'react';

export function DoubleDivider(props: { alignPosition: string }) {
    return (
        <div className={`flex flex-col justify-center w-full gap-[1px] ${props.alignPosition}`}>
            <div className='w-full h-1 rounded-full bg-bcorange'></div>
            <div className='w-[95%] h-1 rounded-full bg-bcblue'></div>
        </div>
    )
}