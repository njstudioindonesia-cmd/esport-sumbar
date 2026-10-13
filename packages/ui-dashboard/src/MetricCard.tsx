import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: string | number;
    label?: string;
    direction: 'up' | 'down' | 'neutral';
    isPositive?: boolean; // whether "up" is good or bad
  };
  accent?: 'amber' | 'emerald' | 'rose' | 'sky' | 'purple' | 'neutral';
  onClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  accent = 'amber',
  onClick,
}) => {
  const accentClasses = {
    amber: {
      border: 'hover:border-amber-500/40',
      iconBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      bar: 'bg-amber-500',
    },
    emerald: {
      border: 'hover:border-emerald-500/40',
      iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      bar: 'bg-emerald-500',
    },
    rose: {
      border: 'hover:border-rose-500/40',
      iconBg: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      bar: 'bg-rose-500',
    },
    sky: {
      border: 'hover:border-sky-500/40',
      iconBg: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
      bar: 'bg-sky-500',
    },
    purple: {
      border: 'hover:border-purple-500/40',
      iconBg: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      bar: 'bg-purple-500',
    },
    neutral: {
      border: 'hover:border-neutral-700',
      iconBg: 'bg-neutral-800 text-neutral-400 border-neutral-700',
      bar: 'bg-neutral-600',
    },
  }[accent];

  let trendColor = 'text-neutral-400 bg-neutral-800/40';
  if (trend) {
    const isGood =
      trend.isPositive !== undefined
        ? trend.isPositive
        : trend.direction === 'up';
    if (trend.direction === 'neutral') {
      trendColor = 'text-neutral-400 bg-neutral-800/60';
    } else if (isGood) {
      trendColor = 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20';
    } else {
      trendColor = 'text-rose-400 bg-rose-500/10 border border-rose-500/20';
    }
  }

  return (
    <div
      onClick={onClick}
      className={`relative bg-neutral-900 border border-neutral-800 rounded-xl p-5 shadow-sm transition-all duration-200 ${
        accentClasses.border
      } ${onClick ? 'cursor-pointer hover:bg-neutral-900/80 hover:-translate-y-0.5' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-neutral-400 tracking-wide uppercase">
            {title}
          </p>
          <div className="mt-2 text-2xl font-black text-neutral-100 tracking-tight">
            {value}
          </div>
        </div>
        {icon && (
          <div
            className={`p-2.5 rounded-lg border ${accentClasses.iconBg} shrink-0`}
          >
            {icon}
          </div>
        )}
      </div>

      {(trend || subtitle) && (
        <div className="mt-3 pt-3 border-t border-neutral-800/80 flex items-center justify-between text-xs">
          {trend ? (
            <div className="flex items-center gap-1.5">
              <span
                className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold ${trendColor}`}
              >
                {trend.direction === 'up' && <TrendingUp className="w-3 h-3" />}
                {trend.direction === 'down' && <TrendingDown className="w-3 h-3" />}
                {trend.direction === 'neutral' && <Minus className="w-3 h-3" />}
                {trend.value}
              </span>
              {trend.label && (
                <span className="text-[11px] text-neutral-500">{trend.label}</span>
              )}
            </div>
          ) : (
            <div />
          )}

          {subtitle && (
            <span className="text-[11px] text-neutral-500 truncate max-w-[50%]">
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
