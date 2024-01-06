import React from "react";
import { CircularProgress } from "@chakra-ui/react";

const LoaderScreen = () => { 
    return (
        <div className="absolute w-full h-full bg-white/30 flex justify-center items-center z-[2000]">
            <CircularProgress isIndeterminate color='green.300' />
        </div>
    )
}

export default LoaderScreen;