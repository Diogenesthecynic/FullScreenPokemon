import { ICallbackRegister, IMod } from "modattachr";

import { ModComponent } from "./ModComponent";

/**
 * Mod to prevent the player from encountering any wild Pokemon.
 */
export class InfiniteRepelMod extends ModComponent implements IMod {
    /**
     * Name of the mod.
     */
    public static readonly modName: string = "Infinite Repel";

    /**
     * Mod events, keyed by name.
     */
    public readonly events: ICallbackRegister = {
        [this.eventNames.onModEnable]: (): void => {
            this.game.actions.walking.encounters.choices.getWildEncounterPokemonOptions = () =>
                undefined;
        },
        [this.eventNames.onModDisable]: (): void => {
            delete this.game.actions.walking.encounters.choices.getWildEncounterPokemonOptions;
        },
    };
}
