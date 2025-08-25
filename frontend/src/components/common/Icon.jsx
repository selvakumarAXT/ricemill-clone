import React from "react";

// Icon component that accepts icon name and optional props
const Icon = ({ name, className = "w-5 h-5", ...props }) => {
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

  return icons[name] || icons.default;
};

export default Icon;
