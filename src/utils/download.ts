import { GMRequestInstance } from "./request/gmRequst";

export const imageUrl2BlobUrlOfCors = async (url: string, referer: string): Promise<string | undefined> => {
    try {
        const res = await GMRequestInstance.get<BlobPart>(url, {
            headers: {
                'Referer': referer,
            },
            responseType: 'blob',
        });

        if (res.status !== 200) {
            console.error(new Error(`imageUrl2BlobUrlOfCors: ${url} failed`), res);
            return undefined;
        }

        const blob = new Blob([res.data], { type: res.rawResponse.response.type });
        const blobUrl = URL.createObjectURL(blob);
        return blobUrl;
    } catch (error) {
        console.error(new Error(`imageUrl2BlobUrlOfCors: ${url} failed`), error);
    }
};
