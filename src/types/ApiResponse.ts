export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
    timestamp: string;
}

export const createSuccessResponse = <T>(data: T): ApiResponse<T> => ({
    success: true,
    data,
    timestamp: new Date().toISOString()
});

export const createErrorResponse = (error: string, message?: string): ApiResponse<null> => ({
    success: false,
    error: error || undefined,
    message: message || undefined,
    timestamp: new Date().toISOString()
});