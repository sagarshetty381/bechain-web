import React, { useEffect, useRef, useState } from 'react';
import StorageService from '../helper/StorageService';
import { useToastService } from "../hooks/useToastService";
import supabaseClient from "../helper/SupabaseClient";
import LoaderScreen from '../layouts/LoaderScreen';
import BackendServices from '../services/BackendServices';
import { UploadImageModal } from '../components/UploadImageModal';
import { calculateAge } from '../helper/baseController';
import { ProfileImageLayout } from '../layouts/ProfileImagesLayout';
import { DoubleDivider } from '../layouts/DoubleDivider';

export const MyProfile = (props) => {
    const STORAGE_URL = process.env.REACT_APP_STORAGE_URL;
    const userDetails = StorageService.getItem('user');
    const imageModalRef = useRef<any>(null);
    const [imageElement, setImageElement] = useState<any>([]);
    const [_, setProfileImages] = useState<any[]>([]);
    const { toastError, toastSuccess } = useToastService();
    const [loading, setLoading] = useState(false);
    const [editUserBio, setEditUserBio] = useState(false);
    const [age, setAge] = useState("");

    useEffect(() => {
        const profileImages = StorageService.getItem('profileImages');
        profileImages ? loadProfileImages(profileImages) : getProfileImages();
        setAge(calculateAge(userDetails.birthdate));
    }, [])

    const getProfileImages = async () => {
        const { data, error } = await supabaseClient.client
            .storage
            .from('uploads')
            .list(`${userDetails.id}`);

        if (error) {
            toastError('Error', 'Error while fetching images');
            return;
        }
        if (data) {
            StorageService.setItem('profileImages', data);
            loadProfileImages(data);
        }
    }

    const loadProfileImages = async (data: any[]) => {
        setProfileImages(data);
        setImageElement(data);
        if (data.length >= 5) {
            StorageService.setItem('userProfileCompleted', true);
        }
    }

    const openImageModal = () => {
        imageModalRef.current?.openModal();
    }

    const updateUserBio = () => {
        setEditUserBio(!editUserBio);
        const inputElement = document.getElementById('user-bio');
        if (inputElement?.contentEditable === 'inherit' || inputElement?.contentEditable === 'false') {
            inputElement.contentEditable = 'true';
            inputElement.focus();
        } else if (inputElement?.contentEditable === 'true') {
            inputElement.contentEditable = 'false';
            inputElement.blur();
            const user = StorageService.getItem('user');
            if (inputElement.innerText === user.bio) return;

            BackendServices.updateProfileDetails({ id: user.id, bio: inputElement.innerText }).then((res) => {
                let userDetails = StorageService.getItem('user');
                userDetails.bio = res.payload.bio;
                StorageService.setItem('user', userDetails);
                toastSuccess('Success', 'Bio updated successfully');
            });
        }
    }

    return (
        <div className="flex flex-row-reverse w-full gap-3 p-2">
            <div className='flex flex-col'>
                <section className='px-5 py-4 rounded-md w-[400px] flex flex-col gap-3 h-screen shadow-xl'>
                    <img className='object-cover rounded-md shadow-md w-max aspect-square' src={`https://hjqjruueqdtekvcsgfhc.supabase.co/storage/v1/object/public/uploads/profiles/${userDetails?.id}`} alt="" />
                    <div className='flex'>
                        <p className='pb-1 text-3xl font-bold text-bcorange'>{`${userDetails?.fname}, ${age}`}</p>
                        <p className='self-center px-1 ml-3 text-sm text-green-500 bg-green-200 border-2 border-green-400 rounded-lg h-fit w-fit'>Online</p>
                    </div>
                    <DoubleDivider alignPosition='items-center' />

                    <div className='relative border-4 border-bcorange rounded-xl w-fit'>
                        <p id='user-bio' className='p-2 font-semibold border-4 rounded-md text-bcblue border-bcblue'>{userDetails?.bio === "" ? "Add you bio here" : userDetails?.bio}</p>
                        {!editUserBio ?
                            <span className='hover:cursor-pointer h-[24px] w-[24px] absolute rounded-full bg-bcorange p-1 border-bcblue border-2 border-solid right-[-10px] top-[-10px]' onClick={updateUserBio}>
                                <svg xmlns="http://www.w3.org/2000/svg" enableBackground="new 0 0 32 32" viewBox="0 0 32 32" id="edit"><path d="M12.82373,12.95898l-1.86279,6.21191c-0.1582,0.52832-0.01367,1.10156,0.37646,1.49121c0.28516,0.28516,0.66846,0.43945,1.06055,0.43945c0.14404,0,0.28906-0.02051,0.43066-0.06348l6.2124-1.8623c0.23779-0.07129,0.45459-0.2002,0.62988-0.37598L31.06055,7.41016C31.3418,7.12891,31.5,6.74707,31.5,6.34961s-0.1582-0.7793-0.43945-1.06055l-4.3501-4.34961c-0.58594-0.58594-1.53516-0.58594-2.12109,0L13.2002,12.3291C13.02441,12.50488,12.89551,12.7207,12.82373,12.95898z M15.58887,14.18262L25.6499,4.12109l2.22852,2.22852L17.81738,16.41113l-3.18262,0.9541L15.58887,14.18262z"></path><path d="M30,14.5c-0.82861,0-1.5,0.67188-1.5,1.5v10c0,1.37891-1.12158,2.5-2.5,2.5H6c-1.37842,0-2.5-1.12109-2.5-2.5V6c0-1.37891,1.12158-2.5,2.5-2.5h10c0.82861,0,1.5-0.67188,1.5-1.5S16.82861,0.5,16,0.5H6C2.96729,0.5,0.5,2.96777,0.5,6v20c0,3.03223,2.46729,5.5,5.5,5.5h20c3.03271,0,5.5-2.46777,5.5-5.5V16C31.5,15.17188,30.82861,14.5,30,14.5z"></path></svg>
                            </span> :
                            <div className='absolute right-0 flex gap-2 text-white *:px-2 mt-2 *:rounded-lg'>
                                <button onClick={updateUserBio} className='bg-green-500'><img className='w-4' src={require('../assets/tick.png')} alt="" />
                                </button>
                                <button onClick={() => { setEditUserBio(!editUserBio) }} className='bg-red-500'>X</button>
                            </div>
                        }
                    </div>
                </section>
            </div>
            <div className='flex flex-col gap-3 w-fit'>
                <section className='overflow-y-auto' style={{ height: 'calc(100vh - 50px)', scrollbarWidth: 'none' }}>
                    <ProfileImageLayout imageElement={imageElement} id={userDetails.id} storageUrl={STORAGE_URL} openImageModal={openImageModal} />
                </section>
            </div>
            <UploadImageModal ref={imageModalRef} setLoading={setLoading} getProfileImages={getProfileImages} />
            {loading && <LoaderScreen />}
        </div>
    )
}