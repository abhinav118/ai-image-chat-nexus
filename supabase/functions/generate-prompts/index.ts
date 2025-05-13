
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
    const OPENAI_API_KEY = Deno.env.get('OPEN_AI_KEY')
    if (!OPENAI_API_KEY) {
      throw new Error('Missing OpenAI API key')
    }

    const { userType } = await req.json()
    
    if (!userType) {
      throw new Error('Missing userType parameter')
    }

    console.log(`Generating suggestions for userType: ${userType}`)
    
    // Format user type to be more readable
    const formattedUserType = userType === 'general' 
      ? 'general user'
      : `${userType} owner`.replace(/([A-Z])/g, ' $1').toLowerCase()
    
    const payload = {
      model: "gpt-4o-mini",
      messages: [
        { 
          role: "system", 
          content: `You are a creative assistant that generates prompt ideas for AI image generation. 
          The user is a ${formattedUserType}. Generate 3 short, descriptive visual prompt ideas
          tailored specifically for this profession that they could use to generate marketing images.
          Keep each prompt under 130 characters. Return ONLY a JSON array of strings with no explanation.`
        },
        {
          role: "user",
          content: `Generate 3 creative prompt ideas for AI image generation for a ${formattedUserType}.`
        }
      ],
      temperature: a0.7
    }

    console.log("Sending request to OpenAI")
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    })

    const data = await response.json()
    console.log("OpenAI response received")
    
    if (data.error) {
      console.error("OpenAI API error:", data.error)
      throw new Error(`OpenAI API error: ${data.error.message}`)
    }

    const content = data.choices[0]?.message?.content
    console.log("Raw content from OpenAI:", content)

    let suggestions = []
    try {
      // Try to parse the JSON response
      suggestions = JSON.parse(content)
      
      // Ensure we have an array of strings
      if (!Array.isArray(suggestions)) {
        console.warn("Response is not an array, attempting to extract array")
        // Try to extract array using regex if the response includes other text
        const match = content.match(/\[[\s\S]*?\]/)
        if (match) {
          suggestions = JSON.parse(match[0])
        } else {
          throw new Error("Could not extract array from response")
        }
      }
      
      console.log("Parsed suggestions:", suggestions)
    } catch (error) {
      console.error("Error parsing OpenAI response:", error)
      console.log("Falling back to text splitting")
      
      // Fallback: split the text by lines or commas if JSON parsing fails
      suggestions = content
        .replace(/^\s*\[|\]\s*$/g, '') // Remove brackets
        .split(/",\s*"|',\s*'|\\n/)    // Split by quotes+comma or newlines
        .map(item => item.replace(/^["']|["']$/g, '').trim()) // Remove quotes and trim
        .filter(item => item.length > 0)
        .slice(0, 3)
      
      console.log("Fallback suggestions:", suggestions)
    }

    return new Response(
      JSON.stringify({ suggestions }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error("Function error:", error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
