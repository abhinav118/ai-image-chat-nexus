
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
      console.error('OpenAI API key not found in environment variables');
      return new Response(
        JSON.stringify({
          error: 'OpenAI API key not configured. Please set the OPEN_AI_KEY in your Supabase Edge Function Secrets.',
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
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
  const { messages, file } = data;
  
  // Prepare the request payload
  const requestPayload = {
    model: 'gpt-4o',
    messages: messages,
    temperature: 0.7,
    max_tokens: 1000,
  };
  
  // If there's a file, add it to the messages
  if (file) {
    // If the last message is from the user, we can add the file to it
    const lastUserMessageIndex = [...messages].reverse().findIndex(msg => msg.role === 'user');
    
    if (lastUserMessageIndex !== -1) {
      // Convert the last user message to have content as an array of objects
      const lastUserMessageRealIndex = messages.length - 1 - lastUserMessageIndex;
      
      // Determine the content type
      const contentType = getContentType(file.type);
      
      // Create a new message list with the file
      const updatedMessages = [...messages];
      
      // If the file is an image, we need to add it as a content array
      if (contentType === 'image') {
        updatedMessages[lastUserMessageRealIndex] = {
          role: 'user',
          content: [
            { type: 'text', text: updatedMessages[lastUserMessageRealIndex].content },
            { 
              type: 'image_url', 
              image_url: { 
                url: `data:${file.type};base64,${file.data}`,
                detail: 'high' 
              } 
            }
          ]
        };
      } else {
        // For non-image files, just note that a file was attached
        const fileName = file.name || 'attachment';
        const updatedContent = `${updatedMessages[lastUserMessageRealIndex].content}\n\n[Attached file: ${fileName}]`;
        updatedMessages[lastUserMessageRealIndex].content = updatedContent;
      }
      
      requestPayload.messages = updatedMessages;
    }
  }
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestPayload),
  });
  
  const result = await response.json();
  
  if (result.error) {
    throw new Error(result.error.message || 'Error from OpenAI API');
  }
  
  return new Response(
    JSON.stringify({ 
      response: result.choices[0]?.message || { content: "No response generated" } 
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
}

function getContentType(mimeType) {
  if (mimeType.startsWith('image/')) {
    return 'image';
  } else if (mimeType.startsWith('video/')) {
    return 'video';
  } else if (mimeType.startsWith('audio/')) {
    return 'audio';
  } else {
    return 'document';
  }
}

async function handleImageRequest(apiKey, data) {
  const { prompt, size, style, quality } = data;
  
  const response = await fetch('https://api.openai.com/v1/images/generations', {
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
  
  if (result.error) {
    throw new Error(result.error.message || 'Error generating image');
  }
  
  return new Response(
    JSON.stringify({ imageUrl: result.data?.[0]?.url || null }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
}
