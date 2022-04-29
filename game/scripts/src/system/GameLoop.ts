import { createMachine, EventObject, interpret, StateMachine } from "../uncolib/xstate/main";

enum MainState{
    "Null",
    "INIT",
    "BP",
    "SHOW",
    "BATTALE",
    "GAMEOVER",
}

enum BPSTATE{
    "Null",
    "INIT",
    "SELECT_PLAYER",
    "RED_SELECT",
    "BLUE_SELECT",
    "LOCK",
}

export class GameLoop {
    MainServe:StateMachine.Service<object, EventObject, {
        value: any;
        context: object;
    }>
    BPloopServe:StateMachine.Service<object, EventObject, {
        value: any;
        context: object;
    }>
    historyRecordPlayer:"null"|"blue"|"red" = 'null'
    redSelectHero:number[] = []
    blueSelectHero:number[] = []

    /**这个是游戏的主循环 */
    MainLoop = createMachine({
        id:"MainLoop",
        initial:"INIT",
        states:{
            INIT:{ on:{ change:"BP"},entry:"INIT_ENTRY",exit: "INIT_EXIT" },
            BP:{ on:{change:"SHOW"},entry:"BP_ENTRY",exit: "BP_EXIT"  },
            SHOW:{ on:{change:"BATTALE"},entry:"SHOW_ENTRY",exit:"SHOW_EXIT"},
            BATTALE:{ on:{change:"GAMEOVER"},entry:"BATTALE_ENTRY",exit:"BATTALE_EXIT"},
            GAMEOVER:{entry:"GAMEOVER_ENTRY"}
        }
    },{
        actions:{
            INIT_ENTRY:()=>this.MainLoop_INIT_ENTRY(),
            INIT_EXIT:()=>this.MainLoop_INIT_EXIT(),
            BP_ENTRY:()=>this.MainLoop_BP_ENTRY(),
            BP_EXIT:()=>this.MainLoop_BP_EXIT(),
            SHOW_ENTRY:()=>this.MainLoop_SHOW_ENTRY(),
            SHOW_EXIT:()=>this.MainLoop_SHOW_EXIT(),
            BATTALE_ENTRY:()=>this.MainLoop_BATTALE_ENTRY(),
            BATTALE_EXIT:()=>this.MainLoop_BATTALE_EXIT(),
            GAMEOVER_ENTRY:()=>this.MainLoop_GAMEOVER_ENTRY(),
        }
    })

    BPloop = createMachine({
        id:"BPloop",
        initial:"INIT",
        states:{
            INIT:{ on:{ change:"SELECT_PLAYER"},entry:"INIT_ENTRY",exit: "INIT_EXIT" },
            SELECT_PLAYER:{on:{ change_to_red:"RED_SELECT",change_to_blue:"BLUE_SELECT",bp_over:"LOCK"},entry:"SELECT_PLAYER_ENTRY",exit:"SELECT_PLAYER_EXIT" },
            RED_SELECT:{on:{change:"SELECT_PLAYER"},entry:"RED_SELECT_ENTRY",exit:"RED_SELECT_EXIT"},
            BLUE_SELECT:{on:{change:"SELECT_PLAYER"},entry:"BLUE_SELECT_ENTRY",exit:"BLUE_SELECT_EXIT"},
            LOCK:{entry:"LOCK_ENTRY"}
        }
    },{
        actions:{
            INIT_ENTRY:()=>this.BPloop_INIT_ENTRY(),
            INIT_EXIT:()=>this.BPloop_INIT_EXIT(),
            SELECT_PLAYER_ENTRY:()=>this.BPloop_SELECT_PLAYER_ENTRY(),
            SELECT_PLAYER_EXIT:()=>this.BPloop_SELECT_PLAYER_EXIT(),
            RED_SELECT_ENTRY:()=>this.BPloop_RED_SELECT_ENTRY(),
            RED_SELECT_EXIT:()=>this.BPloop_RED_SELECT_EXIT(),
            BLUE_SELECT_ENTRY:()=>this.BPloop_BLUE_SELECT_ENTRY(),
            BLUE_SELECT_EXIT:()=>this.BPloop_BLUE_SELECT_EXIT(),
            LOCK_ENTRY:()=>this.BPloop_LOCK_ENTRY(),
        }
    })

    Timer(cb:()=>number|null,interval:number){
        GameRules.GetGameModeEntity().SetContextThink(DoUniqueString("timer"),cb,interval)
    }

