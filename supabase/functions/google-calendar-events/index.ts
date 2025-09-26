import { corsHeaders } from '../_shared/cors.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Create Supabase client with service role for user lookup
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Get user from auth header
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get user's Google Calendar configuration
    const { data: calendarConfig, error: configError } = await supabase
      .from('google_calendar_configs')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (configError || !calendarConfig) {
      return new Response(
        JSON.stringify({ error: 'Google Calendar not configured. Please connect your Google Calendar in settings.' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Check if token needs refresh
    const now = new Date()
    const expiresAt = new Date(calendarConfig.expires_at)
    
    let accessToken = calendarConfig.access_token

    if (now >= expiresAt) {
      // Token expired, refresh it
      const refreshResponse = await fetch(`${supabaseUrl}/functions/v1/google-oauth-refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseServiceKey}`,
        },
        body: JSON.stringify({
          refreshToken: calendarConfig.refresh_token
        })
      })

      if (!refreshResponse.ok) {
        return new Response(
          JSON.stringify({ error: 'Failed to refresh Google Calendar access. Please reconnect your account.' }),
          { 
            status: 401, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      const refreshData = await refreshResponse.json()
      accessToken = refreshData.access_token

      // Update stored tokens
      await supabase
        .from('google_calendar_configs')
        .update({
          access_token: accessToken,
          expires_at: new Date(now.getTime() + refreshData.expires_in * 1000).toISOString()
        })
        .eq('user_id', user.id)
    }

    // Fetch calendar events
    const timeMin = new Date().toISOString()
    const timeMax = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    
    const calendarResponse = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&orderBy=startTime&maxResults=50`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        }
      }
    )

    if (!calendarResponse.ok) {
      const error = await calendarResponse.text()
      console.error('Google Calendar API error:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch calendar events', details: error }),
        { 
          status: calendarResponse.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }
    
    const calendarData = await calendarResponse.json()
    
    // Transform events to our format
    const events = calendarData.items?.map((event: any) => ({
      id: event.id,
      title: event.summary || 'Untitled Event',
      start: event.start?.dateTime || event.start?.date,
      end: event.end?.dateTime || event.end?.date,
      location: event.location,
      description: event.description,
      color: getEventColor(event),
      allDay: !event.start?.dateTime, // All-day if no time specified
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