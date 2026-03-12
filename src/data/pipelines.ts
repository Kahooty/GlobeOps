/**
 * Major Pipelines — Static dataset for map overlay.
 *
 * ~30 strategically significant pipelines rendered as polylines.
 * Each pipeline is an array of [lon, lat] waypoints that approximate its route.
 * Sources: public domain energy infrastructure data.
 *
 * Coordinates: WGS84 [longitude, latitude]
 */

import type { Region } from '@/types';

export interface PipelineRoute {
  name: string;
  waypoints: [lon: number, lat: number][];
  region: Region;
  type: 'oil' | 'gas' | 'multi';
  status: 'active' | 'disrupted' | 'planned' | 'disputed';
  operator: string;
  minZoom: number;
}

export const PIPELINES: PipelineRoute[] = [
  // ═══════════════════════════════════════════════════════════
  // EUROPE — Gas supply routes
  // ═══════════════════════════════════════════════════════════
  {
    name: 'Nord Stream (damaged)',
    waypoints: [[30, 60], [22, 58], [14, 55]],
    region: 'EUROPE', type: 'gas', status: 'disrupted', operator: 'Gazprom', minZoom: 3,
  },
  {
    name: 'TurkStream',
    waypoints: [[37, 44], [33, 43], [30, 42], [28, 41]],
    region: 'EUROPE', type: 'gas', status: 'active', operator: 'Gazprom', minZoom: 4,
  },
  {
    name: 'Yamal-Europe',
    waypoints: [[68, 67], [55, 60], [40, 55], [28, 52], [20, 52], [14, 52]],
    region: 'EUROPE', type: 'gas', status: 'active', operator: 'Gazprom', minZoom: 4,
  },
  {
    name: 'Trans-Adriatic (TAP)',
    waypoints: [[41, 40], [26, 41], [21, 40], [18, 41], [16, 41]],
    region: 'EUROPE', type: 'gas', status: 'active', operator: 'TAP AG', minZoom: 5,
  },
  {
    name: 'Druzhba Oil',
    waypoints: [[52, 52], [38, 52], [30, 50], [22, 50], [15, 51]],
    region: 'EUROPE', type: 'oil', status: 'active', operator: 'Transneft', minZoom: 4,
  },
  {
    name: 'Norwegian Gas System',
    waypoints: [[2, 62], [3, 58], [3, 56], [1, 52]],
    region: 'EUROPE', type: 'gas', status: 'active', operator: 'Equinor', minZoom: 5,
  },

  // ═══════════════════════════════════════════════════════════
  // MIDDLE EAST — Oil export routes
  // ═══════════════════════════════════════════════════════════
  {
    name: 'East-West (Petroline)',
    waypoints: [[50, 26], [46, 24], [42, 23], [39, 22]],
    region: 'MIDDLE EAST', type: 'oil', status: 'active', operator: 'Saudi Aramco', minZoom: 4,
  },
  {
    name: 'Kirkuk-Ceyhan',
    waypoints: [[44, 35], [40, 37], [36, 37]],
    region: 'MIDDLE EAST', type: 'oil', status: 'active', operator: 'BOTAş', minZoom: 4,
  },
  {
    name: 'BTC Pipeline',
    waypoints: [[50, 40], [46, 41], [44, 42], [41, 41], [36, 37]],
    region: 'MIDDLE EAST', type: 'oil', status: 'active', operator: 'BP', minZoom: 4,
  },
  {
    name: 'IGAT (Iran Gas)',
    waypoints: [[52, 28], [52, 32], [52, 36], [48, 38]],
    region: 'MIDDLE EAST', type: 'gas', status: 'active', operator: 'NIGC', minZoom: 5,
  },

  // ═══════════════════════════════════════════════════════════
  // CENTRAL ASIA — Landlocked energy export routes
  // ═══════════════════════════════════════════════════════════
  {
    name: 'Central Asia-China Gas',
    waypoints: [[60, 40], [66, 42], [72, 42], [80, 40], [90, 38], [100, 36]],
    region: 'EAST ASIA', type: 'gas', status: 'active', operator: 'CNPC', minZoom: 4,
  },
  {
    name: 'ESPO Oil',
    waypoints: [[75, 56], [90, 54], [105, 52], [120, 48], [132, 43]],
    region: 'EAST ASIA', type: 'oil', status: 'active', operator: 'Transneft', minZoom: 4,
  },
  {
    name: 'Power of Siberia',
    waypoints: [[110, 52], [118, 48], [125, 45], [130, 43]],
    region: 'EAST ASIA', type: 'gas', status: 'active', operator: 'Gazprom', minZoom: 4,
  },

  // ═══════════════════════════════════════════════════════════
  // AFRICA
  // ═══════════════════════════════════════════════════════════
  {
    name: 'Trans-Saharan Gas (planned)',
    waypoints: [[3, 5], [3, 12], [2, 20], [1, 30], [0, 36]],
    region: 'AFRICA', type: 'gas', status: 'planned', operator: 'NNPC/Sonatrach', minZoom: 4,
  },
  {
    name: 'Sumed Pipeline',
    waypoints: [[33, 30], [31, 30], [30, 31]],
    region: 'AFRICA', type: 'oil', status: 'active', operator: 'SUMED', minZoom: 5,
  },
  {
    name: 'Chad-Cameroon',
    waypoints: [[18, 10], [14, 8], [10, 4]],
    region: 'AFRICA', type: 'oil', status: 'active', operator: 'COTCO', minZoom: 5,
  },

  // ═══════════════════════════════════════════════════════════
  // NORTH AMERICA
  // ═══════════════════════════════════════════════════════════
  {
    name: 'Keystone XL',
    waypoints: [[-110, 51], [-106, 48], [-100, 43], [-97, 37], [-97, 30]],
    region: 'NORTH AMERICA', type: 'oil', status: 'disputed', operator: 'TC Energy', minZoom: 4,
  },
  {
    name: 'Trans-Alaska',
    waypoints: [[-148, 70], [-146, 65], [-146, 61]],
    region: 'NORTH AMERICA', type: 'oil', status: 'active', operator: 'Alyeska', minZoom: 4,
  },
  {
    name: 'Colonial Pipeline',
    waypoints: [[-90, 30], [-85, 32], [-80, 34], [-76, 38], [-74, 40]],
    region: 'NORTH AMERICA', type: 'oil', status: 'active', operator: 'Colonial', minZoom: 5,
  },

  // ═══════════════════════════════════════════════════════════
  // SOUTH AMERICA
  // ═══════════════════════════════════════════════════════════
  {
    name: 'TGS Pipeline',
    waypoints: [[-70, -50], [-66, -42], [-60, -35]],
    region: 'SOUTH AMERICA', type: 'gas', status: 'active', operator: 'TGS', minZoom: 5,
  },

  // ═══════════════════════════════════════════════════════════
  // SOUTH ASIA
  // ═══════════════════════════════════════════════════════════
  {
    name: 'TAPI (planned)',
    waypoints: [[62, 36], [65, 34], [68, 30], [72, 26]],
    region: 'SOUTH ASIA', type: 'gas', status: 'planned', operator: 'TAPI Pipeline Co', minZoom: 5,
  },
  {
    name: 'India East-West Gas',
    waypoints: [[78, 16], [80, 18], [82, 22], [85, 25]],
    region: 'SOUTH ASIA', type: 'gas', status: 'active', operator: 'GAIL', minZoom: 5,
  },
];

// ─── Helpers ───

export function getPipelinesAtZoom(zoom: number): PipelineRoute[] {
  return PIPELINES.filter((p) => zoom >= p.minZoom);
}

export function getPipelinesByStatus(status: PipelineRoute['status']): PipelineRoute[] {
  return PIPELINES.filter((p) => p.status === status);
}
