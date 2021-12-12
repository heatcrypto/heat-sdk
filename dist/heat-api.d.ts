export interface HeatApiConfig {
    baseURL: string;
}
export declare class HeatApi {
    private baseURL;
    constructor(defaults: HeatApiConfig);
    get<T>(path: string): Promise<T>;
    post<T, Y>(path: string, params: Y): Promise<T>;
    private searchParams;
}
export declare class HeatApiError {
    errorDescription: string;
    errorCode: number;
    path: string;
    params?: {
        [key: string]: any;
    };
    constructor(errorDescription: string, errorCode: number, path: string, params?: {
        [key: string]: any;
    });
}
