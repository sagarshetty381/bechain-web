import React from "react";
import { CircularProgress } from "@chakra-ui/react";

const LoaderScreen = () => {
    return (
        <div className="absolute w-full h-full bg-white/30 flex justify-center items-center z-[2000]">
            <CircularProgress isIndeterminate color='#ef810f' />
        </div>
    )
}

export default LoaderScreen;