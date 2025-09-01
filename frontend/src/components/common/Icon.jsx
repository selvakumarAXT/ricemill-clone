import React from "react";
import {
  LayoutDashboard,
  Users,
  Wheat,
  Boxes,
  ShoppingBag,
  Building2,
  Wallet,
  Zap,
  TrendingUp,
  GitBranch,
  FileText as FileTextIcon,
  Settings as SettingsIcon,
  LogOut,
  Plus,
  Pencil,
  Trash2,
  Save,
  Search as SearchIcon,
  Filter,
  Download,
  Upload,
  RefreshCcw,
  User as UserIcon,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  Menu,
  X,
  Scale,
  Truck,
  BadgeCheck,
  Archive,
  BarChart3,
  TrendingDown,
  DollarSign,
  Calendar,
  Tag,
  Hash as HashIcon,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronDown,
  ChevronUp,
  Package as PackageIcon,
  Box,
  Droplet,
  StickyNote,
  Check,
} from "lucide-react";

// Icon component that accepts icon name and optional props
const Icon = ({ name, className = "w-5 h-5", ...props }) => {
  // Professional lucide-react icon mapping
  const LucideIconMap = {
    // Navigation & UI
    dashboard: LayoutDashboard,
    users: Users,
    paddy: Wheat,
    rice: Wheat,
    inventory: Boxes,
    gunny: ShoppingBag,
    vendor: Building2,
    financial: Wallet,
    ebMeter: Zap,
    sales: TrendingUp,
    branch: GitBranch,
    documents: FileTextIcon,
    settings: SettingsIcon,
    logout: LogOut,

    // Actions
    add: Plus,
    edit: Pencil,
    delete: Trash2,
    save: Save,
    search: SearchIcon,
    filter: Filter,
    download: Download,
    upload: Upload,
    refresh: RefreshCcw,

    // Form
    user: UserIcon,
    mail: Mail,
    phone: Phone,
    lock: Lock,
    eye: Eye,
    eyeOff: EyeOff,

    // Status
    success: CheckCircle2,
    error: XCircle,
    warning: AlertTriangle,
    info: Info,
    check: Check,

    // Navigation
    menu: Menu,
    close: X,

    // Domain-specific
    grain: Wheat,
    mill: Building2,
    bag: ShoppingBag,
    weight: Scale,
    truck: Truck,
    farmer: UserIcon,
    quality: BadgeCheck,
    storage: Archive,
    delivery: Truck,

    // Charts & finance
    barChart: BarChart3,
    trendingUp: TrendingUp,
    trendingDown: TrendingDown,
    payment: CreditCard,
    calendar: Calendar,
    tag: Tag,
    dollarSign: DollarSign,
    fileText: FileTextIcon,
    hash: HashIcon,
    creditCard: CreditCard,
    checkCircle: CheckCircle2,
    building: Building2,

    // Pagination
    chevronLeft: ChevronLeft,
    chevronRight: ChevronRight,
    chevronDoubleLeft: ChevronsLeft,
    chevronDoubleRight: ChevronsRight,
    chevronDown: ChevronDown,
    chevronUp: ChevronUp,

    // Inventory add-ons
    package: PackageIcon,
    box: Box,
    droplet: Droplet,
    note: StickyNote,
  };
  const icons = {
    // Navigation & UI Icons
    dashboard: (
      <span className={className} {...props}>
        📊
      </span>
    ),

    users: (
      <span className={className} {...props}>
        👥
      </span>
    ),



    paddy: (
      <span className={className} {...props}>
        🌾
      </span>
    ),

    gunny: (
      <span className={className} {...props}>
        🧺
      </span>
    ),

    rice: (
      <span className={className} {...props}>
        🍚
      </span>
    ),

    inventory: (
      <span className={className} {...props}>
        📦
      </span>
    ),

    settings: (
      <span className={className} {...props}>
        ⚙️
      </span>
    ),

    sales: (
      <span className={className} {...props}>
        💰
      </span>
    ),

    qc: (
      <span className={className} {...props}>
        ✅
      </span>
    ),

    vendor: (
      <span className={className} {...props}>
        🤝
      </span>
    ),

    financial: (
      <span className={className} {...props}>
        💳
      </span>
    ),

    ebMeter: (
      <span className={className} {...props}>
        ⚡
      </span>
    ),

    documents: (
      <span className={className} {...props}>
        📄
      </span>
    ),

    branch: (
      <span className={className} {...props}>
        🏢
      </span>
    ),

    invoice: (
      <span className={className} {...props}>
        📋
      </span>
    ),

    // Action Icons
    add: (
      <span className={className} {...props}>
        ➕
      </span>
    ),

    edit: (
      <span className={className} {...props}>
        ✏️
      </span>
    ),

    delete: (
      <span className={className} {...props}>
        🗑️
      </span>
    ),

    save: (
      <span className={className} {...props}>
        💾
      </span>
    ),

    search: (
      <span className={className} {...props}>
        🔍
      </span>
    ),

    filter: (
      <span className={className} {...props}>
        🔧
      </span>
    ),

    download: (
      <span className={className} {...props}>
        ⬇️
      </span>
    ),

    upload: (
      <span className={className} {...props}>
        ⬆️
      </span>
    ),

    refresh: (
      <span className={className} {...props}>
        🔄
      </span>
    ),

    // Form Icons
    user: (
      <span className={className} {...props}>
        👤
      </span>
    ),

    mail: (
      <span className={className} {...props}>
        📧
      </span>
    ),

    phone: (
      <span className={className} {...props}>
        📞
      </span>
    ),

    lock: (
      <span className={className} {...props}>
        🔒
      </span>
    ),

    eye: (
      <span className={className} {...props}>
        👁️
      </span>
    ),

    eyeOff: (
      <span className={className} {...props}>
        🙈
      </span>
    ),

    // Status Icons
    success: (
      <span className={className} {...props}>
        ✅
      </span>
    ),

    error: (
      <span className={className} {...props}>
        ❌
      </span>
    ),

    warning: (
      <span className={className} {...props}>
        ⚠️
      </span>
    ),

    info: (
      <span className={className} {...props}>
        ℹ️
      </span>
    ),

    // Navigation Icons
    menu: (
      <span className={className} {...props}>
        ☰
      </span>
    ),

    close: (
      <span className={className} {...props}>
        ❌
      </span>
    ),

    logout: (
      <span className={className} {...props}>
        🚪
      </span>
    ),

    // Rice Mill Specific Icons
    grain: (
      <span className={className} {...props}>
        🌾
      </span>
    ),

    mill: (
      <span className={className} {...props}>
        🏭
      </span>
    ),

    bag: (
      <span className={className} {...props}>
        🛍️
      </span>
    ),

    weight: (
      <span className={className} {...props}>
        ⚖️
      </span>
    ),

    truck: (
      <span className={className} {...props}>
        🚛
      </span>
    ),

    farmer: (
      <span className={className} {...props}>
        👨‍🌾
      </span>
    ),

    quality: (
      <span className={className} {...props}>
        🏆
      </span>
    ),

    storage: (
      <span className={className} {...props}>
        🏪
      </span>
    ),

    delivery: (
      <span className={className} {...props}>
        🚚
      </span>
    ),

    // Additional icons for inventory
    wheat: (
      <span className={className} {...props}>
        🌾
      </span>
    ),

    droplet: (
      <span className={className} {...props}>
        💧
      </span>
    ),

    package: (
      <span className={className} {...props}>
        📦
      </span>
    ),

    box: (
      <span className={className} {...props}>
        📦
      </span>
    ),

    scale: (
      <span className={className} {...props}>
        ⚖️
      </span>
    ),

    barChart: (
      <span className={className} {...props}>
        📊
      </span>
    ),

    trendingUp: (
      <span className={className} {...props}>
        📈
      </span>
    ),

    trendingDown: (
      <span className={className} {...props}>
        📉
      </span>
    ),

    payment: (
      <span className={className} {...props}>
        💵
      </span>
    ),

    // Financial Icons
    calendar: (
      <span className={className} {...props}>
        📅
      </span>
    ),

    tag: (
      <span className={className} {...props}>
        🏷️
      </span>
    ),

    dollarSign: (
      <span className={className} {...props}>
        💲
      </span>
    ),

    fileText: (
      <span className={className} {...props}>
        📄
      </span>
    ),

    hash: (
      <span className={className} {...props}>
        #
      </span>
    ),

    creditCard: (
      <span className={className} {...props}>
        💳
      </span>
    ),

    checkCircle: (
      <span className={className} {...props}>
        ✅
      </span>
    ),

    building: (
      <span className={className} {...props}>
        🏢
      </span>
    ),

    note: (
      <span className={className} {...props}>
        📝
      </span>
    ),

    // Pagination Icons
    chevronLeft: (
      <span className={className} {...props}>
        ◀️
      </span>
    ),

    chevronRight: (
      <span className={className} {...props}>
        ▶️
      </span>
    ),

    chevronDoubleLeft: (
      <span className={className} {...props}>
        ⏪
      </span>
    ),

    chevronDoubleRight: (
      <span className={className} {...props}>
        ⏩
      </span>
    ),

    // Default icon if name not found
    default: (
      <span className={className} {...props}>
        ℹ️
      </span>
    ),
  };

  if (LucideIconMap[name]) {
    const Lucide = LucideIconMap[name];
    return <Lucide className={className} {...props} />;
  }
  return icons[name] || icons.default;
};

export default Icon;
