import React, { useEffect, useState } from 'react';
import StorageService from '../helper/StorageService';
import apiService from '../helper/apiService';
import { useToastService } from '../hooks/useToastService';
import '../../index.css'
import { RangeSlider, RangeSliderTrack, RangeSliderFilledTrack, RangeSliderThumb } from '@chakra-ui/react';

export const Settings = () => {
    const { toastError, toastSuccess } = useToastService();
    const [formData, setFormData] = useState({
        fname: '',
        gender: '',
        profession: '',
        birthdate: ''
    });
    const [settingsText, setSettingsText] = useState('Profile Settings');
    const [minMaxAge, setMinMaxAge] = useState([21, 24]);

    const handleChange = async (event) => {
        const { name, value } = event.target;
        setFormData({ ...formData, [name]: value });
    };

    const onSubmit = (event) => {
        const user = StorageService.getItem('user');
        const payload = {
            id: user.id,
            ...formData
        }
        apiService.updateProfileDetails(payload).then((res) => {
            StorageService.setItem('user', res.payload);
            setFormData({
                fname: res.payload.fname,
                gender: res.payload.gender,
                profession: res.payload.profession,
                birthdate: res.payload.birthdate
            })
            toastSuccess('Success', 'Profile updated successfully');
        }).catch((err) => {
            console.log(err);

            toastError('Error', 'Error while updating profile');
        })
    }

    const changeNavigation = (event) => {
        const navOptions = document.querySelectorAll('.settings');
        navOptions.forEach((navOption) => {
            navOption.classList.remove('active');
        });
        event.target.classList.add('active');
        const { innerText } = event.target;
        setSettingsText(innerText);
    }

    useEffect(() => {
        const user = StorageService.getItem('user');

        if (user !== null) {
            setFormData({
                fname: user.fname,
                gender: user.gender,
                profession: user.profession,
                birthdate: user.birthdate
            })
        }
    }, []);

    return (
        <div className='w-full bg-bcorange-light flex'>
            <div className=' w-[30%] leading-5 hover:cursor-pointer'>
                <h1 className='font-bold p-4 text-xl'>Settings</h1>
                <div className='active settings p-3 m-2 font-semibold hover:bg-slate-400 rounded-md hover:text-black' onClick={changeNavigation}>Profile Settings</div>
                <div className='settings p-3 m-2 font-semibold hover:bg-slate-400 rounded-md hover:text-black' onClick={changeNavigation}>Preferences</div>
                <div className='settings p-3 m-2 font-semibold hover:bg-slate-400 rounded-md hover:text-black' onClick={changeNavigation}>App Settings</div>
            </div>
            <div className='flex-1 border-l-4 border-dotted border-bcorange relative'>
                <div className='right-0 left-0 absolute top-0 bottom-0 border-2 border-solid border-bcorange m-5 rounded-md'>
                    <div className='flex  items-center'>
                        <h1 className='font-bold p-4 text-base'>{settingsText}</h1>
                        <button onClick={onSubmit} className='bg-bcorange text-white m-4 mr-10 py-1 px-3 rounded-md' >Save</button>
                    </div>
                    <div className='m-4'>
                        {settingsText === 'Profile Settings' && <>
                            <h2 className='mb-2'>Name</h2>
                            <input type="text" placeholder='Enter Name' onChange={handleChange} value={formData.fname} name='fname'
                                className='w-full p-3 mb-3 text-sm bg-transparent border-2 border-solid border-bcblue rounded-md' />
                            <h2 className='mb-2'>Gender</h2>
                            <select className='w-full p-3 mb-3 text-sm bg-transparent border-2 border-solid border-bcblue rounded-md' value={formData.gender} name='gender' onChange={handleChange}>
                                <option className='p-3 text-sm bg-transparent' key="Male" value="male">Male</option>
                                <option className='p-3 text-sm bg-transparent' key="Female" value="female">Female</option>
                            </select>
                            <h2 className='mb-4'>Birth Date</h2>
                            <div className='flex items-center'>
                                <input type="date" placeholder='Enter Birth Date' value={formData.birthdate} onChange={handleChange} name='birthdate'
                                    className='w-full p-3 mb-3 text-sm bg-transparent border-2 border-solid border-bcblue rounded-md' />
                            </div>
                            <h2 className='mb-2'>Profession</h2>
                            <input type="text" placeholder='Enter Profession' value={formData.profession} onChange={handleChange} name='profession'
                                className='w-full p-3 mb-3 text-sm bg-transparent border-2 border-solid border-bcblue rounded-md' />
                        </>}
                        {settingsText === 'Preferences' && <>
                            <h2 className='mb-2'>Preferred Gender</h2>
                            <select className='w-full p-3 mb-3 text-sm bg-transparent border-2 border-solid border-bcblue rounded-md' value={formData.gender} name='gender' onChange={handleChange}>
                                <option className='p-3 text-sm bg-transparent' key="Male" value="male">Male</option>
                                <option className='p-3 text-sm bg-transparent' key="Female" value="female">Female</option>
                            </select>
                            <h2 className='mb-2'>Preferred Age</h2>
                            <div className='ml-3'>
                                <RangeSlider
                                    aria-label={['min', 'max']}
                                    colorScheme='orange'
                                    defaultValue={[21, 24]}
                                    min={21}
                                    max={60}
                                    onChange={(value) => setMinMaxAge(value)}
                                >
                                    <RangeSliderTrack>
                                        <RangeSliderFilledTrack />
                                    </RangeSliderTrack>
                                    <RangeSliderThumb index={0} boxSize={6} className='text-sm' >{minMaxAge[0]}</RangeSliderThumb>
                                    <RangeSliderThumb index={1} boxSize={6}  className='text-sm' >{minMaxAge[1]}</RangeSliderThumb>
                                </RangeSlider>
                            </div>
                        </>}
                        {settingsText === 'App Settings' && <>
                            <h2 className='bg-green-500 p-3 rounded-md text-white mb-3'>Feedback</h2>
                            <h2 className='bg-orange-500 p-3 rounded-md text-white mb-3'>Report an activity</h2>
                            <h2 className='bg-yellow-500 p-3 rounded-md text-white mb-3'>Pause your Profile</h2>
                            <h2 className='bg-red-500 p-3 rounded-md text-white'>Deactivate Account</h2>
                        </>}
                    </div>
                </div>
            </div>
        </div>
    );
}