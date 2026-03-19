import {
  BarChart3, Wallet, Apple, ShoppingBag, Calendar, Quote,
  FileSearch, Mic, Briefcase, Link, QrCode, KeyRound,
  FileText, Calculator, LetterText, Scale, Code, Search,
  Wrench
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  BarChart3, Wallet, Apple, ShoppingBag, Calendar, Quote,
  FileSearch, Mic, Briefcase, Link, QrCode, KeyRound,
  FileText, Calculator, LetterText, Scale, Code, Search,
  Wrench,
};

export function getToolIcon(name: string): LucideIcon {
  return iconMap[name] || Wrench;
}
