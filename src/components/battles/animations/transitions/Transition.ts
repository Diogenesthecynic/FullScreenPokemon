import { GeneralComponent } from "gamestartr";

import { FullScreenPokemon } from "../../../../FullScreenPokemon";
import { ITransitionSettings } from "../Transitions";

/**
 * Base transition class for battle start transition animations.
 */
export class Transition<TGameStartr extends FullScreenPokemon> extends GeneralComponent<TGameStartr> {
    /**
     * Settings for the transition.
     */
    protected readonly settings: ITransitionSettings;

    /**
     * Initializes a new instance of the Transition class.
     *
     * @param gameStarter   FullScreenPokemon instance this is used for.
     * @param settings   Settings for the transition.
     */
    public constructor(gameStarter: TGameStartr, settings: ITransitionSettings) {
        super(gameStarter);

        this.settings = settings;
    }

    /**
     * Plays the transition.
     */
    public play(): void {
        console.warn(`Unknown transition: '${this.settings.name}'`);
        this.settings.onComplete();
    }
}
