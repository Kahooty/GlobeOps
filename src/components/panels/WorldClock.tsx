/**
 * WorldClock — Multi-timezone clock display.
 *
 * Shows current time across major geopolitical centers:
 * Washington, London, Brussels, Moscow, Riyadh, Beijing, Tokyo, Sydney.
 * ASCII-styled with day/night indicators and UTC offset.
 */

import { useMemo } from 'react';
import { TerminalWindow } from '@/components/terminal/TerminalWindow';
import { useClock } from '@/hooks/useClock';
import type { PanelStatus } from '@/types';

interface ClockZone {
  city: string;
  code: string;
  tz: string;
  region: string;
}

const ZONES: ClockZone[] = [
  { city: 'Washington', code: 'DC', tz: 'America/New_York', region: 'N.AMERICA' },
  { city: 'London', code: 'LON', tz: 'Europe/London', region: 'EUROPE' },
  { city: 'Brussels', code: 'BRU', tz: 'Europe/Brussels', region: 'EU/NATO' },
  { city: 'Moscow', code: 'MOW', tz: 'Europe/Moscow', region: 'RUSSIA' },
  { city: 'Riyadh', code: 'RUH', tz: 'Asia/Riyadh', region: 'MIDEAST' },
  { city: 'New Delhi', code: 'DEL', tz: 'Asia/Kolkata', region: 'S.ASIA' },
  { city: 'Beijing', code: 'PEK', tz: 'Asia/Shanghai', region: 'E.ASIA' },
  { city: 'Tokyo', code: 'TYO', tz: 'Asia/Tokyo', region: 'E.ASIA' },
  { city: 'Sydney', code: 'SYD', tz: 'Australia/Sydney', region: 'OCEANIA' },
];

function formatZoneTime(date: Date, tz: string): { time: string; hours: number; offset: string; day: string } {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const dayFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    weekday: 'short',
  });

  const offsetFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    timeZoneName: 'shortOffset',
  });

  const time = formatter.format(date);
  const day = dayFormatter.format(date).toUpperCase();

  // Extract hours for day/night
  const parts = formatter.formatToParts(date);
  const hourPart = parts.find((p) => p.type === 'hour');
  const hours = parseInt(hourPart?.value || '0', 10);

  // Extract UTC offset
  const offsetParts = offsetFormatter.formatToParts(date);
  const offsetPart = offsetParts.find((p) => p.type === 'timeZoneName');
  const offset = offsetPart?.value?.replace('GMT', 'UTC') || '';

  return { time, hours, offset, day };
}

function getDayNightSymbol(hours: number): { symbol: string; isDay: boolean } {
  if (hours >= 6 && hours < 18) return { symbol: '☀', isDay: true };
  if (hours >= 18 && hours < 21) return { symbol: '◐', isDay: false };
  if (hours >= 5 && hours < 6) return { symbol: '◑', isDay: false };
  return { symbol: '☾', isDay: false };
}

export function WorldClock() {
  const now = useClock(1000);
  const status: PanelStatus = 'live';

  const utcTime = useMemo(() => {
    return now.toISOString().slice(11, 19);
  }, [now]);

  const zoneData = useMemo(() => {
    return ZONES.map((zone) => {
      const { time, hours, offset, day } = formatZoneTime(now, zone.tz);
      const { symbol, isDay } = getDayNightSymbol(hours);
      return { ...zone, time, hours, offset, day, symbol, isDay };
    });
  }, [now]);

  return (
    <TerminalWindow
      title="WORLD CLOCK"
      status={status}
      headerRight={
        <span className="text-[9px] text-terminal-cyan font-bold">
          UTC {utcTime}
        </span>
      }
    >
      <div className="space-y-0.5 px-1">
        {/* Zone grid */}
        {zoneData.map((z) => (
          <div
            key={z.code}
            className="flex items-center gap-1 text-[9px] leading-tight py-0.5"
            style={{
              borderLeft: `2px solid ${z.isDay ? 'var(--color-terminal-amber)' : 'var(--color-terminal-cyan)'}`,
              paddingLeft: '6px',
              opacity: z.isDay ? 1 : 0.75,
            }}
          >
            {/* Day/night symbol */}
            <span className="w-3 text-center" style={{
              color: z.isDay ? 'var(--color-terminal-amber)' : 'var(--color-terminal-cyan)',
            }}>
              {z.symbol}
            </span>

            {/* City code */}
            <span className="w-[28px] font-bold text-terminal-primary">
              {z.code}
            </span>

            {/* Time */}
            <span className="w-[62px] font-mono text-terminal-primary tracking-wide">
              {z.time}
            </span>

            {/* Day */}
            <span className="w-[28px] text-terminal-primary-dim text-[8px]">
              {z.day}
            </span>

            {/* Region */}
            <span className="text-terminal-primary-dim text-[8px] flex-1 text-right">
              {z.region}
            </span>
          </div>
        ))}

        {/* UTC reference bar */}
        <div className="border-t border-terminal-border mt-1 pt-1 text-[8px] text-terminal-primary-dim flex justify-between">
          <span>ZULU TIME: {utcTime}</span>
          <span>{now.toISOString().slice(0, 10)}</span>
        </div>

        {/* Day/night legend */}
        <div className="flex items-center gap-3 text-[8px] text-terminal-primary-dim">
          <span><span className="text-terminal-amber">☀</span> DAY</span>
          <span><span className="text-terminal-cyan">◐</span> DUSK</span>
          <span><span className="text-terminal-cyan">☾</span> NIGHT</span>
        </div>
      </div>
    </TerminalWindow>
  );
}
