import { Car } from "../../objects/Car";
import { DistanceSensor } from "./CarSensor";

export class AutoCar{
	// 状态空间的个数。例如射线个数*射线维度
	states=0;
	sensors:DistanceSensor[];
	phycar:Car;// = new Car();
	updateSensors() {
		var data = new Float64Array(this.states)
		for (var i = 0, k = 0; i < this.sensors.length; k += this.sensors[i].dimensions, i++) {
			this.sensors[i].update()
			data.set(this.sensors[i].read(), k)
		}
	
		if (k !== this.states) {
			throw 'unexpected';
		}
	
		this.drawSensors()
	
		return data
	};
	
}