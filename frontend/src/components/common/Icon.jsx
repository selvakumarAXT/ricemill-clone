import React from 'react';
import { 
  FaUser, FaLock, FaSignOutAlt, FaSearch, FaCog, FaHome, FaUsers, FaBoxes, FaChartBar, FaIndustry, FaBuilding, FaExclamationTriangle, FaPlus, FaEdit, FaTrash, FaSave, FaEye, FaEyeSlash, FaChevronDown, FaChevronUp, FaChevronLeft, FaChevronRight, FaDownload, FaUpload, FaCheck, FaTimes, FaCalendar, FaFile, FaTruck, FaBox, FaWeightHanging, FaAngleDoubleLeft, FaAngleDoubleRight, FaFilter
} from 'react-icons/fa';

// Map icon names to components for dynamic usage
const ICONS = {
  user: FaUser,
  lock: FaLock,
  logout: FaSignOutAlt,
  search: FaSearch,
  settings: FaCog,
  dashboard: FaHome,
  users: FaUsers,
  inventory: FaBoxes,
  reports: FaChartBar,
  production: FaIndustry,
  branch: FaBuilding,
  warning: FaExclamationTriangle,
  add: FaPlus,
  edit: FaEdit,
  delete: FaTrash,
  save: FaSave,
  show: FaEye,
  hide: FaEyeSlash,
  chevronDown: FaChevronDown,
  chevronUp: FaChevronUp,
  chevronLeft: FaChevronLeft,
  chevronRight: FaChevronRight,
  chevronDoubleLeft: FaAngleDoubleLeft,
  chevronDoubleRight: FaAngleDoubleRight,
  filter: FaFilter,
  download: FaDownload,
  upload: FaUpload,
  check: FaCheck,
  close: FaTimes,
  calendar: FaCalendar,
  file: FaFile,
  truck: FaTruck,
  package: FaBox,
  scale: FaWeightHanging,
};

/**
 * Icon component for consistent icon usage
 * @param {string} name - The icon name (from ICONS map)
 * @param {string} className - Additional classes for styling
 * @param {object} props - Other props (size, color, etc.)
 */
const Icon = ({ name, className = '', ...props }) => {
  const IconComponent = ICONS[name];
  if (!IconComponent) return null;
  return <IconComponent className={className} {...props} />;
};

export default Icon;
export { ICONS }; 