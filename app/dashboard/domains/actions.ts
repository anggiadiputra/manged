'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

// Tipe untuk data WHOIS yang diparsing
export type WhoisData = {
  domain_name: string;
  registrar: string;
  registration_date: string;
  expiration_date: string;
  [key: string]: any; // Untuk menampung field lain
};

// Test action sederhana
export async function testAction(formData: FormData) {
  console.log('🚀 TEST ACTION WORKS!');
  const domain = formData.get('domain');
  console.log('Domain received:', domain);
  console.log('FormData entries:', Array.from(formData.entries()));
  // Tidak menggunakan redirect untuk test sederhana
}

// Action #1: Mengambil data WHOIS dan redirect ke halaman konfirmasi
export async function fetchWhoisAndRedirect(formData: FormData) {
  console.log('🔥 SERVER ACTION CALLED!'); // Test sederhana
  
  const domainName = formData.get('domain') as string

  console.log('=== WHOIS Fetch Debug ===');
  console.log('Domain name received:', domainName);

  if (!domainName) {
    console.log('No domain name provided');
    redirect('/dashboard/domains/new?error=Domain+name+is+required.')
  }

  const apiUrl = `https://get.indexof.id/api/whois?domain=${domainName}`;
  console.log('API URL:', apiUrl);

  try {
    console.log('Starting fetch request...');
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Next.js App)',
        'Accept': 'application/json',
      },
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const result = await response.json()
    console.log('Response body:', result);

    if (!response.ok || !result.success) {
      console.log('API returned error or unsuccessful response');
      redirect(`/dashboard/domains/new?error=${encodeURIComponent(result.message || 'Domain not found or invalid.')}&domain=${domainName}`)
    }
    
    // Encode data untuk dilewatkan di URL dan redirect
    const encodedData = encodeURIComponent(JSON.stringify(result.data))
    console.log('Encoded data length:', encodedData.length);
    redirect(`/dashboard/domains/confirm?data=${encodedData}`)

  } catch (error: any) {
    // Jika error adalah NEXT_REDIRECT, biarkan Next.js menanganinya
    if (error?.message === 'NEXT_REDIRECT') {
      throw error;
    }
    
    console.error('WHOIS API Fetch Error Details:');
    console.error('Error type:', error?.constructor?.name);
    console.error('Error message:', error?.message);
    console.error('Full error object:', error);
    redirect(`/dashboard/domains/new?error=${encodeURIComponent('Failed to connect to WHOIS API. Check server console for details.')}&domain=${domainName}`)
  }
}


// Skema validasi untuk form konfirmasi
const FinalDomainSchema = z.object({
  name: z.string(),
  registrar: z.string().optional(),
  registration_date: z.string().optional(),
  expiration_date: z.string().optional(),
  cost: z.coerce.number().optional(),
  notes: z.string().optional(),
});


// Action #2: Menyimpan data final dari halaman konfirmasi
export async function saveDomain(formData: FormData) {
  const validatedFields = FinalDomainSchema.safeParse({
    name: formData.get('name'),
    registrar: formData.get('registrar'),
    registration_date: formData.get('registration_date'),
    expiration_date: formData.get('expiration_date'),
    cost: formData.get('cost'),
    notes: formData.get('notes'),
  })

  if (!validatedFields.success) {
    // Seharusnya tidak terjadi jika form di-generate dengan benar
    throw new Error('Invalid data received from confirmation form.');
  }
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return redirect('/login')
  }

  const { name, registrar, registration_date, expiration_date, cost, notes } = validatedFields.data;

  try {
    const { error } = await supabase.from('domains').insert({
      name,
      registrar: registrar || null,
      registration_date: registration_date || null,
      expiration_date: expiration_date || null,
      cost,
      notes,
      status: 'active',
      created_by: user.id
    })

    if (error) {
       if (error.code === '23505') { 
        // Redirect dengan error jika domain sudah ada
        redirect(`/dashboard/domains/new?error=${encodeURIComponent('This domain already exists in your list.')}`)
      }
      throw new Error(`Database Error: ${error.message}`);
    }
  } catch (e) {
     throw new Error('An unexpected error occurred during database insertion.');
  }

  revalidatePath('/dashboard/domains')
  redirect('/dashboard/domains')
}

// Skema validasi sederhana
const DomainSchema = z.object({
  domain: z.string().min(3, { message: 'Domain name must be at least 3 characters.' }),
  renewal_price: z.coerce.number().optional(),
  note: z.string().optional(),
})

export type State = {
  errors?: {
    domain?: string[]
  }
  message?: string | null
}

