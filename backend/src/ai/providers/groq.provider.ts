import { FreeAIProvider, LLMCompletionRequest } from '@coach/shared';
import { IProvider, LLMResponse } from '../types';
import { env, FREE_PROVIDER_CAPABILITIES } from '../../config';

export class GroqProvider implements IProvider {
  public readonly name: FreeAIProvider = 'groq';

  public isConfigured(): boolean {
    return Boolean(env.GROQ_API_KEY && env.GROQ_API_KEY.trim().length > 0);
  }

  public async complete(request: LLMCompletionRequest): Promise<LLMResponse> {
    if (!this.isConfigured()) {
      throw new Error('Groq API key is not configured.');
    }

    const caps = FREE_PROVIDER_CAPABILITIES.groq;
    const url = 'https://api.groq.com/openai/v1/chat/completions';
    const startTime = Date.now();

    const systemContent = request.responseFormat === 'json'
      ? `${request.systemPrompt}\n\nIMPORTANT: Respond with pure, valid JSON only. Do not wrap in markdown or backticks.`
      : request.systemPrompt;

    const messages = [
      { role: 'system', content: systemContent },
      { role: 'user', content: request.userPrompt }
    ];

    const bodyPayload: Record<string, any> = {
      model: caps.model,
      messages,
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
          'Authorization': `Bearer ${env.GROQ_API_KEY}`
        },
        body: JSON.stringify(bodyPayload),
        signal: controller.signal
      });

      if (!response.ok) {
        const errorBody = await response.text();
        const err = new Error(`Groq API error [${response.status}]: ${errorBody}`);
        (err as any).statusCode = response.status;
        throw err;
      }

      const data = await response.json() as any;
      const durationMs = Date.now() - startTime;
      const text = data?.choices?.[0]?.message?.content || '';

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
              // Failed JSON parsing
            }
          }
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
