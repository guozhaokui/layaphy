import { Browser } from "./Browser";
export class Log {
    static enable() {
        if (!Log._logdiv) {
            Log._logdiv = Browser.createElement('div');
            Log._logdiv.style.cssText = "border:white;padding:4px;overflow-y:auto;z-index:1000000;background:rgba(100,100,100,0.6);color:white;position: absolute;left:0px;top:0px;width:50%;height:50%;";
            Browser.document.body.appendChild(Log._logdiv);
            Log._btn = Browser.createElement("button");
            Log._btn.innerText = "Hide";
            Log._btn.style.cssText = "z-index:1000001;position: absolute;left:10px;top:10px;";
            Log._btn.onclick = Log.toggle;
            Browser.document.body.appendChild(Log._btn);
        }
    }
    static toggle() {
        var style = Log._logdiv.style;
        if (style.display === "") {
            Log._btn.innerText = "Show";
            style.display = "none";
        }
        else {
            Log._btn.innerText = "Hide";
            style.display = "";
        }
    }
    static print(value) {
        if (Log._logdiv) {
            if (Log._count >= Log.maxCount)
                Log.clear();
            Log._count++;
            Log._logdiv.innerText += value + "\n";
            if (Log.autoScrollToBottom) {
                if (Log._logdiv.scrollHeight - Log._logdiv.scrollTop - Log._logdiv.clientHeight < 50) {
                    Log._logdiv.scrollTop = Log._logdiv.scrollHeight;
                }
            }
        }
    }
    static clear() {
        Log._logdiv.innerText = "";
        Log._count = 0;
    }
}
Log._count = 0;
Log.maxCount = 50;
Log.autoScrollToBottom = true;