// Action utama: Ambil WHOIS + Simpan domain
export async function createDomain(prevState: State, formData: FormData): Promise<State> {
  // 1. Validasi input
  const validatedFields = DomainSchema.safeParse({
    domain: formData.get('domain'),
    renewal_price: formData.get('renewal_price'),
    note: formData.get('note'),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Invalid input data.',
    }
  }

  const { domain, renewal_price, note } = validatedFields.data
  
  // 2. Ambil data WHOIS
  let whoisData: any = null
  try {
    console.log(`🔍 Fetching WHOIS for: ${domain}`)
    const response = await fetch(`https://get.indexof.id/api/whois?domain=${domain}`)
    const result = await response.json()

    if (!response.ok || !result.success) {
      return { 
        message: `WHOIS Error: ${result.message || 'Domain not found or invalid.'}` 
      }
    }
    
    whoisData = result.data
    console.log(`WHOIS Data Status for ${domain}:`, whoisData['Status']);
    console.log(`✅ WHOIS data received for ${domain}`)
  } catch (error) {
    console.error('WHOIS API Error:', error)
    return { 
      message: 'Failed to fetch domain information. Please try again.' 
    }
  }

  // 3. Cek autentikasi
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Determine domain_status based on WHOIS status
  let derivedDomainStatus = 'active';
  const rawWhoisStatus = whoisData['Status']?.toLowerCase() || '';

  if (rawWhoisStatus.includes('expire') || rawWhoisStatus.includes('redemption')) {
    derivedDomainStatus = 'expired';
  } else if (rawWhoisStatus.includes('suspended')) {
    derivedDomainStatus = 'suspended';
  }
  // Add more conditions as needed for other statuses

  // Extract nameservers array
  const nameservers = []
  for (let i = 1; i <= 4; i++) {
    const ns = whoisData[`Nameserver ${i}`]
    if (ns) nameservers.push(ns)
  }

  // 4. Simpan ke database
  try {
    const { error } = await supabase.from('domains').insert({
      name: domain,
      renewal_price: renewal_price || 0,
      note,
      registrar: whoisData['Registrar Name'] || null,
      registration_date: whoisData['Created On']?.split(' ')[0] || null,
      expiration_date: whoisData['Expiration Date']?.split(' ')[0] || null,
      nameservers,
      domain_id_external: whoisData['Domain ID'] || null,
      last_update_date: whoisData['Last Update On']?.split(' ')[0] || null,
      domain_status: derivedDomainStatus,
      whois_status: whoisData['Status'] || null, // Store raw WHOIS status
      dnssec_status: whoisData['DNSSEC'] || 'unsigned',
      hosting_info: '',
      whois_data: whoisData,
      created_by: user.id
    })

    if (error) {
      if (error.code === '23505') {
        return { message: 'This domain already exists in your list.' }
      }
      return { message: `Database Error: ${error.message}` }
    }

    console.log(`✅ Domain ${domain} saved successfully`)
  } catch (e) {
    return { message: 'An unexpected error occurred while saving.' }
  }

  // 5. Berhasil - redirect ke daftar domain
  revalidatePath('/dashboard/domains')
  redirect('/dashboard/domains')
}

export async function getDomains() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('domains').select('*').order('expiration_date', { ascending: true })

  if (error) {
    console.error('Error fetching domains:', error)
    return []
  }

  return data
}

export async function fetchDomainWhois(domainName: string) {
  console.log(`🔍 Fetching WHOIS for existing domain: ${domainName}`)
  
  try {
    const response = await fetch(`https://get.indexof.id/api/whois?domain=${encodeURIComponent(domainName)}`)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    console.log(`✅ WHOIS data received for ${domainName}`)
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch WHOIS data')
    }
    
    return {
      success: true,
      data: data.data
    }
  } catch (error) {
    console.error(`❌ Error fetching WHOIS for ${domainName}:`, error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

export async function getDomainDetails(domainName: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('domains')
    .select('*')
    .eq('name', domainName)
    .single()
  
  if (error) {
    console.error('Error fetching domain details:', error)
    return null
  }
  
  return data
}

// Action untuk memperbarui data WHOIS domain
export async function updateDomainWhois(domainName: string) {
  console.log(`🔄 Updating WHOIS data for: ${domainName}`)
  const supabase = await createClient()
  
  try {
    // 1. Fetch new WHOIS data
    const response = await fetch(`https://get.indexof.id/api/whois?domain=${encodeURIComponent(domainName)}`)
    const result = await response.json()
    
    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Failed to fetch WHOIS data')
    }
    
    const whoisData = result.data
    console.log(`WHOIS Data Status for ${domainName}:`, whoisData['Status']);

    // Determine domain_status based on WHOIS status
    let derivedDomainStatus = 'active';
    const rawWhoisStatus = whoisData['Status']?.toLowerCase() || '';

    if (rawWhoisStatus.includes('expire') || rawWhoisStatus.includes('redemption')) {
      derivedDomainStatus = 'expired';
    } else if (rawWhoisStatus.includes('suspended')) {
      derivedDomainStatus = 'suspended';
    }
    // Add more conditions as needed for other statuses

    // Extract nameservers array
    const nameservers = []
    for (let i = 1; i <= 4; i++) {
      const ns = whoisData[`Nameserver ${i}`]
      if (ns) nameservers.push(ns)
    }
    
    // 2. Update database with new WHOIS data
    const { error: updateError } = await supabase
      .from('domains')
      .update({
        registrar: whoisData['Registrar Name'] || null,
        registration_date: whoisData['Created On']?.split(' ')[0] || null,
        expiration_date: whoisData['Expiration Date']?.split(' ')[0] || null,
        nameservers,
        domain_id_external: whoisData['Domain ID'] || null,
        last_update_date: whoisData['Last Update On']?.split(' ')[0] || null,
        domain_status: derivedDomainStatus,
        whois_status: whoisData['Status'] || null,
        dnssec_status: whoisData['DNSSEC'] || 'unsigned',
        whois_data: whoisData,
        updated_at: new Date().toISOString()
      })
      .eq('name', domainName)
    
    if (updateError) {
      throw updateError
    }
    
    console.log(`✅ WHOIS data updated for ${domainName}`)
    return { success: true, data: whoisData }
    
  } catch (error: any) {
    console.error(`❌ Error updating WHOIS for ${domainName}:`, error)
    // Log detail error tambahan
    console.error('Error object details:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2))
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred - check server logs for details.'
    }
  }
}