import { NextResponse } from 'next/server'
import { spawn } from 'child_process'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth'
import path from 'path'
import fs from 'fs'

function parseDbUrl(url: string) {
  try {
    // Use non-pooling URL for direct database access
    const dbUrl = process.env.POSTGRES_URL_NON_POOLING
    if (!dbUrl) {
      throw new Error('POSTGRES_URL_NON_POOLING tidak ditemukan di environment variables')
    }

    // Parse connection URL
    const regex = /^postgres:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/([^?]+)/
    const matches = dbUrl.match(regex)
    
    if (!matches) {
      console.error('Failed to parse database URL:', dbUrl.replace(/:[^:@]+@/, ':****@'))
      throw new Error('Format URL database tidak valid')
    }
    
    const [, user, password, host, port, database] = matches
    
    return {
      user,  // Keep full username with project prefix
      password,
      host: host.trim(),
      port: port.trim(),
      database: database.split('?')[0].trim() // Remove query params
    }
  } catch (error) {
    console.error('Error parsing database URL:', error)
    throw new Error('Gagal mengurai URL database. Pastikan environment variables lengkap.')
  }
}

export async function POST() {
  try {
    const user = await requireAuth()
    if (user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const backupsDir = path.join(process.cwd(), 'database', 'backups')
    if (!fs.existsSync(backupsDir)) {
      fs.mkdirSync(backupsDir, { recursive: true })
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const fileName = `backup-${timestamp}.sql`
    const filePath = path.join(backupsDir, fileName)

    // Parse connection string
    const dbConfig = parseDbUrl('')  // URL now taken from env var

    // Use absolute path for pg_dump
    const pgDumpPath = '/opt/homebrew/opt/postgresql@17/bin/pg_dump'
    
    console.log('Using pg_dump at:', pgDumpPath)
    console.log('Database config:', {
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      database: dbConfig.database,
      // password omitted for security
    })

    // Add SSL mode for Supabase connection
    const pgDump = spawn(pgDumpPath, [
      '-h', dbConfig.host,
      '-p', dbConfig.port,
      '-U', dbConfig.user,
      '-d', dbConfig.database,
      '--no-password',
      '--clean',
      '--if-exists',
      '--verbose',
      '-f', filePath
    ], {
      env: {
        ...process.env,
        PGPASSWORD: dbConfig.password,
        PGSSLMODE: 'require',
        PGSSLCERT: '',
        PGSSLKEY: '',
        PGSSLROOTCERT: ''
      }
    })

    // Log full command for debugging (hide password)
    console.log('Running command:', [
      pgDumpPath,
      '-h', dbConfig.host,
      '-p', dbConfig.port,
      '-U', dbConfig.user,
      '-d', dbConfig.database,
      '--no-password',
      '--clean',
      '--if-exists',
      '--verbose',
      '-f', filePath
    ].join(' '))

    let errorOutput = ''
    let stdoutOutput = ''

    await new Promise((resolve, reject) => {
      pgDump.on('close', (code) => {
        if (code === 0) {
          resolve(true)
        } else {
          reject(new Error(`pg_dump failed (code ${code}): ${errorOutput}`))
        }
      })

      pgDump.stdout.on('data', (data) => {
        stdoutOutput += data.toString()
        console.log(`pg_dump stdout: ${data}`)
      })

      pgDump.stderr.on('data', (data) => {
        errorOutput += data.toString()
        console.error(`pg_dump stderr: ${data}`)
      })

      pgDump.on('error', (err) => {
        // Check if error is NodeJS.ErrnoException which has 'code'
        const nodeError = err as NodeJS.ErrnoException
        const message = nodeError.code === 'ENOENT'
          ? `pg_dump tidak ditemukan di ${pgDumpPath}. Pastikan PostgreSQL client terinstal.`
          : `Gagal menjalankan pg_dump: ${nodeError.message}`
        console.error(message, err)
        reject(new Error(message))
      })
    })

    return NextResponse.json({ 
      success: true, 
      filePath,
      message: 'Backup berhasil dibuat'
    })

  } catch (error: any) {
    // Log full error details for debugging
    console.error('Backup API error:', {
      message: error.message,
      code: (error as NodeJS.ErrnoException).code,
      path: (error as NodeJS.ErrnoException).path,
      stack: error.stack
    })
    return NextResponse.json({ 
      error: error.message || 'Gagal membuat backup database'
    }, { 
      status: 500 
    })
  }
} 