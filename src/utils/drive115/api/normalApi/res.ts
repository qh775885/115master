type ResBase<T> = {
	state: boolean;
} & T;

export type VideoM3u8 = string;

export type FilesDownload = ResBase<{
	file_url: string;
}>;
