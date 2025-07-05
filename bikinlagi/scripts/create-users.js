const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

// Initialize Supabase client with service role key for admin operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // This is the service role key, not anon key
)

const users = [
  {
    email: 'support@indexof.id',
    password: 'SuperAdmin123!',
    name: 'Super Admin',
    role: 'super_admin'
  },
  {
    email: 'anggiadiputra@yahoo.com',
    password: 'AdminWeb123!',
    name: 'Admin Web',
    role: 'admin_web'
  },
  {
    email: 'no-reply@indexof.id',
    password: 'Finance123!',
    name: 'Finance',
    role: 'finance'
  }
]

async function createUsers() {
  console.log('🚀 Starting user creation process...\n')

  for (const user of users) {
    try {
      console.log(`Creating user: ${user.email}`)
      
      // Create user in Supabase Auth
      const { data, error } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true, // Auto-confirm email
      })

      if (error) {
        console.error(`❌ Error creating auth user for ${user.email}:`, error.message)
        continue
      }

      const userId = data.user.id

      // Insert user into staff table
      const { error: staffError } = await supabase
        .from('staff')
        .insert({
          id: userId,
          email: user.email,
          name: user.name,
          role: user.role
        })

      if (staffError) {
        console.error(`❌ Error inserting staff for ${user.email}:`, staffError.message)
        continue
      }

      console.log(`✅ Created user and staff: ${user.email} (${user.role})`)
      console.log(`📧 Email: ${user.email}`)
      console.log(`🔑 Password: ${user.password}`)
      console.log(`�� Role: ${user.role}`)
      console.log('---')

    } catch (error) {
      console.error(`❌ Unexpected error for ${user.email}:`, error.message)
    }
  }

  console.log('\n🎉 User creation process completed!')
  console.log('\n📝 Login Credentials:')
  console.log('================================')
  users.forEach(user => {
    console.log(`${user.role.toUpperCase()}: ${user.email} / ${user.password}`)
  })
}

// Run the script
createUsers().then(() => {
  console.log('Done!')
  process.exit(0)
}).catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
}) 