type Base<T> = {
    state: boolean;
} & T

export type FilesAppChromeDown = Base<{
    data: {
        [key: string]: {
            url: {
                url: string;
            };
        }
    }
}>

export type FilesDownload = Base<{
    file_url: string;
}>