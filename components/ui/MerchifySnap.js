// components/ui/MerchifySnap.js
import Image from 'next/image';

export default function MerchifySnap({ frameSrc, timestamp, videoTitle = 'Merchify Moment' }) {
  if (!frameSrc) return null;

  return (
    <div className="bg-white rounded-lg shadow-lg p-3 pb-4 w-full max-w-md mx-auto border border-gray-200">
      <div className="relative w-full aspect-[16/9] bg-black rounded-sm overflow-hidden">
        <Image
          src={frameSrc}
          alt={videoTitle}
          layout="fill"
          objectFit="contain"
          priority
        />
      </div>
      <div className="flex justify-between items-center pt-3 px-1">
        <span className="text-sm font-bold text-gray-800 tracking-tight">
          Merchify
        </span>
        <span className="text-sm font-mono text-gray-600">
          {timestamp}
        </span>
      </div>
    </div>
  );
}
