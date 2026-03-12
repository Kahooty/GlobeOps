/**
 * Simplified world map SVG path data for terminal-styled visualization.
 * Equirectangular projection mapped to viewBox "0 0 1000 500".
 *
 * Coordinate system:
 *   x: 0 = -180° lon, 1000 = +180° lon
 *   y: 0 = +90° lat (north), 500 = -90° lat (south)
 *
 * Convert lon/lat to SVG coords:
 *   svgX = ((lon + 180) / 360) * 1000
 *   svgY = ((90 - lat) / 180) * 500
 *
 * Paths are simplified from Natural Earth 110m (public domain).
 * Grouped by region for interactive highlighting.
 */

import type { Region } from '@/types';

export const SVG_WIDTH = 1000;
export const SVG_HEIGHT = 500;

export interface RegionPathData {
  region: Region;
  paths: string[];
  labelPosition: [lon: number, lat: number];
}

/** Convert lon/lat to SVG viewBox coordinates */
export function lonLatToSvg(lon: number, lat: number): { x: number; y: number } {
  return {
    x: ((lon + 180) / 360) * SVG_WIDTH,
    y: ((90 - lat) / 180) * SVG_HEIGHT,
  };
}

/** Convert lon/lat to percentage for absolute positioning over the SVG */
export function lonLatToPercent(lon: number, lat: number): { left: string; top: string } {
  return {
    left: `${((lon + 180) / 360) * 100}%`,
    top: `${((90 - lat) / 180) * 100}%`,
  };
}

// ─── Simplified Continent/Region Path Data ───
// Each path is a simplified outline in SVG viewBox coordinates (0-1000 x, 0-500 y)

