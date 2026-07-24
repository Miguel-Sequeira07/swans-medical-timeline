/**
 * Small inline icon set, hand-drawn as plain SVG paths — same convention
 * as CaseAssistant's ChatIcon/CloseIcon (24x24 viewBox, currentColor
 * stroke, round caps/joins) so every icon in the app reads as one
 * family instead of a mix of emoji and font glyphs.
 */

interface IconProps {
  className?: string;
}

const DEFAULT_SIZE = "h-4 w-4";

function outline(children: React.ReactNode, className: string) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export function MoonIcon({ className = DEFAULT_SIZE }: IconProps) {
  return outline(<path d="M20 14.3A8.5 8.5 0 1 1 9.7 4a6.5 6.5 0 0 0 10.3 10.3z" />, className);
}

export function SunIcon({ className = DEFAULT_SIZE }: IconProps) {
  return outline(
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2.2M12 19.8V22M4.9 4.9l1.55 1.55M17.55 17.55 19.1 19.1M2 12h2.2M19.8 12H22M4.9 19.1l1.55-1.55M17.55 6.45 19.1 4.9" />
    </>,
    className
  );
}

export function FlagIcon({ className = DEFAULT_SIZE }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M5.5 2.75a.75.75 0 0 1 .75.75v.34c1.7-.62 3.4-.55 5.1.07 1.86.68 3.7.68 5.55-.06a.75.75 0 0 1 1.02.7v9.1a.75.75 0 0 1-.48.7c-2.13.83-4.24.83-6.36 0a7.3 7.3 0 0 0-4.83-.07V21.5a.75.75 0 0 1-1.5 0V3.5a.75.75 0 0 1 .75-.75z" />
    </svg>
  );
}

export function DiamondIcon({ className = DEFAULT_SIZE }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2.5 21 12l-9 9.5-9-9.5 9-9.5z" />
    </svg>
  );
}

export function StarIcon({ className = DEFAULT_SIZE }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2.5 14.8 8.3 21.2 9.2 16.6 13.6 17.7 20 12 16.9 6.3 20 7.4 13.6 2.8 9.2 9.2 8.3 12 2.5z" />
    </svg>
  );
}

export function ExternalLinkIcon({ className = DEFAULT_SIZE }: IconProps) {
  return outline(
    <>
      <path d="M7 17 17 7" />
      <path d="M8.5 7H17v8.5" />
    </>,
    className
  );
}

export function ChevronLeftIcon({ className = DEFAULT_SIZE }: IconProps) {
  return outline(<path d="M15 6 9 12l6 6" />, className);
}

export function ChevronRightIcon({ className = DEFAULT_SIZE }: IconProps) {
  return outline(<path d="M9 6l6 6-6 6" />, className);
}

export function ChevronDownIcon({ className = DEFAULT_SIZE }: IconProps) {
  return outline(<path d="M6 9l6 6 6-6" />, className);
}

export function ChevronUpIcon({ className = DEFAULT_SIZE }: IconProps) {
  return outline(<path d="M18 15l-6-6-6 6" />, className);
}

export function SwapIcon({ className = DEFAULT_SIZE }: IconProps) {
  return outline(
    <>
      <path d="M7 4 3 8l4 4" />
      <path d="M3 8h13" />
      <path d="M17 20l4-4-4-4" />
      <path d="M21 16H8" />
    </>,
    className
  );
}

export function CloseIcon({ className = DEFAULT_SIZE }: IconProps) {
  return outline(
    <>
      <path d="M18 6 6 18" />
      <path d="M6 6l12 12" />
    </>,
    className
  );
}
