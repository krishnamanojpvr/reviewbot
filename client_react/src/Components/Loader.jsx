const Loader = ({ isLoading }) => {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="animate-spin rounded-full text-violet-600 h-16 w-16 border-t-6 border-b-6 border-accent"></div>
    </div>
  );
};

export default Loader;