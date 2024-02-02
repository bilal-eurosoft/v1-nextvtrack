import { VehicleData } from '@/types/vehicle'

export default function countCars(
    carData: VehicleData[],
) {
    const speeds = carData?.map((car) => car.gps.speed);
    const ignitions = carData?.map((car) => car.ignition);
    const countParked = speeds.filter(
      (speed, index) => speed === 0 && ignitions[index] === 0
    ).length;
    const countMoving = speeds.filter(
      (speed, index) => speed > 0 && ignitions[index] === 1
    ).length;
    const countPause = carData?.length - (countParked + countMoving);
  return {countParked, countMoving,countPause}
}
