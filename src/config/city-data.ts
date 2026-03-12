/**
 * Major World Cities — Geographic reference data for map labels.
 *
 * ~200 cities selected by geopolitical, economic, and strategic significance.
 * Each city has a minimum zoom level (minZoom) at which it appears:
 *   - Z:2  Mega-cities and geopolitical capitals (NYC, London, Beijing, Moscow)
 *   - Z:3  Major national capitals and regional hubs
 *   - Z:4  Secondary cities and important regional centers
 *   - Z:5  Notable cities for strategic/intelligence context
 *
 * Coordinates: WGS84 [longitude, latitude]
 */

import type { Region } from '@/types';

export interface CityData {
  name: string;
  coordinates: [lon: number, lat: number];
  country: string;       // ISO 3166-1 alpha-2
  region: Region;
  isCapital: boolean;
  minZoom: number;       // Minimum zoom level to display (2-5)
}

export const MAJOR_CITIES: CityData[] = [
  // ═══════════════════════════════════════════════════════════
  // TIER 1 — Global power centers (Z:2)
  // ═══════════════════════════════════════════════════════════
  { name: 'Washington DC', coordinates: [-77.0, 38.9], country: 'US', region: 'NORTH AMERICA', isCapital: true, minZoom: 2 },
  { name: 'New York', coordinates: [-74.0, 40.7], country: 'US', region: 'NORTH AMERICA', isCapital: false, minZoom: 2 },
  { name: 'London', coordinates: [-0.1, 51.5], country: 'GB', region: 'EUROPE', isCapital: true, minZoom: 2 },
  { name: 'Moscow', coordinates: [37.6, 55.8], country: 'RU', region: 'EAST ASIA', isCapital: true, minZoom: 2 },
  { name: 'Beijing', coordinates: [116.4, 39.9], country: 'CN', region: 'EAST ASIA', isCapital: true, minZoom: 2 },
  { name: 'Tokyo', coordinates: [139.7, 35.7], country: 'JP', region: 'EAST ASIA', isCapital: true, minZoom: 2 },
  { name: 'Delhi', coordinates: [77.2, 28.6], country: 'IN', region: 'SOUTH ASIA', isCapital: true, minZoom: 2 },
  { name: 'Paris', coordinates: [2.3, 48.9], country: 'FR', region: 'EUROPE', isCapital: true, minZoom: 2 },
  { name: 'Brussels', coordinates: [4.4, 50.8], country: 'BE', region: 'EUROPE', isCapital: true, minZoom: 2 },

  // ═══════════════════════════════════════════════════════════
  // TIER 2 — Major capitals & strategic cities (Z:3)
  // ═══════════════════════════════════════════════════════════

  // North America
  { name: 'Los Angeles', coordinates: [-118.2, 34.1], country: 'US', region: 'NORTH AMERICA', isCapital: false, minZoom: 3 },
  { name: 'Chicago', coordinates: [-87.6, 41.9], country: 'US', region: 'NORTH AMERICA', isCapital: false, minZoom: 3 },
  { name: 'Houston', coordinates: [-95.4, 29.8], country: 'US', region: 'NORTH AMERICA', isCapital: false, minZoom: 3 },
  { name: 'Ottawa', coordinates: [-75.7, 45.4], country: 'CA', region: 'NORTH AMERICA', isCapital: true, minZoom: 3 },
  { name: 'Toronto', coordinates: [-79.4, 43.7], country: 'CA', region: 'NORTH AMERICA', isCapital: false, minZoom: 3 },
  { name: 'Mexico City', coordinates: [-99.1, 19.4], country: 'MX', region: 'NORTH AMERICA', isCapital: true, minZoom: 3 },

  // Europe
  { name: 'Berlin', coordinates: [13.4, 52.5], country: 'DE', region: 'EUROPE', isCapital: true, minZoom: 3 },
  { name: 'Rome', coordinates: [12.5, 41.9], country: 'IT', region: 'EUROPE', isCapital: true, minZoom: 3 },
  { name: 'Madrid', coordinates: [-3.7, 40.4], country: 'ES', region: 'EUROPE', isCapital: true, minZoom: 3 },
  { name: 'Kyiv', coordinates: [30.5, 50.5], country: 'UA', region: 'EUROPE', isCapital: true, minZoom: 3 },
  { name: 'Warsaw', coordinates: [21.0, 52.2], country: 'PL', region: 'EUROPE', isCapital: true, minZoom: 3 },
  { name: 'Ankara', coordinates: [32.9, 39.9], country: 'TR', region: 'MIDDLE EAST', isCapital: true, minZoom: 3 },
  { name: 'Stockholm', coordinates: [18.1, 59.3], country: 'SE', region: 'EUROPE', isCapital: true, minZoom: 3 },
  { name: 'Oslo', coordinates: [10.8, 59.9], country: 'NO', region: 'EUROPE', isCapital: true, minZoom: 3 },
  { name: 'Helsinki', coordinates: [24.9, 60.2], country: 'FI', region: 'EUROPE', isCapital: true, minZoom: 3 },

  // Middle East
  { name: 'Tehran', coordinates: [51.4, 35.7], country: 'IR', region: 'MIDDLE EAST', isCapital: true, minZoom: 3 },
  { name: 'Riyadh', coordinates: [46.7, 24.7], country: 'SA', region: 'MIDDLE EAST', isCapital: true, minZoom: 3 },
  { name: 'Baghdad', coordinates: [44.4, 33.3], country: 'IQ', region: 'MIDDLE EAST', isCapital: true, minZoom: 3 },
  { name: 'Jerusalem', coordinates: [35.2, 31.8], country: 'IL', region: 'MIDDLE EAST', isCapital: true, minZoom: 3 },
  { name: 'Cairo', coordinates: [31.2, 30.0], country: 'EG', region: 'AFRICA', isCapital: true, minZoom: 3 },
  { name: 'Damascus', coordinates: [36.3, 33.5], country: 'SY', region: 'MIDDLE EAST', isCapital: true, minZoom: 3 },

  // Asia
  { name: 'Shanghai', coordinates: [121.5, 31.2], country: 'CN', region: 'EAST ASIA', isCapital: false, minZoom: 3 },
  { name: 'Seoul', coordinates: [127.0, 37.6], country: 'KR', region: 'EAST ASIA', isCapital: true, minZoom: 3 },
  { name: 'Singapore', coordinates: [103.8, 1.3], country: 'SG', region: 'EAST ASIA', isCapital: true, minZoom: 3 },
  { name: 'Taipei', coordinates: [121.6, 25.0], country: 'TW', region: 'EAST ASIA', isCapital: true, minZoom: 3 },
  { name: 'Mumbai', coordinates: [72.9, 19.1], country: 'IN', region: 'SOUTH ASIA', isCapital: false, minZoom: 3 },
  { name: 'Islamabad', coordinates: [73.0, 33.7], country: 'PK', region: 'SOUTH ASIA', isCapital: true, minZoom: 3 },
  { name: 'Kabul', coordinates: [69.2, 34.5], country: 'AF', region: 'SOUTH ASIA', isCapital: true, minZoom: 3 },
  { name: 'Bangkok', coordinates: [100.5, 13.8], country: 'TH', region: 'EAST ASIA', isCapital: true, minZoom: 3 },
  { name: 'Hanoi', coordinates: [105.8, 21.0], country: 'VN', region: 'EAST ASIA', isCapital: true, minZoom: 3 },
  { name: 'Pyongyang', coordinates: [125.8, 39.0], country: 'KP', region: 'EAST ASIA', isCapital: true, minZoom: 3 },

  // Africa
  { name: 'Nairobi', coordinates: [36.8, -1.3], country: 'KE', region: 'AFRICA', isCapital: true, minZoom: 3 },
  { name: 'Lagos', coordinates: [3.4, 6.5], country: 'NG', region: 'AFRICA', isCapital: false, minZoom: 3 },
  { name: 'Addis Ababa', coordinates: [38.7, 9.0], country: 'ET', region: 'AFRICA', isCapital: true, minZoom: 3 },
  { name: 'Pretoria', coordinates: [28.2, -25.7], country: 'ZA', region: 'AFRICA', isCapital: true, minZoom: 3 },
  { name: 'Khartoum', coordinates: [32.5, 15.6], country: 'SD', region: 'AFRICA', isCapital: true, minZoom: 3 },

  // South America
  { name: 'Brasília', coordinates: [-47.9, -15.8], country: 'BR', region: 'SOUTH AMERICA', isCapital: true, minZoom: 3 },
  { name: 'São Paulo', coordinates: [-46.6, -23.6], country: 'BR', region: 'SOUTH AMERICA', isCapital: false, minZoom: 3 },
  { name: 'Buenos Aires', coordinates: [-58.4, -34.6], country: 'AR', region: 'SOUTH AMERICA', isCapital: true, minZoom: 3 },
  { name: 'Bogotá', coordinates: [-74.1, 4.6], country: 'CO', region: 'SOUTH AMERICA', isCapital: true, minZoom: 3 },
  { name: 'Lima', coordinates: [-77.0, -12.0], country: 'PE', region: 'SOUTH AMERICA', isCapital: true, minZoom: 3 },

  // Oceania
  { name: 'Canberra', coordinates: [149.1, -35.3], country: 'AU', region: 'OCEANIA', isCapital: true, minZoom: 3 },
  { name: 'Sydney', coordinates: [151.2, -33.9], country: 'AU', region: 'OCEANIA', isCapital: false, minZoom: 3 },
  { name: 'Wellington', coordinates: [174.8, -41.3], country: 'NZ', region: 'OCEANIA', isCapital: true, minZoom: 3 },

  // ═══════════════════════════════════════════════════════════
  // TIER 3 — Important regional cities (Z:4)
  // ═══════════════════════════════════════════════════════════

  // North America
  { name: 'San Francisco', coordinates: [-122.4, 37.8], country: 'US', region: 'NORTH AMERICA', isCapital: false, minZoom: 4 },
  { name: 'Miami', coordinates: [-80.2, 25.8], country: 'US', region: 'NORTH AMERICA', isCapital: false, minZoom: 4 },
  { name: 'Seattle', coordinates: [-122.3, 47.6], country: 'US', region: 'NORTH AMERICA', isCapital: false, minZoom: 4 },
  { name: 'Dallas', coordinates: [-96.8, 32.8], country: 'US', region: 'NORTH AMERICA', isCapital: false, minZoom: 4 },
  { name: 'Denver', coordinates: [-104.9, 39.7], country: 'US', region: 'NORTH AMERICA', isCapital: false, minZoom: 4 },
  { name: 'Atlanta', coordinates: [-84.4, 33.7], country: 'US', region: 'NORTH AMERICA', isCapital: false, minZoom: 4 },
  { name: 'Boston', coordinates: [-71.1, 42.4], country: 'US', region: 'NORTH AMERICA', isCapital: false, minZoom: 4 },
  { name: 'Vancouver', coordinates: [-123.1, 49.3], country: 'CA', region: 'NORTH AMERICA', isCapital: false, minZoom: 4 },
  { name: 'Montréal', coordinates: [-73.6, 45.5], country: 'CA', region: 'NORTH AMERICA', isCapital: false, minZoom: 4 },
  { name: 'Havana', coordinates: [-82.4, 23.1], country: 'CU', region: 'NORTH AMERICA', isCapital: true, minZoom: 4 },
  { name: 'Guadalajara', coordinates: [-103.3, 20.7], country: 'MX', region: 'NORTH AMERICA', isCapital: false, minZoom: 4 },

  // Europe
  { name: 'Amsterdam', coordinates: [4.9, 52.4], country: 'NL', region: 'EUROPE', isCapital: true, minZoom: 4 },
  { name: 'Vienna', coordinates: [16.4, 48.2], country: 'AT', region: 'EUROPE', isCapital: true, minZoom: 4 },
  { name: 'Lisbon', coordinates: [-9.1, 38.7], country: 'PT', region: 'EUROPE', isCapital: true, minZoom: 4 },
  { name: 'Bucharest', coordinates: [26.1, 44.4], country: 'RO', region: 'EUROPE', isCapital: true, minZoom: 4 },
  { name: 'Budapest', coordinates: [19.0, 47.5], country: 'HU', region: 'EUROPE', isCapital: true, minZoom: 4 },
  { name: 'Prague', coordinates: [14.4, 50.1], country: 'CZ', region: 'EUROPE', isCapital: true, minZoom: 4 },
  { name: 'Dublin', coordinates: [-6.3, 53.3], country: 'IE', region: 'EUROPE', isCapital: true, minZoom: 4 },
  { name: 'Athens', coordinates: [23.7, 38.0], country: 'GR', region: 'EUROPE', isCapital: true, minZoom: 4 },
  { name: 'Zürich', coordinates: [8.5, 47.4], country: 'CH', region: 'EUROPE', isCapital: false, minZoom: 4 },
  { name: 'Frankfurt', coordinates: [8.7, 50.1], country: 'DE', region: 'EUROPE', isCapital: false, minZoom: 4 },
  { name: 'Munich', coordinates: [11.6, 48.1], country: 'DE', region: 'EUROPE', isCapital: false, minZoom: 4 },
  { name: 'Milan', coordinates: [9.2, 45.5], country: 'IT', region: 'EUROPE', isCapital: false, minZoom: 4 },
  { name: 'Barcelona', coordinates: [2.2, 41.4], country: 'ES', region: 'EUROPE', isCapital: false, minZoom: 4 },
  { name: 'Istanbul', coordinates: [29.0, 41.0], country: 'TR', region: 'MIDDLE EAST', isCapital: false, minZoom: 4 },
  { name: 'Minsk', coordinates: [27.6, 53.9], country: 'BY', region: 'EUROPE', isCapital: true, minZoom: 4 },
  { name: 'Belgrade', coordinates: [20.5, 44.8], country: 'RS', region: 'EUROPE', isCapital: true, minZoom: 4 },
  { name: 'Sofia', coordinates: [23.3, 42.7], country: 'BG', region: 'EUROPE', isCapital: true, minZoom: 4 },
  { name: 'Copenhagen', coordinates: [12.6, 55.7], country: 'DK', region: 'EUROPE', isCapital: true, minZoom: 4 },

  // Middle East
  { name: 'Dubai', coordinates: [55.3, 25.3], country: 'AE', region: 'MIDDLE EAST', isCapital: false, minZoom: 4 },
  { name: 'Abu Dhabi', coordinates: [54.4, 24.5], country: 'AE', region: 'MIDDLE EAST', isCapital: true, minZoom: 4 },
  { name: 'Tel Aviv', coordinates: [34.8, 32.1], country: 'IL', region: 'MIDDLE EAST', isCapital: false, minZoom: 4 },
  { name: 'Doha', coordinates: [51.5, 25.3], country: 'QA', region: 'MIDDLE EAST', isCapital: true, minZoom: 4 },
  { name: 'Amman', coordinates: [35.9, 31.9], country: 'JO', region: 'MIDDLE EAST', isCapital: true, minZoom: 4 },
  { name: 'Beirut', coordinates: [35.5, 33.9], country: 'LB', region: 'MIDDLE EAST', isCapital: true, minZoom: 4 },
  { name: "Sana'a", coordinates: [44.2, 15.4], country: 'YE', region: 'MIDDLE EAST', isCapital: true, minZoom: 4 },
  { name: 'Muscat', coordinates: [58.5, 23.6], country: 'OM', region: 'MIDDLE EAST', isCapital: true, minZoom: 4 },
  { name: 'Kuwait City', coordinates: [47.9, 29.4], country: 'KW', region: 'MIDDLE EAST', isCapital: true, minZoom: 4 },

  // Asia
  { name: 'Hong Kong', coordinates: [114.2, 22.3], country: 'CN', region: 'EAST ASIA', isCapital: false, minZoom: 4 },
  { name: 'Shenzhen', coordinates: [114.1, 22.5], country: 'CN', region: 'EAST ASIA', isCapital: false, minZoom: 4 },
  { name: 'Guangzhou', coordinates: [113.3, 23.1], country: 'CN', region: 'EAST ASIA', isCapital: false, minZoom: 4 },
  { name: 'Chengdu', coordinates: [104.1, 30.6], country: 'CN', region: 'EAST ASIA', isCapital: false, minZoom: 4 },
  { name: 'Wuhan', coordinates: [114.3, 30.6], country: 'CN', region: 'EAST ASIA', isCapital: false, minZoom: 4 },
  { name: 'Osaka', coordinates: [135.5, 34.7], country: 'JP', region: 'EAST ASIA', isCapital: false, minZoom: 4 },
  { name: 'Ulaanbaatar', coordinates: [106.9, 47.9], country: 'MN', region: 'EAST ASIA', isCapital: true, minZoom: 4 },
  { name: 'Nur-Sultan', coordinates: [71.4, 51.2], country: 'KZ', region: 'EAST ASIA', isCapital: true, minZoom: 4 },
  { name: 'Jakarta', coordinates: [106.8, -6.2], country: 'ID', region: 'OCEANIA', isCapital: true, minZoom: 4 },
  { name: 'Manila', coordinates: [121.0, 14.6], country: 'PH', region: 'EAST ASIA', isCapital: true, minZoom: 4 },
  { name: 'Kuala Lumpur', coordinates: [101.7, 3.1], country: 'MY', region: 'EAST ASIA', isCapital: true, minZoom: 4 },
  { name: 'Dhaka', coordinates: [90.4, 23.8], country: 'BD', region: 'SOUTH ASIA', isCapital: true, minZoom: 4 },
  { name: 'Colombo', coordinates: [79.9, 6.9], country: 'LK', region: 'SOUTH ASIA', isCapital: true, minZoom: 4 },
  { name: 'Bengaluru', coordinates: [77.6, 13.0], country: 'IN', region: 'SOUTH ASIA', isCapital: false, minZoom: 4 },
  { name: 'Karachi', coordinates: [67.0, 24.9], country: 'PK', region: 'SOUTH ASIA', isCapital: false, minZoom: 4 },
  { name: 'Yangon', coordinates: [96.2, 16.9], country: 'MM', region: 'SOUTH ASIA', isCapital: false, minZoom: 4 },
  { name: 'Ho Chi Minh', coordinates: [106.7, 10.8], country: 'VN', region: 'EAST ASIA', isCapital: false, minZoom: 4 },
  { name: 'Phnom Penh', coordinates: [104.9, 11.6], country: 'KH', region: 'EAST ASIA', isCapital: true, minZoom: 4 },

  // Africa
  { name: 'Johannesburg', coordinates: [28.0, -26.2], country: 'ZA', region: 'AFRICA', isCapital: false, minZoom: 4 },
  { name: 'Mogadishu', coordinates: [45.3, 2.0], country: 'SO', region: 'AFRICA', isCapital: true, minZoom: 4 },
  { name: 'Kinshasa', coordinates: [15.3, -4.3], country: 'CD', region: 'AFRICA', isCapital: true, minZoom: 4 },
  { name: 'Dar es Salaam', coordinates: [39.3, -6.8], country: 'TZ', region: 'AFRICA', isCapital: false, minZoom: 4 },
  { name: 'Abuja', coordinates: [7.5, 9.1], country: 'NG', region: 'AFRICA', isCapital: true, minZoom: 4 },
  { name: 'Luanda', coordinates: [13.2, -8.8], country: 'AO', region: 'AFRICA', isCapital: true, minZoom: 4 },
  { name: 'Algiers', coordinates: [3.1, 36.7], country: 'DZ', region: 'AFRICA', isCapital: true, minZoom: 4 },
  { name: 'Rabat', coordinates: [-6.8, 34.0], country: 'MA', region: 'AFRICA', isCapital: true, minZoom: 4 },
  { name: 'Tripoli', coordinates: [13.2, 32.9], country: 'LY', region: 'AFRICA', isCapital: true, minZoom: 4 },
  { name: 'Accra', coordinates: [-0.2, 5.6], country: 'GH', region: 'AFRICA', isCapital: true, minZoom: 4 },
  { name: 'Bamako', coordinates: [-8.0, 12.6], country: 'ML', region: 'AFRICA', isCapital: true, minZoom: 4 },

  // South America
  { name: 'Santiago', coordinates: [-70.7, -33.4], country: 'CL', region: 'SOUTH AMERICA', isCapital: true, minZoom: 4 },
  { name: 'Caracas', coordinates: [-66.9, 10.5], country: 'VE', region: 'SOUTH AMERICA', isCapital: true, minZoom: 4 },
  { name: 'Quito', coordinates: [-78.5, -0.2], country: 'EC', region: 'SOUTH AMERICA', isCapital: true, minZoom: 4 },
  { name: 'La Paz', coordinates: [-68.1, -16.5], country: 'BO', region: 'SOUTH AMERICA', isCapital: true, minZoom: 4 },
  { name: 'Montevideo', coordinates: [-56.2, -34.9], country: 'UY', region: 'SOUTH AMERICA', isCapital: true, minZoom: 4 },
  { name: 'Rio de Janeiro', coordinates: [-43.2, -22.9], country: 'BR', region: 'SOUTH AMERICA', isCapital: false, minZoom: 4 },

  // Oceania
  { name: 'Melbourne', coordinates: [145.0, -37.8], country: 'AU', region: 'OCEANIA', isCapital: false, minZoom: 4 },
  { name: 'Brisbane', coordinates: [153.0, -27.5], country: 'AU', region: 'OCEANIA', isCapital: false, minZoom: 4 },
  { name: 'Perth', coordinates: [115.9, -32.0], country: 'AU', region: 'OCEANIA', isCapital: false, minZoom: 4 },
  { name: 'Auckland', coordinates: [174.8, -36.9], country: 'NZ', region: 'OCEANIA', isCapital: false, minZoom: 4 },

  // ═══════════════════════════════════════════════════════════
  // TIER 4 — Strategic & intelligence-relevant cities (Z:5)
  // ═══════════════════════════════════════════════════════════

  // North America
  { name: 'Norfolk', coordinates: [-76.3, 36.8], country: 'US', region: 'NORTH AMERICA', isCapital: false, minZoom: 5 },
  { name: 'San Diego', coordinates: [-117.2, 32.7], country: 'US', region: 'NORTH AMERICA', isCapital: false, minZoom: 5 },
  { name: 'Honolulu', coordinates: [-157.9, 21.3], country: 'US', region: 'NORTH AMERICA', isCapital: false, minZoom: 5 },
  { name: 'Phoenix', coordinates: [-112.1, 33.4], country: 'US', region: 'NORTH AMERICA', isCapital: false, minZoom: 5 },
  { name: 'Detroit', coordinates: [-83.0, 42.3], country: 'US', region: 'NORTH AMERICA', isCapital: false, minZoom: 5 },
  { name: 'Minneapolis', coordinates: [-93.3, 44.9], country: 'US', region: 'NORTH AMERICA', isCapital: false, minZoom: 5 },
  { name: 'Philadelphia', coordinates: [-75.2, 40.0], country: 'US', region: 'NORTH AMERICA', isCapital: false, minZoom: 5 },
  { name: 'Calgary', coordinates: [-114.1, 51.0], country: 'CA', region: 'NORTH AMERICA', isCapital: false, minZoom: 5 },
  { name: 'Edmonton', coordinates: [-113.5, 53.5], country: 'CA', region: 'NORTH AMERICA', isCapital: false, minZoom: 5 },
  { name: 'Monterrey', coordinates: [-100.3, 25.7], country: 'MX', region: 'NORTH AMERICA', isCapital: false, minZoom: 5 },
  { name: 'Tijuana', coordinates: [-117.0, 32.5], country: 'MX', region: 'NORTH AMERICA', isCapital: false, minZoom: 5 },

  // Europe
  { name: 'Hamburg', coordinates: [10.0, 53.6], country: 'DE', region: 'EUROPE', isCapital: false, minZoom: 5 },
  { name: 'Marseille', coordinates: [5.4, 43.3], country: 'FR', region: 'EUROPE', isCapital: false, minZoom: 5 },
  { name: 'Lyon', coordinates: [4.8, 45.8], country: 'FR', region: 'EUROPE', isCapital: false, minZoom: 5 },
  { name: 'Naples', coordinates: [14.3, 40.8], country: 'IT', region: 'EUROPE', isCapital: false, minZoom: 5 },
  { name: 'Gdańsk', coordinates: [18.6, 54.4], country: 'PL', region: 'EUROPE', isCapital: false, minZoom: 5 },
  { name: 'Kraków', coordinates: [19.9, 50.1], country: 'PL', region: 'EUROPE', isCapital: false, minZoom: 5 },
  { name: 'Odesa', coordinates: [30.7, 46.5], country: 'UA', region: 'EUROPE', isCapital: false, minZoom: 5 },
  { name: 'Kharkiv', coordinates: [36.2, 50.0], country: 'UA', region: 'EUROPE', isCapital: false, minZoom: 5 },
  { name: 'St Petersburg', coordinates: [30.3, 59.9], country: 'RU', region: 'EAST ASIA', isCapital: false, minZoom: 5 },
  { name: 'Reykjavik', coordinates: [-22.0, 64.1], country: 'IS', region: 'EUROPE', isCapital: true, minZoom: 5 },
  { name: 'Edinburgh', coordinates: [-3.2, 55.9], country: 'GB', region: 'EUROPE', isCapital: false, minZoom: 5 },
  { name: 'Manchester', coordinates: [-2.2, 53.5], country: 'GB', region: 'EUROPE', isCapital: false, minZoom: 5 },
  { name: 'Geneva', coordinates: [6.1, 46.2], country: 'CH', region: 'EUROPE', isCapital: false, minZoom: 5 },
  { name: 'Bratislava', coordinates: [17.1, 48.1], country: 'SK', region: 'EUROPE', isCapital: true, minZoom: 5 },
  { name: 'Zagreb', coordinates: [16.0, 45.8], country: 'HR', region: 'EUROPE', isCapital: true, minZoom: 5 },
  { name: 'Tallinn', coordinates: [24.7, 59.4], country: 'EE', region: 'EUROPE', isCapital: true, minZoom: 5 },
  { name: 'Riga', coordinates: [24.1, 56.9], country: 'LV', region: 'EUROPE', isCapital: true, minZoom: 5 },
  { name: 'Vilnius', coordinates: [25.3, 54.7], country: 'LT', region: 'EUROPE', isCapital: true, minZoom: 5 },

  // Middle East
  { name: 'Mosul', coordinates: [43.1, 36.3], country: 'IQ', region: 'MIDDLE EAST', isCapital: false, minZoom: 5 },
  { name: 'Basra', coordinates: [47.8, 30.5], country: 'IQ', region: 'MIDDLE EAST', isCapital: false, minZoom: 5 },
  { name: 'Aleppo', coordinates: [37.2, 36.2], country: 'SY', region: 'MIDDLE EAST', isCapital: false, minZoom: 5 },
  { name: 'Isfahan', coordinates: [51.7, 32.7], country: 'IR', region: 'MIDDLE EAST', isCapital: false, minZoom: 5 },
  { name: 'Jeddah', coordinates: [39.2, 21.5], country: 'SA', region: 'MIDDLE EAST', isCapital: false, minZoom: 5 },
  { name: 'Mecca', coordinates: [39.8, 21.4], country: 'SA', region: 'MIDDLE EAST', isCapital: false, minZoom: 5 },
  { name: 'Aden', coordinates: [45.0, 12.8], country: 'YE', region: 'MIDDLE EAST', isCapital: false, minZoom: 5 },
  { name: 'Baku', coordinates: [49.9, 40.4], country: 'AZ', region: 'MIDDLE EAST', isCapital: true, minZoom: 5 },
  { name: 'Tbilisi', coordinates: [44.8, 41.7], country: 'GE', region: 'MIDDLE EAST', isCapital: true, minZoom: 5 },
  { name: 'Yerevan', coordinates: [44.5, 40.2], country: 'AM', region: 'MIDDLE EAST', isCapital: true, minZoom: 5 },

  // Asia
  { name: 'Vladivostok', coordinates: [131.9, 43.1], country: 'RU', region: 'EAST ASIA', isCapital: false, minZoom: 5 },
  { name: 'Novosibirsk', coordinates: [82.9, 55.0], country: 'RU', region: 'EAST ASIA', isCapital: false, minZoom: 5 },
  { name: 'Nanjing', coordinates: [118.8, 32.1], country: 'CN', region: 'EAST ASIA', isCapital: false, minZoom: 5 },
  { name: 'Xi\'an', coordinates: [108.9, 34.3], country: 'CN', region: 'EAST ASIA', isCapital: false, minZoom: 5 },
  { name: 'Tianjin', coordinates: [117.2, 39.1], country: 'CN', region: 'EAST ASIA', isCapital: false, minZoom: 5 },
  { name: 'Busan', coordinates: [129.1, 35.2], country: 'KR', region: 'EAST ASIA', isCapital: false, minZoom: 5 },
  { name: 'Nagoya', coordinates: [136.9, 35.2], country: 'JP', region: 'EAST ASIA', isCapital: false, minZoom: 5 },
  { name: 'Chennai', coordinates: [80.3, 13.1], country: 'IN', region: 'SOUTH ASIA', isCapital: false, minZoom: 5 },
  { name: 'Kolkata', coordinates: [88.4, 22.6], country: 'IN', region: 'SOUTH ASIA', isCapital: false, minZoom: 5 },
  { name: 'Hyderabad', coordinates: [78.5, 17.4], country: 'IN', region: 'SOUTH ASIA', isCapital: false, minZoom: 5 },
  { name: 'Lahore', coordinates: [74.3, 31.5], country: 'PK', region: 'SOUTH ASIA', isCapital: false, minZoom: 5 },
  { name: 'Tashkent', coordinates: [69.2, 41.3], country: 'UZ', region: 'EAST ASIA', isCapital: true, minZoom: 5 },
  { name: 'Surabaya', coordinates: [112.8, -7.3], country: 'ID', region: 'OCEANIA', isCapital: false, minZoom: 5 },

  // Africa
  { name: 'Cape Town', coordinates: [18.4, -34.0], country: 'ZA', region: 'AFRICA', isCapital: false, minZoom: 5 },
  { name: 'Maputo', coordinates: [32.6, -25.9], country: 'MZ', region: 'AFRICA', isCapital: true, minZoom: 5 },
  { name: 'Dakar', coordinates: [-17.4, 14.7], country: 'SN', region: 'AFRICA', isCapital: true, minZoom: 5 },
  { name: 'Tunis', coordinates: [10.2, 36.8], country: 'TN', region: 'AFRICA', isCapital: true, minZoom: 5 },
  { name: 'Kampala', coordinates: [32.6, 0.3], country: 'UG', region: 'AFRICA', isCapital: true, minZoom: 5 },
  { name: 'Kigali', coordinates: [29.9, -1.9], country: 'RW', region: 'AFRICA', isCapital: true, minZoom: 5 },
  { name: 'Djibouti', coordinates: [43.1, 11.6], country: 'DJ', region: 'AFRICA', isCapital: true, minZoom: 5 },
  { name: 'N\'Djamena', coordinates: [15.0, 12.1], country: 'TD', region: 'AFRICA', isCapital: true, minZoom: 5 },
  { name: 'Harare', coordinates: [31.0, -17.8], country: 'ZW', region: 'AFRICA', isCapital: true, minZoom: 5 },

  // South America
  { name: 'Medellín', coordinates: [-75.6, 6.2], country: 'CO', region: 'SOUTH AMERICA', isCapital: false, minZoom: 5 },
  { name: 'Asunción', coordinates: [-57.6, -25.3], country: 'PY', region: 'SOUTH AMERICA', isCapital: true, minZoom: 5 },
  { name: 'Guayaquil', coordinates: [-79.9, -2.2], country: 'EC', region: 'SOUTH AMERICA', isCapital: false, minZoom: 5 },
  { name: 'Manaus', coordinates: [-60.0, -3.1], country: 'BR', region: 'SOUTH AMERICA', isCapital: false, minZoom: 5 },
  { name: 'Recife', coordinates: [-34.9, -8.1], country: 'BR', region: 'SOUTH AMERICA', isCapital: false, minZoom: 5 },
  { name: 'Salvador', coordinates: [-38.5, -12.9], country: 'BR', region: 'SOUTH AMERICA', isCapital: false, minZoom: 5 },

  // Oceania
  { name: 'Adelaide', coordinates: [138.6, -34.9], country: 'AU', region: 'OCEANIA', isCapital: false, minZoom: 5 },
  { name: 'Darwin', coordinates: [130.8, -12.5], country: 'AU', region: 'OCEANIA', isCapital: false, minZoom: 5 },
  { name: 'Port Moresby', coordinates: [147.2, -9.5], country: 'PG', region: 'OCEANIA', isCapital: true, minZoom: 5 },
];

// ─── Helpers ───

/** Get cities visible at a given zoom level */
export function getCitiesAtZoom(zoom: number): CityData[] {
  return MAJOR_CITIES.filter((c) => zoom >= c.minZoom);
}

/** Get cities in a specific region */
export function getCitiesByRegion(region: Region): CityData[] {
  return MAJOR_CITIES.filter((c) => c.region === region);
}

/** Get capital cities only */
export function getCapitals(): CityData[] {
  return MAJOR_CITIES.filter((c) => c.isCapital);
}

/** Total count */
export const CITY_COUNT = MAJOR_CITIES.length;