export const WORLD_REGIONS: RegionPathData[] = [
  {
    region: 'NORTH AMERICA',
    labelPosition: [-100, 45],
    paths: [
      // North America mainland (Canada + USA + Mexico)
      'M 40 38 L 55 32 L 75 28 L 92 25 L 110 22 L 130 20 L 148 22 L 160 28 L 168 35 L 172 45 L 175 55 L 178 62 L 185 68 L 190 72 L 195 78 L 200 85 L 198 92 L 192 98 L 188 105 L 182 112 L 178 118 L 172 122 L 165 128 L 158 135 L 150 140 L 142 145 L 135 148 L 128 152 L 120 155 L 115 158 L 110 162 L 105 168 L 100 172 L 95 175 L 88 178 L 82 182 L 78 188 L 75 192 L 70 195 L 65 198 L 60 200 L 55 198 L 50 195 L 48 190 L 45 185 L 42 180 L 38 175 L 35 170 L 32 165 L 30 160 L 28 155 L 25 150 L 22 145 L 20 140 L 18 135 L 15 128 L 12 120 L 10 112 L 8 105 L 10 95 L 12 88 L 15 80 L 18 72 L 22 65 L 25 58 L 28 52 L 32 48 L 35 42 L 40 38 Z',
      // Greenland
      'M 285 28 L 295 22 L 310 18 L 325 20 L 335 25 L 340 32 L 338 42 L 332 50 L 322 55 L 310 58 L 298 55 L 290 48 L 285 40 L 285 28 Z',
      // Alaska
      'M 18 62 L 25 55 L 35 50 L 45 48 L 55 50 L 60 55 L 55 62 L 45 68 L 35 70 L 25 68 L 18 62 Z',
    ],
  },
  {
    region: 'SOUTH AMERICA',
    labelPosition: [-58, -15],
    paths: [
      // South America mainland
      'M 185 200 L 192 195 L 198 192 L 205 190 L 212 192 L 218 195 L 225 198 L 230 202 L 235 208 L 238 215 L 240 222 L 242 230 L 244 238 L 245 248 L 244 258 L 242 268 L 240 278 L 238 288 L 235 298 L 230 308 L 225 318 L 220 325 L 215 332 L 210 338 L 205 342 L 200 348 L 195 352 L 192 358 L 190 365 L 188 372 L 185 378 L 182 385 L 178 390 L 175 395 L 172 398 L 168 400 L 165 398 L 168 392 L 170 385 L 172 378 L 175 370 L 178 362 L 180 355 L 182 348 L 180 340 L 178 332 L 175 325 L 172 318 L 168 310 L 165 302 L 162 295 L 160 288 L 158 280 L 158 272 L 160 265 L 162 258 L 165 250 L 168 242 L 170 235 L 172 228 L 175 220 L 178 212 L 180 205 L 185 200 Z',
    ],
  },
  {
    region: 'EUROPE',
    labelPosition: [15, 50],
    paths: [
      // Europe mainland
      'M 468 68 L 475 62 L 482 58 L 490 55 L 498 52 L 505 50 L 512 48 L 520 48 L 528 50 L 535 52 L 540 55 L 545 58 L 548 62 L 552 68 L 555 72 L 558 78 L 556 82 L 552 88 L 548 92 L 545 98 L 542 102 L 538 108 L 535 112 L 530 115 L 525 118 L 520 120 L 515 122 L 510 125 L 505 128 L 500 130 L 495 132 L 490 130 L 485 128 L 480 125 L 478 120 L 475 115 L 472 110 L 468 105 L 465 100 L 462 95 L 460 90 L 458 85 L 460 80 L 462 75 L 465 72 L 468 68 Z',
      // Scandinavia
      'M 502 28 L 510 25 L 518 28 L 525 32 L 530 38 L 528 45 L 522 50 L 515 48 L 508 45 L 505 40 L 502 35 L 502 28 Z',
      // British Isles
      'M 458 68 L 462 62 L 468 60 L 472 62 L 470 68 L 465 72 L 460 70 L 458 68 Z',
      // Italy boot
      'M 510 125 L 515 130 L 518 135 L 515 140 L 510 138 L 508 132 L 510 125 Z',
    ],
  },
  {
    region: 'MIDDLE EAST',
    labelPosition: [45, 28],
    paths: [
      // Arabian Peninsula + Middle East
      'M 558 128 L 565 125 L 572 122 L 580 120 L 588 118 L 595 120 L 600 125 L 605 130 L 608 135 L 610 140 L 608 148 L 605 155 L 600 160 L 595 165 L 588 168 L 580 170 L 575 172 L 568 170 L 562 168 L 558 165 L 555 160 L 552 155 L 550 148 L 548 142 L 550 135 L 555 130 L 558 128 Z',
      // Turkey
      'M 548 92 L 555 88 L 562 85 L 570 82 L 578 85 L 582 90 L 580 95 L 575 98 L 568 100 L 560 102 L 555 100 L 550 98 L 548 92 Z',
    ],
  },
  {
    region: 'AFRICA',
    labelPosition: [20, 5],
    paths: [
      // Africa mainland
      'M 462 145 L 468 140 L 475 138 L 482 135 L 490 132 L 498 130 L 505 128 L 510 130 L 515 135 L 520 140 L 525 148 L 530 155 L 535 162 L 540 170 L 545 178 L 548 185 L 550 192 L 552 200 L 555 208 L 558 218 L 560 228 L 562 238 L 560 248 L 558 258 L 555 268 L 552 278 L 548 288 L 542 298 L 535 308 L 528 315 L 520 320 L 512 325 L 505 328 L 498 330 L 492 328 L 488 322 L 485 315 L 482 308 L 480 300 L 478 292 L 475 285 L 472 278 L 468 270 L 465 262 L 462 255 L 460 248 L 458 240 L 455 232 L 452 225 L 450 218 L 448 210 L 448 202 L 450 195 L 452 188 L 455 180 L 458 172 L 460 165 L 462 158 L 462 150 L 462 145 Z',
      // Madagascar
      'M 568 305 L 572 298 L 575 305 L 578 312 L 575 318 L 572 322 L 568 318 L 568 312 L 568 305 Z',
    ],
  },
  {
    region: 'SOUTH ASIA',
    labelPosition: [78, 22],
    paths: [
      // Indian subcontinent
      'M 610 102 L 618 98 L 625 95 L 632 98 L 638 102 L 642 108 L 645 115 L 648 122 L 650 128 L 652 135 L 655 142 L 652 150 L 648 158 L 645 165 L 640 172 L 635 178 L 630 182 L 625 178 L 620 172 L 615 165 L 612 158 L 610 150 L 608 142 L 605 135 L 602 128 L 600 120 L 602 112 L 605 108 L 610 102 Z',
      // Sri Lanka
      'M 638 185 L 642 182 L 645 185 L 642 190 L 638 188 L 638 185 Z',
    ],
  },
  {
    region: 'EAST ASIA',
    labelPosition: [115, 35],
    paths: [
      // China + Central/East Asia
      'M 655 55 L 665 50 L 675 48 L 688 50 L 700 52 L 712 55 L 722 58 L 730 62 L 738 68 L 742 75 L 745 82 L 748 88 L 750 95 L 748 102 L 745 108 L 742 115 L 738 120 L 732 125 L 725 128 L 718 130 L 710 132 L 702 130 L 695 128 L 688 125 L 682 120 L 678 115 L 672 110 L 668 105 L 665 100 L 662 95 L 658 90 L 655 85 L 652 78 L 650 72 L 648 65 L 650 58 L 655 55 Z',
      // Japan
      'M 762 72 L 768 68 L 772 72 L 775 78 L 778 85 L 775 92 L 772 98 L 768 102 L 765 108 L 762 102 L 760 95 L 758 88 L 760 82 L 762 72 Z',
      // Korean Peninsula
      'M 748 78 L 752 72 L 756 75 L 758 82 L 755 88 L 752 92 L 748 88 L 748 78 Z',
      // Southeast Asia
      'M 710 135 L 718 132 L 725 135 L 732 138 L 738 142 L 742 148 L 740 155 L 735 160 L 728 165 L 720 168 L 712 170 L 705 168 L 698 165 L 695 158 L 698 150 L 702 145 L 708 140 L 710 135 Z',
      // Philippines
      'M 755 148 L 760 145 L 762 150 L 760 158 L 755 155 L 755 148 Z',
      // Taiwan
      'M 752 115 L 755 112 L 758 115 L 756 120 L 752 118 L 752 115 Z',
    ],
  },
  {
    region: 'OCEANIA',
    labelPosition: [135, -25],
    paths: [
      // Australia
      'M 745 275 L 755 268 L 768 262 L 782 258 L 795 260 L 808 265 L 818 272 L 825 280 L 830 290 L 832 300 L 828 310 L 822 318 L 815 325 L 808 330 L 798 332 L 788 330 L 778 325 L 770 320 L 762 315 L 755 310 L 750 302 L 748 295 L 745 288 L 745 280 L 745 275 Z',
      // New Zealand
      'M 852 325 L 858 320 L 862 325 L 860 332 L 855 338 L 850 342 L 848 338 L 850 332 L 852 325 Z',
      // Papua New Guinea
      'M 808 218 L 818 215 L 828 218 L 835 222 L 832 228 L 825 232 L 818 230 L 812 228 L 808 222 L 808 218 Z',
      // Indonesia archipelago
      'M 718 195 L 728 192 L 738 195 L 748 198 L 758 200 L 768 202 L 778 205 L 788 208 L 795 212 L 790 218 L 782 220 L 772 218 L 762 215 L 752 212 L 742 210 L 732 208 L 722 205 L 715 202 L 718 195 Z',
    ],
  },
];

/** Graticule lines for visual reference (optional overlay) */
export const GRATICULE_LONS = [-120, -60, 0, 60, 120]; // every 60°
export const GRATICULE_LATS = [60, 30, 0, -30, -60]; // every 30°
