
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const OPENAI_API_KEY = Deno.env.get('OPEN_AI_KEY');
    
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key not found in environment variables');
    }

    const { action, data } = await req.json();
    
    if (action === 'chat') {
      return handleChatRequest(OPENAI_API_KEY, data);
    } else if (action === 'image') {
      return handleImageRequest(OPENAI_API_KEY, data);
    } else {
      throw new Error('Invalid action specified');
    }
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({
        error: error.message || 'An unexpected error occurred',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function handleChatRequest(apiKey, data) {
  const { messages } = data;
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: messages,
      temperature: 0.7,
      max_tokens: 1000,
    }),
  });
  
  const result = await response.json();
  
  return new Response(
    JSON.stringify({ 
      response: result.choices[0]?.message || { content: "No response generated" } 
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
}

async function handleImageRequest(apiKey, data) {
  const { prompt, size, style, quality } = data;
  
  const response = await fetch('https://api.openai.com/v1/images/generate', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'dall-e-3',
      prompt: prompt,
      n: 1,
      size: size || '1024x1024',
      style: style || 'vivid',
      quality: quality || 'standard',
    }),
  });
  
  const result = await response.json();
  
  return new Response(
    JSON.stringify({ imageUrl: result.data?.[0]?.url || null }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
}
