export class PostProcessRenderContext {
    constructor() {
        this.source = null;
        this.destination = null;
        this.camera = null;
        this.compositeShaderData = null;
        this.command = null;
        this.deferredReleaseTextures = [];
    }
}
