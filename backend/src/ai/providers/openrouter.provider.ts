import { FreeAIProvider, LLMCompletionRequest } from '@coach/shared';
import { IProvider, LLMResponse } from '../types';
import { env, FREE_PROVIDER_CAPABILITIES } from '../../config';

export class OpenRouterProvider implements IProvider {
  public readonly name: FreeAIProvider = 'openrouter';

  public isConfigured(): boolean {
    return Boolean(env.OPENROUTER_API_KEY && env.OPENROUTER_API_KEY.trim().length > 0);
  }

  public async complete(request: LLMCompletionRequest): Promise<LLMResponse> {
    if (!this.isConfigured()) {
      throw new Error('OpenRouter API key is not configured.');
    }

    const caps = FREE_PROVIDER_CAPABILITIES.openrouter;
    const url = 'https://openrouter.ai/api/v1/chat/completions';
    const startTime = Date.now();

    const messages = [
      { role: 'system', content: request.systemPrompt },
      { role: 'user', content: request.userPrompt }
    ];

    const bodyPayload: Record<string, any> = {
      model: caps.model,
      messages,
      temperature: request.temperature,
      max_tokens: request.maxTokens
    };

    if (request.responseFormat === 'json') {
      bodyPayload.response_format = { type: 'json_object' };
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), env.AI_REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${env.OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'https://github.com/personal-ai-learning-coach',
          'X-Title': 'Personal AI Learning Coach'
        },
        body: JSON.stringify(bodyPayload),
        signal: controller.signal
      });

      if (!response.ok) {
        const errorBody = await response.text();
        const err = new Error(`OpenRouter API error [${response.status}]: ${errorBody}`);
        (err as any).statusCode = response.status;
        throw err;
      }

      const data = await response.json() as any;
      const durationMs = Date.now() - startTime;
      const text = data?.choices?.[0]?.message?.content || '';

      let parsedJson: any = undefined;
      if (request.responseFormat === 'json') {
        try {
          parsedJson = JSON.parse(text);
        } catch {
          // Fallback parsing
        }
      }

      const promptTokens = data?.usage?.prompt_tokens || Math.ceil((request.systemPrompt.length + request.userPrompt.length) / 4);
      const completionTokens = data?.usage?.completion_tokens || Math.ceil(text.length / 4);

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
