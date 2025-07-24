const FormSelect = ({ label, name, value, onChange, required = false, className = '', children, ...rest }) => (
  <div className="mb-2">
    {label && <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor={name}>{label}</label>}
    <select
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${className}`}
      {...rest}
    >
      {children}
    </select>
  </div>
);
export default FormSelect; 