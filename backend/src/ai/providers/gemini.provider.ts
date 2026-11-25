import { FreeAIProvider, LLMCompletionRequest } from '@coach/shared';
import { IProvider, LLMResponse } from '../types';
import { env, FREE_PROVIDER_CAPABILITIES } from '../../config';

export class GeminiProvider implements IProvider {
  public readonly name: FreeAIProvider = 'gemini';

  public isConfigured(): boolean {
    return Boolean(env.GEMINI_API_KEY && env.GEMINI_API_KEY.startsWith('AIza'));
  }

  public async complete(request: LLMCompletionRequest): Promise<LLMResponse> {
    if (!this.isConfigured()) {
      throw new Error('Gemini API key is not configured.');
    }

    const caps = FREE_PROVIDER_CAPABILITIES.gemini;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${caps.model}:generateContent?key=${env.GEMINI_API_KEY}`;
    const startTime = Date.now();

    const contents = [
      {
        role: 'user',
        parts: [
          { text: `SYSTEM INSTRUCTIONS:\n${request.systemPrompt}\n\nUSER PROMPT:\n${request.userPrompt}` }
        ]
      }
    ];

    const generationConfig: Record<string, any> = {
      temperature: request.temperature,
      maxOutputTokens: request.maxTokens
    };

    if (request.responseFormat === 'json') {
      generationConfig.responseMimeType = 'application/json';
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), env.AI_REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents, generationConfig }),
        signal: controller.signal
      });

      if (!response.ok) {
        const errorBody = await response.text();
        const err = new Error(`Gemini API error [${response.status}]: ${errorBody}`);
        (err as any).statusCode = response.status;
        throw err;
      }

      const data = await response.json() as any;
      const durationMs = Date.now() - startTime;
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

      let parsedJson: any = undefined;
      if (request.responseFormat === 'json') {
        try {
          parsedJson = JSON.parse(text);
        } catch {
          // JSON parsing fallback
        }
      }

      const promptTokens = data?.usageMetadata?.promptTokenCount || Math.ceil((request.systemPrompt.length + request.userPrompt.length) / 4);
      const completionTokens = data?.usageMetadata?.candidatesTokenCount || Math.ceil(text.length / 4);

      return {
        text,
        parsedJson,
        provider: this.name,
        model: caps.model,
        tokens: {
          prompt: promptTokens,
          completion: completionTokens,
          total: promptTokens + completionTokens
        },
        durationMs
      };
    } finally {
      clearTimeout(timeout);
    }
  }
}
