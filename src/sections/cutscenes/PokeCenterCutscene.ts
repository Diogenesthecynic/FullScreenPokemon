import { Section } from "eightbittr";

import { FullScreenPokemon } from "../../FullScreenPokemon";
import { IPokemon } from "../Battles";
import { IMap } from "../Maps";
import { ICharacter, IThing } from "../Things";

/**
 * PokeCenter cutscene routines.
 */
export class PokeCenterCutscene extends Section<FullScreenPokemon> {
    /**
     * Rate at which balls appear.
     */
    public readonly ballAppearanceRate = 35;

    /**
     * Rate at which balls flicker.
     */
    public readonly ballFlickerRate = 21;

    /**
     * Cutscene for a nurse's welcome at the Pokemon Center.
     */
    public readonly Welcome = (): void => {
        const nurse = this.game.utilities.getExistingThingById<ICharacter>("Nurse");
        const machine = this.game.utilities.getExistingThingById("HealingMachine");

        this.game.menuGrapher.createMenu("GeneralText");
        this.game.menuGrapher.addMenuDialog(
            "GeneralText",
            [
                "Welcome to our %%%%%%%POKEMON%%%%%%% CENTER!",
                "We heal your %%%%%%%POKEMON%%%%%%% back to perfect health!",
                "Shall we heal your %%%%%%%POKEMON%%%%%%%?",
            ],
            (): void => this.choose(machine, nurse)
        );
        this.game.menuGrapher.setActiveMenu("GeneralText");
    };

    /**
     * Cutscene for choosing whether or not to heal Pokemon.
     */
    private choose(machine: IThing, nurse: ICharacter): void {
        this.game.menuGrapher.createMenu("Heal/Cancel", {
            killOnB: ["GeneralText"],
        });
        this.game.menuGrapher.addMenuList("Heal/Cancel", {
            options: [
                {
                    callback: (): void => this.chooseHeal(machine, nurse),
                    text: "HEAL",
                },
                {
                    callback: this.chooseCancel,
                    text: "CANCEL",
                },
            ],
        });
        this.game.menuGrapher.setActiveMenu("Heal/Cancel");
    }

    /**
     * Cutscene for choosing to heal Pokemon.
     */
    private chooseHeal(machine: IThing, nurse: ICharacter): void {
        this.game.menuGrapher.deleteMenu("Heal/Cancel");

        this.game.menuGrapher.createMenu("GeneralText", {
            ignoreA: true,
            finishAutomatically: true,
        });
        this.game.menuGrapher.addMenuDialog(
            "GeneralText",
            ["Ok. We'll need your %%%%%%%POKEMON%%%%%%%."],
            (): void => this.healing(machine, nurse)
        );
        this.game.menuGrapher.setActiveMenu("GeneralText");
    }

    /**
     * Cutscene for placing Pokeballs into the healing machine.
     *
     */
    private healing(machine: IThing, nurse: ICharacter): void {
        const party: IPokemon[] = this.game.itemsHolder.getItem(
            this.game.storage.names.pokemonInParty
        );
        const balls: IThing[] = [];
        const dt = 35;
        const left: number = machine.left + 20;
        const top: number = machine.top + 28;
        let i = 0;

        this.game.actions.animateCharacterSetDirection(nurse, 3);

        this.game.timeHandler.addEventInterval(
            (): void => {
                balls.push(
                    this.game.things.add(
                        this.game.things.names.healingMachineBall,
                        left + (i % 2) * 12,
                        top + Math.floor(i / 2) * 10
                    )
                );
                i += 1;
            },
            dt,
            party.length
        );

        this.game.timeHandler.addEvent(
            (): void => this.healingAction(machine, nurse, balls),
            dt * (party.length + 1)
        );
    }

    /**
     * Cutscene for Pokemon being healed in the healing machine.
     *
     */
    private healingAction(machine: IThing, nurse: ICharacter, balls: IThing[]): void {
        const numFlashes = 8;
        let i = 0;

        this.game.timeHandler.addEventInterval(
            (): void => {
                const changer =
                    i % 2 === 0
                        ? (thing: IThing, className: string): void =>
                              this.game.graphics.classes.addClass(thing, className)
                        : (thing: IThing, className: string): void =>
                              this.game.graphics.classes.removeClass(thing, className);

                for (const ball of balls) {
                    changer(ball, "lit");
                }

                changer(machine, "lit");

                i += 1;
            },
            this.ballFlickerRate,
            numFlashes
        );

        this.game.timeHandler.addEvent(
            (): void => this.healingComplete(nurse, balls),
            (numFlashes + 2) * this.ballFlickerRate
        );
    }

    /**
     * Cutscene for when the Pokemon have finished healing.
     *
     * @param settings   Settings used for the cutscene.
     * @param args Settings for the routine.
     */
    private healingComplete(nurse: ICharacter, balls: IThing[]): void {
        const party: IPokemon[] = this.game.itemsHolder.getItem(
            this.game.storage.names.pokemonInParty
        );

        for (const ball of balls) {
            this.game.death.kill(ball);
        }

        for (const pokemon of party) {
            this.game.battles.healPokemon(pokemon);
        }

        this.game.actions.animateCharacterSetDirection(nurse, 2);

        this.game.menuGrapher.createMenu("GeneralText");
        this.game.menuGrapher.addMenuDialog(
            "GeneralText",
            [
                "Thank you! \n Your %%%%%%%POKEMON%%%%%%% are fighting fit!",
                "We hope to see you again!",
            ],
            (): void => {
                this.game.menuGrapher.deleteMenu("GeneralText");
                this.game.scenePlayer.stopCutscene();
            }
        );
        this.game.menuGrapher.setActiveMenu("GeneralText");

        const map: string = this.game.itemsHolder.getItem(this.game.storage.names.map);
        const mapInfo: IMap = this.game.areaSpawner.getMap() as IMap;
        const location: string | undefined = mapInfo.locationDefault;

        this.game.itemsHolder.setItem(this.game.storage.names.lastPokecenter, { map, location });
    }

    /**
     * Cutscene for choosing not to heal Pokemon.
     */
    private readonly chooseCancel = (): void => {
        this.game.menuGrapher.deleteMenu("Heal/Cancel");

        this.game.menuGrapher.createMenu("GeneralText");
        this.game.menuGrapher.addMenuDialog(
            "GeneralText",
            ["We hope to see you again!"],
            (): void => {
                this.game.menuGrapher.deleteMenu("GeneralText");
                this.game.scenePlayer.stopCutscene();
            }
        );
        this.game.menuGrapher.setActiveMenu("GeneralText");
    };
}
