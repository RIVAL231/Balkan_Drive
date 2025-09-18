package audit

import (
	"context"
	"encoding/json"
	"net/http"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

// AuditLogger handles logging of user activities
type AuditLogger struct {
	db *pgxpool.Pool
}

// NewAuditLogger creates a new audit logger instance
func NewAuditLogger(db *pgxpool.Pool) *AuditLogger {
	return &AuditLogger{
		db: db,
	}
}

// ActivityDetails represents additional metadata for audit logs
type ActivityDetails struct {
	FileSize    *int64  `json:"file_size,omitempty"`
	FileType    *string `json:"file_type,omitempty"`
	FolderPath  *string `json:"folder_path,omitempty"`
	ShareType   *string `json:"share_type,omitempty"`
	RecipientID *string `json:"recipient_id,omitempty"`
}

// LogActivity logs a user activity to the audit log
func (al *AuditLogger) LogActivity(ctx context.Context, userID string, action, resourceType string, resourceID *string, resourceName *string, details *ActivityDetails, req *http.Request) error {
	var detailsJSON []byte
	var err error
	
	if details != nil {
		detailsJSON, err = json.Marshal(details)
		if err != nil {
			detailsJSON = nil
		}
	}

	var ipAddress *string
	var userAgent *string
	
	if req != nil {
		// Extract IP address
		ip := req.Header.Get("X-Forwarded-For")
		if ip == "" {
			ip = req.Header.Get("X-Real-IP")
		}
		if ip == "" {
			ip = req.RemoteAddr
		}
		if ip != "" {
			ipAddress = &ip
		}
		
		// Extract user agent
		ua := req.Header.Get("User-Agent")
		if ua != "" {
			userAgent = &ua
		}
	}

	query := `
		INSERT INTO audit_logs (user_id, action, resource_type, resource_id, resource_name, details, ip_address, user_agent, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
	`
	
	_, err = al.db.Exec(ctx, query, userID, action, resourceType, resourceID, resourceName, detailsJSON, ipAddress, userAgent, time.Now())
	return err
}

// Helper methods for common audit log types

// LogFileUpload logs a file upload activity
func (al *AuditLogger) LogFileUpload(ctx context.Context, userID, fileID string, filename string, fileSize int64, fileType string, req *http.Request) error {
	details := &ActivityDetails{
		FileSize: &fileSize,
		FileType: &fileType,
	}
	return al.LogActivity(ctx, userID, "upload", "file", &fileID, &filename, details, req)
}

// LogFileDownload logs a file download activity
func (al *AuditLogger) LogFileDownload(ctx context.Context, userID, fileID string, filename string, req *http.Request) error {
	return al.LogActivity(ctx, userID, "download", "file", &fileID, &filename, nil, req)
}

// LogFileDelete logs a file deletion activity
func (al *AuditLogger) LogFileDelete(ctx context.Context, userID, fileID string, filename string, req *http.Request) error {
	return al.LogActivity(ctx, userID, "delete", "file", &fileID, &filename, nil, req)
}

// LogFolderCreate logs a folder creation activity
func (al *AuditLogger) LogFolderCreate(ctx context.Context, userID, folderID string, folderName string, req *http.Request) error {
	return al.LogActivity(ctx, userID, "create_folder", "folder", &folderID, &folderName, nil, req)
}

// LogFolderDelete logs a folder deletion activity
func (al *AuditLogger) LogFolderDelete(ctx context.Context, userID, folderID string, folderName string, req *http.Request) error {
	return al.LogActivity(ctx, userID, "delete_folder", "folder", &folderID, &folderName, nil, req)
}

// LogFileShare logs a file sharing activity
func (al *AuditLogger) LogFileShare(ctx context.Context, userID, fileID string, filename string, shareType string, recipientID *string, req *http.Request) error {
	details := &ActivityDetails{
		ShareType:   &shareType,
		RecipientID: recipientID,
	}
	return al.LogActivity(ctx, userID, "share", "file", &fileID, &filename, details, req)
}
