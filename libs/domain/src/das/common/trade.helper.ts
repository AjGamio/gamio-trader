import {
  AverageWithMinMax,
  ITickerData,
} from 'gamio/domain/polygon/interfaces/iTickerData';
import { TradeStatus } from 'gamio/domain/trade-bot/tradeBotOder.entity';
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

/**
 * Get the enum value for a given string value.
 *
 * @param {string} stringValue - The string value to look up.
 * @returns {TradeStatus | undefined} - The corresponding enum value or undefined if not found.
 */
export function getTradeStatusFromString(
  stringValue: string,
): TradeStatus | undefined {
  return Object.values(TradeStatus).find(
    (enumValue) => enumValue === stringValue,
  ) as TradeStatus | undefined;
}

/**
 * Generates a random bot name.
 * @returns {string} A randomly generated bot name.
 */
export function generateBotName(): string {
  /** @type {string[]} Array of adjectives for generating bot names */
  const adjectives = [
    'Alpha',
    'Beta',
    'Gamma',
    'Delta',
    'Omega',
    'Spartan',
    'Titan',
    'Phoenix',
    'Galactic',
    'Cosmic',
  ];
  /** @type {string[]} Array of nouns for generating bot names */
  const nouns: string[] = [
    'Trader',
    'Investor',
    'Bot',
    'Algorithm',
    'Executor',
    'Strategist',
    'Quant',
    'Machine',
    'AI',
    'Engine',
  ];

  /** @type {string} Randomly selected adjective */
  const randomAdjective: string =
    adjectives[Math.floor(Math.random() * adjectives.length)];
  /** @type {string} Randomly selected noun */
  const randomNoun: string = nouns[Math.floor(Math.random() * nouns.length)];

  /** @type {string} The generated bot name */
  return `${randomAdjective} ${randomNoun}`;
}

/**
 * Returns the current timestamp in nanoseconds.
 * @returns {number} The current timestamp in nanoseconds.
 */
export function getCurrentTimestampInNanoseconds(): number {
  // Get current time in milliseconds
  const currentTime = Date.now();
  // Calculate the time 30 minutes ago in milliseconds
  // const thirtyMinutesAgo = currentTime - 30 * 60 * 1000; // 15 minutes in milliseconds
  // Convert milliseconds to nanoseconds (1 second = 1e9 nanoseconds)
  return currentTime * 1e6;
}
