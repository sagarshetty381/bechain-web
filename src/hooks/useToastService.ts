import { useToast } from "@chakra-ui/toast";

export const useToastService = () => {
    const toast = useToast();

    const toastError = (title: string, description: string) => {
        toast({
            title: title,
            description: description,
            status: "error",
            duration: 2000,
            isClosable: true,
        });
    }

    const toastSuccess = (title: string, description: string) => {
        toast({
            title: title,
            description: description,
            status: "success",
            duration: 2000,
            isClosable: true,
        });
    }

    return { toastError, toastSuccess };
}
