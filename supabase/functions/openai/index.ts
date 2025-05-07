import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

serve(async (req) => {
  console.log('Incoming request:', req.method);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const OPENAI_API_KEY = Deno.env.get('OPEN_AI_KEY');
    if (!OPENAI_API_KEY) {
      console.error('OpenAI API key not found in environment variables');
      return new Response(JSON.stringify({
        error: 'OpenAI API key not configured. Please set the OPEN_AI_KEY in your Supabase Edge Function Secrets.'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { action, data } = await req.json();
    console.log('Parsed request:', { action, data: { ...data, image: data.image ? 'IMAGE_DATA_HERE' : undefined } });

    if (action === 'chat') {
      console.log('Handling chat request');
      return await handleChatRequest(OPENAI_API_KEY, data);
    } else if (action === 'image') {
      console.log('Handling image generation request');
      return await handleImageRequest(OPENAI_API_KEY, data);
    } else if (action === 'image-edit') {
      console.log('Handling image edit request');
      return await handleImageEditRequest(OPENAI_API_KEY, data);
    } else {
      console.warn('Invalid action received:', action);
      throw new Error('Invalid action specified');
    }

  } catch (error) {
    console.error('Unhandled error:', error);
    return new Response(JSON.stringify({
      error: error.message || 'An unexpected error occurred'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function handleChatRequest(apiKey, data) {
  const { messages, file } = data;
  console.log('Preparing chat request payload', { messages, hasFile: !!file });

  const requestPayload = {
    model: 'gpt-4o',
    messages: messages,
    temperature: 0.7,
    max_tokens: 1000
  };

  if (file) {
    console.log('File detected, processing:', file.name || 'Unnamed file');

    const lastUserMessageIndex = [...messages].reverse().findIndex((msg) => msg.role === 'user');
    const lastUserMessageRealIndex = messages.length - 1 - lastUserMessageIndex;

    if (lastUserMessageIndex !== -1) {
      const updatedMessages = [...messages];
      const contentType = getContentType(file.type);
      console.log('File type classified as:', contentType);

      if (contentType === 'image') {
        updatedMessages[lastUserMessageRealIndex] = {
          role: 'user',
          content: [
            {
              type: 'text',
              text: updatedMessages[lastUserMessageRealIndex].content
            },
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
        const fileName = file.name || 'attachment';
        const updatedContent = `${updatedMessages[lastUserMessageRealIndex].content}\n\n[Attached file: ${fileName}]`;
        updatedMessages[lastUserMessageRealIndex].content = updatedContent;
      }

      requestPayload.messages = updatedMessages;
    } else {
      console.warn('No user message found to attach file to.');
    }
  }

  console.log('Sending request to OpenAI with payload:', requestPayload);

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestPayload)
  });

  const result = await response.json();
  console.log('OpenAI API response received:', result);

  if (result.error) {
    console.error('OpenAI API returned error:', result.error);
    throw new Error(result.error.message || 'Error from OpenAI API');
  }

  return new Response(JSON.stringify({
    response: result.choices[0]?.message || { content: "No response generated" }
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

function getContentType(mimeType) {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  return 'document';
}

async function handleImageRequest(apiKey, data) {
  const { prompt, size, style, quality } = data;
  console.log('Image generation request with:', { prompt, size, style, quality });

  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'dall-e-3',
      prompt: prompt,
      n: 1,
      size: size || '1024x1024',
      style: style || 'vivid',
      quality: quality || 'standard'
    })
  });

  const result = await response.json();
  console.log('Image generation response:', result);

  if (result.error) {
    console.error('Image generation failed:', result.error);
    throw new Error(result.error.message || 'Error generating image');
  }

  return new Response(JSON.stringify({
    imageUrl: result.data?.[0]?.url || null
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handleImageEditRequest(apiKey, data) {
  const { prompt, size, n, image } = data;
  console.log('Image edit request with:', { prompt, size, n });

  // Convert base64 to a binary buffer
  const imageBuffer = Uint8Array.from(atob(image), c => c.charCodeAt(0));
  
  // Create form data for multipart/form-data request
  const formData = new FormData();
  formData.append('prompt', prompt);
  formData.append('n', n.toString());
  formData.append('size', size || '1024x1024');
  
  // Add image as form data
  const imageBlob = new Blob([imageBuffer], { type: 'image/png' });
  formData.append('image', imageBlob, 'image.png');

  console.log('Sending request to OpenAI image edit API...');
  
  const response = await fetch('https://api.openai.com/v1/images/edits', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      // Note: Don't set Content-Type here as it's automatically set with correct boundary in multipart/form-data
    },
    body: formData
  });

  const result = await response.json();
  console.log('Image edit response:', result);

  if (result.error) {
    console.error('Image edit failed:', result.error);
    throw new Error(result.error.message || 'Error editing image');
  }

  return new Response(JSON.stringify({
    imageUrl: result.data?.[0]?.url || null
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}
