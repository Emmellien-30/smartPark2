import React from 'react';
const StatCard = ({ title, value, icon: Icon, color = 'blue' }) => {
  const c = {
    blue:  { bg:'bg-primary-50',  border:'border-primary-100', icon:'text-primary-600', val:'text-primary-700' },
    green: { bg:'bg-success-50',  border:'border-success-100', icon:'text-success-600', val:'text-success-700' },
    orange:{ bg:'bg-orange-50',   border:'border-orange-100',  icon:'text-orange-500',  val:'text-orange-700'  },
    red:   { bg:'bg-danger-50',   border:'border-red-100',     icon:'text-danger-500',  val:'text-danger-700'  },
  }[color] || {};
  return (
    <div className={`rounded-xl border ${c.bg} ${c.border} p-5 flex items-center gap-4`}>
      <div className={`w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm flex-shrink-0`}>
        {Icon && <Icon size={22} className={c.icon} />}
      </div>
      <div>
        <p className={`text-2xl font-bold ${c.val}`}>{value}</p>
        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mt-0.5">{title}</p>
      </div>
    </div>
  );
};
export default StatCard;
