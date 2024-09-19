export interface IHttpErrResponse {
    success: boolean,
    status: number,
    message: string,
    error: boolean
}

export interface CardProps {
    id: string;
    fname: string;
}
