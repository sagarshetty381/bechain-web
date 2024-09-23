import React from "react";
import { CircularProgress } from "@chakra-ui/react";

interface LoaderScreenProps {
    msg?: string
}

const defaultProps: LoaderScreenProps = {
    msg: ''
}

const LoaderScreen = (props = defaultProps) => {
    return (
        <div className="absolute w-full h-full bg-black/50 flex flex-col justify-center items-center z-[2000]">
            <CircularProgress isIndeterminate color='#ef810f' />
            {props?.msg && props.msg.length > 0 && <p className="mt-5 text-xl text-bcorange">{props.msg}</p>}
        </div>
    )
}

export default LoaderScreen;