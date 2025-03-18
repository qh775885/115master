import type { PathItem, PlaylistItem } from "../entity";

type Base<T> = {
	state: boolean;
} & T;

export type VodApiFiles = Base<{
	data: PlaylistItem[];
	path: PathItem[];
}>;

export type VodApiFilesHistory = Base<{
	data: {
		add_time: number;
		category: number;
		file_name: string;
		hash: string;
		pick_code: string;
		thumb: string;
		time: number;
	};
}>;
