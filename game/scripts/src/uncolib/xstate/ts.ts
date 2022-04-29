import { createMachine,interpret  } from "./main";

const m = createMachine({
    id:'one',
    initial:"inactive",
    states:{
        inactive : {  on : {  TOGGLE : 'active'  },entry:"inactive_entry"} , 
        active : {  on : {  TOGGLE : 'inactive'  },entry:"active_entry"},
    },
},{actions:{
    inactive_entry:()=>{print("开始了inacive_entry")},
    active_entry:()=>{print("开始了active_entry")}
}
})

const toggle = interpret(m).start()

interpret(m).send("TOGGLE")
print("打印状态")
DeepPrintTable(toggle.getstate())

