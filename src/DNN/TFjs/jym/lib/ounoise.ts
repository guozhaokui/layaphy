
declare var N: any;
export class OUNoise {
	mu: number[];
	theta: number;
	sigma: number;
	state: any;
	constructor(size: number, mu = 0., theta = 0.15, sigma = 0.05) {
		this.mu = N.mul(mu, N.ones([size]));
		this.theta = theta;
		this.sigma = sigma;
		this.reset();
	}
	reset() {
		this.state = N.clone(this.mu);
	}
	sample() {
		const x = this.state;
		const dx = N.add(N.mul(this.theta, N.sub(this.mu, x)),
			N.mul(this.sigma, N.til(x.length).map(Math.random)));
		this.state = N.add(x, dx)
		return this.state
	}
}
