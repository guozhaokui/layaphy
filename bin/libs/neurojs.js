(function () {
	'use strict';

	var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

	function commonjsRequire () {
		throw new Error('Dynamic requires are not currently supported by rollup-plugin-commonjs');
	}

	function unwrapExports (x) {
		return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
	}

	function createCommonjsModule(fn, module) {
		return module = { exports: {} }, fn(module, module.exports), module.exports;
	}

	function getCjsExportFromNamespace (n) {
		return n && n['default'] || n;
	}

	function CheckSupport() {
		/*
		if (process !== undefined && !process.browser) {
			if (process.version.indexOf('v') !== 0) {
				throw 'unknown node version.';
			}

			var vn = process.version.substring(1).split('.');
			var major = parseInt(vn[0]);
			var minor = parseInt(vn[1]);
		
			if (major > 6) return true;
			if (major === 6 && minor >= 6) return true;

			return false;
		}

		else if (typeof window !== 'undefined') {
			var supported = {
				'safari': 10,
				'chrome': 54
			};

			return true;
		}
		*/
		return true;

	}

	var support = CheckSupport;

	if (Float64Array.prototype.fill === undefined)
	    Float64Array.prototype.fill = function (v) {
	        for (var i = 0; i < this.length; i++) { this[i] = v; }
	    };


	Object.assign(Math, {

	    statistics: true,

	    randn() {
	        var U1, U2 = this.randn.U2, W, mult;
	        if (U2) {
	            this.randn.U2 = null; // deactivate for next time
	            return U2;
	        }

	        do {
	            U1 = -1 + this.random() * 2;
	            U2 = -1 + this.random() * 2;
	            W = U1 * U1 + U2 * U2;
	        } while (W >= 1 || W === 0);

	        mult = Math.sqrt(-2 * Math.log(W) / W);
	        this.randn.U2 = U2 * mult;

	        return U1 * mult;
	    },

	    randf(a, b) {
	        return this.random() * (b - a) + a;
	    },

	    randi(a, b) {
	        return a + Math.floor(Math.random() * (b - a))
	    },

	    uhlenbeckOrnstein(old, theta, sigma, dt) {
	       return old - theta * old * dt + Math.sqrt(dt) * Math.randn(0.0, sigma)
	    }

	});

	Object.assign(Array, {

	    random(arr) {
	        return arr[Math.floor(Math.random() * arr.length)]
	    },

	    randomAndRemove() {
	        var index = Math.floor(Math.random() * this.length);
	        var value = this[index];
	        this.splice(index, 1);

	        return value
	    },

	    sum(arr, valueFunc) {
	        valueFunc = valueFunc || (x => x);
	        var sum = 0.0;
	        for (var i = 0; i < arr.length; i++) {
	            sum += valueFunc(arr[i]);
	        }

	        return sum
	    },

	    lowest(valueFunc) {
	        return this.reduce((a, b) => valueFunc(a) < valueFunc(b) ? a : b)
	    },

	    highest(valueFunc) {
	        return this.reduce((a, b) => valueFunc(a) > valueFunc(b) ? a : b)
	    },

	    sample(probFunc) {
	        var des = Math.random();
	        var pos = 0.0;
	        for (var i = 0; i < this.children.length; i++) {
	            if (des < (pos += prob[i]))
	                return this.children[i]
	        }

	        return this.children[this.children.length - 1]
	    }

	});


	Object.assign(Float64Array, {

	    filled(n, v) {
	        return (new Float64Array(n)).fill(v)
	    },

	    oneHot(n, N) {
	        var vec = new Float64Array(N);
	        vec[n] = 1.0;
	        return vec
	    },

	    noise(N, a, b) {
	        var vec = new Float64Array(N);
	        vec.randf(a || -1, b || 1);
	        return vec
	    }

	});


	Object.assign(Float64Array.prototype, {

	    randn(mu, std) {
	        for (var i = 0; i < this.length; i++) { this[i] = mu + std * Math.randn(); }
	    },

	    randf(a, b) { 
	        for (var i = 0; i < this.length; i++) { this[i] = Math.randf(a, b); }
	    },

	    maxi() {
	        var maxv = -Infinity, maxi = 0.0;
	        for (var i = 0; i < this.length; i++) {
	            if (this[i] > maxv) {
	                maxv = this[i]; maxi = i;
	            }
	        }

	        return maxi
	    },

	    clone() {
	        var copied = new Float64Array(this.length);
	        copied.set(this);
	        return copied
	    },

	    diff(x, y) {
	        for (var i = 0; i < this.length; i++) { this[i] = x[i] - y[i]; }
	    },

	    add(x, y) {
	        for (var i = 0; i < this.length; i++) { this[i] = x[i] + y[i]; }
	    },

	    mult(x, y) {
	        for (var i = 0; i < this.length; i++) { this[i] = x[i] * y; }
	    }

	});

	var statistics = /*#__PURE__*/Object.freeze({
		__proto__: null
	});

	var size = class Size {

		static derive(val) {
			if (val instanceof Size) {
				return val;
			}

			if (Number.isInteger(val)) {
				return new Size(1, 1, val)
			}

			if (val instanceof Object) {
				return new Size(val.x, val.y, val.z)
			}

			throw "Could not create size object";
		}

		constructor(x, y, z) {
			this.x = x;
			this.y = y;
			this.z = z;
		}

		get length() {
			return this.x * this.y * this.z
		}

		/**
		 * 维度。最大到3
		 * 例如 1,1,50表示是一维数据，长度50
		 */
		get dimensions() {
			if (this.x * this.y * this.z === 0)
				return 0

			if (this.x * this.y === 1)
				return 1

			if (this.x === 1)
				return 2

			return 3
		}

	};

	class FullyConnectedLayer {

		constructor(input, opt) {
			opt.size = size.derive(opt.size);

			this.dimensions = {
				input,
				output: opt.size,
				parameters: input.length * opt.size.length + opt.size.length
			};
			
		}

		forward(ctx) {
			var sum = 0.0, X = this.dimensions.input.length, Y = this.dimensions.output.length;
			var inpw = ctx.input.w, outw = ctx.output.w, paramw = ctx.params.w;
			

			for (var i = 0; i < Y; i++) {
				sum = 0.0;
				for (var j = 0; j < X; j++) {
					sum += inpw[j] * paramw[i * X + j];
				}

				outw[i] = sum + paramw[X * Y + i];
			}

			// outw.set(this.fwd(inpw, paramw));
		}

		backward(ctx) {
			var sum = 0.0, X = this.dimensions.input.length, Y = this.dimensions.output.length;
			var inpw = ctx.input.w, outw = ctx.output.w, paramw = ctx.params.w;
			var inpdw = ctx.input.dw, outdw = ctx.output.dw, paramdw = ctx.params.dw;

			for (var i = 0; i < X; i++) {
				sum = 0.0;
				for (var j = 0; j < Y; j++) {
					sum += paramw[j * X + i] * outdw[j];
					paramdw[j * X + i] = inpw[i] * outdw[j];
				}

				inpdw[i] = sum;
			}

			for (var i = 0; i < Y; i++) {
				paramdw[X * Y + i] = outdw[i];
			}
		}

		initialize(params) {
			if (this.options.init) {
				params.w.randf(this.options.init[0], this.options.init[1]);
				return 
			}

			var X = this.dimensions.input.length, Y = this.dimensions.output.length;
			var dropout = this.options.dropout || 0;
			var elements = (1 - dropout) * (this.dimensions.input.length + this.dimensions.output.length);
			var scale = Math.sqrt(2.0 / elements);
			params.w.randn(0.0, scale);

			if (this.options.customInit) {
				this.options.customInit(params.w);
			}
		}

	}

	var dot = {
		FullyConnectedLayer
	};
	var dot_1 = dot.FullyConnectedLayer;

	class DropOutLayer {

		constructor(input, opt) {
			this.dimensions = {
				input,
				output: input,
				parameters: 0
			};

			this.probability = opt.probability;
			this.storage = {
				activations: input
			};
		}

		forward(ctx) {
			var X = this.dimensions.input.length;
			var inpw = ctx.input.w, outw = ctx.output.w;
			var prob = this.probability, act = ctx.activations;

			// if (ctx.state.options.learning !== true) {
			// 	for (var i = 0; i < X; i++)
			// 		outw[i] = inpw[i] * prob 
				
			// 	return 
			// }

			for (var i = 0; i < X; i++) {
				if (Math.random() < prob) { // dropping out
					outw[i] = 0.0;
					act[i] = 0.0;
				}

				else {
					outw[i] = inpw[i] / (1.0 - prob);
					act[i] = 1.0;
				}
			}
		}

		backward(ctx) {
			var X = this.dimensions.input.length;
			var inpw = ctx.input.w, outw = ctx.output.w;
			var inpdw = ctx.input.dw, outdw = ctx.output.dw;
			var prob = this.probability, act = ctx.activations;

			// if (ctx.state.options.learning !== true) {
			// 	// for (var i = 0; i < X; i++)
			// 	// 	inpdw[i] = outdw[i] * prob 

			// 	return
			// }

			for (var i = 0; i < X; i++) {
				inpdw[i] = act[i] * outdw[i] / (1.0 - prob);
			}
		}

	}

	var dropout = {
		DropOutLayer
	};
	var dropout_1 = dropout.DropOutLayer;

	class NonLinearityLayer {

		constructor(input, opt) {
			this.dimensions = {
				input,
				output: input,
				parameters: 0
			};
		}

	}

	class SigmoidLayer extends NonLinearityLayer {

		forward(ctx) {
			var X = this.dimensions.input.length;
			var inpw = ctx.input.w, outw = ctx.output.w;

			for (var i = 0; i < X; i++) {
				outw[i] = 1 / (1 + Math.exp(-inpw[i]));
			}
		}

		backward(ctx) {
			var X = this.dimensions.input.length;
			var inpw = ctx.input.w, outw = ctx.output.w;
			var inpdw = ctx.input.dw, outdw = ctx.output.dw;

			for (var i = 0; i < X; i++) {
				inpdw[i] = outw[i] * (1.0 - outw[i]) * outdw[i];
			}
		}

	}

	class TanhLayer extends NonLinearityLayer {

		forward(ctx) {
			var X = this.dimensions.input.length;
			var inpw = ctx.input.w, outw = ctx.output.w;
			var y = 0.0;

			for (var i = 0; i < X; i++) {
				y = Math.exp(2 * inpw[i]);
				outw[i] = (y - 1) / (y + 1);
			}
		}

		backward(ctx) {
			var X = this.dimensions.input.length;
			var inpw = ctx.input.w, outw = ctx.output.w;
			var inpdw = ctx.input.dw, outdw = ctx.output.dw;

			for (var i = 0; i < X; i++) {
				inpdw[i] = (1 - outw[i] * outw[i]) * outdw[i];
			}
		}

	}

	class ReLuLayer extends NonLinearityLayer {

		constructor(input, opt) {
			super(input, opt);
			this.leaky = opt.leaky || 0;
		}

		forward(ctx) {
			var X = this.dimensions.input.length;
			var inpw = ctx.input.w, outw = ctx.output.w;
			var y = 0.0;

			for (var i = 0; i < X; i++) {
				outw[i] = inpw[i] > 0.0 ? inpw[i] : this.leaky * inpw[i];
			}
		}

		backward(ctx) {
			var X = this.dimensions.input.length;
			var inpw = ctx.input.w, outw = ctx.output.w;
			var inpdw = ctx.input.dw, outdw = ctx.output.dw;

			for (var i = 0; i < X; i++) {
				inpdw[i] = inpw[i] > 0.0 ? outdw[i] : this.leaky * outdw[i];
			}
		}

	}

	var nonlinear = {
		SigmoidLayer, TanhLayer, ReLuLayer
	};
	var nonlinear_1 = nonlinear.SigmoidLayer;
	var nonlinear_2 = nonlinear.TanhLayer;
	var nonlinear_3 = nonlinear.ReLuLayer;

	class InputLayer {

		constructor(inp, opt) {
			this.dimensions = {
				input: size.derive(opt.size),
				output: size.derive(opt.size),
				parameters: 0
			};

			this.input = true;
			this.passthrough = true;
		}

		toInputVector(input, out) {
			if (input === undefined)
				return 

			if (Number.isInteger(input) && input < this.dimensions.intrinsic) {
				out.fill(0.0);
				out[input] = 1.0;
			} 

			else if (input.length === out.length) {
				out.set(input);
			} 

			else {
				throw 'invalid input format';
			}
		}

	}

	var input = {
		InputLayer
	};
	var input_1 = input.InputLayer;

	class OutputLayer {

		constructor(inp, opt) {
	        this.dimensions = {
	            input: inp,
	            output: inp,
	            parameters: 0
	        };

	        this.output = true;
	    }

	    result(ctx) {
	        return ctx.output.w.clone()
	    }


	}

	class SoftmaxLayer extends OutputLayer {

		forward(ctx) {
			var X = this.dimensions.input.length;
			var inpw = ctx.input.w, outw = ctx.output.w;
			var inpmax = -Infinity;

			for (var i = 0; i < X; ++i)
				if (inpw[i] > inpmax) inpmax = inpw[i];

			var expsum = 0.0;
			for (var i = 0; i < X; ++i)
				expsum += outw[i] = Math.exp(inpw[i] - inpmax);

			for (var i = 0; i < X; ++i)
				outw[i] /= expsum;
	    }

	    backward(ctx) {
	        var X = this.dimensions.input.length;
	        var inpdw = ctx.input.dw;
	        var outdw = ctx.output.dw, outw = ctx.output.w;

	        for (var i = 0; i < X; i++) {
	            var sum = outw[i] * (1 - outw[i]) * outdw[i];

	            for (var j = 0; j < X; j++) {
	                if (i !== j)  sum -= outw[j] * outw[i] * outdw[j];
	            }

	            inpdw[i] = sum;
	        }
	    }

	    loss(ctx, desired, target) {
	        return -Math.log(ctx.output.w[desired]) 
	    }

	    toGradientVector(desired, actual, out) {
	        if (Number.isInteger(desired) !== true || desired >= this.size)
	            throw 'target must be class index in softmax'

	        for (var i = 0; i < this.size; i++) {
	            out[i] = actual[i] - (desired === i ? 1.0 : 0.0);
	        }
	    }

	}

	class RegressionLayer extends OutputLayer {

	    constructor(inp, opt) {
	        super(inp, opt);
	        this.passthrough = true;
	    }

	    loss(ctx, desired) {
	        var loss = 0.0;
	        var grads = this.toGradientVector(desired, ctx.output.w);

	        for (var i = 0; i < this.dimensions.input.length; i++) {
	            loss += 0.5 * grads[i] * grads[i];
	        }

	        return loss
	    }

	    toGradientVector(desired, actual, out) {
	        var X = this.dimensions.input.length;

	        if (out === undefined) {
	            out = new Float64Array(X);
	        }

	        // target is maximizing argmax, set n-th value to 1, rest to 0
	        if (X > 1 && !isNaN(desired) && Number.isInteger(desired) && desired < X) {
	            for (var i = 0; i < X; ++i) {
	                out[i] = actual[i] - (i === desired ? 1.0 : 0.0);
	            }
	        }

	        // single value output
	        else if (X === 1 && !isNaN(desired)) {
	            out[0] = actual[0] - desired;
	        }

	        else if (desired instanceof Array || desired instanceof Float64Array) {
	            for (var i = 0; i < out.length; ++i) {
	                out[i] = actual[i] - desired[i];
	            }
	        }

	        else {
	            throw 'invalid target'
	        }

	        return out
	    }

	}

	var regression = {
	    RegressionLayer, SoftmaxLayer
	};
	var regression_1 = regression.RegressionLayer;
	var regression_2 = regression.SoftmaxLayer;

	class UhlenbeckOrnsteinNoiseLayer {

		constructor(input, opt) {
			this.dimensions = {
				input,
				output: input,
				parameters: 0
			};

			this.theta = opt.theta || 0.15;
			this.sigma = opt.sigma || 0.3;
			this.delta = opt.delta || 0.1;

			this.storage = {
				noise: input
			};
		}

		forward(ctx) {
			var X = this.dimensions.input.length;
			var outw = ctx.output.w, inpw = ctx.input.w;

			var alpha = 0.3;
			for (var i = 0; i < X; i++) {
				outw[i] = (1-alpha) * inpw[i] + alpha * (ctx.noise[i] = Math.uhlenbeckOrnstein(ctx.noise[i], this.theta, this.sigma, this.delta));
			}
		}

		backward(ctx) {
			ctx.input.dw.set(ctx.output.dw);
		}

	}

	var noise = {
	    UhlenbeckOrnsteinNoiseLayer
	};
	var noise_1 = noise.UhlenbeckOrnsteinNoiseLayer;

	// http://arxiv.org/pdf/1505.05424.pdf
	class VariationalBayesianLayer {

		constructor(input, opt) {
			opt.size = size.derive(opt.size);

			this.dimensions = {
				input,
				output: opt.size,
				parameters: 2 * (input.length * opt.size.length + opt.size.length) // mean and std
			};

			this.storage = {
				sample: input.length * opt.size.length + opt.size.length,
				weights: input.length * opt.size.length + opt.size.length
			};


		}

		forward(ctx) {
			var sum = 0.0, X = this.dimensions.input.length, Y = this.dimensions.output.length;
			var inpw = ctx.input.w, outw = ctx.output.w, paramw = ctx.params.w;
			var sampled = ctx.sample, weights = ctx.weights, epsilon = 0;
			var mu, std, w, b;

			if (ctx.state.options.uncertainty) {
				return this.uncertainty(ctx)
			}

			for (var i = 0; i < Y; i++) {
				sum = 0.0;
				for (var j = 0; j < X; j++) {
					mu = paramw[(i * X + j) * 2 + 0]; 
					std = Math.log(1 + Math.exp( paramw[(i * X + j) * 2 + 1] ));

					sampled[i * X + j] = epsilon = Math.randn();
					weights[i * X + j] = w = mu + std * epsilon;

					sum += inpw[j] * w;
				}

				mu = paramw[(X * Y + i) * 2 + 0]; 
				std = Math.log(1 + Math.exp( paramw[(X * Y + i) * 2 + 1] ));

				sampled[X * Y + i] = epsilon = Math.randn();
				weights[X * Y + i] = b = mu + std * epsilon;

				outw[i] = sum + b;
			}

		}

		uncertainty(ctx) {
			var sum = 0.0, X = this.dimensions.input.length, Y = this.dimensions.output.length;
			var inpw = ctx.input.w, outw = ctx.output.w, paramw = ctx.params.w;
			var std, mu, w, b, dir = ctx.state.options.uncertainty;

			for (var i = 0; i < Y; i++) {
				sum = 0.0;
				for (var j = 0; j < X; j++) {
					mu = paramw[(i * X + j) * 2 + 0]; 
					std = Math.log(1 + Math.exp( paramw[(i * X + j) * 2 + 1] ));
					w = mu + dir * std;

					sum += inpw[j] * w;
				}

				mu = paramw[(X * Y + i) * 2 + 0]; 
				std = Math.log(1 + Math.exp( paramw[(X * Y + i) * 2 + 1] ));
				b = mu + dir * std;

				outw[i] = sum + b;
			}
		}

		backward(ctx) {
			var sum = 0.0, X = this.dimensions.input.length, Y = this.dimensions.output.length;
			var inpw = ctx.input.w, outw = ctx.output.w, paramw = ctx.params.w;
			var inpdw = ctx.input.dw, outdw = ctx.output.dw, paramdw = ctx.params.dw;
			var sampled = ctx.sample, weights = ctx.weights;

			for (var i = 0; i < X; i++) {
				sum = 0.0;
				for (var j = 0; j < Y; j++) {
					paramdw[(j * X + i) * 2 + 0] = inpw[i] * outdw[j];
					paramdw[(j * X + i) * 2 + 1] = inpw[i] * outdw[j] * sampled[j * X + i] / (1.0 + Math.exp(-paramw[(j * X + i) * 2 + 1]));
					sum += weights[j * X + i] * outdw[j];
				}

				inpdw[i] = sum;
			}

			for (var i = 0; i < Y; i++) {
				paramdw[(X * Y + i) * 2 + 0] = outdw[i];
				paramdw[(X * Y + i) * 2 + 1] = outdw[i] * sampled[X * Y + i] / (1.0 + Math.exp(-paramw[(X * Y + i) * 2 + 1]));
			}
		}

		initialize(params) {
			var H = this.dimensions.parameters / 2;
			var elements = (this.dimensions.input.length + this.dimensions.output.length);
			var scale = Math.sqrt(2.0 / elements);

			for (var i = 0; i < H; i+=2) {
				params.w[i] = Math.randn() * scale;
				params.w[i + 1] = Math.randn();
			}
		}

	}

	class ConfidenceLayer {

		constructor(input, opt) {

			this.dimensions = {
				input,
				output: new size(1, 1, input.length / 2),
				parameters: 0
			};

			this.storage = {
				sample: this.dimensions.output.length
			};


		}

		forward(ctx) {
			var Y = this.dimensions.output.length;
			var inpw = ctx.input.w, outw = ctx.output.w;
			var sampled = ctx.sample;

			for (var i = 0; i < Y; i++) {
				var mu = inpw[i * 2 + 0];
				var std = inpw[i * 2 + 1];

				sampled[i] = Math.randn();
				outw[i] = mu + sampled[i] * std;
			}

		}

		backward(ctx) {
			var Y = this.dimensions.output.length;
			var inpw = ctx.input.w, outw = ctx.output.w;
			var inpdw = ctx.input.dw, outdw = ctx.output.dw;
			var sampled = ctx.sample;

			for (var i = 0; i < Y; i++) {
				inpdw[i * 2 + 0] = outdw[i];
				inpdw[i * 2 + 1] = sampled[i] * outdw[i];
			}
		}


	}

	var bayesian = {
		VariationalBayesianLayer, ConfidenceLayer
	};
	var bayesian_1 = bayesian.VariationalBayesianLayer;
	var bayesian_2 = bayesian.ConfidenceLayer;

	var tensor = class Tensor {

		constructor(size$1) {
			this.size = size.derive(size$1);
			this.w = new Float64Array(this.size.length);
			this.dw = new Float64Array(this.size.length);
		}

	};

	Object.assign(RegExp, {

	    escape(str) {
	        return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
	    }

	});

	Object.assign(Function.prototype, {

	    getArguments() {
	        const STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
	        const ARGUMENT_NAMES = /([^\s,]+)/g;

	        if (this.$args)
	            return this.$args;

	        var fnStr = this.toString().replace(STRIP_COMMENTS, '');
	        var result = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(ARGUMENT_NAMES);
	        if (result === null)
	            result = [];

	        return this.$args = result;
	    },

	    getSource() {
	        return this.toString().replace(/^[^{]+{/i, '').replace(/}[^}]*$/i, '')
	    },

	    decompile() {
	        return { arguments: this.getArguments(), source: this.getSource() };
	    }

	});

	Object.assign(Object, {

	    each(obj, callback) {
	        for (var key in obj)
	            if (obj.hasOwnProperty(key))
	                callback(key, obj[key]);
	    }

	});

	Object.assign(String.prototype, {

	    replaceAll(find, replace) {
	        return this.replace(new RegExp(RegExp.escape(find), 'g'), replace);
	    }

	});

	/**
	 * How to use this optimizer:
	 *
	 * 1. First initialize with options e.g.
	 *     var optimizer = new Optim({
	 *         method: 'adadelta',
	 *         regularization: { l2: 1e-2 },
	 *         clipping: 5
	 *     })
	 * 2. Then create a (weight) tensor:
	 *     var toOptimize = new Tensor(100)
	 * 3. And prepare the tensor for optimization
	 *     optimizer.initialize(toOptimize)
	 * 4. Then add a gradient to the tensor (not practical like this, but you get the hang of it)
	 *     toOptimize.dw[50] = 1.0
	 * 5. Accumulate gradient (do this n-times if n is your batch count)
	 *     optimizer.accumulate(toOptimize)
	 * 6. Finally apply gradient optimization via
	 *     optimizer.apply(toOptimize)
	 * 
	 */

	class Optim {

	    constructor(opt) {
	        this.update(opt || {});
	        this.uuid = ++Optim.INDEX;
	    }

	    update(opt) {
	        this.method = opt.method || 'sgd';
	        this.options = Object.assign({

	            type: 'descent',
	            clipping: 0,
	            regularization: {
	                l1: 0,
	                l2: 0
	            }

	        }, Optim.methods[this.method].options, opt);

	        delete this.options.method;

	        this.options = Object.freeze(this.options);

	        this.build();
	    }

	    build() {
	        if (this.options.type === 'descent')
	            this.apply = this.assemble('-');
	        else if (this.options.type === 'ascent')
	            this.apply = this.assemble('+');
	        else 
	            throw 'unrecognized optimizer type'
	    }

	    assemble(dir) {
	        var method = Optim.methods[this.method];
	        var regDir = dir === '+' ? '-' : '+';

	        var performer = (method.deliver ? method.deliver(this.options) : method.perform).decompile();
	        var stateDefs = [], produceDefs = [];

	        this.states = performer.arguments;

	        for (var i = 0; i < this.states.length; i++) {
	            stateDefs.push(this.states[i] + '=' + 'dw.' + this.states[i]);
	        }

	        function _definitions() {
	            var defs = '';
	            if (stateDefs.length > 0)
	                defs += 'var ' + stateDefs.join(',') + ';';

	            if (produceDefs.length > 0)
	                defs += 'var ' + produceDefs.join(',') + ';';

	            return defs;
	        }

	        function _gradient() {
	            var producer = '';
	            if (this.options.clipping > 0) {
	                producer += 'grad = grad > opt.clipping ? opt.clipping : (grad < -opt.clipping ? -opt.clipping : grad);\n';
	            }

	            var sum = 'grad';
	            if (this.options.regularization.l1 > 0) {
	                produceDefs.push('l1grad');
	                producer += 'l1grad = opt.regularization.l1 * (w[i] > 0 ? ' + regDir + '1 : ' + dir + '1);\n';
	                sum += '+l1grad';
	            }

	            if (this.options.regularization.l2 > 0) {
	                produceDefs.push('l2grad');
	                producer += 'l2grad = opt.regularization.l2 * w[i] * ' + regDir + '1.0;\n';
	                sum += '+l2grad';
	            }

	            producer += 'gij = ' + '(' + sum + ') / iteration' + ';\n';

	            return { source: producer };
	        }

	        function replaceOptionsWithConstants(k, v) {
	            if (typeof v === 'object') {
	                Object.each(v, replaceOptionsWithConstants.bind(this + k + '.'));
	                return;
	            }

	            fn = fn.replaceAll(this + k, v);
	        }

	        var grad = _gradient.call(this);

	        var fn =
	            `
            var w = tensor.w, dw = tensor.dw, accdw = dw.acc;
            var dx, gij, grad, iteration = dw.iteration;
            if (iteration < 1) return ;
            ${ _definitions() }
            for (var i = 0; i < w.length; ++i) {
                grad = accdw[i];
                ${ grad.source }
                ${ performer.source }
                w[i] ${ dir }= dx;
                accdw[i] = 0.0;
            }
            dw.iteration = 0;`;

	        Object.each(this.options, replaceOptionsWithConstants.bind('opt.'));
	        return new Function('tensor', fn);
	    }

	    accumulate(tensor, weighted) {
	        weighted = weighted || 1;
	        var w = tensor.w, dw = tensor.dw, accdw = dw.acc;
	        var dx, gij, grad, iteration = (dw.iteration += weighted);
	        for (var i = 0; i < w.length; ++i) accdw[i] += weighted * dw[i];
	    }

	    initialize(tensor, set, linked) {
	        if (!tensor.initialized) { // general initialization
	            tensor.dw.iteration = 0;
	            tensor.dw.acc = new Float64Array(tensor.dw.length);
	        }

	        for (var i = 0; i < this.states.length; ++i) { // specific (algorithm dependent) initialization
	            if (this.states[i] in tensor.dw)
	                tensor.dw[this.states[i]] = tensor.dw[this.states[i]].fill(0.0);
	            else
	                tensor.dw[this.states[i]] = new Float64Array(tensor.dw.length);
	        }

	        tensor.initialized = true;
	    }

	    static register(name, value) {
	        Optim.methods[name] = value;
	    }

	}

	Optim.methods = {};

	Optim.register("sgd", {

	    deliver(opt) {
	        if (opt.momentum === 0) {
	            return function() { dx = opt.rate * gij; }
	        }

	        return this.perform;
	    },

	    perform(mom) {
	        dx = opt.rate * gij + opt.momentum * mom[i];
	        mom[i] = dx;
	    },

	    options: {
	        rate: 0.01,
	        momentum: 0
	    }

	});

	Optim.register("adadelta", {

	    perform(gsum, xsum) {
	        gsum[i] = opt.ro * gsum[i] + (1 - opt.ro) * gij * gij;
	        dx = Math.sqrt((xsum[i] + opt.eps) / (gsum[i] + opt.eps)) * gij;
	        xsum[i] = opt.ro * xsum[i] + (1 - opt.ro) * dx * dx; // yes, xsum lags behind gsum by 1.
	    },

	    options: {
	        ro: 0.95,
	        eps: 1e-8
	    }

	});

	Optim.register("adam", {

	    perform(m, v) {
	        m[i] = opt.beta1 * m[i] + (1 - opt.beta1) * gij; // update biased first moment estimate
	        v[i] = opt.beta2 * v[i] + (1 - opt.beta2) * gij * gij; // update biased second moment estimate
	        var bcm = m[i] / (1 - Math.pow(opt.beta1, iteration)); // correct bias first moment estimate
	        var bcv = v[i] / (1 - Math.pow(opt.beta2, iteration)); // correct bias second moment estimate
	        dx = opt.rate * bcm / (Math.sqrt(bcv) + opt.eps);
	    },

	    options: {
	        rate: 0.01,
	        eps: 1e-8,
	        beta1: 0.9,
	        beta2: 0.999
	    }

	});

	Optim.INDEX = 0;

	var optim = Optim;

	class EventRadio {

		constructor() {
			this.events = {};
		}


		on(event, callback) {
			if (!(event in this.events)) {
				this.events[event] = [];
			}

			this.events[event].push(callback);
		}

		trigger(event, args = []) {
			if (event in this.events) {
				for (var i = 0; i < this.events[event].length; i++) {
					this.events[event][i].apply(undefined, [this].concat(args));
				}
			}
		}

	}

	class ConfigPool extends EventRadio {

		constructor(names) {
			super();
			this.states = {};
			this.configs = {};
			this.requested = [];
		}

		add(name, wrapper) {
			if (!(name in this.states)) {
				this.states[name] = [];
			}

			if (name in this.configs) {
				wrapper.set(this.configs[name]);
			}

			this.states[name].push(wrapper);
			wrapper.pool = this;
			wrapper.__pool_name = name;

			this.trigger('add', [ wrapper, name ]);
			this.trigger('add ' + name, [ wrapper ]);
		}

		set(name, config) {
			if (name in this.states) {

				for (var i = 0; i < this.states[name].length; i++) {
					this.states[name][i].set(config);
				}

			}

			this.configs[name] = config;
		}

		step() {
			for (var i = 0; i < this.requested.length; i++) {
				var name = this.requested[i];
				this.configs[name].optimize(false);
			}

			this.requested = [];
		}

		requestOptimisation(wrapper) {
			if (wrapper.__pool_name === undefined || !(wrapper.__pool_name in this.configs)) 
				return false

			if (this.requested.indexOf(wrapper.__pool_name) >= 0)
				return true

			this.requested.push(wrapper.__pool_name);

			return true
		}

	}

	class NetworkWrapper extends EventRadio {

		constructor() {
			super();

			this.on('set', () => {
				if (this.optim !== undefined)
					this.config.useOptimizer(this.optim);
			});
		}

		set(value) {
			var state;

			if (!value) {
				return;
			}

			if (value.constructor.name === 'State') {
				state = value;
			}
			else if (value.constructor.name === 'Configuration' || value.constructor.name === 'Model') {
				state = value.newState();
			}

			this.net = state;
			this.config = state.configuration;
			this.model = state.model;

			this.trigger('set', [ state ]);
		}

		useOptimizer(optim) {
			this.optim = optim;

			if (this.config) {
				this.config.useOptimizer(optim);
			}
		}

		optimize() {
			if (this.pool && this.pool.requestOptimisation(this)) {
				return 
			}
			
			this.config.optimize(false);
		}

	}

	var shared = {
		NetworkWrapper, ConfigPool
	};
	var shared_1 = shared.NetworkWrapper;
	var shared_2 = shared.ConfigPool;

	var input$1 = input;











	// defines how the network looks; which layers etc.
	class Model {

		constructor(opt) {
			this.representation = opt;
			this.build(opt);
		}

		build(opt) {
			this.layers = [];

			var input = null;
			var desc = Model.expand(opt);

			for(var i = 0; i < desc.length; i++) {
				var current = desc[i];
				var layer = Model.create(input, current);

				layer.label = current.label || undefined;
				layer.index = i;
				layer.model = this;
				layer.options = current;

				if (layer.dimensions.output)
					layer.size = layer.dimensions.output.length; // convenience

				this.layers.push(layer);
				input = layer.dimensions.output;
			}

			this.input = this.layers[0];
			this.output = this.layers[this.layers.length - 1];
		}

		newConfiguration() {
			return new Configuration(this)
		}

		newState() {
			return this.newConfiguration().newState()
		}

		numericalGradientCheck() {
			var config = this.newConfiguration();
			var state = config.newState();
			var diff = 1e-5;

			function clear() {
				// clear gradients
				for (var i = 0; i < config.parameters.length; i++) {
					if (config.parameters[i]) 
						config.parameters[i].dw.fill(0.0);
				}
			}

			function analyse(param, index) {
				clear.call(this);

				state.forward(input);
				state.backward(output);

				return config.parameters[param].dw[index]
			}

			function loss() {
				state.forward(input);
				return state.loss(output)
			}

			function measure(param, index) {
				var orig = config.parameters[param].w[index];
				config.parameters[param].w[index] = orig - diff;
				var loss1 = loss.call(this);
				config.parameters[param].w[index] = orig + diff;
				var loss2 = loss.call(this);
				config.parameters[param].w[index] = orig;

				return (loss2 - loss1) / (2 * diff)
			}

			function checkWeight(param, index) {
				var analytical = analyse.call(this, param, index);
				var numerical = measure.call(this, param, index);
				var divisor = Math.abs(analytical);

				return Math.abs(numerical - analytical) / (divisor !== 0 ? divisor : 1)
			}


			var input = Float64Array.filled(this.input.size, 1.0);
			var output = Float64Array.filled(this.output.size, 1.0);

			console.log('Checking analytical gradients...'.magenta);

			var total = 0.0;
			for (var i = config.parameters.length - 1; i >= 0; i--) {
				var param = config.parameters[i];
				if (param === undefined)
					continue 

				var offset = 0.0;
				for (var j = 0; j < param.w.length; j++) {
					var error = checkWeight.call(this, i, j);
					if (isNaN(error)) {
						console.log('Layer ' + i);
						throw 'gradient is NaN'
					}

					offset += error * error;
				}

				total += offset;
				offset = Math.sqrt(offset) / param.w.length;

				console.log('Layer ' + i + ' with gradient error of ' + offset);

				if (offset > 1e-3)  {
					throw 'analytical gradient unusually faulty'
				}
			}

			total = Math.sqrt(total) / config.countOfParameters;

			console.log(('Mean gradient error is ' + total).bold.cyan);
			console.log('Gradients are looking good!'.bold.white);
		}


		static expand(opt) {
			var description = [];
			for (var i = 0; i < opt.length; i++) {
				var current = opt[i];

				if (current.type === 'softmax' && current.classes)
					description.push({ type: 'fc', size: current.classes });

				description.push(current);

				if (current.activation)
					description.push({ type: current.activation });

				if (current.dropout)
					description.push({ type: 'dropout', probability: current.dropout });
			}

			if (![ 'softmax', 'regression' ].includes(description[description.length - 1].type))
				description.push({ type: 'regression' });

			return description
		}

		static create(inp, opt) {
			switch (opt.type) {
				case 'fc': return new dot.FullyConnectedLayer(inp, opt)
				case 'dropout': return new dropout.DropOutLayer(inp, opt)
				case 'sigmoid': return new nonlinear.SigmoidLayer(inp, opt)
				case 'tanh': return new nonlinear.TanhLayer(inp, opt)
				case 'relu': return new nonlinear.ReLuLayer(inp, opt)
				case 'input': return new input$1.InputLayer(inp, opt)
				case 'regression': return new regression.RegressionLayer(inp, opt)
				case 'softmax': return new regression.SoftmaxLayer(inp, opt)
				case 'noise': return new noise.UhlenbeckOrnsteinNoiseLayer(inp, opt)
				case 'bayesian': return new bayesian.VariationalBayesianLayer(inp, opt)
				case 'conf': return new bayesian.ConfidenceLayer(inp, opt)
			}

			throw 'error'
		}

	}

	// defines how the network behaves; parameter/weights etc.
	class Configuration {

		constructor(model, parameters, optimizer) {
			this.model = model;
			this.parameters = [];
			this.optimizer = null;
			this.countOfParameters = 0;  

			for (var i = 0; i < this.model.layers.length; i++) {
				var layer = this.model.layers[i];
				if (!layer.dimensions.parameters) {
					continue 
				}

				var param = this.parameters[i] = new tensor(layer.dimensions.parameters);
				if (parameters && i in parameters) // copy from
					param.w.set(parameters[i].w);
				else if (layer.initialize) // initialize as new parameters
					layer.initialize(param);
				else  // random parameters
					param.w.randf(-1, 1);

				this.countOfParameters += layer.dimensions.parameters;
			}

			if (optimizer) {
				this.useOptimizer(optimizer);
			}
		}


		useOptimizer(optimizer) {
			if (optimizer.constructor === Object)
				optimizer = new optim(optimizer);

			this.optimizer = optimizer;
			this.forEachParameter(param => optimizer.initialize(param));

			return optimizer
		}

		freeze(val = true) {
			this.freezed = val;
		}

		optimize(accu = true) {
			if (accu) this.accumulate(Number.isInteger(accu) ? accu : undefined);
			this.forEachParameter(param => this.optimizer.apply(param));
		}
		
		accumulate(weighted) {
			this.forEachParameter(param => this.optimizer.accumulate(param, weighted));
		}



		forEachParameter(cb) {
			if (this.freezed) return
			for (var i = 0; i < this.parameters.length; i++) { 
				var param = this.parameters[i];
				if (param === undefined) 
					continue

				cb(param, i);
			}
		}

		copyParametersFrom(config) {
			if (config.model !== this.model)
				throw 'models must match'

			this.forEachParameter((function (param, index) {
				param.w.set(config.parameters[index].w);
			}).bind(this));
		}


		newState() {
			return new State(this)
		}

		clone() {
			return new Configuration(this.model, this.parameters, this.optimizer)
		}


		putWeights(arr) {
			var joined = arr;

			if (arr.length !== this.countOfParameters)
				throw 'array doesnt match'

			for (var i = 0, p = 0; i < this.parameters.length; i++) { 
				var param = this.parameters[i];
				if (param === undefined) 
					continue

				param.w.set(joined.subarray(p, p + param.w.length));

				p += param.w.length;
			}
		}

		pullWeights() {
			var joined = new Float64Array(this.countOfParameters);

			for (var i = 0, p = 0; i < this.parameters.length; i++) { 
				var param = this.parameters[i];
				if (param === undefined) 
					continue

				joined.set(param.w, p);

				p += param.w.length;
			}

			return joined
		}


		share() {
			return new shared(this)
		}

	}

	// defines current network input/hidden/output-state; activations and gradients etc.
	class State {

		constructor(configuration) {
			this.configuration = configuration;
			this.model = this.configuration.model;
			this.layers = this.model.layers;

			this.tensors = []; // array of layer tensors; this.tensors[i] = output tensor of layer i
			this.contexts = []; 

			// First input + output of every layer
			for (var i = 0; i < this.layers.length + 1; i++) {
				if (i > 0 && this.layers[i - 1].passthrough) // if passthrough, just use last tensor
					this.tensors[i] = this.tensors[i - 1];
				else // if at i = layers.length, then use output of last layer as tensor size
					this.tensors[i] = new tensor(i < this.layers.length ? this.layers[i].dimensions.input : this.layers[i - 1].dimensions.output);
			}
			
			for (var i = 0; i < this.layers.length; i++) {
				var layer = this.layers[i];
				var context = this.contexts[i] = new LayerContext({
					input: this.tensors[i],
					output: this.tensors[i + 1],
					parameters: this.configuration.parameters[i],
					state: this
				});

				Object.each(layer.storage || {}, function (k, v) {
					context[k] = new Float64Array(!isNaN(v) ? v : v.length);
				});
			}
	 
			this.in = this.tensors[0];
			this.out = this.tensors[this.layers.length];

			this.__target = new Float64Array(this.out.w.length);
			this.__l_in = this.layers[0];
			this.__l_out = this.layers[this.layers.length - 1];
		}

		/**
		 * Evaluate network
		 * @param  {Float64Array} input
		 * @return {Float64Array} 
		 */
		forward(input, opt) {
			if (input != null) {
				this.__l_in.toInputVector(input, this.in.w); // use 'input' as input values, while converting it to a vector
			}

			this.options = opt || {}; // set pass options
			this.activate(); // activate all layers

			return this.output // return copy of output
		}

		/**
		 * Propagates error back, error is provided by subtracting desired from actual output values. 
		 * @param  {Float64Array | Int} desired
		 * @return {Float}         loss
		 */
		backward(desired) {
			if (desired != null) {
				this.__l_out.toGradientVector(desired, this.out.w, this.out.dw); // convert 'desired' to target vector
			}
			
			this.propagate(); // propagate errors backwards

			return this.loss(desired) // return loss
		}

		/**
		 * Instead of regressing the network to have minimal error, you can provide your own gradient.
		 * @param  {Float64Array} grad
		 */
		backwardWithGradient(grad) {
			if (Array.isArray(grad))
				this.out.dw.set(grad);
			else if (this.out.dw.length === 1)
				this.out.dw[0] = grad;
			else
				throw 'error grad not propagatable';

			this.propagate();
		}


		// get copy of current output
		get output() {
			return this.__l_out.result(this.contexts[this.__l_out.index])
		}

		// get loss of current 
		loss(desired) {
			if (desired === undefined)
				return 

			return this.__l_out.loss(this.contexts[this.__l_out.index], desired)
		}


		// not error gradient, but value gradient => how to increase/decrease n-th output value
		derivatives(n, clone = true) {
			this.out.dw.fill(0.0);
			this.out.dw[n] = 1.0;

			this.propagate();

			if (clone)
				return this.in.dw.clone()

			return this.in.dw
		}


		// forward pass
		activate() {
			for (var i = 0; i < this.layers.length; i++) {
				if (this.layers[i].passthrough) 
					continue ;

				this.layers[i].forward(this.contexts[i]);
			}
		}

		// backwards pass
		propagate() {
			// safety check
			for (var i = 0; i < this.out.dw.length; i++) {
				if (isNaN(this.out.dw[i])) {
					throw 'warning: terror!';
				}
			}

			for (var i = this.layers.length - 1; i >= 0; i--) {
				if (this.layers[i].passthrough) 
					continue ;

				this.layers[i].backward(this.contexts[i]);
			}
		}

	}

	class LayerContext {

		constructor(opt) {
			this.input = opt.input;
			this.output = opt.output;
			this.params = opt.parameters;
			this.state = opt.state;
		}

	}


	var network = {
		Model, Configuration, State
	};
	var network_1 = network.Model;
	var network_2 = network.Configuration;
	var network_3 = network.State;

	class Window {

		constructor(n) {
			this.list = [];
			this.length = n;
		}

		push(value) {
			this.list.unshift(value);

			if (this.list.length > this.length) {
				this.list.pop();
			}
		}

		get(nth) {
			return this.list[nth]
		}

		get size() {
			return this.list.length
		}

	}

	var window$1 = Window;

	class Experience {

		constructor(agent) {
			this.agent = agent;
			this.learnSteps = 0;

			if (agent.options.type === 'sarsa')
				this.target = this.__sarsa_target;
			else
				this.target = this.__q_target;
		}

		__q_target() {
			return this.reward0 + this.agent.options.discount * this.agent.evaluate(this.state1, true) // this.agent.value(this.state1, this.agent.act(this.state1, true), true)
		}

		__sarsa_target() {
			return this.reward0 + this.agent.options.discount * this.agent.value(this.state1, this.action1, true)
		}

		estimate() {
			return this.value = this.agent.value(this.state0, this.action0)
		}

		step() {
			this.loss = this.agent.algorithm.optimize(this);

			this.learnSteps++;
			this.lastLearnedAt = this.agent.age;

			return this.loss
		}

		init() {
			this.loss = this.agent.algorithm.optimize(this, false);
			this.atAge = this.agent.age;
		}

		get priority() {
			if (this.loss === undefined)
				return undefined

			return Math.pow(this.loss, this.agent.options.beta || 0.5)
		}

	}

	var experience = Experience;

	class ReplayBuffer {

		add(e) { throw 'not implemented' }
		sample(n) { throw 'not implemented' }
		getAverageLoss() { throw 'not implemented' }
		getImportanceSamplingWeight(e) { return 1.0 }
		updateAfterLearning() {}

	}

	class UniformReplayBuffer extends ReplayBuffer {

		constructor(size) {
			super();
			this.buffer = [];
			this.size = size;
		}

		add(e) {

			if (this.buffer.length >= this.size) {
				this.buffer[Math.randi(0, this.buffer.length)] = e;
			}

			else {
				this.buffer.push(e);
			}
			
		}

		sample(n) {
			var batch = [];

			if (this.buffer.length <= n)
				return this.buffer
			
			for (var i = 0; i < n; i++) {
				batch.push(Array.random(this.buffer));
			}

			return batch
		}

		draw() {
			return Array.random(this.buffer)
		}

		getAverageLoss() {
			return Array.sum(this.buffer, x => x.loss) / this.buffer.length
		}

	}

	class PrioritizedReplayBuffer extends ReplayBuffer {

		constructor(N) {
			super();

			this.root = new PrioritizedReplayBuffer.Node(null, null);
			this.iterations = 0;
			this.size = 0;

			this.maxISW = 1.0;
			this.beta = 0.5;

			for (var i = 0; i < N - 1; ++i) {
				this.root.add(null);
			}

			this.leafs = this.root.getLeafs();

			if (this.leafs.length !== this.root.size)
				throw 'could not create replay tree...'
		}

		add(e) {
			if (this.size === this.leafs.length) {
				this.root.descent((a, b) => a.minimum < b.minimum ? 0 : 1).set(e);
			}

			else {
				this.leafs[this.size].set(e);
			}
			
			this.iterations += 1;
			this.size = Math.max(this.size, this.iterations % this.leafs.length);
		}

		sample(n) { 
			var batch = [];

			this.maxISW = Math.pow(this.size * (this.root.minimum / this.root.value), -this.beta);

			if (this.size < 5 * n) 
				return [ ]

			while (batch.length < n)
				batch.push(this.root.cumulativeSample(Math.random() * this.root.value).experience);

			return batch
		}

		draw(prioritised) {
			if (!prioritised) 
				return this.leafs[Math.randi(0, this.size)].experience

			return this.root.cumulativeSample(Math.random() * this.root.value).experience
		}

		updateAfterLearning(batch) {
			for (var i = 0; i < batch.length; i++) {
				var e = batch[i];
				if (e !== e.node.experience)
					throw 'association error'

				e.node.revalue();
			}
		}

		getImportanceSamplingWeight(e) { 
			if (e.priority === undefined)
				return 1.0

			return Math.pow(this.size * (e.priority / this.root.value), -this.beta)
		}

		getAverageLoss() {
			return this.root.value / this.root.size
		}

	}

	PrioritizedReplayBuffer.Node = class Node {

		constructor(parent, experience) {
			this.parent = parent;
			this.children = [];
			this.size = 1;
			this.value = 0.0;

			this.maximum = -Infinity;
			this.minimum = Infinity;

			this.experience = experience;
			this.revalue();
		}


		cumulativeSample(x) {
			if (this.children.length === 0)
				return this

			if (this.children[0].value < x)
				return this.children[1].cumulativeSample(x - this.children[0].value)
			else 
				return this.children[0].cumulativeSample(x)
		} 

		update() {
			this.value = Array.sum(this.children, x => x.value);
			this.maximum = this.children.reduce((a, b) => a.maximum > b.maximum ? a : b).maximum;
			this.minimum = this.children.reduce((a, b) => a.minimum < b.minimum ? a : b).minimum;

			if (this.parent)
				this.parent.update();
		}

		revalue() {
			if (this.children.length > 0)
				throw 'not possible'

			if (!this.experience)
				return 

			this.value = this.experience.priority || Infinity;

			this.maximum = this.value;
			this.minimum = this.value;

			if (this.parent)
				this.parent.update();
		}

		set(experience) {
			if (this.children.length > 0)
				throw "can't set experience of node with children"

			experience.node = this;

			this.experience = experience;
			this.revalue();
		}

		add(experience) {
			if (this.children.length === 0) { // branch off
				this.children.push(new PrioritizedReplayBuffer.Node(this, this.experience));
				this.children.push(new PrioritizedReplayBuffer.Node(this, experience));
				this.experience = null;

				// this.update()
			} else {
				this.children.reduce((a, b) => a.size < b.size ? a : b).add(experience);
			}

			this.size++;
		}

		descent(dir) {
			if (this.children.length === 0)
				return this

			return this.children[ dir(this.children[0], this.children[1]) ].descent(dir)
		}

		getLeafs() {
			if (this.children.length === 0)
				return [ this ]

			var unfolded = [];
			for (var i = 0; i < this.children.length; i++) {
				unfolded.push(this.children[i].getLeafs());
			}

			return Array.prototype.concat.apply([], unfolded)
		}

	};

	var replayBuffers = {

		ReplayBuffer, 
		UniformReplayBuffer, 
		PrioritizedReplayBuffer

	};
	var replayBuffers_1 = replayBuffers.ReplayBuffer;
	var replayBuffers_2 = replayBuffers.UniformReplayBuffer;
	var replayBuffers_3 = replayBuffers.PrioritizedReplayBuffer;

	class Algorithm {

		// what to do?
		act(state, target) { throw 'Not implemented' }

		// how good is an action at state
		value(state, action, target) { throw 'Not implemented' }

		// replay
		optimize(e, descent = true) { throw 'Not implemented' }

		// adjust weights etc
		learn() { throw 'Not implemented' }

		import(params) { throw 'Not implemented' }
		export() { throw 'Not implemented' }


		evaluate(state, target) {
			return this.value(state, this.act(state, target), target)
		}

	}

	var algorithm = Algorithm;

	class DQN extends algorithm {

		constructor(agent) {
			// options
			this.options = Object.assign({

				alpha: 0.1, // advantage learning (AL) http://arxiv.org/pdf/1512.04860v1.pdf; increase action-gap
				theta: 0.001, // soft target updates
				
				learningSteps: 100e3,
				learningStepsBurnin: 3e3,

				epsilonMin: 0.05,
				epsilonAtTestTime: 0.05


			}, agent.options);

			//
			this.net = agent.options.network.newState();
			this.target = this.net.model.newState(); // agent.options.target.actor.newState()
			// this.target.configuration.copyParametersFrom(this.net.configuration)

			//
			this.targetWeightCopy = this.progressiveCopy.bind(this, this.net.configuration);

			this.net.configuration.useOptimizer({
				type: 'descent',
				method: 'adadelta',
	            regularization: { l2: 1e-3 }
			});

			// agent
			this.agent = agent;
			this.buffer = agent.buffer;

			this.states = this.agent.states;
			this.actions = this.agent.actions;
			this.input = this.agent.input;
		}

		// what to do?
		act(state, target) {

			if (this.agent.learning)
				this.epsilon = Math.max(1.0 - Math.max((this.agent.age - this.options.learningStepsBurnin) / this.options.learningSteps, 0.0), this.options.epsilonMin);
			else
				this.epsilon = this.options.epsilonAtTestTime;

			if (Math.random() <= this.epsilon) {
				return Math.randi(0, this.actions)
			}

			this.net.forward(state);

			return this.net.out.w.maxi()

		}

		// how good is an action at state
		value(state, action, target) {
			target = target == null ? this.net : this.target;
			target.forward(state);
			return target.out.w[action]
		}

		// replay
		optimize(e, descent = true) {
			var target = e.target();
			var value = e.estimate();

			var grad = value - target;
			var gradAL = grad + this.options.alpha * (value - this.agent.evaluate(e.state0, true)); // advantage learning
			var isw = this.buffer.getImportanceSamplingWeight(e);

			this.net.out.dw.fill(0.0);
			this.net.out.dw[e.action0] = gradAL * isw;

			if (descent) {
				this.net.backward();
				this.net.configuration.accumulate();
			}

			return gradAL * gradAL * 0.5
		}

		// adjust weights etc
		learn() {
			this.net.configuration.optimize(false);
			this.targetUpdate();
		}


		targetUpdate() {
			if (this.options.theta < 1) {
				this.target.configuration.forEachParameter(this.targetWeightCopy);
			}
		}

		progressiveCopy(net, param, index) {
			var _theta = this.options.theta;
			for (var i = 0; i < param.w.length; i++) {
				param.w[i] = _theta * net.parameters[index].w[i] + (1.0 - _theta) * param.w[i];
			}
		}


		import(params) {
			if (params.length !== this.net.configuration.countOfParameters)
				return false

			this.net.configuration.read(params);

			return true
		}

		export() {
			return this.net.configuration.write()
		}

	}

	var dqn = DQN;

	/*\
	|*|
	|*|	:: Number.isInteger() polyfill ::
	|*|
	|*|	https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isInteger
	|*|
	\*/

	if (!Number.isInteger) {
		Number.isInteger = function isInteger (nVal) {
			return typeof nVal === "number" && isFinite(nVal) && nVal > -9007199254740992 && nVal < 9007199254740992 && Math.floor(nVal) === nVal;
		};
	}

	/*\
	|*|
	|*|	StringView - Mozilla Developer Network
	|*|
	|*|	Revision #9, October 30, 2016
	|*|
	|*|	https://developer.mozilla.org/en-US/Add-ons/Code_snippets/StringView
	|*|	https://developer.mozilla.org/en-US/docs/User:fusionchess
	|*|	https://github.com/madmurphy/stringview.js
	|*|
	|*|	This framework is released under the GNU Lesser General Public License, version 3 or later.
	|*|	http://www.gnu.org/licenses/lgpl-3.0.html
	|*|
	\*/

	function StringView (vInput, sEncoding /* optional (default: UTF-8) */, nOffset /* optional */, nLength /* optional */) {

		var fTAView, aWhole, aRaw, fPutOutptCode, fGetOutptChrSize, nInptLen, nStartIdx = isFinite(nOffset) ? nOffset : 0, nTranscrType = 15;

		if (sEncoding) { this.encoding = sEncoding.toString(); }

		encSwitch: switch (this.encoding) {
			case "UTF-8":
				fPutOutptCode = StringView.putUTF8CharCode;
				fGetOutptChrSize = StringView.getUTF8CharLength;
				fTAView = Uint8Array;
				break encSwitch;
			case "UTF-16":
				fPutOutptCode = StringView.putUTF16CharCode;
				fGetOutptChrSize = StringView.getUTF16CharLength;
				fTAView = Uint16Array;
				break encSwitch;
			case "UTF-32":
				fTAView = Uint32Array;
				nTranscrType &= 14;
				break encSwitch;
			default:
				/* case "ASCII", or case "BinaryString" or unknown cases */
				fTAView = Uint8Array;
				nTranscrType &= 14;
		}

		typeSwitch: switch (typeof vInput) {
			case "string":
				/* the input argument is a primitive string: a new buffer will be created. */
				nTranscrType &= 7;
				break typeSwitch;
			case "object":
				classSwitch: switch (vInput.constructor) {
					case StringView:
						/* the input argument is a stringView: a new buffer will be created. */
						nTranscrType &= 3;
						break typeSwitch;
					case String:
						/* the input argument is an objectified string: a new buffer will be created. */
						nTranscrType &= 7;
						break typeSwitch;
					case ArrayBuffer:
						/* the input argument is an arrayBuffer: the buffer will be shared. */
						aWhole = new fTAView(vInput);
						nInptLen = this.encoding === "UTF-32" ?
								vInput.byteLength >>> 2
							: this.encoding === "UTF-16" ?
								vInput.byteLength >>> 1
							:
								vInput.byteLength;
						aRaw = nStartIdx === 0 && (!isFinite(nLength) || nLength === nInptLen) ?
							aWhole
							: new fTAView(vInput, nStartIdx, !isFinite(nLength) ? nInptLen - nStartIdx : nLength);

						break typeSwitch;
					case Uint32Array:
					case Uint16Array:
					case Uint8Array:
						/* the input argument is a typedArray: the buffer, and possibly the array itself, will be shared. */
						fTAView = vInput.constructor;
						nInptLen = vInput.length;
						aWhole = vInput.byteOffset === 0 && vInput.length === (
							fTAView === Uint32Array ?
								vInput.buffer.byteLength >>> 2
							: fTAView === Uint16Array ?
								vInput.buffer.byteLength >>> 1
							:
								vInput.buffer.byteLength
						) ? vInput : new fTAView(vInput.buffer);
						aRaw = nStartIdx === 0 && (!isFinite(nLength) || nLength === nInptLen) ?
							vInput
							: vInput.subarray(nStartIdx, isFinite(nLength) ? nStartIdx + nLength : nInptLen);

						break typeSwitch;
					default:
						/* the input argument is an array or another serializable object: a new typedArray will be created. */
						aWhole = new fTAView(vInput);
						nInptLen = aWhole.length;
						aRaw = nStartIdx === 0 && (!isFinite(nLength) || nLength === nInptLen) ?
							aWhole
							: aWhole.subarray(nStartIdx, isFinite(nLength) ? nStartIdx + nLength : nInptLen);
				}
				break typeSwitch;
			default:
				/* the input argument is a number, a boolean or a function: a new typedArray will be created. */
				aWhole = aRaw = new fTAView(Number(vInput) || 0);

		}

		if (nTranscrType < 8) {

			var vSource, nOutptLen, nCharStart, nCharEnd, nEndIdx, fGetInptChrSize, fGetInptChrCode;

			if (nTranscrType & 4) { /* input is string */

				vSource = vInput;
				nOutptLen = nInptLen = vSource.length;
				nTranscrType ^= this.encoding === "UTF-32" ? 0 : 2;
				/* ...or...: nTranscrType ^= Number(this.encoding !== "UTF-32") << 1; */
				nStartIdx = nCharStart = nOffset ? Math.max((nOutptLen + nOffset) % nOutptLen, 0) : 0;
				nEndIdx = nCharEnd = (Number.isInteger(nLength) ? Math.min(Math.max(nLength, 0) + nStartIdx, nOutptLen) : nOutptLen) - 1;

			} else { /* input is stringView */

				vSource = vInput.rawData;
				nInptLen = vInput.makeIndex();
				nStartIdx = nCharStart = nOffset ? Math.max((nInptLen + nOffset) % nInptLen, 0) : 0;
				nOutptLen = Number.isInteger(nLength) ? Math.min(Math.max(nLength, 0), nInptLen - nCharStart) : nInptLen;
				nEndIdx = nCharEnd = nOutptLen + nCharStart;

				if (vInput.encoding === "UTF-8") {
					fGetInptChrSize = StringView.getUTF8CharLength;
					fGetInptChrCode = StringView.loadUTF8CharCode;
				} else if (vInput.encoding === "UTF-16") {
					fGetInptChrSize = StringView.getUTF16CharLength;
					fGetInptChrCode = StringView.loadUTF16CharCode;
				} else {
					nTranscrType &= 1;
				}

			}

			if (nOutptLen === 0 || nTranscrType < 4 && vSource.encoding === this.encoding && nCharStart === 0 && nOutptLen === nInptLen) {

				/* the encoding is the same, the length too and the offset is 0... or the input is empty! */

				nTranscrType = 7;

			}

			conversionSwitch: switch (nTranscrType) {

				case 0:

				/* both the source and the new StringView have a fixed-length encoding... */

					aWhole = new fTAView(nOutptLen);
					for (var nOutptIdx = 0; nOutptIdx < nOutptLen; aWhole[nOutptIdx] = vSource[nStartIdx + nOutptIdx++]);
					break conversionSwitch;

				case 1:

				/* the source has a fixed-length encoding but the new StringView has a variable-length encoding... */

					/* mapping... */

					nOutptLen = 0;

					for (var nInptIdx = nStartIdx; nInptIdx < nEndIdx; nInptIdx++) {
						nOutptLen += fGetOutptChrSize(vSource[nInptIdx]);
					}

					aWhole = new fTAView(nOutptLen);

					/* transcription of the source... */

					for (var nInptIdx = nStartIdx, nOutptIdx = 0; nOutptIdx < nOutptLen; nInptIdx++) {
						nOutptIdx = fPutOutptCode(aWhole, vSource[nInptIdx], nOutptIdx);
					}

					break conversionSwitch;

				case 2:

				/* the source has a variable-length encoding but the new StringView has a fixed-length encoding... */

					/* mapping... */

					nStartIdx = 0;

					var nChrCode;

					for (nChrIdx = 0; nChrIdx < nCharStart; nChrIdx++) {
						nChrCode = fGetInptChrCode(vSource, nStartIdx);
						nStartIdx += fGetInptChrSize(nChrCode);
					}

					aWhole = new fTAView(nOutptLen);

					/* transcription of the source... */

					for (var nInptIdx = nStartIdx, nOutptIdx = 0; nOutptIdx < nOutptLen; nInptIdx += fGetInptChrSize(nChrCode), nOutptIdx++) {
						nChrCode = fGetInptChrCode(vSource, nInptIdx);
						aWhole[nOutptIdx] = nChrCode;
					}

					break conversionSwitch;

				case 3:

				/* both the source and the new StringView have a variable-length encoding... */

					/* mapping... */

					nOutptLen = 0;

					var nChrCode;

					for (var nChrIdx = 0, nInptIdx = 0; nChrIdx < nCharEnd; nInptIdx += fGetInptChrSize(nChrCode)) {
						nChrCode = fGetInptChrCode(vSource, nInptIdx);
						if (nChrIdx === nCharStart) { nStartIdx = nInptIdx; }
						if (++nChrIdx > nCharStart) { nOutptLen += fGetOutptChrSize(nChrCode); }
					}

					aWhole = new fTAView(nOutptLen);

					/* transcription... */

					for (var nInptIdx = nStartIdx, nOutptIdx = 0; nOutptIdx < nOutptLen; nInptIdx += fGetInptChrSize(nChrCode)) {
						nChrCode = fGetInptChrCode(vSource, nInptIdx);
						nOutptIdx = fPutOutptCode(aWhole, nChrCode, nOutptIdx);
					}

					break conversionSwitch;

				case 4:

				/* DOMString to ASCII or BinaryString or other unknown encodings */

					aWhole = new fTAView(nOutptLen);

					/* transcription... */

					for (var nIdx = 0; nIdx < nOutptLen; nIdx++) {
						aWhole[nIdx] = vSource.charCodeAt(nIdx) & 0xff;
					}

					break conversionSwitch;

				case 5:

				/* DOMString to UTF-8 or to UTF-16 */

					/* mapping... */

					nOutptLen = 0;

					for (var nMapIdx = 0; nMapIdx < nInptLen; nMapIdx++) {
						if (nMapIdx === nCharStart) { nStartIdx = nOutptLen; }
						nOutptLen += fGetOutptChrSize(vSource.charCodeAt(nMapIdx));
						if (nMapIdx === nCharEnd) { nEndIdx = nOutptLen; }
					}

					aWhole = new fTAView(nOutptLen);

					/* transcription... */

					for (var nOutptIdx = 0, nChrIdx = 0; nOutptIdx < nOutptLen; nChrIdx++) {
						nOutptIdx = fPutOutptCode(aWhole, vSource.charCodeAt(nChrIdx), nOutptIdx);
					}

					break conversionSwitch;

				case 6:

				/* DOMString to UTF-32 */

					aWhole = new fTAView(nOutptLen);

					/* transcription... */

					for (var nIdx = 0; nIdx < nOutptLen; nIdx++) {
						aWhole[nIdx] = vSource.charCodeAt(nIdx);
					}

					break conversionSwitch;

				case 7:

					aWhole = new fTAView(nOutptLen ? vSource : 0);
					break conversionSwitch;

			}

			aRaw = nTranscrType > 3 && (nStartIdx > 0 || nEndIdx < aWhole.length - 1) ? aWhole.subarray(nStartIdx, nEndIdx) : aWhole;

		}

		this.buffer = aWhole.buffer;
		this.bufferView = aWhole;
		this.rawData = aRaw;

		Object.freeze(this);

	}

	/* CONSTRUCTOR'S METHODS */

	StringView.loadUTF8CharCode = function (aChars, nIdx) {

		var nLen = aChars.length, nPart = aChars[nIdx];

		return nPart > 251 && nPart < 254 && nIdx + 5 < nLen ?
				/* (nPart - 252 << 30) may be not safe in ECMAScript! So...: */
				/* six bytes */ (nPart - 252) * 1073741824 + (aChars[nIdx + 1] - 128 << 24) + (aChars[nIdx + 2] - 128 << 18) + (aChars[nIdx + 3] - 128 << 12) + (aChars[nIdx + 4] - 128 << 6) + aChars[nIdx + 5] - 128
			: nPart > 247 && nPart < 252 && nIdx + 4 < nLen ?
				/* five bytes */ (nPart - 248 << 24) + (aChars[nIdx + 1] - 128 << 18) + (aChars[nIdx + 2] - 128 << 12) + (aChars[nIdx + 3] - 128 << 6) + aChars[nIdx + 4] - 128
			: nPart > 239 && nPart < 248 && nIdx + 3 < nLen ?
				/* four bytes */(nPart - 240 << 18) + (aChars[nIdx + 1] - 128 << 12) + (aChars[nIdx + 2] - 128 << 6) + aChars[nIdx + 3] - 128
			: nPart > 223 && nPart < 240 && nIdx + 2 < nLen ?
				/* three bytes */ (nPart - 224 << 12) + (aChars[nIdx + 1] - 128 << 6) + aChars[nIdx + 2] - 128
			: nPart > 191 && nPart < 224 && nIdx + 1 < nLen ?
				/* two bytes */ (nPart - 192 << 6) + aChars[nIdx + 1] - 128
			:
				/* one byte */ nPart;

	};

	StringView.putUTF8CharCode = function (aTarget, nChar, nPutAt) {

		var nIdx = nPutAt;

		if (nChar < 0x80 /* 128 */) {
			/* one byte */
			aTarget[nIdx++] = nChar;
		} else if (nChar < 0x800 /* 2048 */) {
			/* two bytes */
			aTarget[nIdx++] = 0xc0 /* 192 */ + (nChar >>> 6);
			aTarget[nIdx++] = 0x80 /* 128 */ + (nChar & 0x3f /* 63 */);
		} else if (nChar < 0x10000 /* 65536 */) {
			/* three bytes */
			aTarget[nIdx++] = 0xe0 /* 224 */ + (nChar >>> 12);
			aTarget[nIdx++] = 0x80 /* 128 */ + ((nChar >>> 6) & 0x3f /* 63 */);
			aTarget[nIdx++] = 0x80 /* 128 */ + (nChar & 0x3f /* 63 */);
		} else if (nChar < 0x200000 /* 2097152 */) {
			/* four bytes */
			aTarget[nIdx++] = 0xf0 /* 240 */ + (nChar >>> 18);
			aTarget[nIdx++] = 0x80 /* 128 */ + ((nChar >>> 12) & 0x3f /* 63 */);
			aTarget[nIdx++] = 0x80 /* 128 */ + ((nChar >>> 6) & 0x3f /* 63 */);
			aTarget[nIdx++] = 0x80 /* 128 */ + (nChar & 0x3f /* 63 */);
		} else if (nChar < 0x4000000 /* 67108864 */) {
			/* five bytes */
			aTarget[nIdx++] = 0xf8 /* 248 */ + (nChar >>> 24);
			aTarget[nIdx++] = 0x80 /* 128 */ + ((nChar >>> 18) & 0x3f /* 63 */);
			aTarget[nIdx++] = 0x80 /* 128 */ + ((nChar >>> 12) & 0x3f /* 63 */);
			aTarget[nIdx++] = 0x80 /* 128 */ + ((nChar >>> 6) & 0x3f /* 63 */);
			aTarget[nIdx++] = 0x80 /* 128 */ + (nChar & 0x3f /* 63 */);
		} else /* if (nChar <= 0x7fffffff) */ { /* 2147483647 */
			/* six bytes */
			aTarget[nIdx++] = 0xfc /* 252 */ + /* (nChar >>> 30) may be not safe in ECMAScript! So...: */ (nChar / 1073741824);
			aTarget[nIdx++] = 0x80 /* 128 */ + ((nChar >>> 24) & 0x3f /* 63 */);
			aTarget[nIdx++] = 0x80 /* 128 */ + ((nChar >>> 18) & 0x3f /* 63 */);
			aTarget[nIdx++] = 0x80 /* 128 */ + ((nChar >>> 12) & 0x3f /* 63 */);
			aTarget[nIdx++] = 0x80 /* 128 */ + ((nChar >>> 6) & 0x3f /* 63 */);
			aTarget[nIdx++] = 0x80 /* 128 */ + (nChar & 0x3f /* 63 */);
		}

		return nIdx;

	};

	StringView.getUTF8CharLength = function (nChar) {
		return nChar < 0x80 ? 1 : nChar < 0x800 ? 2 : nChar < 0x10000 ? 3 : nChar < 0x200000 ? 4 : nChar < 0x4000000 ? 5 : 6;
	};

	StringView.loadUTF16CharCode = function (aChars, nIdx) {

		/* UTF-16 to DOMString decoding algorithm */
		var nFrstChr = aChars[nIdx];

		return nFrstChr > 0xD7BF /* 55231 */ && nIdx + 1 < aChars.length ?
			(nFrstChr - 0xD800 /* 55296 */ << 10) + aChars[nIdx + 1] + 0x2400 /* 9216 */
			: nFrstChr;

	};

	StringView.putUTF16CharCode = function (aTarget, nChar, nPutAt) {

		var nIdx = nPutAt;

		if (nChar < 0x10000 /* 65536 */) {
			/* one element */
			aTarget[nIdx++] = nChar;
		} else {
			/* two elements */
			aTarget[nIdx++] = 0xD7C0 /* 55232 */ + (nChar >>> 10);
			aTarget[nIdx++] = 0xDC00 /* 56320 */ + (nChar & 0x3FF /* 1023 */);
		}

		return nIdx;

	};

	StringView.getUTF16CharLength = function (nChar) {
		return nChar < 0x10000 ? 1 : 2;
	};

	/* Array of bytes to base64 string decoding */

	StringView.b64ToUint6 = function (nChr) {

		return nChr > 64 && nChr < 91 ?
				nChr - 65
			: nChr > 96 && nChr < 123 ?
				nChr - 71
			: nChr > 47 && nChr < 58 ?
				nChr + 4
			: nChr === 43 ?
				62
			: nChr === 47 ?
				63
			:
				0;

	};

	StringView.uint6ToB64 = function (nUint6) {

		return nUint6 < 26 ?
				nUint6 + 65
			: nUint6 < 52 ?
				nUint6 + 71
			: nUint6 < 62 ?
				nUint6 - 4
			: nUint6 === 62 ?
				43
			: nUint6 === 63 ?
				47
			:
				65;

	};

	/* Base64 string to array encoding */

	StringView.bytesToBase64 = function (aBytes) {

		var eqLen = (3 - (aBytes.length % 3)) % 3, sB64Enc = "";

		for (var nMod3, nLen = aBytes.length, nUint24 = 0, nIdx = 0; nIdx < nLen; nIdx++) {
			nMod3 = nIdx % 3;
			/* Uncomment the following line in order to split the output in lines 76-character long: */
			/*
			if (nIdx > 0 && (nIdx * 4 / 3) % 76 === 0) { sB64Enc += "\r\n"; }
			*/
			nUint24 |= aBytes[nIdx] << (16 >>> nMod3 & 24);
			if (nMod3 === 2 || aBytes.length - nIdx === 1) {
				sB64Enc += String.fromCharCode(StringView.uint6ToB64(nUint24 >>> 18 & 63), StringView.uint6ToB64(nUint24 >>> 12 & 63), StringView.uint6ToB64(nUint24 >>> 6 & 63), StringView.uint6ToB64(nUint24 & 63));
				nUint24 = 0;
			}
		}

		return	eqLen === 0 ?
				sB64Enc
			:
				sB64Enc.substring(0, sB64Enc.length - eqLen) + (eqLen === 1 ? "=" : "==");


	};


	StringView.base64ToBytes = function (sBase64, nBlockBytes) {

		var
			sB64Enc = sBase64.replace(/[^A-Za-z0-9\+\/]/g, ""), nInLen = sB64Enc.length,
			nOutLen = nBlockBytes ? Math.ceil((nInLen * 3 + 1 >>> 2) / nBlockBytes) * nBlockBytes : nInLen * 3 + 1 >>> 2, aBytes = new Uint8Array(nOutLen);

		for (var nMod3, nMod4, nUint24 = 0, nOutIdx = 0, nInIdx = 0; nInIdx < nInLen; nInIdx++) {
			nMod4 = nInIdx & 3;
			nUint24 |= StringView.b64ToUint6(sB64Enc.charCodeAt(nInIdx)) << 18 - 6 * nMod4;
			if (nMod4 === 3 || nInLen - nInIdx === 1) {
				for (nMod3 = 0; nMod3 < 3 && nOutIdx < nOutLen; nMod3++, nOutIdx++) {
					aBytes[nOutIdx] = nUint24 >>> (16 >>> nMod3 & 24) & 255;
				}
				nUint24 = 0;
			}
		}

		return aBytes;

	};

	StringView.makeFromBase64 = function (sB64Inpt, sEncoding, nByteOffset, nLength) {

		return new StringView(sEncoding === "UTF-16" || sEncoding === "UTF-32" ? StringView.base64ToBytes(sB64Inpt, sEncoding === "UTF-16" ? 2 : 4).buffer : StringView.base64ToBytes(sB64Inpt), sEncoding, nByteOffset, nLength);

	};

	/* DEFAULT VALUES */

	StringView.prototype.encoding = "UTF-8"; /* Default encoding... */

	/* INSTANCES' METHODS */

	StringView.prototype.makeIndex = function (nChrLength, nStartFrom) {

		var

			aTarget = this.rawData, nChrEnd, nRawLength = aTarget.length,
			nStartIdx = nStartFrom || 0, nIdxEnd = nStartIdx, nStopAtChr = isNaN(nChrLength) ? Infinity : nChrLength;

		if (nChrLength + 1 > aTarget.length) { throw new RangeError("StringView.prototype.makeIndex - The offset can\'t be major than the length of the array - 1."); }

		switch (this.encoding) {

			case "UTF-8":

				var nPart;

				for (nChrEnd = 0; nIdxEnd < nRawLength && nChrEnd < nStopAtChr; nChrEnd++) {
					nPart = aTarget[nIdxEnd];
					nIdxEnd += nPart > 251 && nPart < 254 && nIdxEnd + 5 < nRawLength ? 6
						: nPart > 247 && nPart < 252 && nIdxEnd + 4 < nRawLength ? 5
						: nPart > 239 && nPart < 248 && nIdxEnd + 3 < nRawLength ? 4
						: nPart > 223 && nPart < 240 && nIdxEnd + 2 < nRawLength ? 3
						: nPart > 191 && nPart < 224 && nIdxEnd + 1 < nRawLength ? 2
						: 1;
				}

				break;

			case "UTF-16":

				for (nChrEnd = nStartIdx; nIdxEnd < nRawLength && nChrEnd < nStopAtChr; nChrEnd++) {
					nIdxEnd += aTarget[nIdxEnd] > 0xD7BF /* 55231 */ && nIdxEnd + 1 < aTarget.length ? 2 : 1;
				}

				break;

			default:

				nIdxEnd = nChrEnd = isFinite(nChrLength) ? nChrLength : nRawLength - 1;

		}

		if (nChrLength) { return nIdxEnd; }

		return nChrEnd;

	};

	StringView.prototype.toBase64 = function (bWholeBuffer) {

		return StringView.bytesToBase64(
			bWholeBuffer ?
				(
					this.bufferView.constructor === Uint8Array ?
						this.bufferView
					:
						new Uint8Array(this.buffer)
				)
			: this.rawData.constructor === Uint8Array ?
				this.rawData
			:
				new Uint8Array(this.buffer, this.rawData.byteOffset, this.rawData.length << (this.rawData.constructor === Uint16Array ? 1 : 2))
			);

	};

	StringView.prototype.subview = function (nCharOffset /* optional */, nCharLength /* optional */) {

		var

			nChrLen, nCharStart, nStrLen, bVariableLen = this.encoding === "UTF-8" || this.encoding === "UTF-16",
			nStartOffset = nCharOffset, nStringLength, nRawLen = this.rawData.length;

		if (nRawLen === 0) {
			return new StringView(this.buffer, this.encoding);
		}

		nStringLength = bVariableLen ? this.makeIndex() : nRawLen;
		nCharStart = nCharOffset ? Math.max((nStringLength + nCharOffset) % nStringLength, 0) : 0;
		nStrLen = Number.isInteger(nCharLength) ? Math.max(nCharLength, 0) + nCharStart > nStringLength ? nStringLength - nCharStart : nCharLength : nStringLength;

		if (nCharStart === 0 && nStrLen === nStringLength) { return this; }

		if (bVariableLen) {
			nStartOffset = this.makeIndex(nCharStart);
			nChrLen = this.makeIndex(nStrLen, nStartOffset) - nStartOffset;
		} else {
			nStartOffset = nCharStart;
			nChrLen = nStrLen - nCharStart;
		}

		if (this.encoding === "UTF-16") {
			nStartOffset <<= 1;
		} else if (this.encoding === "UTF-32") {
			nStartOffset <<= 2;
		}

		return new StringView(this.buffer, this.encoding, nStartOffset, nChrLen);

	};

	StringView.prototype.forEachChar = function (fCallback, oThat, nChrOffset, nChrLen) {

		var aSource = this.rawData, nRawEnd, nRawIdx;

		if (this.encoding === "UTF-8" || this.encoding === "UTF-16") {

			var fGetInptChrSize, fGetInptChrCode;

			if (this.encoding === "UTF-8") {
				fGetInptChrSize = StringView.getUTF8CharLength;
				fGetInptChrCode = StringView.loadUTF8CharCode;
			} else if (this.encoding === "UTF-16") {
				fGetInptChrSize = StringView.getUTF16CharLength;
				fGetInptChrCode = StringView.loadUTF16CharCode;
			}

			nRawIdx = isFinite(nChrOffset) ? this.makeIndex(nChrOffset) : 0;
			nRawEnd = isFinite(nChrLen) ? this.makeIndex(nChrLen, nRawIdx) : aSource.length;

			for (var nChrCode, nChrIdx = 0; nRawIdx < nRawEnd; nChrIdx++) {
				nChrCode = fGetInptChrCode(aSource, nRawIdx);
				fCallback.call(oThat || null, nChrCode, nChrIdx, nRawIdx, aSource);
				nRawIdx += fGetInptChrSize(nChrCode);
			}

		} else {

			nRawIdx = isFinite(nChrOffset) ? nChrOffset : 0;
			nRawEnd = isFinite(nChrLen) ? nChrLen + nRawIdx : aSource.length;

			for (nRawIdx; nRawIdx < nRawEnd; nRawIdx++) {
				fCallback.call(oThat || null, aSource[nRawIdx], nRawIdx, nRawIdx, aSource);
			}

		}

	};

	StringView.prototype.valueOf = StringView.prototype.toString = function () {

		if (this.encoding !== "UTF-8" && this.encoding !== "UTF-16") {
			/* ASCII, UTF-32 or BinaryString to DOMString */
			return String.fromCharCode.apply(null, this.rawData);
		}

		var fGetCode, fGetIncr, sView = "";

		if (this.encoding === "UTF-8") {
			fGetIncr = StringView.getUTF8CharLength;
			fGetCode = StringView.loadUTF8CharCode;
		} else if (this.encoding === "UTF-16") {
			fGetIncr = StringView.getUTF16CharLength;
			fGetCode = StringView.loadUTF16CharCode;
		}

		for (var nChr, nLen = this.rawData.length, nIdx = 0; nIdx < nLen; nIdx += fGetIncr(nChr)) {
			nChr = fGetCode(this.rawData, nIdx);
			sView += String.fromCharCode(nChr);
		}

		return sView;

	};

	var stringview = StringView;

	function isObjLiteral(_obj) {
	  var _test  = _obj;
	  return (  typeof _obj !== 'object' || _obj === null ?
	              false :  
	              (
	                (function () {
	                  while (!false) {
	                    if (  Object.getPrototypeOf( _test = Object.getPrototypeOf(_test)  ) === null) {
	                      break;
	                    }      
	                  }
	                  return Object.getPrototypeOf(_obj) === _test;
	                })()
	              )
	          );
	}

	class BinaryWriter {

		/**
		 * Returns array buffer, which contains the binary data.
		 * @param  {array} contents
		 * @return {ArrayBuffer} 
		 */
		static write(contents) {
			var toc = [], length = 0;

			for (var i = 0; i < contents.length; i++) {
				var value = contents[i];
				var isobject = false;

				if (value.constructor === Object || value.constructor === Array) {
					value = (contents[i] = JSON.stringify(value));
					isobject = true;
				}

				if (typeof value === 'string') {
					toc.push({
						t: 's',
						l: value.length
					});

					if (isobject) {
						toc[toc.length - 1]['o'] = 1;
					}

					length += value.length;
				}

				else if (ArrayBuffer.isView(value)) {
					toc.push({
						t: 't',
						l: value.byteLength,
						i: value.constructor.name
					});

					length += value.byteLength;
				}

				else if (value instanceof ArrayBuffer) {
					toc.push({
						t: 'b',
						l: value.byteLength
					});

					length += value.byteLength;
				}
	 		}

			var jsonified = JSON.stringify(toc);

			length += jsonified.length + Uint32Array.BYTES_PER_ELEMENT + 1;

			var writer = new BinaryWriter(length);

			writer.setUint8(BinaryWriter.validationByte); // validation byte
			writer.setUint32(jsonified.length); // table of contents length
			writer.setString(jsonified); // ToC

			for (var i = 0; i < toc.length; i++) {
				switch(toc[i].t) {
					case 's': writer.setString(contents[i]); break
					case 't': writer.setTypedArray(contents[i]); break
					case 'b': writer.setBuffer(contents[i]); break
				}
			}

			if (!writer.isAtEnd()) {
				throw "The lengths don't match up";
			}

			return writer.raw
		}


		constructor(length) {
			this.array = new Uint8Array(length);
			this.buffer = this.array.buffer;
			this.dataView = new DataView(this.buffer);
			this.index = 0;
		}

		setUint8(val) {
			this.dataView.setUint8(this.index, val);
			this.index += Uint8Array.BYTES_PER_ELEMENT;
		}

		setUint32(val) {
			this.dataView.setUint32(this.index, val);
			this.index += Uint32Array.BYTES_PER_ELEMENT;
		}

		setString(string) {
			var sv = new stringview(string);
			this.array.set(sv.rawData, this.index);
			this.index += sv.buffer.byteLength;
		}

		setTypedArray(arr) {
			this.array.set(new Uint8Array(arr.buffer), this.index);
			this.index += arr.byteLength;
		}

		setBuffer(buf) {
			this.array.set(new Uint8Array(buf), this.index);
			this.index += buf.byteLength;
		}

		isAtEnd() {
			return this.buffer.byteLength === this.index
		}

		get raw() {
			return this.array.buffer
		}

	}


	class BinaryReader {

		/**
		 * Returns the contents read from the array buffer
		 * @param  {ArrayBuffer} buffer
		 * @return {array}      
		 */
		static read(buffer) {
			var reader = new BinaryReader(buffer);

			var validation = reader.getUint8();

			if (validation !== BinaryWriter.validationByte) {
				throw "validation byte doesn't match."
			}

			var tocLength = reader.getUint32();
			var tocString = reader.getString(tocLength);
			var toc = JSON.parse(tocString);
			var contents = [];

			for (var i = 0; i < toc.length; i++) {
				switch (toc[i].t) {
					case 's': contents.push(reader.getString(toc[i].l)); break
					case 't': contents.push(new (typeof window !== 'undefined' ? window : commonjsGlobal)[toc[i].i](reader.getBuffer(toc[i].l))); break
					case 'b': contents.push(reader.getBuffer(toc[i].l)); break
				}

				if (toc[i]['o'] === 1) {
					contents[i] = JSON.parse(contents[i]);
				}
			}

			return contents
		}


		constructor(buffer) {
			this.array = new Uint8Array(buffer);
			this.buffer = buffer;
			this.dataView = new DataView(buffer);
			this.index = 0;
		}


		getUint8() {
			var val = this.dataView.getUint8(this.index);
			this.index += Uint8Array.BYTES_PER_ELEMENT;

			return val
		}

		getUint32() {
			var val = this.dataView.getUint32(this.index);
			this.index += Uint32Array.BYTES_PER_ELEMENT;

			return val
		}

		getString(length) {
			var arr = this.array.subarray(this.index, this.index + length);
			var str = (new stringview(arr)).toString();

			this.index += arr.byteLength;

			return str
		}

		getBuffer(byteLength) {
			var arr = this.array.slice(this.index, this.index + byteLength);
			this.index += byteLength;

			return arr.buffer
		}

		isAtEnd() {
			return this.buffer.byteLength === this.index
		}

	}

	BinaryWriter.validationByte = 0x8F;

	var file = {
		'Writer' : BinaryWriter,
		'Reader' : BinaryReader
	};

	class NetOnDisk {

		static write(config) {
			var contents = [];

			contents.push(config.model.representation);
			contents.push(config.pullWeights());

			return file.Writer.write(contents)
		}

		static read(buffer) {
			var contents = file.Reader.read(buffer);

			var model = new network.Model(contents[0]);
			var config = model.newConfiguration();

			config.putWeights(contents[1]);

			return config
		}



		static writeMultiPart(list) {
			var contents = [];

			contents.push(Object.keys(list));

			for (var name in list) {
				var config = list[name];

				if (!config instanceof network.Configuration) {
					throw 'config in list must be of type Network.Configuration'
				}

				contents.push(name);
				contents.push(config.model.representation);
				contents.push(config.pullWeights());
			}

			return file.Writer.write(contents)
		}

		static readMultiPart(buffer) {
			var contents = file.Reader.read(buffer);

			var ptr = -1;
			var names = contents[++ptr];

			var list = {};

			for (var i = 0; i < names.length; i++) {
				var name = names[i];

				if (contents[++ptr] !== name) {
					throw 'name does not match up'
				}

				var model = new network.Model(contents[++ptr]);
				var config = model.newConfiguration();

				config.putWeights(contents[++ptr]);

				list[name] = config;
			}

			return list
		}

	}

	var storage = NetOnDisk;

	/* Deep deterministic policy gradient */
	class DDPG extends algorithm {

		constructor(agent) {
			super();
			// options
			this.options = Object.assign({
				alpha: 0, // advantage learning (AL) http://arxiv.org/pdf/1512.04860v1.pdf; increase action-gap
				theta: 0.001, // soft target updates
			}, agent.options);


			this.actor = new shared.NetworkWrapper();
			this.critic = new shared.NetworkWrapper();

			// target networks

			var targetCreate = (wrapper, state) => {
				wrapper.live = state;

				if (this.options.theta < 1) {
					wrapper.target = wrapper.live.model.newState();
				}
				
				else {
					wrapper.target = wrapper.live;
				}
			};

			this.actor.on('set', targetCreate);
			this.critic.on('set', targetCreate);

			// network validations

			this.actor.on('set', (wrapper, state) => {
				if (state.in.w.length !== this.agent.input) {
					throw 'actor input length insufficient'
				}

				if (state.out.w.length !== this.agent.actions) {
					throw 'actor output insufficient'
				}
			});

			this.critic.on('set', (wrapper, state) => {
				if (state.in.w.length !== this.agent.input + this.agent.actions) {
					throw 'critic input length insufficient'
				}

				if (state.out.w.length !== 1) {
					throw 'critic output length insufficient'
				}
			});

			// optimizer

			this.actor.useOptimizer({
				type: 'ascent',
				method: 'adadelta',
				regularization: { l2: 1e-2 }
			});

			this.critic.useOptimizer({
				type: 'descent',
				method: 'adadelta',
	            regularization: { l2: 1e-3 }
			});

			// agent
			this.agent = agent;

			this.input = agent.input;
			this.buffer = agent.buffer;

			// network weight updates
			this.targetActorUpdate = this.progressiveCopy.bind(this, this.actor);
			this.targetCriticUpdate = this.progressiveCopy.bind(this, this.critic);

			// adopt networks
			this.actor.set(this.options.actor);
			this.critic.set(this.options.critic);
		}

		act(state, target) {
			if (target) {
				return this.actor.target.forward(state)
			}

			return this.actor.live.forward(state)
		}

		value(state, action, target) {
			var net = target ? this.critic.target : this.critic.live;

			net.in.w.set(state, 0);
			net.in.w.set(action, this.input);

			return net.forward()[0]
		}

		optimize(e, descent = true) {
			var target = e.target();
			var value = e.estimate();

			var grad = value - target;
			var gradAL = grad;

			if (this.options.alpha > 0) {
				gradAL = grad + this.options.alpha * (value - this.evaluate(e.state0, true)); // advantage learning
			}

			if (descent) {
				var isw = this.buffer.getImportanceSamplingWeight(e);
				this.critic.live.backwardWithGradient(gradAL * isw);
				this.critic.live.configuration.accumulate();
				this.teach(e, isw);
			}

			return 0.5 * gradAL * gradAL // Math.pow(this.teach(e, isw, descent) - target, 2)
		}

		teach(e, isw = 1.0, descent = true) {
			var action = this.actor.live.forward(e.state0);  // which action to take?
			var val = this.value(e.state0, action); // how good will the future be, if i take this action?
			var grad = this.critic.live.derivatives(0, false); // how will the future change, if i change this action

			for (var i = 0; i < this.options.actions; i++) {
				this.actor.live.out.dw[i] = grad[this.input + i] * isw;
			}

			if (descent) {
				this.actor.live.backward(); // propagate change
				this.actor.config.accumulate();
			}
		}

		learn() {
			// Improve through batch accumuluated gradients
			this.actor.optimize();
			this.critic.optimize();
			
			// Copy actor and critic to target networks slowly
			this.targetNetworkUpdates();
		}

		targetNetworkUpdates() {
			this.actor.target.configuration.forEachParameter(this.targetActorUpdate);
			this.critic.target.configuration.forEachParameter(this.targetCriticUpdate);
		}

		progressiveCopy(net, param, index) {
			if (this.options.theta >= 1) {
				return 
			}

			// _ = network in use, no _ = target network
			var _theta = this.options.theta, _paramw = net.config.parameters[index].w;
			var  theta = 1.0 - _theta,        paramw = param.w;

			for (var i = 0; i < param.w.length; i++) {
				paramw[i] = _theta * _paramw[i] + theta * paramw[i];
			}
		}


		import(file) {
			var multiPart = storage.readMultiPart(file);
			this.actor.set(multiPart.actor);
			this.critic.set(multiPart.critic);
		}

		export() {
			return storage.writeMultiPart({
				'actor': this.actor.config,
				'critic': this.critic.config
			})
		}

	}

	var ddpg = DDPG;

	// var network = require('../network.js')






	/**
	 * The Agent class represents the
	 * reinforcement-learner.
	 */
	class Agent {

		constructor(opt) {

			this.options = Object.assign({

				type: 'q-learning', // sarsa or q-learning
				experience: 25e3,
				temporalWindow: 0,

				learningPerTick: 64,
				startLearningAt: 1000,

				buffer: replayBuffers.PrioritizedReplayBuffer,

				algorithm: 'ddpg',

				discount: opt.discount || 0.9,
				beta: 0.15, // how to prioritise experiences (0 = no prioritisation, 1 = full prioritisation)

			}, opt);

			// options
			this.states = this.options.states; // state space
			this.actions = this.options.actions; // action space
			this.input = Agent.getInputDimension(this.states, this.actions, this.options.temporalWindow); // extended state (over time)

			// settings
			this.buffer = new this.options.buffer(this.options.experience);
			this.history = {
				states: new window$1(Math.max(2, this.options.temporalWindow)),
				actions: new window$1(Math.max(2, this.options.temporalWindow)),
				inputs: new window$1(2),
				rewards: new window$1(2),
			};

			this.age = 1;
			this.learning = true;
			this.ready = true;

			switch (this.options.algorithm) {
				case 'dqn':
					this.algorithm = new dqn(this); break
				case 'ddpg':
					this.algorithm = new ddpg(this); break
				default:
					throw 'unknown algorithm'
			}
		}

		/**
		 * Let the agent make an action, includes exploration through noise
		 * 返回最终决策的行为
		 * @param  {Array} state
		 * @return {Array}       An action
		 */
		policy(state) {
			if (!this.ready)
				return

			var input = this.getStateInputVector(state);
			var action = this.act(input);

			this.history.inputs.push(input);
			this.history.states.push(state);
			this.history.actions.push(action);
			this.acted = true;

			return action
		}

		actionToVector(action) {
			if (action instanceof Float64Array) {
				return action
			}

			if (Number.isInteger(action)) {
				return Float64Array.oneHot(action, this.actions)
			}

			throw 'Action is invalid'
		}

		getStateInputVector(state) {
			if (this.options.temporalWindow > 0) {
				var input = new Float64Array(this.input);
				var cursor = 0;
				
				for (var t = this.options.temporalWindow - 1; t >= 0; t--) {
					if (this.history.states.size > t) {
						input.set(this.history.states.get(t), cursor);
						input.set(this.actionToVector( this.history.actions.get(t) ), cursor + this.states); 
					}
					
					cursor += this.states + this.actions;
				}

				input.set(state, cursor);

				return input
			}

			return state
		}

		/**
		 * Simulate that the agent did an action
		 * @param  {Array} state
		 * @param  {Array} action
		 */
		simulate(state, action) {
			if (!this.ready)
				return

			var input = this.getStateInputVector(state);

			this.history.inputs.push(input);
			this.history.states.push(state);
			this.history.actions.push(action);
			this.acted = true;
		}

		/**
		 * Adds an experience to the buffer and replays a batch of experiences
		 * @param  {Float} reward
		 * @return {Float}        The loss
		 */
		learn(reward) {
			if (!this.acted || !this.ready)
				return

			this.acted = false;
			this.history.rewards.push(reward);

			// Learning happens always one step after actually experiencing
			if (this.history.states.size < 2 || this.learning === false) 
				return

			// Create new experience
			var e = new experience(this);
			e.action0 = this.history.actions.get(1);
			e.state0 = this.history.inputs.get(1);
			e.reward0 = this.history.rewards.get(1);
			e.state1 = this.history.inputs.get(0);
			e.action1 = this.history.actions.get(0); // for SARSA only
			e.init(); // set loss etc.

			// Add experience to replay buffer
			this.buffer.add(e);

			// Get older
			++this.age; 

			return this.backward()
		}

		backward() {
			if (this.options.startLearningAt > this.age)
				return false

			// Set training
			this.training = true;

			// Learn batch
			var loss = this.replay();

			// Execute algorithm
			this.algorithm.learn();
	 
			return loss
		}

		replay() {		
			var batch = this.buffer.sample(this.options.learningPerTick), loss = 0.0;

			for (var i = 0; i < batch.length; i++) {
				loss += batch[i].step();
			}

			this.buffer.updateAfterLearning(batch);

			return loss / batch.length
		}


		// 
		act(state, target) {
			return this.algorithm.act(state, target)
		}

		value(state, action, target)  {
			return this.algorithm.value(state, action, target)
		}

		evaluate(state, target) {
			return this.algorithm.evaluate(state, target)
		}



		// utility functions
		export() {
			return this.algorithm.export()
		}

		static getInputDimension(states, actions, temporalWindow) {
			return states + temporalWindow * (states + actions)
		}

	}

	var agent = Agent;

	class WebLoader {

	    static load(path, completion) {
	        var request = new XMLHttpRequest();
	        request.open("GET", path, true);
	        request.responseType = "arraybuffer";
	        request.addEventListener('load', function(e) {
	            completion(request.response);
	        });

	        request.send(null);
	    }

	    static loadConfig(path, model, completion) {
	    	var config = model.newConfiguration();
	    	WebLoader.loadConfigInto(path, config, completion.bind(null, config));
	    }

	    static loadConfigInto(path, config, completion) {
	        WebLoader.load(path, function (buffer) {
	            var weights = new Float64Array(buffer);
	            config.read(weights);
	            completion();
	        });
	    }


	    static loadAgent(path, agent, completion) {
	        agent.ready = false;

	        WebLoader.load(path, function (buffer) {
	            var weights = new Float64Array(buffer);
	            agent.import(weights);
	            agent.ready = true;

	            if (completion)
	                completion(agent);
	        });
	    }

	}

	var loader = WebLoader;

	class FileLoader {

		static download(file, callback) {
			// Create XHR, Blob and FileReader objects
		    var xhr = new XMLHttpRequest(), blob, fileReader = new FileReader();

		    xhr.open("GET", file, true);
		    // Set the responseType to arraybuffer. "blob" is an option too, rendering manual Blob creation unnecessary, but the support for "blob" is not widespread enough yet
		    xhr.responseType = "arraybuffer";

		    xhr.addEventListener("load", function () {
		        if (xhr.status === 200) {
		            callback(null, xhr.response);
		        }

		        else {
		        	callback(xhr.status, null);
		        }
		    }, false);

		    // Send XHR
		    xhr.send();
		}

	}

	var downloader = FileLoader;

	var framework = createCommonjsModule(function (module) {
	if (!support()) {
		throw 'env unsupported';
	}



	var neurojs = {

		Network: network,
		Agent: agent,
		Optim: optim,
		Loader: loader,
		Buffers: replayBuffers,
		NetOnDisk: storage,
		FileLoader: downloader,
		Binary: file,
		Shared: shared

	};

	if (typeof window !== 'undefined') {
		window.neurojs = neurojs;
	} else {
		module.exports = neurojs;
	}
	});

	return framework;

}());
