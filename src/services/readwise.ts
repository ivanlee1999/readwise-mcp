import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';

// Load environment variables from .env file
dotenv.config();

const READWISE_API_BASE_URL = 'https://readwise.io/api/v2';

/**
 * Initialize the Readwise API client with the provided token
 * @param apiToken The Readwise API token
 * @returns Axios instance configured for Readwise API
 */
export function initReadwiseApi(apiToken: string) {
  return axios.create({
    baseURL: READWISE_API_BASE_URL,
    headers: {
      'Authorization': `Token ${apiToken}`,
      'Content-Type': 'application/json'
    }
  });
}

/**
 * Get API token from command-line arguments, environment variable, or .env file
 * @returns The API token if found
 * @throws Error if no API token is found
 */
export function getApiToken(): string {
  // Check if token is available in process.env (either from system environment or loaded by dotenv)
  if (process.env.READWISE_API_TOKEN) {
    return process.env.READWISE_API_TOKEN;
  }
  
  // If not found in process.env, try to read from .env file directly as a fallback
  try {
    if (fs.existsSync('.env')) {
      const envFile = fs.readFileSync('.env', 'utf8');
      // More robust regex that handles quoted values and values with spaces
      const match = envFile.match(/READWISE_API_TOKEN=(['"]?([^'"\r\n]+)['"]?|([^\s\r\n]+))/);
      if (match && (match[2] || match[3])) {
        return match[2] || match[3];
      }
    }
  } catch (error) {
    // Silently fail and continue to error handling
  }
  
  throw new Error('Readwise API token not found. Please provide it as a command-line argument or environment variable.');
}

export interface Highlight {
  text: string;
  title?: string;
  author?: string;
  source_url?: string;
  note?: string;
  location?: number;
  location_type?: string;
  highlighted_at?: string;
  category?: string;
  highlight_url?: string;
  image_url?: string;
}

export class ReadwiseService {
  private api: ReturnType<typeof initReadwiseApi>;

  constructor(apiToken: string) {
    this.api = initReadwiseApi(apiToken);
  }

  /**
   * Clean highlight data by removing empty strings (replacing with null)
   * @param highlight The highlight data to clean
   * @returns Cleaned highlight data
   */
  private cleanHighlightData(highlight: Highlight): Highlight {
    const cleanedHighlight: Highlight = { ...highlight };
    
    // Process each field and set empty strings to null
    Object.keys(cleanedHighlight).forEach(key => {
      const value = cleanedHighlight[key as keyof Highlight];
      if (value === '') {
        // Set empty strings to null/undefined
        (cleanedHighlight as any)[key] = null;
      }
    });
    
    return cleanedHighlight;
  }

  /**
   * Create a new highlight in Readwise
   * @param highlight The highlight data to create
   * @returns The created highlight data
   */
  async createHighlight(highlight: Highlight): Promise<any> {
    try {
      // Clean the highlight data
      const cleanedHighlight = this.cleanHighlightData(highlight);
      console.log('cleanedHighlight', cleanedHighlight);
      
      // Readwise API expects an array of highlights under a 'highlights' key
      const response = await this.api.post('/highlights/', { 
        highlights: [cleanedHighlight] 
      });
      return response.data;
    } catch (error) {
      console.error('Error creating highlight:', error);
      throw error;
    }
  }

  /**
   * Create multiple highlights in Readwise
   * @param highlights Array of highlight data to create
   * @returns The created highlights data
   */
  async createHighlights(highlights: Highlight[]): Promise<any> {
    try {
      // Clean each highlight in the array
      const cleanedHighlights = highlights.map(highlight => this.cleanHighlightData(highlight));
      
      const response = await this.api.post('/highlights/', { highlights: cleanedHighlights });
      return response.data;
    } catch (error) {
      console.error('Error creating highlights:', error);
      throw error;
    }
  }

  /**
   * Get all highlights from Readwise
   * @returns Array of highlights
   */
  async getHighlights(): Promise<any> {
    try {
      const response = await this.api.get('/highlights/');
      return response.data;
    } catch (error) {
      console.error('Error fetching highlights:', error);
      throw error;
    }
  }
}

export default new ReadwiseService(getApiToken());
