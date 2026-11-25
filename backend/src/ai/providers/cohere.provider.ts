import { FreeAIProvider, LLMCompletionRequest } from '@coach/shared';
import { IProvider, LLMResponse } from '../types';
import { env, FREE_PROVIDER_CAPABILITIES } from '../../config';

export class CohereProvider implements IProvider {
  public readonly name: FreeAIProvider = 'cohere';

  public isConfigured(): boolean {
    return Boolean(env.COHERE_API_KEY && env.COHERE_API_KEY.trim().length > 0);
  }

  public async complete(request: LLMCompletionRequest): Promise<LLMResponse> {
    if (!this.isConfigured()) {
      throw new Error('Cohere API key is not configured.');
    }

    const caps = FREE_PROVIDER_CAPABILITIES.cohere;
    const url = 'https://api.cohere.com/v2/chat';
    const startTime = Date.now();

    const systemContent = request.responseFormat === 'json'
      ? `${request.systemPrompt}\n\nIMPORTANT: Output pure valid JSON only without markdown code fences.`
      : request.systemPrompt;

    const bodyPayload: Record<string, any> = {
      model: caps.model,
      messages: [
        { role: 'system', content: systemContent },
        { role: 'user', content: request.userPrompt }
      ],
      temperature: request.temperature,
      max_tokens: request.maxTokens
    };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), env.AI_REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${env.COHERE_API_KEY}`
        },
        body: JSON.stringify(bodyPayload),
        signal: controller.signal
      });

      if (!response.ok) {
        const errorBody = await response.text();
        const err = new Error(`Cohere API error [${response.status}]: ${errorBody}`);
        (err as any).statusCode = response.status;
        throw err;
      }

      const data = await response.json() as any;
      const durationMs = Date.now() - startTime;
      const text = data?.message?.content?.[0]?.text || '';

      let parsedJson: any = undefined;
      if (request.responseFormat === 'json') {
        const cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*$/gi, '').trim();
        try {
          parsedJson = JSON.parse(cleaned);
        } catch {
          const firstBrace = cleaned.indexOf('{');
          const lastBrace = cleaned.lastIndexOf('}');
          if (firstBrace !== -1 && lastBrace !== -1) {
            try {
              parsedJson = JSON.parse(cleaned.substring(firstBrace, lastBrace + 1));
            } catch {
              // Fallback parsing failed
            }
          }
        }
      }

      const promptTokens = data?.usage?.tokens?.input_tokens || Math.ceil((request.systemPrompt.length + request.userPrompt.length) / 4);
      const completionTokens = data?.usage?.tokens?.output_tokens || Math.ceil(text.length / 4);

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
