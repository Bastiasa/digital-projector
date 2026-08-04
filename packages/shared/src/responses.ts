export { };


export type ResponseData<DataType = undefined> = {
    success: true;
    data: DataType;

    error?: never;
} | {
    error: string;

    success?: never;
    data?: never;
}

export type GetFoldersResponse = ResponseData<[number, string][]>;

export type GetFolderResponse = ResponseData<{
    id: number;
    path: string;
    files: {
        fileName: string;
        id: string;
    }[];
}>;
