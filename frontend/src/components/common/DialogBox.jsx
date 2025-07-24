const DialogBox = ({ title, onClose, children, show = true, maxWidth = 'max-w-lg' }) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className={`bg-white rounded shadow-lg w-full ${maxWidth} p-6 relative`}>
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl">&times;</button>
        {title && <h2 className="text-xl font-bold mb-4">{title}</h2>}
        {children}
      </div>
    </div>
  );
};
export default DialogBox; 