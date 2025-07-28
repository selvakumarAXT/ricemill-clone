const DialogBox = ({ title, onClose, children, show = true, maxWidth = 'max-w-lg' }) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-auto ">
      <div className="bg-[var(--color-bg-white)] w-full h-full md:h-auto overflow-auto md:rounded-lg shadow-lg md:max-w-2xl lg:max-w-3xl p-6 relative">
        <button onClick={onClose} className="absolute top-2 right-2 text-[var(--color-text-gray-light)] hover:text-[var(--color-text-gray-dark)] text-2xl">&times;</button>
        {title && <h2 className="text-xl font-bold mb-4 text-[var(--color-text-black)]">{title}</h2>}
        {children}
      </div>
    </div>
  );
};
export default DialogBox; 