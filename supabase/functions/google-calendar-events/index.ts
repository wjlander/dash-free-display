import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { calendarId } = await req.json()
    
    if (!calendarId) {
      return new Response(
        JSON.stringify({ error: 'Calendar ID is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const GOOGLE_CALENDAR_API_KEY = Deno.env.get('GOOGLE_CALENDAR_API_KEY')
    
    if (!GOOGLE_CALENDAR_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'Google Calendar API key not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get events for the next 30 days
    const timeMin = new Date().toISOString()
    const timeMax = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    
    const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?key=${GOOGLE_CALENDAR_API_KEY}&timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&orderBy=startTime&maxResults=50`
    
    const response = await fetch(url)
    
    if (!response.ok) {
      const error = await response.text()
      console.error('Google Calendar API error:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch calendar events', details: error }),
        { 
          status: response.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }
    
    const data = await response.json()
    
    // Transform events to our format
    const events = data.items?.map((event: any) => ({
      id: event.id,
      title: event.summary || 'Untitled Event',
      start: event.start?.dateTime || event.start?.date,
      end: event.end?.dateTime || event.end?.date,
      location: event.location,
      description: event.description,
      color: getEventColor(event),
    })) || []

    return new Response(
      JSON.stringify({ events }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  } catch (error) {
    console.error('Error fetching calendar events:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

function getEventColor(event: any): string {
  // Map Google Calendar colors to Tailwind classes
  const colorMap: { [key: string]: string } = {
    '1': 'bg-blue-500',
    '2': 'bg-green-500',
    '3': 'bg-purple-500',
    '4': 'bg-red-500',
    '5': 'bg-yellow-500',
    '6': 'bg-orange-500',
    '7': 'bg-cyan-500',
    '8': 'bg-gray-500',
    '9': 'bg-indigo-500',
    '10': 'bg-emerald-500',
    '11': 'bg-pink-500',
  }
  
  return colorMap[event.colorId] || 'bg-primary'
}