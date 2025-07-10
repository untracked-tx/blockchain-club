# Supabase Realtime Chat Setup

## Database Setup

You'll need to create a `messages` table in your Supabase database with the following SQL:

```sql
-- Create messages table
CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  username TEXT NOT NULL,
  room_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations for authenticated users
CREATE POLICY "Allow all operations for authenticated users" ON messages
  FOR ALL USING (auth.role() = 'authenticated');

-- Enable realtime for the messages table
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
```

## Environment Variables

Make sure your `.env.local` file contains:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Integration Complete

The chat is now integrated into the members lounge page at `/memberslounge` and will:

- Show a live chat interface for verified members only
- Use wallet address as username (truncated for privacy)
- Enable real-time messaging using Supabase
- Automatically handle message persistence and real-time updates

## Features

- ✅ Real-time messaging
- ✅ Message persistence 
- ✅ Member-only access
- ✅ Responsive design
- ✅ Live status indicator
- ✅ Smooth animations
- ✅ Dark theme integration
