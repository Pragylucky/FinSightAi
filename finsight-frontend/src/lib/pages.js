// The app's pages, shared by the dock and the header.
import {
  LayoutDashboard, Building2, MessageSquareText, BriefcaseBusiness, Star, Newspaper, SlidersHorizontal,
  TrendingUp, GraduationCap, Scale,
} from 'lucide-react';

export const PAGES = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/company', match: '/company', label: 'Research', icon: Building2 },
  { path: '/compare', label: 'Compare', icon: Scale },
  { path: '/chat', label: 'AI Chat', icon: MessageSquareText, badge: true },
  { path: '/portfolio', label: 'Portfolio', icon: BriefcaseBusiness },
  { path: '/watchlist', label: 'Watchlist', icon: Star },
  { path: '/news', label: 'News', icon: Newspaper },
  { path: '/screener', label: 'Screener', icon: SlidersHorizontal },
  { path: '/funds', label: 'Funds', icon: TrendingUp },
  { path: '/learn', label: 'Learn', icon: GraduationCap },
];
