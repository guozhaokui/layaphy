
// https://html5gamepad.com/
// https://developer.mozilla.org/zh-CN/docs/Web/API/Gamepad_API/Using_the_Gamepad_API

/*
var gamepads = {};

function gamepadHandler(event: GamepadEvent, connecting: boolean) {
    var gamepad = event.gamepad;
    // 注：
    // gamepad === navigator.getGamepads()[gamepad.index]

    if (connecting) {
        gamepads[gamepad.index] = gamepad;
    } else {
        delete gamepads[gamepad.index];
    }
}

window.addEventListener("gamepadconnected", function (e: GamepadEvent) { gamepadHandler(e, true); }, false);
window.addEventListener("gamepaddisconnected", function (e: GamepadEvent) { gamepadHandler(e, false); }, false);
*/

var controllers: Gamepad[] = [];

function addgamepad(gamepad: Gamepad) {
    controllers[gamepad.index] = gamepad;
    //let d = document.createElement("div");
    console.log("controller" + gamepad.index, gamepad.id);
    //d.setAttribute("id", "controller" + gamepad.index);
    //var t = document.createElement("h1");
    for (var i = 0; i < gamepad.buttons.length; i++) {
    }
    for (i = 0; i < gamepad.axes.length; i++) {
    }
}

function updateStatus() {
    //scangamepads();
    // 所有的控制器
    for (let j in controllers) {
        let controller = controllers[j];
        //var d = document.getElementById("controller" + j);
        //var buttons = d.getElementsByClassName("button");
        for (var i = 0; i < controller.buttons.length; i++) {
            let val: number | GamepadButton = controller.buttons[i];
            let pressed = false;
            if (typeof (val) == "object") {
                pressed = val.pressed;
                val = val.value;
            } else {
                pressed = val == 1.0;
            }
            if (pressed) {
            } else {
            }
        }

        for (var i = 0; i < controller.axes.length; i++) {
            controller.axes[i].toFixed(4);
            controller.axes[i] + 1;//value
        }
    }
}

function scangamepads() {
    var gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    for (var i = 0; i < gamepads.length; i++) {
        let gp=gamepads[i];
        if (gp) {
            if (!(gp.index in controllers)) {
                addgamepad(gp);
            } else {
                controllers[gp.index] = gp;
            }
        }
    }
}

function removegamepad(gamepad: Gamepad) {
    //var d = document.getElementById("controller" + gamepad.index);
    //document.body.removeChild(d);
    delete controllers[gamepad.index];
}

/*
window.addEventListener("gamepadconnected", (e:GamepadEvent)=>{
    addgamepad(e.gamepad);
} );

window.addEventListener("gamepaddisconnected", (e: GamepadEvent)=>{
    removegamepad(e.gamepad);
});
*/
var KeyMap = {
    'axis0': {},
    'axis1': {}
}

/*
    getGamePadSatus(st:Object)
    keymap(st)

    axis0,value,
    button,value
    changed:
        axis0,value
        button,down/up
*/

export function getGamePadStatus(steerfunc: (v: number) => void, accfunc: (v: number) => void, brakefunc: (v: number) => void) {
    if (controllers.length <= 0){
        //scangamepads();
    }
    else {
        //updateStatus();
        let pad1 = controllers[1];
        console.log(pad1.axes[0],pad1.axes[1],pad1.axes[2]);
    }
}