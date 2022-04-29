import { Timers } from "./lib/timers";
import { reloadable } from "./lib/tstl-utils";
import { GameLoop } from "./system/GameLoop";
//@ts-ignore
import {aes} from './utils/aeslua'

const heroSelectionTime = 10;


//游戏循环是每个人避不开的一个系统
//他有时候分  大阶段   大阶段里面又分其他小截断
//这个系统 我们可以用现成的库  去完成

declare global {
    interface CDOTAGamerules {
        Addon: GameMode;
        GameLoop: GameLoop;
    }
}

@reloadable
export class GameMode {
    public static Precache(this: void, context: CScriptPrecacheContext) {
        PrecacheResource("particle", "particles/units/heroes/hero_meepo/meepo_earthbind_projectile_fx.vpcf", context);
        PrecacheResource("soundfile", "soundevents/game_sounds_heroes/game_sounds_meepo.vsndevts", context);
    }

    public static Activate(this: void) {
        GameRules.Addon = new GameMode();
    }

    constructor() {
        this.configure();
        ListenToGameEvent("game_rules_state_change",()=>this.game_rules_state_change(),null)
    }

    game_rules_state_change(){
        const state = GameRules.State_Get()
        if(state == GameState.PRE_GAME){
            GameRules.GameLoop = new GameLoop()
            GameRules.GameLoop.Start()
        }
    }

    private configure(): void {
        GameRules.SetCustomGameTeamMaxPlayers(DotaTeam.GOODGUYS, 3);
        GameRules.SetCustomGameTeamMaxPlayers(DotaTeam.BADGUYS, 3);
        GameRules.SetShowcaseTime(0);
        GameRules.SetHeroSelectionTime(heroSelectionTime);
    }


    public Reload() {
        print("Script reloaded!");
    }
}