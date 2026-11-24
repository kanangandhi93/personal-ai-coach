# Free-Tier AI Provider Setup Guide (₹0 Monthly Cost)

The Personal AI Learning Coach runs strictly on **free tiers** without requiring a credit card or incurring cloud costs.

---

## 1. Supported Free Providers

| Provider | Free Quota | Model | Signup Link |
|---|---|---|---|
| **Google AI Studio (Gemini)** | 15 RPM / 1,500 RPD | `gemini-1.5-flash` | [aistudio.google.com](https://aistudio.google.com/app/apikey) |
| **Groq Cloud** | 30 RPM / 14,400 RPD | `llama-3.1-8b-instant` | [console.groq.com](https://console.groq.com/keys) |
| **OpenRouter** | Free models (:free) | `llama-3.2-3b-instruct:free` | [openrouter.ai](https://openrouter.ai/keys) |
| **Cerebras Cloud** | 30 RPM / 14,400 RPD | `llama3.1-8b` | [cloud.cerebras.ai](https://cloud.cerebras.ai/) |

---

## 2. Configuration Steps

1. Copy `.env.example` in `backend/` to `.env`:
   ```bash
   cp backend/.env.example backend/.env
   ```
2. Paste any of your free API keys into `backend/.env`:
   ```ini
   GEMINI_API_KEY=your_gemini_key_here
   GROQ_API_KEY=your_groq_key_here
   OPENROUTER_API_KEY=your_openrouter_key_here
   CEREBRAS_API_KEY=your_cerebras_key_here
   ```
3. If no keys are provided, the system seamlessly falls back to its built-in zero-cost deterministic mock provider for testing and development.
4. If rate limits (HTTP 429) are reached, the system pauses safely and reports remaining quotas.
