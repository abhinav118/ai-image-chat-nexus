
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY') || Deno.env.get('OPEN_AI_KEY')
    if (!OPENAI_API_KEY) {
      console.error('Missing OpenAI API key')
      return new Response(
        JSON.stringify({ error: 'Missing OpenAI API key' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const requestBody = await req.json()
    console.log('OpenAI request received:', requestBody)

    // Handle image generation requests
    if (requestBody.type === 'image' || requestBody.prompt) {
      const prompt = requestBody.prompt || requestBody.message
      
      if (!prompt) {
        return new Response(
          JSON.stringify({ error: 'Missing prompt for image generation' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      console.log('Generating image with prompt:', prompt)

      const imageResponse = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-image-1',
          prompt: prompt,
          n: 1,
          size: '1024x1024',
          quality: 'standard',
        }),
      })

      console.log('OpenAI image API response status:', imageResponse.status)

      if (!imageResponse.ok) {
        const errorData = await imageResponse.json().catch(() => ({}))
        console.error('OpenAI image API error:', errorData)
        return new Response(
          JSON.stringify({ 
            error: 'Failed to generate image', 
            details: errorData.error?.message || 'Unknown error' 
          }),
          { status: imageResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const imageData = await imageResponse.json()
      console.log('Image generation successful')

      return new Response(
        JSON.stringify({ 
          imageUrl: imageData.data[0]?.url,
          success: true 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Handle chat completion requests
    const messages = requestBody.messages || [
      { role: 'user', content: requestBody.message || requestBody.prompt }
    ]

    console.log('Processing chat completion request')

    const chatResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: messages,
        temperature: 0.7,
      }),
    })

    console.log('OpenAI chat API response status:', chatResponse.status)

    if (!chatResponse.ok) {
      const errorData = await chatResponse.json().catch(() => ({}))
      console.error('OpenAI chat API error:', errorData)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to process chat request', 
          details: errorData.error?.message || 'Unknown error' 
        }),
        { status: chatResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const chatData = await chatResponse.json()
    console.log('Chat completion successful')

    return new Response(
      JSON.stringify({ 
        response: chatData.choices[0]?.message?.content,
        success: true 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
