export class EmitterBase {
    constructor() {
        this._frameTime = 0;
        this._emissionRate = 60;
        this._emissionTime = 0;
        this.minEmissionTime = 1 / 60;
    }
    set particleTemplate(particleTemplate) {
        this._particleTemplate = particleTemplate;
    }
    set emissionRate(_emissionRate) {
        if (_emissionRate <= 0)
            return;
        this._emissionRate = _emissionRate;
        (_emissionRate > 0) && (this.minEmissionTime = 1 / _emissionRate);
    }
    get emissionRate() {
        return this._emissionRate;
    }
    start(duration = Number.MAX_VALUE) {
        if (this._emissionRate != 0)
            this._emissionTime = duration;
    }
    stop() {
        this._emissionTime = 0;
    }
    clear() {
        this._emissionTime = 0;
    }
    emit() {
    }
    advanceTime(passedTime = 1) {
        this._emissionTime -= passedTime;
        if (this._emissionTime < 0)
            return;
        this._frameTime += passedTime;
        if (this._frameTime < this.minEmissionTime)
            return;
        while (this._frameTime > this.minEmissionTime) {
            this._frameTime -= this.minEmissionTime;
            this.emit();
        }
    }
}
