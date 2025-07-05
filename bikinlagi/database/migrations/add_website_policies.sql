-- Add website policies table and relations
CREATE TABLE IF NOT EXISTS website_policies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    website_id UUID REFERENCES websites(id) ON DELETE CASCADE,
    policy_type VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add indices for faster lookups
CREATE INDEX IF NOT EXISTS idx_website_policies_website_id ON website_policies(website_id);
CREATE INDEX IF NOT EXISTS idx_website_policies_type ON website_policies(policy_type);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_website_policies_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_website_policies_timestamp
    BEFORE UPDATE ON website_policies
    FOR EACH ROW
    EXECUTE FUNCTION update_website_policies_updated_at(); 