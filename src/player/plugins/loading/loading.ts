import { PlayerPlugin } from "..";
import { Player } from "../..";

type State = {
    loading: boolean;
}

export class Loading extends PlayerPlugin<any> {
    static pluginName = 'loading';

    constructor(player: Player) {
        super(player, {
            loading: false,
        });
    }

}