/**
 * 从 array 中取样 size 个。 不允许重复取样
 * @param array 
 * @param size 
 */
export const sample = (array:number[], size:number) => {
	const results = [],
		sampled:{[key:number]:boolean} = {};
	while (results.length < size && results.length < array.length) {
		const index = Math.trunc(Math.random() * array.length);
		if (!sampled[index]) {
			results.push(array[index]);
			sampled[index] = true;
		}
	}
	return results;
}

export const sigmoid = (t:number) => 1 / (1 + Math.pow(Math.E, -t));

export const softmax = (arr:number[]) => {
	const C = Math.max(...arr);
	const d = arr.map(y => Math.exp(y - C)).reduce((a, b) => a + b);
	return arr.map(value => Math.exp(value - C) / d);
}

