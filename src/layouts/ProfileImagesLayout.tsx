import React, { useEffect, useState } from 'react';
import { DoubleDivider } from '../layouts/DoubleDivider';

export function ProfileImageLayout(props: any) {
    const [imageElement, setImageElement] = useState<any>([]);

    useEffect(() => {
        if (!props.imageElement) return;
        createImageLayout(props.imageElement);
    }, [props.imageElement])

    const calculateNumberOfRows = (rowCount: number, colCount = 4) => {
        const rowCountArr = [rowCount, rowCount, rowCount, rowCount];
        return rowCountArr.map((row, i) => Math.trunc(row) + ((row % 1) * colCount > i ? 1 : 0));
    }

    const createImageLayout = (profileImages: any[]) => {
        const rowCount = calculateNumberOfRows(profileImages.length / 4);
        const parentElArr = [];
        let imageElementArr = [];
        let index = 0;
        // parentElArr.push(<div className='h-full bg-gray-300 shadow-xl'></div>)

        for (let i = 0; i < rowCount.length; i++) {
            imageElementArr = [];
            for (let j = 0; j < rowCount[i]; j++) {
                if (index >= profileImages.length) break;
                // if (imageElementArr.length === 0) {
                imageElementArr.push(<div className='h-full bg-gray-300 shadow-xl'></div>)
                //     continue;
                // }
                imageElementArr.push(
                    <div className='shadow-xl' key={props.id + j}>
                        <img key={profileImages[index]?.name} className="w-full h-auto rounded-lg" src={`${props.storageUrl}/uploads/${props.id}/${profileImages[index]?.name}`} alt="" />
                    </div>
                )
                index++;
            }
            parentElArr.push(<div key={i} className="grid gap-2">{imageElementArr}</div>)
        }
        setImageElement(parentElArr);
    }

    return (
        <>
            <section className='sticky top-0 p-4 bg-white'>
                <div className='flex items-center'>
                    <p className='m-2 text-3xl font-bold text-bcblue'>Your Spotlight </p>
                    <img className='w-7 h-7 hover:cursor-pointer' src={require('../assets/add-image.png')} alt="addimage" onClick={props.openImageModal} />
                </div>
                <DoubleDivider alignPosition='align-start' />
            </section>
            <div className="grid items-start grid-cols-2 gap-3 m-4 md:grid-cols-2 lg:grid-cols-4">
                {imageElement}
            </div>
        </>
    )
}