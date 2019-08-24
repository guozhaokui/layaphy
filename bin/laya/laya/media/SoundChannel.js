import { EventDispatcher } from "../events/EventDispatcher";
export class SoundChannel extends EventDispatcher {
    constructor() {
        super(...arguments);
        this.isStopped = false;
    }
    set volume(v) {
    }
    get volume() {
        return 1;
    }
    get position() {
        return 0;
    }
    get duration() {
        return 0;
    }
    play() {
    }
    stop() {
        if (this.completeHandler)
            this.completeHandler.run();
    }
    pause() {
    }
    resume() {
    }
    __runComplete(handler) {
        if (handler) {
            handler.run();
        }
    }
}
