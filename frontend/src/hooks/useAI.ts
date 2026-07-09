'use client';

import { useState, useCallback } from 'react';
import aiClient, {
  GenerateImageRequest,
  GenerateTextRequest,
  RemoveBackgroundRequest,
  ColorPaletteRequest,
  DesignSuggestionsRequest,
} from '@/lib/ai-client';

interface UseAIState {
  loading: boolean;
  error: string | null;
  data: any;
}

export const useAI = () => {
  const [imageGenState, setImageGenState] = useState<UseAIState>({
    loading: false,
    error: null,
    data: null,
  });

  const [textGenState, setTextGenState] = useState<UseAIState>({
    loading: false,
    error: null,
    data: null,
  });

  const [bgRemovalState, setBgRemovalState] = useState<UseAIState>({
    loading: false,
    error: null,
    data: null,
  });

  const [paletteState, setPaletteState] = useState<UseAIState>({
    loading: false,
    error: null,
    data: null,
  });

  const [suggestionsState, setSuggestionsState] = useState<UseAIState>({
    loading: false,
    error: null,
    data: null,
  });

  const [cropState, setCropState] = useState<UseAIState>({
    loading: false,
    error: null,
    data: null,
  });

  /**
   * Generate images
   */
  const generateImage = useCallback(async (request: GenerateImageRequest) => {
    setImageGenState({ loading: true, error: null, data: null });
    try {
      const result = await aiClient.generateImage(request);
      setImageGenState({ loading: false, error: null, data: result.data });
      return result.data;
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || error.message;
      setImageGenState({ loading: false, error: errorMsg, data: null });
      throw error;
    }
  }, []);

  /**
   * Generate text
   */
  const generateText = useCallback(async (request: GenerateTextRequest) => {
    setTextGenState({ loading: true, error: null, data: null });
    try {
      const result = await aiClient.generateText(request);
      setTextGenState({ loading: false, error: null, data: result.data });
      return result.data;
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || error.message;
      setTextGenState({ loading: false, error: errorMsg, data: null });
      throw error;
    }
  }, []);

  /**
   * Remove background
   */
  const removeBackground = useCallback(
    async (request: RemoveBackgroundRequest) => {
      setBgRemovalState({ loading: true, error: null, data: null });
      try {
        const result = await aiClient.removeBackground(request);
        setBgRemovalState({ loading: false, error: null, data: result.data });
        return result.data;
      } catch (error: any) {
        const errorMsg = error.response?.data?.error || error.message;
        setBgRemovalState({ loading: false, error: errorMsg, data: null });
        throw error;
      }
    },
    []
  );

  /**
   * Extract color palette
   */
  const getColorPalette = useCallback(
    async (request: ColorPaletteRequest) => {
      setPaletteState({ loading: true, error: null, data: null });
      try {
        const result = await aiClient.getColorPalette(request);
        setPaletteState({ loading: false, error: null, data: result.data });
        return result.data;
      } catch (error: any) {
        const errorMsg = error.response?.data?.error || error.message;
        setPaletteState({ loading: false, error: errorMsg, data: null });
        throw error;
      }
    },
    []
  );

  /**
   * Get design suggestions
   */
  const getDesignSuggestions = useCallback(
    async (request: DesignSuggestionsRequest) => {
      setSuggestionsState({ loading: true, error: null, data: null });
      try {
        const result = await aiClient.getDesignSuggestions(request);
        setSuggestionsState({ loading: false, error: null, data: result.data });
        return result.data;
      } catch (error: any) {
        const errorMsg = error.response?.data?.error || error.message;
        setSuggestionsState({ loading: false, error: errorMsg, data: null });
        throw error;
      }
    },
    []
  );

  /**
   * Get smart crop suggestions
   */
  const getSmartCrop = useCallback(async (imageUrl: string) => {
    setCropState({ loading: true, error: null, data: null });
    try {
      const result = await aiClient.getSmartCrop(imageUrl);
      setCropState({ loading: false, error: null, data: result.data });
      return result.data;
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || error.message;
      setCropState({ loading: false, error: errorMsg, data: null });
      throw error;
    }
  }, []);

  return {
    // Image generation
    generateImage,
    imageGenState,

    // Text generation
    generateText,
    textGenState,

    // Background removal
    removeBackground,
    bgRemovalState,

    // Color palette
    getColorPalette,
    paletteState,

    // Design suggestions
    getDesignSuggestions,
    suggestionsState,

    // Smart crop
    getSmartCrop,
    cropState,
  };
};

export default useAI;
