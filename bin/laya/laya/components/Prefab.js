import { ILaya } from "../../ILaya";
export class Prefab {
    create() {
        if (this.json)
            return ILaya.SceneUtils.createByData(null, this.json);
        return null;
    }
}
