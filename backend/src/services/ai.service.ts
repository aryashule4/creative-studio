import axios, { AxiosInstance } from 'axios';
import FormData from 'form-data';
import * as fs from 'fs';
import * as path from 'path';
import redis from '../config/redis';

interface AIImageGenerationRequest {
  prompt: string;
  size?: '256x256' | '512x512' | '1024x1024';
  quantity?: number;
}

interface AITextGenerationRequest {
  prompt: string;
  style?: 'professional' | 'casual' | 'creative' | 'marketing';
  length?: 'short' | 'medium' | 'long';
}

interface BackgroundRemovalRequest {
  imageUrl: string;
  size?: 'auto' | 'preview' | 'small' | 'regular' | 'hd' | '4k';
}

interface ColorPaletteRequest {
  imageUrl: string;
  count?: number;
}

export class AIService {
  private openaiClient: AxiosInstance;
  private removeBgApiKey: string;
  private huggingfaceApiKey: string;
  private redisClient = redis;

  constructor() {
    this.openaiClient = axios.create({
      baseURL: 'https://api.openai.com/v1',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    this.removeBgApiKey = process.env.REMOVE_BG_API_KEY || '';
    this.huggingfaceApiKey = process.env.HUGGINGFACE_API_KEY || '';
  }

  /**
   * Generate images using OpenAI DALL-E
   */
  async generateImage(req: AIImageGenerationRequest): Promise<any> {
    try {
      const cacheKey = `ai:image:${req.prompt}`;
      const cached = await this.redisClient.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      const response = await this.openaiClient.post('/images/generations', {
        prompt: req.prompt,
        n: req.quantity || 1,
        size: req.size || '1024x1024',
        response_format: 'url',
      });

      const result = {
        images: response.data.data.map((img: any) => ({
          url: img.url,
          revised_prompt: img.revised_prompt,
          created_at: new Date(),
        })),
      };

      // Cache for 7 days
      await this.redisClient.setex(cacheKey, 604800, JSON.stringify(result));

      return result;
    } catch (error) {
      throw new Error(`Image generation failed: ${error}`);
    }
  }

  /**
   * Generate text using GPT-4
   */
  async generateText(req: AITextGenerationRequest): Promise<any> {
    try {
      const cacheKey = `ai:text:${req.prompt}:${req.style}:${req.length}`;
      const cached = await this.redisClient.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      const styleGuide = {
        professional: 'Write in a professional and formal tone',
        casual: 'Write in a casual and friendly tone',
        creative: 'Write in a creative and imaginative tone',
        marketing: 'Write compelling marketing copy that drives action',
      };

      const lengthGuide = {
        short: '(maximum 50 words)',
        medium: '(100-150 words)',
        long: '(200-300 words)',
      };

      const systemPrompt = `You are a creative copywriter and designer assistant. ${styleGuide[req.style || 'professional']}. Keep response ${lengthGuide[req.length || 'medium']}.`;

      const response = await this.openaiClient.post('/chat/completions', {
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: req.prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      });

      const result = {
        text: response.data.choices[0].message.content,
        style: req.style || 'professional',
        length: req.length || 'medium',
        tokens_used: response.data.usage.total_tokens,
      };

      // Cache for 3 days
      await this.redisClient.setex(cacheKey, 259200, JSON.stringify(result));

      return result;
    } catch (error) {
      throw new Error(`Text generation failed: ${error}`);
    }
  }

  /**
   * Remove background from image
   */
  async removeBackground(req: BackgroundRemovalRequest): Promise<any> {
    try {
      const cacheKey = `ai:nobg:${req.imageUrl}:${req.size || 'auto'}`;
      const cached = await this.redisClient.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      const formData = new FormData();
      formData.append('image_url', req.imageUrl);
      formData.append('size', req.size || 'auto');
      formData.append('format', 'auto');

      const response = await axios.post(
        'https://api.remove.bg/v1.0/removebg',
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            'X-Api-Key': this.removeBgApiKey,
          },
          responseType: 'arraybuffer',
        }
      );

      // Generate unique filename
      const filename = `nobg-${Date.now()}.png`;
      const outputPath = path.join('/tmp', filename);
      
      fs.writeFileSync(outputPath, response.data);

      const result = {
        filename,
        url: `/api/ai/images/${filename}`,
        size: response.headers['content-length'],
        format: 'png',
      };

      // Cache for 7 days
      await this.redisClient.setex(cacheKey, 604800, JSON.stringify(result));

      return result;
    } catch (error) {
      throw new Error(`Background removal failed: ${error}`);
    }
  }

