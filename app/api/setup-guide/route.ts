import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'GOOGLE_OAUTH_COMPLETE_SETUP.md')
    const content = fs.readFileSync(filePath, 'utf8')
    
    return new NextResponse(content, {
      headers: {
        'Content-Type': 'text/plain',
      },
    })
  } catch (error) {
    return new NextResponse('Setup guide not found', { status: 404 })
  }
}
