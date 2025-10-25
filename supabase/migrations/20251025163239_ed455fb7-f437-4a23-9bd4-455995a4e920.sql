-- Add wifi_latency field to spot_status table
ALTER TABLE spot_status 
ADD COLUMN wifi_latency integer;

COMMENT ON COLUMN spot_status.wifi_latency IS 'WiFi latency in milliseconds';
