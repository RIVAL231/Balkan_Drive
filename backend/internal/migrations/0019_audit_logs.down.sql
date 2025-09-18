-- Drop audit_logs table and related indexes
DROP INDEX IF EXISTS idx_audit_logs_user_action;
DROP INDEX IF EXISTS idx_audit_logs_created_at;
DROP INDEX IF EXISTS idx_audit_logs_resource_id;
DROP INDEX IF EXISTS idx_audit_logs_resource_type;
DROP INDEX IF EXISTS idx_audit_logs_action;
DROP INDEX IF EXISTS idx_audit_logs_user_id;
DROP TABLE IF EXISTS audit_logs;