import React, { useEffect, useRef, useState } from 'react';
import StorageService from '../helper/StorageService';
import { Button, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalOverlay, useDisclosure } from '@chakra-ui/react';
import ImageCropper from './ImageCropper';
import { useToastService } from "../hooks/useToastService";
import supabaseClient from "../helper/SupabaseClient";
import LoaderScreen from '../layouts/LoaderScreen';
import { v4 as uuidv4 } from 'uuid';
import apiService from '../helper/apiService';
import { useNavigate } from 'react-router-dom';

export const Profile = () => {
    const navigate = useNavigate();
    const STORAGE_URL = process.env.REACT_APP_STORAGE_URL;
    const userDetails = StorageService.getItem('user');
    if (!userDetails) {
        window.location.assign('./login')
        return <></>
    }
    const inputRef = useRef(null);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [image, setImage] = useState("");
    const [profileImages, setProfileImages] = useState([]); // [image1, image2, image3]
    const [aspectRatio, setAspectRatio] = useState(16 / 9); // [16, 9, 2/3]
    const [imageElement, setImageElement] = useState([]); // [16, 9, 2/3]
    const [currentPage, setCurrentPage] = useState("choose-img");
    const [imgAfterCrop, setImgAfterCrop] = useState("");
    const { toastError, toastSuccess } = useToastService();
    const [loading, setLoading] = useState(false);
    // const { onOpen: onBioOpen, onClose: onBioClose, isOpen: isBioOpen } = useDisclosure()
    const firstFieldRef = React.useRef(null)
    const [age, setAge] = useState("");

    useEffect(() => {
        loadProfileImages();
        calculateAge();
    }, [])
    
    const calculateAge = () => { 
        const today = new Date();
        const birthDate = new Date(userDetails.birthdate);
        let age = today.getFullYear() - birthDate.getFullYear();
        const month = today.getMonth() - birthDate.getMonth();
        if (month < 0 || (month === 0 && today.getDate() < birthDate.getDate())) { 
            age--;
        }
        setAge(age.toString());
    }

    const loadProfileImages = async () => {
        const { data, error } = await supabaseClient.client
            .storage
            .from('uploads')
            .list(`${userDetails.id}`);

        if (error) {
            toastError('Error', 'Error while fetching images');
            return;
        }

        if (data) {
            data.forEach((image: any) => {
                image['ar'] = '16/9';
            })
            setProfileImages(data);
            createImageLayout(data);
        }
    }

    const handleOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            const reader = new FileReader();
            reader.readAsDataURL(event.target.files[0]);
            reader.onload = function () {
                onImageSelected(reader.result);
            };
        }
    };

    const onChooseImg = () => {
        if (inputRef.current) {
            (inputRef.current as HTMLInputElement).click();
        }
    };

    const onImageSelected = (selectedImg: any) => {
        setImage(selectedImg);
        setCurrentPage("crop-img");
    };

    // Generating Cropped Image When Done Button Clicked
    const onCropDone = (imgCroppedArea: HTMLImageElement, aspectRatio: number) => {
        setAspectRatio(aspectRatio);
        const canvasEle = document.createElement("canvas");
        canvasEle.width = imgCroppedArea.width;
        canvasEle.height = imgCroppedArea.height;

        const context = canvasEle.getContext("2d");

        let imageObj1 = new Image();
        imageObj1.src = image;
        imageObj1.onload = function () {
            context?.drawImage(
                imageObj1,
                imgCroppedArea.x,
                imgCroppedArea.y,
                imgCroppedArea.width,
                imgCroppedArea.height,
                0,
                0,
                imgCroppedArea.width,
                imgCroppedArea.height
            );

            const dataURL = canvasEle.toDataURL("image/jpeg");

            setImgAfterCrop(dataURL);
            setCurrentPage("img-cropped");
        };
    };

    // Handle Cancel Button Click
    const onCropCancel = () => {
        setCurrentPage("choose-img");
        setImage("");
    };

    const uploadProfileImage = async () => {
        setLoading(true);

        if (!image) {
            toastError('Error', 'Please select an image');
            return;
        }

        const userId = userDetails.id;
        const file = dataURLtoFile(imgAfterCrop, `${userId}-${uuidv4()}.jpeg`);

        const { data, error } = await supabaseClient.client
            .storage
            .from('uploads')
            .upload(userId + "/" + uuidv4() + '-rect', file);

        if (error) {
            toastError('Error', 'Error while uploading image');
            setLoading(false);
            return;
        }

        if (data) {
            toastSuccess('Success', 'Image uploaded successfully');
            setLoading(false);
            onCropCancel();
            onClose();
        }
    }

    const dataURLtoFile = (dataURL: any, filename: string) => {
        const arr = dataURL.split(',');
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }

        // const updatedU8arr = new Uint8Array(ExifReader.write(exifData));
        return new File([u8arr], filename, { type: mime });
    }

    const createImageLayout = (profileImages: any) => {
        let imageElementArr = [];
        const parentElArr = [];
        for (let i = 0; i < profileImages.length; i += 3) {
            imageElementArr.push(
                <div>
                    <img className="h-auto w-full rounded-lg" src={`${STORAGE_URL}/uploads/${userDetails.id}/${profileImages[i]?.name}`} alt="" />
                </div>
            )
        }
        parentElArr.push(<div className="grid gap-4">{imageElementArr}</div>)
        imageElementArr = [];
        for (let i = 1; i < profileImages.length; i += 3) {
            imageElementArr.push(
                <div>
                    <img className="h-auto w-full rounded-lg" src={`${STORAGE_URL}/uploads/${userDetails.id}/${profileImages[i]?.name}`} alt="" />
                </div>
            )
        }
        parentElArr.push(<div className="grid gap-4">{imageElementArr}</div>)
        imageElementArr = [];
        for (let i = 2; i < profileImages.length; i += 3) {
            imageElementArr.push(
                <div>
                    <img className="h-auto w-full rounded-lg" src={`${STORAGE_URL}/uploads/${userDetails.id}/${profileImages[i]?.name}`} alt="" />
                </div>
            )
        }
        parentElArr.push(<div className="grid gap-4">{imageElementArr}</div>)
        imageElementArr = [];
        setImageElement(parentElArr);
    }

    const updateUserBio = () => {
        const inputElement = document.getElementById('user-bio');
        if (inputElement?.contentEditable === 'inherit' || inputElement?.contentEditable === 'false') {
            inputElement.contentEditable = 'true';
            inputElement.focus();
        } else if (inputElement?.contentEditable === 'true') { 
            
            inputElement.contentEditable = 'false';
            inputElement.blur();
            const user = StorageService.getItem('user');
            if (inputElement.innerText === user.bio) return;
            
            apiService.updateProfileDetails({ id:user.id, bio: inputElement.innerText }).then((res) => { 
                StorageService.setItem('user', res.payload);
                userDetails.bio = inputElement.innerText;
                toastSuccess('Success', 'Bio updated successfully');
            });
        }
     }

    return (
        <>
            <div className='w-full bg-bcorange-light h-screen overflow-y-scroll'>
                <div className='m-7 '>
                    <div className='flex items-end mb-2 relative flex'>
                        <img className='grow w-72 max-w-[18rem] min-w-[18rem] h-72 object-cover rounded-md' src={`https://hjqjruueqdtekvcsgfhc.supabase.co/storage/v1/object/public/uploads/profiles/${userDetails?.id}`} alt="" />
                        <div className=''>
                            <div className='m-5 relative border-bcorange border-4 rounded-xl w-fit'>
                                <p id='user-bio' className='p-2 text-bcblue font-semibold border-bcblue border-4 rounded-md'>{userDetails?.bio === ""? "Add you bio here": userDetails?.bio}</p>
                                <span className='h-7 w-7 absolute rounded-full bg-bcorange p-1 border-bcblue border-2 border-solid right-[-10px] top-[-10px]' onClick={updateUserBio}>
                                    <svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 32 32" viewBox="0 0 32 32" id="edit"><path d="M12.82373,12.95898l-1.86279,6.21191c-0.1582,0.52832-0.01367,1.10156,0.37646,1.49121c0.28516,0.28516,0.66846,0.43945,1.06055,0.43945c0.14404,0,0.28906-0.02051,0.43066-0.06348l6.2124-1.8623c0.23779-0.07129,0.45459-0.2002,0.62988-0.37598L31.06055,7.41016C31.3418,7.12891,31.5,6.74707,31.5,6.34961s-0.1582-0.7793-0.43945-1.06055l-4.3501-4.34961c-0.58594-0.58594-1.53516-0.58594-2.12109,0L13.2002,12.3291C13.02441,12.50488,12.89551,12.7207,12.82373,12.95898z M15.58887,14.18262L25.6499,4.12109l2.22852,2.22852L17.81738,16.41113l-3.18262,0.9541L15.58887,14.18262z"></path><path d="M30,14.5c-0.82861,0-1.5,0.67188-1.5,1.5v10c0,1.37891-1.12158,2.5-2.5,2.5H6c-1.37842,0-2.5-1.12109-2.5-2.5V6c0-1.37891,1.12158-2.5,2.5-2.5h10c0.82861,0,1.5-0.67188,1.5-1.5S16.82861,0.5,16,0.5H6C2.96729,0.5,0.5,2.96777,0.5,6v20c0,3.03223,2.46729,5.5,5.5,5.5h20c3.03271,0,5.5-2.46777,5.5-5.5V16C31.5,15.17188,30.82861,14.5,30,14.5z"></path></svg>
                                </span>
                            </div>
                            <p className='text-4xl ml-5 font-bold text-bcorange pb-1'>{`${userDetails?.fname}, ${age}`}</p>
                        </div>
                        <div className='absolute top-0 right-0 flex '>
                            <div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    ref={inputRef}
                                    onChange={handleOnChange}
                                    style={{ display: "none" }}
                                />
                                <button className="flex items-center text-xs px-4 py-2 mr-4 rounded-full font-bold text-bcblue align-text-top bg-bcorange hover:bg-bcorange active:bg-bcorange focus:outline-none focus:ring focus:to-bcblue"
                                    onClick={onOpen}>
                                    <img className='w-5 h-5 mr-1' src={require('../assets/upload.svg')} alt="" />
                                    Add Image
                                </button>
                            </div>
                            <button onClick={() => {window.location.assign('./settings') }} className="flex items-center text-xs py-2 px-4 mr-8 rounded-full font-bold text-bcblue align-text-top bg-bcorange hover:bg-bcorange active:bg-bcorange focus:outline-none focus:ring focus:to-bcblue">
                                <img className='w-5 h-5 mr-1' src={require('../assets/upload.svg')} alt="" />
                                Edit Profile
                            </button>
                        </div>
                    </div>
                    <div className='w-[90%] h-1 bg-bcorange mb-1 rounded-md'></div>
                    <div className='w-[85%] h-1 bg-bcblue mb-4 rounded-md'></div>

                    <div className="m-4 grid items-start grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {/* {imageElement} */}
                        {profileImages.map((image: any) => { 
                            return (
                                <div className='grid gap-4'>
                                    <img className="h-auto w-full rounded-lg" src={`${STORAGE_URL}/uploads/${userDetails?.id}/${image.name}`} alt="" />
                                </div>
                            )
                        }) }
                    </div>
                </div>
            </div>
            <Modal size='xl' closeOnOverlayClick={false} isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent bg='#fff4e8'>
                    <ModalCloseButton />
                    <ModalBody pb={6}>
                        <h1 className='text-center font-bold text-bcblue m-4 text-lg'>Upload your
                            <span className="ml-2 before:block before:absolute before:-inset-1 before:-skew-y-3 before:bg-bcorange relative inline-block">
                                <span className="relative text-white">   best</span>
                            </span> click!💗</h1>
                        {currentPage === "choose-img" ? (
                            <>
                                <input type="file" accept="image/*" ref={inputRef}
                                    onChange={handleOnChange} style={{ display: "none" }} />
                                <div className='w-24 h-24 mt-10 mx-auto border-2 border-blue-400 border-dotted flex justify-center items-center rounded-full cursor-pointer'
                                    onClick={onChooseImg}>
                                    <img className="w-10 mx-auto" src={require('../assets/add_image.png')} alt="" />
                                </div>
                            </>
                        ) : currentPage === "crop-img" ? (
                            <ImageCropper
                                image={image}
                                onCropDone={onCropDone}
                                onCropCancel={onCropCancel}
                            />
                        ) : (
                            <div>
                                <div>
                                    <img src={imgAfterCrop} className="cropped-img mx-auto" />
                                </div>

                                <button className="bg-bcorange px-4 py-2 rounded-md mr-2 text-white font-semibold"
                                    onClick={() => { setCurrentPage("crop-img") }}>
                                    Re-Crop
                                </button>

                                <button className="bg-bcorange px-4 py-2 rounded-md mr-2 text-white font-semibold" onClick={() => {
                                    setCurrentPage("choose-img");
                                    setImage("");
                                }}>
                                    Select New Image
                                </button>
                            </div>
                        )}
                    </ModalBody>

                    <ModalFooter>
                        <button onClick={uploadProfileImage} className='bg-bcorange px-4 py-2 rounded-md mr-2 text-black font-semibold'>Upload</button>
                        <Button onClick={() => { onCropCancel(); onClose() }}>Cancel</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
            {loading && <LoaderScreen />}
        </>
    )
}