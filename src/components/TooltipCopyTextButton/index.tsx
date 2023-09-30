import { ClipboardDocumentIcon } from '@heroicons/react/24/outline';
import React, { useState } from 'react';

export default function TooltipCopyTextButton({ textToDisplay,textToCopy }:{textToDisplay:string,textToCopy:string}) {
  const [showTooltip, setShowTooltip] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(textToCopy);
    setShowTooltip(true);
    setTimeout(() => {
      setShowTooltip(false);
    }, 2000);
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-1">
        <span className="text-sm lowercase">{textToDisplay}</span>
        <ClipboardDocumentIcon className="h-5 w-5 cursor-pointer"  onClick={handleCopy} />
      </div>
      {showTooltip && (
        <div className="absolute top-5 right-0 p-2 bg-gray-800 text-white rounded-md shadow-md z-10">
          {`Copied!`}
        </div>
      )}
    </div>
  );
}