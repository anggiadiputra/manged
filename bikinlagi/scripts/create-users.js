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
    name: 'Super Admin User',
    role: 'super_admin'
  },
  {
    email: 'anggiadiputra@yahoo.com',
    password: 'AdminWeb123!',
    name: 'Admin Web User',
    role: 'admin_web'
  },
  {
    email: 'no-reply@indexof.id',
    password: 'Finance123!',
    name: 'Finance User',
    role: 'finance'
  }
]

async function createUsers() {
  console.log('🚀 Starting user creation process...\n')

  for (const userData of users) {
    try {
      console.log(`Creating user: ${userData.email}`)
      
      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true, // Auto-confirm email
        user_metadata: {
          name: userData.name,
          role: userData.role
        }
      })

      if (authError) {
        console.error(`❌ Error creating auth user ${userData.email}:`, authError.message)
        continue
      }

      console.log(`✅ Auth user created: ${userData.email} (ID: ${authData.user.id})`)

      // Insert user into staff table
      const { error: staffError } = await supabase
        .from('staff')
        .insert({
          id: authData.user.id,
          email: userData.email,
          name: userData.name,
          role: userData.role
        })

      if (staffError) {
        console.error(`❌ Error inserting staff record for ${userData.email}:`, staffError.message)
        continue
      }

      console.log(`✅ Staff record created for: ${userData.email}`)
      console.log(`📧 Email: ${userData.email}`)
      console.log(`🔑 Password: ${userData.password}`)
      console.log(`👤 Role: ${userData.role}`)
      console.log('---')

    } catch (error) {
      console.error(`❌ Unexpected error for ${userData.email}:`, error.message)
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
createUsers().catch(console.error) 