const DialogBox = ({
  title,
  onClose,
  children,
  show = true,
  size = "2xl",
  onSubmit,
  submitText,
  cancelText,
  error,
  success,
  loading,
}) => {
  if (!show) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Size classes for different dialog sizes with mobile-responsive width
  const sizeClasses = {
    sm: "max-w-[95vw] sm:max-w-[60vw] w-full mx-2 sm:mx-4", // Mobile: 95vw, Desktop: 60vw
    md: "max-w-[95vw] sm:max-w-[60vw] w-full mx-2 sm:mx-4", // Mobile: 95vw, Desktop: 60vw
    lg: "max-w-[95vw] sm:max-w-[60vw] w-full mx-2 sm:mx-4", // Mobile: 95vw, Desktop: 60vw
    xl: "max-w-[95vw] sm:max-w-[60vw] w-full mx-2 sm:mx-4", // Mobile: 95vw, Desktop: 60vw
    "2xl": "max-w-[95vw] sm:max-w-[60vw] w-full mx-2 sm:mx-4", // Mobile: 95vw, Desktop: 60vw
    full: "max-w-full mx-2 sm:mx-4", // Full width
  };

  // Enforce minimum 2xl size - if size is smaller than 2xl, use 2xl
  const effectiveSize =
    size === "sm" || size === "md" || size === "lg" || size === "xl"
      ? "2xl"
      : size;
  const maxWidth = sizeClasses[effectiveSize] || sizeClasses["2xl"];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-auto p-1 sm:p-2 md:p-4"
      onClick={handleBackdropClick}
    >
      <div
        className={`bg-card w-full max-h-[98vh] sm:max-h-[95vh] overflow-hidden rounded-lg sm:rounded-xl shadow-2xl ${maxWidth} relative flex flex-col`}
      >
        {/* Header */}
        <div className="flex-shrink-0 p-4 sm:p-6 pb-3 sm:pb-4 border-b border-border">
          <button
            onClick={onClose}
            className="absolute top-2 sm:top-4 right-2 sm:right-4 text-muted-foreground hover:text-foreground text-xl sm:text-2xl font-bold transition-colors z-10"
            type="button"
          >
            &times;
          </button>
          {title && (
            <h2 className="text-lg sm:text-xl font-bold text-foreground pr-6 sm:pr-8">
              {title}
            </h2>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 pt-3 sm:pt-4">
          {/* Error and Success Messages */}
          {error && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-destructive text-sm">{error}</p>
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <p className="text-green-500 text-sm">{success}</p>
            </div>
          )}

          <div className="space-y-3 sm:space-y-4">{children}</div>
        </div>

        {/* Action Buttons */}
        {(onSubmit || submitText || cancelText) && (
          <div className="flex-shrink-0 flex justify-end space-x-2 sm:space-x-3 p-4 sm:p-6 pt-3 sm:pt-4 border-t border-border bg-muted">
            {cancelText && (
              <button
                type="button"
                onClick={onClose}
                className="px-3 sm:px-4 py-2 text-sm font-medium text-muted-foreground bg-card border border-border rounded-md hover:bg-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-border transition-colors"
                disabled={loading}
              >
                {cancelText}
              </button>
            )}
            {submitText && onSubmit && (
              <button
                type="submit"
                onClick={onSubmit}
                className="px-3 sm:px-4 py-2 text-sm font-medium text-primary-foreground bg-primary border border-transparent rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
                disabled={loading}
              >
                {loading ? "Loading..." : submitText}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
export default DialogBox;
