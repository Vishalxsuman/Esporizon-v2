export interface ApiResponse<T> {
    success: boolean;
    data: T | null;
    message?: string;
}

export interface ListResponse<T> extends ApiResponse<T[]> {
    count: number;
}
