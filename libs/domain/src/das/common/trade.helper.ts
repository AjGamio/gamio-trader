import {
  AverageWithMinMax,
  ITickerData,
} from 'gamio/domain/polygon/interfaces/iTickerData';
import { get } from 'lodash';

export const calculateVolumeChange = (aggregates: number[]) => {
  const firstVolume = aggregates[0];
  const lastVolume = aggregates[aggregates.length - 1];
  return ((lastVolume - firstVolume) / firstVolume) * 100;
};

export const calculatePriceChange = (aggregates: number[]) => {
  const firstPrice = aggregates[0];
  const lastPrice = aggregates[aggregates.length - 1];
  return ((lastPrice - firstPrice) / firstPrice) * 100;
};

export function calculateAverage(data: ITickerData[], property: string) {
  const dataArray = data.map((item) => get(item, property));

  if (dataArray.length === 0) {
    return 0;
  }

  const sum = dataArray.reduce((acc, val) => acc + val, 0);
  return sum / dataArray.length;
}

export function calculateAverageWithMinMax(
  data: ITickerData[],
  key: string,
): AverageWithMinMax {
  const values = data.map((item) => get(item, key));
  const average = calculateAverage(data, key);
  const min = Math.min(...values);
  const max = Math.max(...values);

  return { average, min, max };
}

export function calculateMinMax(
  data: ITickerData[],
  property: string,
): { min: number; max: number } {
  if (data.length === 0) {
    return { min: 0, max: 0 };
  }

  return data.reduce(
    (result, current) => {
      const value = current[property];

      if (result.min === null || value < result.min) {
        result.min = value;
      }

      if (result.max === null || value > result.max) {
        result.max = value;
      }

      return result;
    },
    { min: 0, max: 0 },
  );
}

export function generateNewOrderToken(): number {
  // Generate a random number between 100,000 (inclusive) and 999,999 (inclusive)
  return Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
}
