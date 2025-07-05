-- Add new fields to hosting table
ALTER TABLE hosting
ADD COLUMN IF NOT EXISTS disk_space BIGINT,
ADD COLUMN IF NOT EXISTS bandwidth BIGINT,
ADD COLUMN IF NOT EXISTS email_accounts INTEGER,
ADD COLUMN IF NOT EXISTS databases INTEGER,
ADD COLUMN IF NOT EXISTS subdomains INTEGER,
ADD COLUMN IF NOT EXISTS backup_frequency VARCHAR(50),
ADD COLUMN IF NOT EXISTS ssl_included BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS control_panel VARCHAR(50),
ADD COLUMN IF NOT EXISTS server_location VARCHAR(100),
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active',
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Add check constraints
ALTER TABLE hosting
ADD CONSTRAINT chk_hosting_disk_space CHECK (disk_space > 0),
ADD CONSTRAINT chk_hosting_bandwidth CHECK (bandwidth > 0),
ADD CONSTRAINT chk_hosting_email_accounts CHECK (email_accounts >= 0),
ADD CONSTRAINT chk_hosting_databases CHECK (databases >= 0),
ADD CONSTRAINT chk_hosting_subdomains CHECK (subdomains >= 0),
ADD CONSTRAINT chk_hosting_status CHECK (status IN ('active', 'suspended', 'expired', 'cancelled')); 