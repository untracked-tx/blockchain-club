import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const filename = searchParams.get('filename')

  if (!filename) {
    return NextResponse.json({ error: 'Filename is required' }, { status: 400 })
  }

  try {
    const filePath = path.join(process.cwd(), 'public', 'articles', filename)
    const content = fs.readFileSync(filePath, 'utf8')
    
    return NextResponse.json({ content })
  } catch (error) {
    console.error('Error reading markdown file:', error)
    return NextResponse.json({ error: 'File not found' }, { status: 404 })
  }
}
