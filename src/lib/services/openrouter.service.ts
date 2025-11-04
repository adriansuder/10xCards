/**
 * OpenRouterService
 * 
 * Service for communicating with the OpenRouter API to generate structured responses
 * from Large Language Models (LLMs). Provides a clean interface for making AI requests
 * with automatic schema validation and comprehensive error handling.
 * 
 * @example
 * ```typescript
 * const service = new OpenRouterService();
 * const result = await service.getStructuredCompletion({
 *   systemPrompt: "You are a helpful assistant",
 *   userPrompt: "Generate flashcards from this text",
 *   model: "anthropic/claude-3.5-sonnet",
 *   responseSchema: MySchema,
 *   params: { temperature: 0.5 }
 * });
 * ```
 */

import type { CompletionOptions } from '../../types';
import { zodToJsonSchema } from 'zod-to-json-schema';

export class OpenRouterService {
  /** OpenRouter API key from environment variables */
  private readonly apiKey: string;
  
  /** Base URL for OpenRouter API endpoints */
  private readonly baseUrl: string = 'https://openrouter.ai/api/v1';

  /**
   * Initializes the OpenRouterService with API credentials.
   * 
   * @throws {Error} If OPENROUTER_API_KEY environment variable is not configured
   */
  constructor() {
    const apiKey = import.meta.env.OPENROUTER_API_KEY;
    
    if (!apiKey) {
      throw new Error(
        'OPENROUTER_API_KEY is not set in environment variables. ' +
        'Please configure this key in your .env file.'
      );
    }
    
    this.apiKey = apiKey;
  }

  /**
   * Requests a structured completion from the OpenRouter API with automatic
   * validation against the provided Zod schema.
   * 
   * @template T - The expected TypeScript type of the validated response
   * @param options - Configuration for the API request
   * @returns Promise resolving to the validated, typed response
   * @throws {Error} If the API request fails, network error occurs, or validation fails
   * 
   * @example
   * ```typescript
   * const result = await service.getStructuredCompletion<MyType>({
   *   systemPrompt: "You are an expert",
   *   userPrompt: "Generate data",
   *   model: "anthropic/claude-3.5-sonnet",
   *   responseSchema: MySchema
   * });
   * ```
   */
  public async getStructuredCompletion<T>(options: CompletionOptions): Promise<T> {
    // Build the request payload with JSON schema
    const payload = this.buildRequestPayload(options);
    
    // Execute the HTTP request
    const response = await this.executeRequest(payload);
    
    // Validate the response against the provided schema
    const validationResult = options.responseSchema.safeParse(response);
    
    if (!validationResult.success) {
      console.error('Zod validation failed:', validationResult.error);
      console.error('Received data:', JSON.stringify(response, null, 2));
      
      throw new Error(
        'Failed to validate the structured response from the AI model. ' +
        'The response does not match the expected schema.'
      );
    }

    return validationResult.data as T;
  }

  /**
   * Builds the request payload for the OpenRouter API.
   * Converts the Zod schema to JSON Schema format and constructs
   * the complete request object with messages and parameters.
   * 
   * @param options - Configuration options for the completion request
   * @returns The complete request payload ready to send to the API
   * @private
   */
  private buildRequestPayload(options: CompletionOptions): object {
    const { systemPrompt, userPrompt, model, responseSchema, params } = options;

    // Convert Zod schema to JSON Schema format for OpenRouter
    const jsonSchema = zodToJsonSchema(responseSchema, 'responseSchema');

    // Construct the payload according to OpenRouter API specification
    // Note: Some models may not support custom JSON schemas, so we use json_object mode
    return {
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: {
        type: 'json_object',
      },
      // Spread optional parameters (temperature, max_tokens, etc.)
      ...params,
    };
  }

  /**
   * Executes the HTTP request to the OpenRouter API.
   * Handles authentication, request formatting, error responses,
   * and JSON parsing of the response content.
   * 
   * @param payload - The request payload to send to the API
   * @returns Promise resolving to the parsed JSON content from the AI model
   * @throws {Error} If HTTP request fails, returns non-2xx status, or parsing fails
   * @private
   */
  private async executeRequest(payload: object): Promise<any> {
    try {
      // Make the HTTP request to OpenRouter
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'HTTP-Referer': 'https://10xcards.app', // Optional: helps with rate limits
          'X-Title': '10xCards', // Optional: shows in OpenRouter dashboard
        },
        body: JSON.stringify(payload),
      });

      // Handle non-successful HTTP responses
      if (!response.ok) {
        const errorBody = await response.text();
        
        throw new Error(
          `OpenRouter API request failed with status ${response.status}: ${errorBody}`
        );
      }

      // Parse the JSON response
      const data = await response.json();
      
      // Extract and parse the content from the response
      // According to OpenRouter docs, the content is in choices[0].message.content
      if (!data.choices?.[0]?.message?.content) {
        throw new Error(
          'Invalid response structure from OpenRouter API. ' +
          'Expected choices[0].message.content to be present.'
        );
      }
      
      const content = JSON.parse(data.choices[0].message.content);
      
      return content;

    } catch (error) {
      // Log the error for debugging purposes
      console.error('Error executing OpenRouter request:', error);
      
      // Re-throw Error instances with their original message
      if (error instanceof Error) {
        throw error;
      }
      
      // Wrap unknown errors in a standard Error
      throw new Error(
        'An unknown error occurred while communicating with the AI service.'
      );
    }
  }
}
