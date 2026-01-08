const PageSkeleton = () => {
    return (
        <div className="flex flex-col items-center justify-center h-96 w-full space-y-4">
            {/* The Spinner Animation */}
            <div className="relative w-16 h-16">
                <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-200 rounded-full opacity-25"></div>
                <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
            </div>
            
            {/* Text Feedback */}
            <div className="text-blue-600 font-semibold animate-pulse">
                Loading Data...
            </div>
        </div>
    );
};

export default PageSkeleton;