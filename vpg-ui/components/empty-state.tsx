interface EmptyStateProps {
  onCreate: () => void;
  onTryDemo: () => void;
}

export default function EmptyState({ onCreate, onTryDemo }: EmptyStateProps) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="max-w-md mx-auto text-center bg-gray-800 rounded-xl border border-gray-700 shadow-lg p-8">
        {/* Icon */}
        <div className="w-16 h-16 mx-auto mb-6 bg-gray-700 rounded-full flex items-center justify-center">
          <svg 
            className="w-8 h-8 text-gray-400" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
            />
          </svg>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-white mb-3">
          Create your first Persona
        </h2>

        {/* Subtitle */}
        <p className="text-gray-400 mb-8 leading-relaxed">
          Get started by creating a new persona or try out a demo to see how it works. 
          Your personas will appear here once created.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={onCreate}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800"
          >
            Create Persona
          </button>
          <button
            onClick={onTryDemo}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-gray-200 font-medium rounded-lg border border-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-800"
          >
            Try Demo
          </button>
        </div>
      </div>
    </div>
  );
}
