import DPlayer from "dplayer";

declare module "dplayer" {
	export interface DPlayerOptions {
		preventClickToggle?: boolean;
	}
}
