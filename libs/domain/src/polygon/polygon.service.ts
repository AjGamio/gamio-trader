// src/polygon-api/polygon-api.service.ts

import { Injectable } from '@nestjs/common';
import { EnvConfig } from 'apps/trade-server/src/config/env.config';
import axios from 'axios';

@Injectable()
export class PolygonApiService {
  private readonly baseUrl = 'https://api.polygon.ai/v1'; // Replace with the actual Polygon API base URL
  private readonly apiKey = EnvConfig.POLYGON_API_KEY; // Replace with your actual Polygon API key

  async getPolygonData(symbol: string): Promise<any> {
    const endpoint = `/stocks/${symbol}/details`; // Replace with the actual endpoint

    try {
      const response = await axios.get(`${this.baseUrl}${endpoint}`, {
        headers: { Authorization: `Bearer ${this.apiKey}` },
      });

      return response.data;
    } catch (error) {
      // Handle errors
      console.error(
        'Error fetching Polygon data:',
        error.response?.data || error.message,
      );
      throw error;
    }
  }
}
