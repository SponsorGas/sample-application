export default function LoadingOverlay(){
    return (
        <div className="fixed inset-0 bg-gray-50 opacity-75 flex items-center justify-center z-50">
            {/* Replace with your loading spinner */}
            <div className="flex items-center justify-center h-16">
                <div className="animate-bounce flex items-center space-x-2">
                    <div className="h-4 w-4 bg-blue-500 rounded-full"></div>
                    <div className="h-4 w-4 bg-blue-500 rounded-full"></div>
                    <div className="h-4 w-4 bg-blue-500 rounded-full"></div>
                </div>
            </div>
        </div>
    );
  };
  
