import { scrollbarTheme } from '@/lib/ui/theme.js';

export default function MarketingLayout({ children }) {
  return (
    <div className={`h-full min-h-0 overflow-y-auto overscroll-y-contain ${scrollbarTheme}`}>
      {children}
    </div>
  );
}