  /**
   * Extract color palette from image
   */
  async extractColorPalette(req: ColorPaletteRequest): Promise<any> {
    try {
      const cacheKey = `ai:palette:${req.imageUrl}:${req.count || 5}`;
      const cached = await this.redisClient.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      // Download image
      const imageResponse = await axios.get(req.imageUrl, {
        responseType: 'arraybuffer',
      });

      // Use vibrant.js or huggingface for color extraction
      const response = await axios.post(
        'https://api-inference.huggingface.co/models/microsoft/resnet-50',
        imageResponse.data,
        {
          headers: {
            Authorization: `Bearer ${this.huggingfaceApiKey}`,
          },
        }
      );

      // Use clustering to extract dominant colors
      const colors = await this.extractDominantColors(imageResponse.data, req.count || 5);

      const result = {
        colors,
        count: colors.length,
        format: 'hex',
      };

      // Cache for 7 days
      await this.redisClient.setex(cacheKey, 604800, JSON.stringify(result));

      return result;
    } catch (error) {
      throw new Error(`Color palette extraction failed: ${error}`);
    }
  }

  /**
   * Get AI design suggestions
   */
  async getDesignSuggestions(projectDetails: any): Promise<any> {
    try {
      const cacheKey = `ai:suggestion:${JSON.stringify(projectDetails)}`;
      const cached = await this.redisClient.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      const prompt = `Based on this design project: ${JSON.stringify(projectDetails, null, 2)}\n\nProvide specific, actionable design suggestions including:
      1. Color scheme recommendations
      2. Typography suggestions
      3. Layout improvements
      4. Element placement tips
      5. Overall design direction`;

      const response = await this.openaiClient.post('/chat/completions', {
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert UX/UI designer providing actionable design suggestions.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.8,
        max_tokens: 1000,
      });

      const suggestions = response.data.choices[0].message.content;
      
      const result = {
        suggestions,
        generated_at: new Date(),
      };

      // Cache for 1 day
      await this.redisClient.setex(cacheKey, 86400, JSON.stringify(result));

      return result;
    } catch (error) {
      throw new Error(`Design suggestions failed: ${error}`);
    }
  }

  /**
   * Smart image crop recommendations
   */
  async getSmartCropSuggestions(imageUrl: string): Promise<any> {
    try {
      const cacheKey = `ai:crop:${imageUrl}`;
      const cached = await this.redisClient.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      const response = await axios.post(
        'https://api.cloudinary.com/v1_1/detect/crop_hints',
        { image_url: imageUrl },
        {
          headers: {
            Authorization: `Bearer ${process.env.CLOUDINARY_API_KEY}`,
          },
        }
      );

      const result = {
        crops: response.data.data.map((crop: any) => ({
          x: crop.x,
          y: crop.y,
          width: crop.width,
          height: crop.height,
          confidence: crop.confidence,
          aspect_ratio: `${crop.width}:${crop.height}`,
        })),
      };

      // Cache for 7 days
      await this.redisClient.setex(cacheKey, 604800, JSON.stringify(result));

      return result;
    } catch (error) {
      throw new Error(`Smart crop failed: ${error}`);
    }
  }

  /**
   * Helper: Extract dominant colors from image
   */
  private async extractDominantColors(imageBuffer: Buffer, count: number): Promise<string[]> {
    // Placeholder implementation - use vibrant.js in production
    return [
      '#FF6B6B',
      '#4ECDC4',
      '#45B7D1',
      '#FFA07A',
      '#98D8C8',
    ].slice(0, count);
  }
}

export default new AIService();