    /**这个函数主要存储nettable的表 
     * nettable表主要是socket实现的实时通信
     * 他只要改变  客户端订阅了的接口  就会触发事件
    */
    SetGameState(mainState:MainState,minState:BPSTATE){
        CustomNetTables.SetTableValue("gameloop","current_state",{
            mainState:mainState,
            minState:minState
        })
    }

    constructor(){

    }

    Start(){
        this.MainServe = interpret(this.MainLoop).start()
    }

    BPloop_LOCK_ENTRY(): void {
        this.SetGameState(MainState.BP,BPSTATE.LOCK)
        print("进入了锁定状态,所有玩家已经选择完毕")
        this.Timer(()=>{
            this.MainServe.send("change")
            return null
        },5)
    }
    BPloop_BLUE_SELECT_EXIT(): void {
        print("蓝色玩家结束选择了")
        this.historyRecordPlayer = 'blue'
    }
    BPloop_BLUE_SELECT_ENTRY(): void {
        this.SetGameState(MainState.BP,BPSTATE.BLUE_SELECT)
        print("蓝色玩家开始选择了")
        this.Timer(()=>{
            this.blueSelectHero.push(Math.random())
            this.BPloopServe.send("change")
            return null
        },8)
    }
    BPloop_RED_SELECT_EXIT(): void {
        print("红色玩家结束选择了")
        this.historyRecordPlayer = 'red'
    }
    BPloop_RED_SELECT_ENTRY(): void {
        this.SetGameState(MainState.BP,BPSTATE.RED_SELECT)
        print("红色玩家开始选择了")
        this.Timer(()=>{
            this.redSelectHero.push(Math.random())
            this.BPloopServe.send("change")
            return null
        },8)
    }
    BPloop_SELECT_PLAYER_EXIT(): void {
        print("退出选择玩家状态 清除select状况")
    }
    
    BPloop_SELECT_PLAYER_ENTRY(): void {
        this.SetGameState(MainState.BP,BPSTATE.SELECT_PLAYER)
        print("开始选择玩家 进行BP")
        if(this.blueSelectHero.length == 4 && this.redSelectHero.length == 4){
            this.BPloopServe.send("bp_over")
            return
        }
        if(this.historyRecordPlayer == 'null'){
            const send = RandomInt(0,1) == 1 ? "change_to_red" : "change_to_blue"
            this.BPloopServe.send(send)
            return
        }else{
            if(this.historyRecordPlayer == 'blue')
            this.BPloopServe.send("change_to_red")
            if(this.historyRecordPlayer == 'red')
            this.BPloopServe.send("change_to_blue")
        }
    }

    BPloop_INIT_EXIT(): void {
        print("BP init 状态结束 清除BPINIT 数据")    
    }

    BPloop_INIT_ENTRY(): void {
        print("游戏子BP状态机启动")  
        this.Timer(()=>{
            this.BPloopServe.send("change")
            return null
        },3) 
    }

    MainLoop_GAMEOVER_ENTRY(): void {
        this.SetGameState(MainState.GAMEOVER,BPSTATE.Null)
        print("整个游戏结束")
    }
    MainLoop_BATTALE_EXIT(): void {
        print("游戏战斗结束")
    }
    MainLoop_BATTALE_ENTRY(): void {
        this.SetGameState(MainState.BATTALE,BPSTATE.Null)
        print("进入了战斗状态")
        this.Timer(()=>{
            this.MainServe.send("change")
            return null
        },12)
    }
    MainLoop_SHOW_EXIT(): void {
        print("show 状态结束")
    }
    MainLoop_SHOW_ENTRY(): void {
        this.SetGameState(MainState.SHOW,BPSTATE.Null)
        print("进行双方卡牌展示")
        this.Timer(()=>{
            this.MainServe.send("change")
            return null
        },10)
    }
    MainLoop_BP_EXIT(): void {
        
    }

    MainLoop_BP_ENTRY(): void {
        this.SetGameState(MainState.BP,BPSTATE.INIT)
        print("开始启动BP状态机")
        this.Timer(()=>{
            this.BPloopServe = interpret(this.BPloop).start()
            return null
        },3)
    }

    MainLoop_INIT_EXIT(): void {
        print("游戏初始化结束")
    }

    MainLoop_INIT_ENTRY(): void {
        print("游戏主循环开始")
        print("创造数据初始化")
        this.SetGameState(MainState.INIT,BPSTATE.Null)
        this.Timer(()=>{
            this.MainServe.send("change")
            return null
        },3)
    }
}