import React, { useRef } from 'react';
import { ImageAsset } from '../types';

interface AssetGridProps {
  assets: ImageAsset[];
  selectedId: string | null;
  onSelect: (asset: ImageAsset) => void;
  onUpload: (file: File) => void;
  title: string;
}

export const AssetGrid: React.FC<AssetGridProps> = ({ assets, selectedId, onSelect, onUpload, title }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUpload(e.target.files[0]);
    }
  };

  return (
    <div className="w-full">
      <h3 className="text-lg font-medium text-gray-800 mb-4">{title}</h3>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 md:gap-4">
        {/* Upload Button */}
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="aspect-[3/4] rounded-xl border-2 border-dashed border-gray-300 hover:border-accent flex flex-col items-center justify-center cursor-pointer transition-colors bg-white group"
        >
          <div className="w-10 h-10 rounded-full bg-gray-100 group-hover:bg-accent/10 flex items-center justify-center mb-2">
            <svg className="w-6 h-6 text-gray-400 group-hover:text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <span className="text-xs text-gray-500 group-hover:text-accent font-medium">上传照片</span>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*" 
            onChange={handleFileChange}
          />
        </div>

        {/* Asset List */}
        {assets.map((asset) => (
          <div 
            key={asset.id}
            onClick={() => onSelect(asset)}
            className={`
              relative aspect-[3/4] rounded-xl overflow-hidden cursor-pointer transition-all duration-200
              ${selectedId === asset.id ? 'ring-4 ring-accent scale-105 shadow-lg' : 'hover:scale-105 hover:shadow-md'}
            `}
          >
            <img src={asset.url} alt="choice" className="w-full h-full object-cover" />
            {asset.type === 'generated' && (
              <span className="absolute top-1 left-1 bg-accent/80 text-white text-[10px] px-1.5 py-0.5 rounded backdrop-blur-sm">AI</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
