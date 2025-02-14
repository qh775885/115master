import { PathItem, PlaylistItem } from "../entity";

type Base<T> = {
    state: boolean;
} & T

export type VodApiFiles = Base<{
    data: PlaylistItem[]
    path: PathItem[]
}>
