import { MainState } from "../enum";

export const InitMian = () => {
    const gameState = useNetTableKey("gameloop","current_state")

    return <Panel className={`InitMain ${( gameState.mainState == MainState.INIT ? "view" : "close" )} `}>
        <Label text={"游戏正在初始化"} className={"tit"}/>
    </Panel>
}

render(<InitMian/>,$.GetContextPanel())