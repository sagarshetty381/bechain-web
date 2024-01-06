import React from 'react';

const Cards = ({ data }: any) => {
    return (
        <div id={data.name} className="card">
            <img src="https://images.unsplash.com/photo-1674470470305-18f24cdf8f69?auto=format&fit=crop&q=80&w=1964&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="" />
            <p>{data.name}</p>
        </div>
    )
}

export default Cards;