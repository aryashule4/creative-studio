'use client';

import React, { useState } from 'react';
import useAI from '@/hooks/useAI';

export const AIPanel: React.FC = () => {
  const {
    generateImage,
    imageGenState,
    generateText,
    textGenState,
    removeBackground,
    bgRemovalState,
    getColorPalette,
    paletteState,
    getDesignSuggestions,
    suggestionsState,
    getSmartCrop,
    cropState,
  } = useAI();

  const [activeTab, setActiveTab] = useState<
    'image' | 'text' | 'bgremoval' | 'palette' | 'suggestions' | 'crop'
  >('image');

  const [imagePrompt, setImagePrompt] = useState('');
  const [imageSize, setImageSize] = useState<'256x256' | '512x512' | '1024x1024'>(
    '1024x1024'
  );
  const [imageQuantity, setImageQuantity] = useState(1);

  const [textPrompt, setTextPrompt] = useState('');
  const [textStyle, setTextStyle] = useState<
    'professional' | 'casual' | 'creative' | 'marketing'
  >('professional');
  const [textLength, setTextLength] = useState<'short' | 'medium' | 'long'>('medium');

  const [imageUrl, setImageUrl] = useState('');
  const [paletteCount, setPaletteCount] = useState(5);

  const handleGenerateImage = async () => {
    try {
      await generateImage({
        prompt: imagePrompt,
        size: imageSize,
        quantity: imageQuantity,
      });
    } catch (error) {
      console.error('Failed to generate image', error);
    }
  };

  const handleGenerateText = async () => {
    try {
      await generateText({
        prompt: textPrompt,
        style: textStyle,
        length: textLength,
      });
    } catch (error) {
      console.error('Failed to generate text', error);
    }
  };

  const handleRemoveBackground = async () => {
    try {
      await removeBackground({
        imageUrl,
      });
    } catch (error) {
      console.error('Failed to remove background', error);
    }
  };

  const handleGetPalette = async () => {
    try {
      await getColorPalette({
        imageUrl,
        count: paletteCount,
      });
    } catch (error) {
      console.error('Failed to extract palette', error);
    }
  };

  const handleSmartCrop = async () => {
    try {
      await getSmartCrop(imageUrl);
    } catch (error) {
      console.error('Failed to get crop suggestions', error);
    }
  };

  return (
    <div className="w-full h-full bg-white rounded-lg shadow-lg overflow-hidden flex flex-col">
      {/* Tabs */}
      <div className="flex border-b bg-gray-50">
        <TabButton
          active={activeTab === 'image'}
          onClick={() => setActiveTab('image')}
          label="🎨 Image Gen"
        />
        <TabButton
          active={activeTab === 'text'}
          onClick={() => setActiveTab('text')}
          label="✍️ Text Gen"
        />
        <TabButton
          active={activeTab === 'bgremoval'}
          onClick={() => setActiveTab('bgremoval')}
          label="🚀 Remove BG"
        />
        <TabButton
          active={activeTab === 'palette'}
          onClick={() => setActiveTab('palette')}
          label="🎯 Palette"
        />
        <TabButton
          active={activeTab === 'suggestions'}
          onClick={() => setActiveTab('suggestions')}
          label="💡 Suggestions"
        />
        <TabButton
          active={activeTab === 'crop'}
          onClick={() => setActiveTab('crop')}
          label="✂️ Smart Crop"
        />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Image Generation */}
        {activeTab === 'image' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-800">🎨 AI Image Generation</h3>
            <textarea
              value={imagePrompt}
              onChange={(e) => setImagePrompt(e.target.value)}
              placeholder="Describe the image you want to generate..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
            />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Size</label>
                <select
                  value={imageSize}
                  onChange={(e) => setImageSize(e.target.value as any)}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  <option value="256x256">256x256 (Small)</option>
                  <option value="512x512">512x512 (Medium)</option>
                  <option value="1024x1024">1024x1024 (Large)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Quantity</label>
                <input
                  type="number"
                  value={imageQuantity}
                  onChange={(e) => setImageQuantity(parseInt(e.target.value))}
                  min="1"
                  max="10"
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
            <button
              onClick={handleGenerateImage}
              disabled={imageGenState.loading || !imagePrompt}
              className="w-full bg-blue-500 text-white py-2 rounded-lg font-semibold hover:bg-blue-600 disabled:bg-gray-400"
            >
              {imageGenState.loading ? 'Generating...' : 'Generate Image'}
            </button>
            {imageGenState.error && (
              <div className="text-red-500 text-sm p-3 bg-red-50 rounded-lg">
                {imageGenState.error}
              </div>
            )}
            {imageGenState.data?.images && (
              <div className="grid grid-cols-2 gap-4">
                {imageGenState.data.images.map((img: any, idx: number) => (
                  <div key={idx} className="space-y-2">
                    <img
                      src={img.url}
                      alt={`Generated ${idx}`}
                      className="w-full rounded-lg border border-gray-200"
                    />
                    {img.revised_prompt && (
                      <p className="text-xs text-gray-600">{img.revised_prompt}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Text Generation */}
        {activeTab === 'text' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-800">✍️ AI Text Generation</h3>
            <textarea
              value={textPrompt}
              onChange={(e) => setTextPrompt(e.target.value)}
              placeholder="What text do you need generated? (tagline, description, headline...)"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
            />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Style</label>
                <select
                  value={textStyle}
                  onChange={(e) => setTextStyle(e.target.value as any)}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  <option value="professional">Professional</option>
                  <option value="casual">Casual</option>
                  <option value="creative">Creative</option>
                  <option value="marketing">Marketing</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Length</label>
                <select
                  value={textLength}
                  onChange={(e) => setTextLength(e.target.value as any)}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  <option value="short">Short</option>
                  <option value="medium">Medium</option>
                  <option value="long">Long</option>
                </select>
              </div>
            </div>
            <button
              onClick={handleGenerateText}
              disabled={textGenState.loading || !textPrompt}
              className="w-full bg-blue-500 text-white py-2 rounded-lg font-semibold hover:bg-blue-600 disabled:bg-gray-400"
            >
              {textGenState.loading ? 'Generating...' : 'Generate Text'}
            </button>
            {textGenState.error && (
              <div className="text-red-500 text-sm p-3 bg-red-50 rounded-lg">
                {textGenState.error}
              </div>
            )}
            {textGenState.data?.text && (
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-gray-800">{textGenState.data.text}</p>
                <p className="text-xs text-gray-600 mt-2">
                  Tokens used: {textGenState.data.tokens_used}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Background Removal */}
        {activeTab === 'bgremoval' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-800">🚀 Remove Background</h3>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Enter image URL"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleRemoveBackground}
              disabled={bgRemovalState.loading || !imageUrl}
              className="w-full bg-blue-500 text-white py-2 rounded-lg font-semibold hover:bg-blue-600 disabled:bg-gray-400"
            >
              {bgRemovalState.loading ? 'Processing...' : 'Remove Background'}
            </button>
            {bgRemovalState.error && (
              <div className="text-red-500 text-sm p-3 bg-red-50 rounded-lg">
                {bgRemovalState.error}
              </div>
            )}
            {bgRemovalState.data && (
              <div className="text-green-600 text-sm p-3 bg-green-50 rounded-lg">
                ✓ Background removed successfully!
              </div>
            )}
          </div>
        )}

        {/* Color Palette */}
        {activeTab === 'palette' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-800">🎯 Extract Color Palette</h3>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Enter image URL"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div>
              <label className="block text-sm font-semibold mb-2">Colors to extract</label>
              <input
                type="number"
                value={paletteCount}
                onChange={(e) => setPaletteCount(parseInt(e.target.value))}
                min="3"
                max="10"
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
            <button
              onClick={handleGetPalette}
              disabled={paletteState.loading || !imageUrl}
              className="w-full bg-blue-500 text-white py-2 rounded-lg font-semibold hover:bg-blue-600 disabled:bg-gray-400"
            >
              {paletteState.loading ? 'Extracting...' : 'Extract Palette'}
            </button>
            {paletteState.error && (
              <div className="text-red-500 text-sm p-3 bg-red-50 rounded-lg">
                {paletteState.error}
              </div>
            )}
            {paletteState.data?.colors && (
              <div className="grid grid-cols-5 gap-2">
                {paletteState.data.colors.map((color: string, idx: number) => (
                  <div key={idx} className="text-center">
                    <div
                      style={{ backgroundColor: color }}
                      className="w-full h-16 rounded-lg border border-gray-300 mb-2"
                    />
                    <span className="text-xs font-mono text-gray-600">{color}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Smart Crop */}
        {activeTab === 'crop' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-800">✂️ Smart Crop Suggestions</h3>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Enter image URL"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSmartCrop}
              disabled={cropState.loading || !imageUrl}
              className="w-full bg-blue-500 text-white py-2 rounded-lg font-semibold hover:bg-blue-600 disabled:bg-gray-400"
            >
              {cropState.loading ? 'Analyzing...' : 'Get Crop Suggestions'}
            </button>
            {cropState.error && (
              <div className="text-red-500 text-sm p-3 bg-red-50 rounded-lg">
                {cropState.error}
              </div>
            )}
            {cropState.data?.crops && (
              <div className="space-y-2">
                {cropState.data.crops.map((crop: any, idx: number) => (
                  <div key={idx} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex justify-between mb-2">
                      <span className="font-semibold text-gray-800">Crop {idx + 1}</span>
                      <span className="text-sm text-blue-600">
                        {Math.round(crop.confidence * 100)}% confidence
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>Aspect Ratio: {crop.aspect_ratio}</p>
                      <p>Position: ({crop.x}, {crop.y})</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  label: string;
}

const TabButton: React.FC<TabButtonProps> = ({ active, onClick, label }) => (
  <button
    onClick={onClick}
    className={`flex-1 py-3 px-4 text-sm font-semibold transition-colors ${
      active
        ? 'bg-blue-500 text-white'
        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
    }`}
  >
    {label}
  </button>
);

export default AIPanel;
