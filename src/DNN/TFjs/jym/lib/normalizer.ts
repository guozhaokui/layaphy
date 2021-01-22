
declare var N: any;
export class Normalizer {
	n: number[];
	mean: number[];
	meanDiff: number[];
	variance: number;

	constructor(nbInputs: number) {
		this.n = N.zeros(nbInputs);
		this.mean = N.zeros(nbInputs);
		this.meanDiff = N.zeros(nbInputs);
		this.variance = N.zeros(nbInputs);
	}

	observe(x:number[]) {
		this.n = N.add(this.n, 1.0);
		const lastMean = N.clone(this.mean);
		this.mean = N.add(this.mean, N.div(N.sub(x, this.mean), this.n));
		this.meanDiff = N.add(this.meanDiff,
			N.mul(N.sub(x, lastMean), N.sub(x, this.mean)));
		this.variance = N.clip(N.div(this.meanDiff, this.n), 1e-2);
	}

	normalize(inputs:number[]) {
		const obsMean = this.mean;
		const obsStd = N.sqrt(this.variance);
		return N.div(N.sub(inputs, obsMean), obsStd);
	}
}

