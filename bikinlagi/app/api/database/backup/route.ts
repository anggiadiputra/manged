import { NextResponse } from 'next/server'
import { spawn } from 'child_process'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth'
import path from 'path'
import fs from 'fs'

export async function POST() {
  try {
    const user = await requireAuth()
    if (user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const dbUrl = process.env.DATABASE_URL
    if (!dbUrl) {
      throw new Error('DATABASE_URL is not set in environment variables.')
    }

    const backupsDir = path.join(process.cwd(), 'database', 'backups')
    if (!fs.existsSync(backupsDir)) {
      fs.mkdirSync(backupsDir, { recursive: true })
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const fileName = `backup-${timestamp}.sql`
    const filePath = path.join(backupsDir, fileName)

    const pgDumpCmd = process.env.PG_DUMP_PATH || 'pg_dump'
    const pgDump = spawn(pgDumpCmd, [dbUrl, '-f', filePath, '--clean', '--if-exists'])

    await new Promise((resolve, reject) => {
      pgDump.on('close', (code) => {
        if (code === 0) {
          resolve(true)
        } else {
          reject(new Error(`pg_dump process exited with code ${code}`))
        }
      })

      pgDump.stderr.on('data', (data) => {
        console.error(`pg_dump stderr: ${data}`)
      });

      pgDump.on('error', (err) => {
        console.error('Failed to start pg_dump process:', err)
        reject(err)
      })
    })

    return NextResponse.json({ success: true, filePath })

  } catch (error: any) {
    console.error('Backup API error:', error)
    let message = error.message
    if (error.code === 'ENOENT') {
      message = `pg_dump executable tidak ditemukan. Pastikan PostgreSQL client tools terinstal atau set variabel lingkungan PG_DUMP_PATH ke lokasi pg_dump.`
    }
    return NextResponse.json({ error: message }, { status: 500 })
  }
} 