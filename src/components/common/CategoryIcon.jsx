import React from 'react';
import {
  Utensils,
  Coffee,
  Bus,
  GraduationCap,
  BookOpen,
  Home,
  Dumbbell,
  Zap,
  Apple,
  ShoppingBag,
  Film,
  Compass,
  Tv,
  Wifi,
  HeartPulse,
  Sparkles,
  MoreHorizontal,
  Wallet,
  Briefcase,
  Award,
  Gift,
  PlusCircle,
  HelpCircle,
} from 'lucide-react';

const ICON_MAP = {
  Utensils,
  Coffee,
  Bus,
  GraduationCap,
  BookOpen,
  Home,
  Dumbbell,
  Zap,
  Apple,
  ShoppingBag,
  Film,
  Compass,
  Tv,
  Wifi,
  HeartPulse,
  Sparkles,
  MoreHorizontal,
  Wallet,
  Briefcase,
  Award,
  Gift,
  PlusCircle,
};

export default function CategoryIcon({
  name,
  className = 'w-5 h-5',
  style = {},
}) {
  const IconComponent = ICON_MAP[name] || HelpCircle;
  return <IconComponent className={className} style={style} />;
}
