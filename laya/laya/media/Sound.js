import { EventDispatcher } from "../events/EventDispatcher";
export class Sound extends EventDispatcher {
    load(url) {
    }
    play(startTime = 0, loops = 0) {
        return null;
    }
    get duration() {
        return 0;
    }
    dispose() {
    }
}
