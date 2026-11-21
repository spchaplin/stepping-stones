import IconifyIcon from './IconifyIcon';
import type { IconifyIconData } from './IconifyIcon';
import { ICON_REGISTRY } from '../generated/iconRegistry';
import type { SVGProps } from 'react';

type IconName =
  | 'log-in'
  | 'log-out'
  | 'cloud'
  | 'loader-2'
  | 'arrow-left'
  | 'arrow-up'
  | 'info'
  | 'rotate-ccw'
  | 'printer'
  | 'check-circle'
  | 'layout-grid'
  | 'file-text'
  | 'user'
  | 'check-circle-2'
  | 'help-circle'
  | 'x'
  | 'sparkles'
  | 'compass'
  | 'milestone'
  | 'circle-alert'
  | 'volume-2'
  | 'volume-x'
  | 'edit-2'
  | 'trash-2'
  | 'chevron-left'
  | 'undo-2'
  | 'plus'
  | 'check'
  | 'footprints'
  | 'target'
  | 'alert-triangle'
  | 'layers'
  | 'shopping-cart'
  | 'zap'
  | 'minus'
  | 'lock'
  | 'copy'
  | 'external-link'
  | 'shield-alert'
  | 'award'
  | 'chevron-right'
  | 'move-right'
  | 'arrow-right'
  | 'share-2'
  | 'list-restart'
  | 'chevron-up'
  | 'chevron-down'
  | 'bookmark-check'
  | 'book-open'
  | 'arrow-left-right'
  | 'arrow-right-left'
  | 'trending-up'
  | 'swords'
  | 'shield'
  | 'zoom-in'
  | 'maximize-2'
  | 'crown'
  | 'flame'
  | 'scroll-text'
  | 'landmark'
  | 'eye';

interface LucideIconProps extends Omit<SVGProps<SVGSVGElement>, 'width' | 'height' | 'viewBox' | 'children'> {
  size?: number;
}

function iconData(name: IconName): IconifyIconData {
  return ICON_REGISTRY[`lucide:${name}` as keyof typeof ICON_REGISTRY];
}

function createLucideIcon(name: IconName) {
  return function LucideIcon({ size = 24, className, strokeWidth, ...props }: LucideIconProps) {
    const utilityStrokeWidth = className?.match(/(?:^|\s)stroke-\[([^\]]+)\]/)?.[1];
    return (
      <IconifyIcon
        icon={iconData(name)}
        size={size}
        className={className}
        strokeWidth={strokeWidth ?? utilityStrokeWidth}
        {...props}
      />
    );
  };
}

export const LogIn = createLucideIcon('log-in');
export const LogOut = createLucideIcon('log-out');
export const Cloud = createLucideIcon('cloud');
export const Loader2 = createLucideIcon('loader-2');
export const ArrowLeft = createLucideIcon('arrow-left');
export const ArrowUp = createLucideIcon('arrow-up');
export const Info = createLucideIcon('info');
export const RotateCcw = createLucideIcon('rotate-ccw');
export const Printer = createLucideIcon('printer');
export const CheckCircle = createLucideIcon('check-circle');
export const LayoutGrid = createLucideIcon('layout-grid');
export const FileText = createLucideIcon('file-text');
export const User = createLucideIcon('user');
export const CheckCircle2 = createLucideIcon('check-circle-2');
export const HelpCircle = createLucideIcon('help-circle');
export const X = createLucideIcon('x');
export const Sparkles = createLucideIcon('sparkles');
export const Compass = createLucideIcon('compass');
export const Milestone = createLucideIcon('milestone');
export const AlertCircle = createLucideIcon('circle-alert');
export const Volume2 = createLucideIcon('volume-2');
export const VolumeX = createLucideIcon('volume-x');
export const Edit2 = createLucideIcon('edit-2');
export const Trash2 = createLucideIcon('trash-2');
export const ChevronLeft = createLucideIcon('chevron-left');
export const Undo2 = createLucideIcon('undo-2');
export const Plus = createLucideIcon('plus');
export const Check = createLucideIcon('check');
export const Footprints = createLucideIcon('footprints');
export const Target = createLucideIcon('target');
export const AlertTriangle = createLucideIcon('alert-triangle');
export const Layers = createLucideIcon('layers');
export const ShoppingCart = createLucideIcon('shopping-cart');
export const Zap = createLucideIcon('zap');
export const Minus = createLucideIcon('minus');
export const Lock = createLucideIcon('lock');
export const Copy = createLucideIcon('copy');
export const ExternalLink = createLucideIcon('external-link');
export const ShieldAlert = createLucideIcon('shield-alert');
export const Award = createLucideIcon('award');
export const ChevronRight = createLucideIcon('chevron-right');
export const MoveRight = createLucideIcon('move-right');
export const ArrowRight = createLucideIcon('arrow-right');
export const Share2 = createLucideIcon('share-2');
export const ListRestart = createLucideIcon('list-restart');
export const ChevronUp = createLucideIcon('chevron-up');
export const ChevronDown = createLucideIcon('chevron-down');
export const BookmarkCheck = createLucideIcon('bookmark-check');
export const BookOpen = createLucideIcon('book-open');
export const ArrowLeftRight = createLucideIcon('arrow-left-right');
export const ArrowRightLeft = createLucideIcon('arrow-right-left');
export const TrendingUp = createLucideIcon('trending-up');
export const Swords = createLucideIcon('swords');
export const Shield = createLucideIcon('shield');
export const ZoomIn = createLucideIcon('zoom-in');
export const Maximize2 = createLucideIcon('maximize-2');
export const Crown = createLucideIcon('crown');
export const Flame = createLucideIcon('flame');
export const ScrollText = createLucideIcon('scroll-text');
export const Landmark = createLucideIcon('landmark');
export const Eye = createLucideIcon('eye');
