
var haveEvents = 'ongamepadconnected' in window;
var controllers: Gamepad[] = [];

function connecthandler(e: GamepadEvent) {
    addgamepad(e.gamepad);
}

function addgamepad(gamepad: Gamepad) {
    controllers[gamepad.index] = gamepad;

    // 见 https://github.com/luser/gamepadtest/blob/master/index.html
    //requestAnimationFrame(updateStatus);
}

function disconnecthandler(e: GamepadEvent) {
    removegamepad(e.gamepad);
}

function removegamepad(gamepad: Gamepad) {
    delete controllers[gamepad.index];
}

export function updateStatus(steer:(v:number)=>void,acc:(v:number)=>void, onD:()=>void,onR:()=>void) {
    if (!haveEvents) {
        scangamepads();
    }

    var i = 0;
    var j;

    for (j in controllers) {
        var controller = controllers[j];

        for (i = 0; i < controller.buttons.length; i++) {
            var val = controller.buttons[i];
            if (typeof (val) == "object") {
                val.pressed;
                val.value;
            }
        }

        let bts=controller.buttons;
        /*
            17  19  21
                O   
            18  20  22
        */
        if(bts[17].pressed) onD();
        if(bts[18].pressed) onR();  

        // 手刹 2

        for (i = 0; i < controller.axes.length; i++) {
            //var a = axes[i];
            //console.log("value", controller.axes[i] + 1);
        }

        steer(controller.axes[0]);
        acc(controller.axes[1])
    }


    //requestAnimationFrame(updateStatus);
}

function scangamepads() {
    var gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    for (var i = 0; i < gamepads.length; i++) {
        let gp = gamepads[i];
        if (gp) {
            if (gp.index in controllers) {
                controllers[gp.index] = gp;
            } else {
                addgamepad(gp);
            }
        }
    }
}

export function ttt() {
    window.addEventListener("gamepadconnected", connecthandler as EventListener);
    window.addEventListener("gamepaddisconnected", disconnecthandler as EventListener);

    if (!haveEvents) {
        setInterval(scangamepads, 500);
    }
}