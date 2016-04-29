module FullScreenPokemon {
    "use strict";

    FullScreenPokemon.settings.mods = {
        storeLocally: true,
        prefix: "FullScreenPokemon::Mods::",
        mods: [
            {
                name: "Running Indoors",
                enabled: false,
                events: {
                    onModEnable: function (mod: ModAttachr.IModAttachrMod): void {
                        let area: IArea = this.AreaSpawner.getArea();
                        if (!area) {
                            return;
                        }

                        (<any>area).allowCyclingOld = area.allowCycling;
                        area.allowCycling = true;
                    },
                    onModDisable: function (mod: ModAttachr.IModAttachrMod): void {
                        let area: IArea = this.AreaSpawner.getArea();
                        if (!area) {
                            return;
                        }

                        area.allowCycling = (<any>area).allowCyclingOld;
                        delete (<any>area).allowCyclingOld;

                        if (!area.allowCycling && this.player.cycling) {
                            this.stopCycling(this.player);
                        }
                    },
                    onSetLocation: function (mod: ModAttachr.IModAttachrMod): void {
                        mod.events.onModEnable.call(this, mod);
                    }
                }
            },
            {
                name: "Speedrunner",
                enabled: false,
                events: {
                    onModEnable: function (mod: ModAttachr.IModAttachrMod): void {
                        let stats: any = this.ObjectMaker.getFunction("Player").prototype;
                        this.player.speed = stats.speed = 10;
                    },
                    onModDisable: function (mod: ModAttachr.IModAttachrMod): void {
                        let stats: any = this.ObjectMaker.getFunction("Player").prototype;
                        this.player.speed = stats.speed = this.settings.objects.properties.Player.speed;
                    }
                }
            },
            {
                name: "Level 100",
                enabled: false,
                events: {
                    "onModEnable": function (mod: ModAttachr.IModAttachrMod): void {
                        let partyPokemon: IPokemon[] = this.ItemsHolder.getItem("PokemonInParty"),
                            statistics: string[] = this.MathDecider.getConstant("statisticNames");

                        for (let i: number = 0; i < partyPokemon.length; i += 1) {
                            partyPokemon[i].previousLevel = partyPokemon[i].level;
                            partyPokemon[i].level = 100;
                            for (let j: number = 0; j < statistics.length; j += 1) {
                                partyPokemon[i][statistics[j]] = this.MathDecider.compute(
                                    "pokemonStatistic", partyPokemon[i], statistics[j]);
                            }
                        }
                    },
                    "onModDisable": function (mod: ModAttachr.IModAttachrMod): void {
                        let partyPokemon: IPokemon[] = this.ItemsHolder.getItem("PokemonInParty"),
                            statistics: string[] = this.MathDecider.getConstant("statisticNames");

                        for (let i: number = 0; i < partyPokemon.length; i += 1) {
                            partyPokemon[i].level = partyPokemon[i].previousLevel;
                            partyPokemon[i].previousLevel = undefined;
                            for (let j: number = 0; j < statistics.length; j += 1) {
                                partyPokemon[i][statistics[j]] = this.MathDecider.compute(
                                    "pokemonStatistic", partyPokemon[i], statistics[j]);
                            }
                        }
                    }
                }
            },
            {
                name: "Walk Through Walls",
                enabled: false,
                events: {
                    onModEnable: function (mod: ModAttachr.IModAttachrMod): void {
                        this.ObjectMaker.getFunction("Solid").prototype.collide = (): boolean => true;
                    },
                    onModDisable: function (mod: ModAttachr.IModAttachrMod): void {
                        this.ObjectMaker.getFunction("Solid").prototype.collide = (): boolean => false;
                    }
                }
            }]
    };
}
