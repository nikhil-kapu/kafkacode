# AI Mode (Bring-Your-Own-Key)

Pattern scanning works with zero configuration. To add AI-powered contextual
findings, provide your own API key — KafkaCode calls an OpenAI-compatible chat
API directly, defaulting to [Groq](https://console.groq.com/keys) (free tier).

```bash
export KAFKACODE_API_KEY=your_key_here
kafkacode scan ./src
```

## Configuration

| Variable | Default | Purpose |
| -------- | ------- | ------- |
| `KAFKACODE_API_KEY` | _(unset)_ | Provider API key — **enables AI mode** |
| `KAFKACODE_API_URL` | `https://api.groq.com/openai/v1` | OpenAI-compatible base URL |
| `KAFKACODE_MODEL` | `llama-3.1-8b-instant` | Model name |
| `KAFKACODE_BACKEND_ENDPOINT` | _(unset)_ | Optional self-hosted backend (takes precedence) |

Point `KAFKACODE_API_URL` at OpenAI, OpenRouter, Together, or a local
OpenAI-compatible server (e.g. Ollama) to use a different provider or model.

::: warning Your code is sent to the provider
With a key set, snippets of your code are sent to the configured provider for
analysis. Leave the key unset, or pass `--no-ai`, to keep scans fully local.
:::

## Disabling AI

```bash
# Force pattern-only, even when a key is configured
kafkacode scan ./src --no-ai
```
