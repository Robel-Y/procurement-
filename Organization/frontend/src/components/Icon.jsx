import React from "react";
import {
  Home,
  FileText,
  Users,
  UserPlus,
  MapPin,
  Bell,
  PieChart,
  Award,
  CheckCircle,
  List,
  RefreshCw,
  Trash2,
  Edit2,
  Zap,
  Calendar,
  Printer,
  Download,
  BarChart,
  ShieldCheck,
  Map,
} from "lucide-react";

const ICONS = {
  home: Home,
  file: FileText,
  users: Users,
  userPlus: UserPlus,
  mapPin: MapPin,
  bell: Bell,
  chart: PieChart,
  award: Award,
  check: CheckCircle,
  list: List,
  refresh: RefreshCw,
  trash: Trash2,
  edit: Edit2,
  zap: Zap,
  calendar: Calendar,
  printer: Printer,
  download: Download,
  bar: BarChart,
  shield: ShieldCheck,
  map: Map,
};

const Icon = ({
  name,
  size = 16,
  strokeWidth = 1.5,
  className = "",
  color = "currentColor",
}) => {
  const Comp = ICONS[name];
  if (!Comp) return null;
  return (
    <Comp
      size={size}
      strokeWidth={strokeWidth}
      className={className}
      color={color}
    />
  );
};

export default Icon;
