import React, { useState } from "react";
import Cropper from "react-easy-crop";

interface ImageCropperProps {
  image: string;
  onCropDone: (croppedArea: any, aspectRatio: number) => void;
  onCropCancel: () => void;
}

function ImageCropper({ image, onCropDone, onCropCancel }: ImageCropperProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState(null);
  const [aspectRatio, setAspectRatio] = useState(16 / 9);

  const onCropComplete = (croppedAreaPercentage: any, croppedAreaPixels: any) => {
    setCroppedArea(croppedAreaPixels);
  };

  // const onAspectRatioChange = (event) => {
  //   setAspectRatio(event.target.value);
  // };

  return (
    <div className="relative flex flex-col cropper item-end">
      <div className="relative w-full h-[50vh]">
        <Cropper
          image={image}
          aspect={aspectRatio}
          crop={crop}
          zoom={zoom}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropComplete}
        />
      </div>
      <div className="flex justify-between mt-4">
        <div className="flex items-center justify-center">
          <img width="24" height="24" onClick={() => { setAspectRatio(1 / 1) }} src="https://img.icons8.com/material-outlined/24/rounded-square.png" alt="rounded-square" />
          <p>1:1</p>
          <img className="ml-2" width="24" height="24" onClick={() => { setAspectRatio(16 / 9) }} src="https://img.icons8.com/material-outlined/24/rounded-rectangle-stroked.png" alt="rounded-rectangle-stroked" />
          <p>16:9</p>
          <img className="ml-2 rotate-90" width="24" height="24" onClick={() => { setAspectRatio(2 / 3) }} src="https://img.icons8.com/material-outlined/24/rounded-rectangle-stroked.png" alt="rounded-rectangle-stroked" />
          <p>2:3</p>
        </div>

        <div className="">
          <button className="px-4 py-2 mr-2 text-sm font-semibold text-white rounded-md bg-bcorange" onClick={onCropCancel}>
            Reselect
          </button>
          <button className="px-4 py-2 mr-2 text-sm font-semibold text-white rounded-md bg-bcorange"
            onClick={() => { onCropDone(croppedArea, aspectRatio); }}>
            Crop Image
          </button>
        </div>
      </div>
    </div>

  );
}

export default ImageCropper;
