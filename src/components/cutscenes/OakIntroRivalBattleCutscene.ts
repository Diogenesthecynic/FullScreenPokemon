import { Component } from "eightbittr/lib/Component";

import { FullScreenPokemon } from "../../FullScreenPokemon";
import { Direction } from "../Constants";
import { ICharacter } from "../Things";

/**
 * OakIntroRivalBattle cutscene functions used by FullScreenPokemon instances.
 */
export class OakIntroRivalBattleCutscene<TGameStartr extends FullScreenPokemon> extends Component<TGameStartr> {
    /**
     * Cutscene for the rival challenging the player to a Pokemon battle.
     *
     * @param settings   Settings used for the cutscene.
     */
    public Approach(settings: any): void {
        const rival: ICharacter = this.gameStarter.utilities.getThingById("Rival") as ICharacter;
        const dx: number = Math.abs(settings.triggerer.left - settings.player.left);
        const further: boolean = dx < 4;

        this.gameStarter.audioPlayer.playTheme("Rival Appears");

        settings.rival = rival;
        this.gameStarter.actions.animateCharacterSetDirection(rival, Direction.Bottom);
        this.gameStarter.actions.animateCharacterSetDirection(settings.player, Direction.Top);

        this.gameStarter.menuGrapher.createMenu("GeneralText");
        this.gameStarter.menuGrapher.addMenuDialog(
            "GeneralText",
            [
                "%%%%%%%RIVAL%%%%%%%: Wait, %%%%%%%PLAYER%%%%%%%! Let's check out our %%%%%%%POKEMON%%%%%%%!",
                "Come on, I'll take you on!"
            ],
            this.gameStarter.scenePlayer.bindRoutine("Challenge", { further }));
        this.gameStarter.menuGrapher.setActiveMenu("GeneralText");
    }

    /**
     * Cutscene for the battle between the player and the rival.
     *
     * @param settings   Settings used for the cutscene.
     * @param args   Settings for the routine.
     */
    public Challenge(settings: any, args: any): void {
        const starterRival: string[] = this.gameStarter.itemsHolder.getItem("starterRival");
        const battleInfo: any = {
            battlers: {
                opponent: {
                    sprite: "RivalPortrait",
                    name: this.gameStarter.itemsHolder.getItem("nameRival"),
                    category: "Trainer",
                    hasActors: true,
                    reward: 175,
                    actors: [
                        this.gameStarter.equations.newPokemon(starterRival, 5)
                    ]
                }
            },
            textStart: ["", " wants to fight!"],
            textDefeat: ["%%%%%%%RIVAL%%%%%%% Yeah! Am I great or what?"],
            textVictory: [
                [
                    "%%%%%%%RIVAL%%%%%%%: WHAT?",
                    "Unbelievable!",
                    "I picked the wrong %%%%%%%POKEMON%%%%%%%!"
                ].join(" ")
            ],
            // "animation": "LineSpiral",
            noBlackout: true,
            keptThings: this.gameStarter.graphics.collectBattleKeptThings(["player", "Rival"]),
            nextCutscene: "OakIntroRivalLeaves"
        };
        let blocks: number;

        switch (this.gameStarter.itemsHolder.getItem("starterRival").join("")) {
            case "SQUIRTLE":
                blocks = 2;
                break;
            case "BULBASAUR":
                blocks = 3;
                break;
            case "CHARMANDER":
                blocks = 1;
                break;
            default:
                throw new Error("Unknown starterRival.");
        }

        if (args.further) {
            blocks += 1;
        }

        this.gameStarter.actions.walking.startWalkingOnPath(
            settings.rival,
            [
                {
                    blocks: blocks,
                    direction: Direction.Left
                },
                {
                    blocks: 1,
                    direction: Direction.Bottom
                },
                (): void => {
                    console.log("Should start battle with", battleInfo);
                    // this.gameStarter.battles.startBattle(battleInfo);
                }
            ]);
    }
}
