import { createClient } from '@supabase/supabase-js'

// Supabase
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

// Groq AI
export async function askAI(messages, systemPrompt = '') {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'openai/gpt-oss-120b',
      max_tokens: 2048,
      messages: [
        ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
        ...messages
      ]
    })
  })

  if (!response.ok) {
    const err = await response.json()
    throw new Error(`AI Error: ${err.error?.message || response.statusText}`)
  }

  const data = await response.json()
  return data.choices[0].message.content
}

// Hinglish system prompt
export const HINGLISH_PROMPT = `You are Pluton AI, a friendly and smart study assistant.
Always respond in simple Hinglish (mix of Hindi and English).
Explain concepts clearly and adapt to the student's level.
Be encouraging, fun, and helpful like a senior student friend.`