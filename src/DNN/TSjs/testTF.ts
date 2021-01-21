
import * as tf from '@tensorflow/tfjs';
import { debug } from 'console';

declare var tfvis: any;

async function run() {
	// Load and plot the original input data that we are going to train on.
	const data = [{ rooms: 1, price: 100 }];
	const values = data.map(d => ({
		x: d.rooms,
		y: d.price,
	}));
	tfvis.render.scatterplot(
		{ name: 'No.of rooms v Price' },
		{ values },
		{
			xLabel: 'No. of rooms',
			yLabel: 'Price',
			height: 300
		}
	);
	// More code will be added below
}

function createModel() {
	debugger;
	// Create a sequential model
	const model = tf.sequential();

	// Add a single hidden layer
	model.add(tf.layers.dense({ inputShape: [1], units: 1, useBias: true }));

	// Add an output layer
	model.add(tf.layers.dense({ units: 1, useBias: true }));
	return model;
}

function convertToTensor(data) {

	return tf.tidy(() => {
	  // Step 1\. Shuffle the data    
	  tf.util.shuffle(data);
	  // Step 2\. Convert data to Tensor
	  const inputs = data.map(d => d.rooms)
	  const labels = data.map(d => d.price);
	  const inputTensor = tf.tensor2d(inputs, [inputs.length, 1]);
	  const labelTensor = tf.tensor2d(labels, [labels.length, 1]);
	  //Step 3\. Normalize the data to the range 0 - 1 using min-max scaling
	  const inputMax = inputTensor.max();
	  const inputMin = inputTensor.min();  
	  const labelMax = labelTensor.max();
	  const labelMin = labelTensor.min();
	  const normalizedInputs = inputTensor.sub(inputMin).div(inputMax.sub(inputMin));
	  const normalizedLabels = labelTensor.sub(labelMin).div(labelMax.sub(labelMin));
	  return {
		inputs: normalizedInputs,
		labels: normalizedLabels,
		// Return the min/max bounds so we can use them later.
		inputMax,
		inputMin,
		labelMax,
		labelMin,
	  }
	});  
  }

export function testTF() {
	document.addEventListener('DOMContentLoaded', run);
	const model = createModel();  
	tfvis.show.modelSummary({name: 'Model Summary'}, model);
}