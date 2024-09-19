import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { Button, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalOverlay, useDisclosure } from '@chakra-ui/react';
import ImageCropper from './ImageCropper';
import { dataURLtoFile } from '../helper/baseController';
import supabaseClient from "../helper/SupabaseClient";
import { useToastService } from '../hooks/useToastService';
import { v4 as uuidv4 } from 'uuid';
import StorageService from '../helper/StorageService';
import { DoubleDivider } from '../layouts/DoubleDivider';

export const UploadImageModal = forwardRef<any, any>((props, ref) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const inputRef = useRef(null);
    const [image, setImage] = useState("");
    const [currentPage, setCurrentPage] = useState("choose-img");
    const [imgAfterCrop, setImgAfterCrop] = useState("");
    const { toastError, toastSuccess } = useToastService();
    const [_, setAspectRatio] = useState(16 / 9); // [16, 9, 2/3]

    const userDetails = StorageService.getItem('user');

    useImperativeHandle(ref, () => ({
        openModal() {
            onOpen();
        }
    }));

    const handleOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            const reader = new FileReader();
            reader.readAsDataURL(event.target.files[0]);
            reader.onload = function () {
                onImageSelected(reader.result);
            };
        }
    }

    const onChooseImg = () => {
        if (inputRef.current) {
            (inputRef.current as HTMLInputElement).click();
        }
    }

    const onCropCancel = () => {
        setCurrentPage("choose-img");
        setImage("");
    }

    const onImageSelected = (selectedImg: any) => {
        setImage(selectedImg);
        setCurrentPage("crop-img");
    };

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

    const uploadProfileImage = async () => {
        props.setLoading(true);

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
            props.setLoading(false);
            return;
        }

        if (data) {
            props.getProfileImages()
            toastSuccess('Success', 'Image uploaded successfully');
            props.setLoading(false);
            onCropCancel();
            onClose();
        }
    }

    return (
        <div ref={ref}>
            <Modal size='xl' closeOnOverlayClick={false} isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent bg='#fff4e8'>
                    <ModalCloseButton />
                    <ModalBody pb={6}>
                        <h1 className='m-4 text-lg font-bold text-center text-bcblue'>Upload your
                            <span className="relative inline-block ml-2 before:block before:absolute before:-inset-1 before:-skew-y-3 before:bg-bcorange">
                                <span className="relative text-white">   best</span>
                            </span> click!💗</h1>
                        {currentPage === "choose-img" ? (
                            <>
                                <input type="file" accept="image/*" ref={inputRef}
                                    onChange={handleOnChange} style={{ display: "none" }} />
                                <div className='flex items-center justify-center w-24 h-24 mx-auto mt-10 border-2 border-blue-400 border-dotted rounded-full cursor-pointer'
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
                                <div className='mb-4'>
                                    <img src={imgAfterCrop} className="mx-auto cropped-img" />
                                </div>
                                <div className='flex items-center justify-center gap-4 mb-4'>
                                    <button className="px-4 py-2 font-semibold bg-transparent border-2 rounded-md text-bcorange border-bcorange hover:underline hover:scale-105"
                                        onClick={() => { setCurrentPage("crop-img") }}>
                                        Re-Crop
                                    </button>
                                    <p className='text-bcorange '>OR</p>
                                    <button className="px-4 py-2 font-semibold bg-transparent border-2 rounded-md text-bcorange border-bcorange hover:underline hover:scale-105" onClick={() => {
                                        setCurrentPage("choose-img");
                                        setImage("");
                                    }}>
                                        Select New Image
                                    </button>

                                </div>
                                <DoubleDivider alignPosition='items-center' />

                            </div>
                        )}
                    </ModalBody>

                    <ModalFooter>
                        <button onClick={uploadProfileImage} className='px-4 py-2 mr-2 font-semibold text-black rounded-md'>Upload</button>
                        <Button className='border-2 border-bc-blue bg-bcorange-dark' onClick={() => { onCropCancel(); onClose() }}>Cancel</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </div>
    );
});