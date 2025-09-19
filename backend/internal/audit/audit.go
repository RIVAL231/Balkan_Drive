// Package audit provides comprehensive audit logging functionality for the Balkan Drive system.
// This package handles tracking and logging of all user activities for security, compliance,
// and monitoring purposes. It captures detailed information about file operations, user actions,
// and system events with associated metadata.
//
// The audit system supports various log types including file uploads, downloads, deletions,
// folder operations, and sharing activities. All logs include contextual information such as
// IP addresses, user agents, timestamps, and custom activity details.
package audit

import (
	"context"
	"encoding/json"
	"net/http"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

// AuditLogger handles logging of user activities for security and compliance purposes.
// It provides methods for recording various types of user actions with detailed metadata
// including IP addresses, user agents, and custom activity details. All audit logs are
// stored in the database for long-term retention and analysis.
type AuditLogger struct {
	// db is the PostgreSQL connection pool used for storing audit logs
	db *pgxpool.Pool
}

// NewAuditLogger creates a new audit logger instance with the provided database connection.
// The logger uses the database connection pool for storing audit log entries with
// high performance and reliability. This function should be called once during
// application initialization.
//
// Parameters:
//   - db: PostgreSQL connection pool for audit log storage
//
// Returns a configured AuditLogger ready for use.
func NewAuditLogger(db *pgxpool.Pool) *AuditLogger {
	return &AuditLogger{
		db: db,
	}
}

// ActivityDetails represents additional metadata for audit logs.
// This struct contains optional fields that provide context-specific information
// about the audited activity. Different activity types may use different fields
// to capture relevant details for compliance and analysis purposes.
type ActivityDetails struct {
	// FileSize contains the size of files involved in the activity (in bytes)
	FileSize    *int64  `json:"file_size,omitempty"`
	// FileType contains the MIME type of files involved in the activity
	FileType    *string `json:"file_type,omitempty"`
	// FolderPath contains the path of folders involved in the activity
	FolderPath  *string `json:"folder_path,omitempty"`
	// ShareType indicates the type of sharing operation (public, private, etc.)
	ShareType   *string `json:"share_type,omitempty"`
	// RecipientID contains the ID of users receiving shared content
	RecipientID *string `json:"recipient_id,omitempty"`
}

// LogActivity logs a user activity to the audit log with comprehensive metadata.
// This is the core method that records all user activities in the system for
// security monitoring, compliance tracking, and analytical purposes.
//
// The method automatically extracts and records contextual information from the
// HTTP request including IP address (supporting X-Forwarded-For and X-Real-IP headers
// for proxy environments), User-Agent strings, and timestamps.
//
// Parameters:
//   - ctx: Context for the database operation
//   - userID: ID of the user performing the activity
//   - action: Type of action being performed (e.g., "upload", "download", "delete")
//   - resourceType: Type of resource being acted upon (e.g., "file", "folder")
//   - resourceID: Optional ID of the specific resource
//   - resourceName: Optional name/identifier of the resource for human readability
//   - details: Optional structured metadata specific to the activity type
//   - req: HTTP request context for extracting IP address and user agent
//
// Returns error if the audit log entry cannot be written to the database.
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

// LogFileUpload logs a file upload activity with file metadata.
// This method records when users upload files to the system, capturing
// essential file information for storage analytics and compliance tracking.
//
// Parameters:
//   - ctx: Context for the database operation
//   - userID: ID of the user uploading the file
//   - fileID: Unique identifier of the uploaded file
//   - filename: Name of the uploaded file
//   - fileSize: Size of the uploaded file in bytes
//   - fileType: MIME type of the uploaded file
//   - req: HTTP request context for IP and user agent extraction
//
// Returns error if the audit log entry cannot be written.
func (al *AuditLogger) LogFileUpload(ctx context.Context, userID, fileID string, filename string, fileSize int64, fileType string, req *http.Request) error {
	details := &ActivityDetails{
		FileSize: &fileSize,
		FileType: &fileType,
	}
	return al.LogActivity(ctx, userID, "upload", "file", &fileID, &filename, details, req)
}

// LogFileDownload logs a file download activity for access tracking.
// This method records when users download files, which is essential for
// usage analytics, compliance auditing, and security monitoring.
//
// Parameters:
//   - ctx: Context for the database operation
//   - userID: ID of the user downloading the file
//   - fileID: Unique identifier of the downloaded file
//   - filename: Name of the downloaded file
//   - req: HTTP request context for IP and user agent extraction
//
// Returns error if the audit log entry cannot be written.
func (al *AuditLogger) LogFileDownload(ctx context.Context, userID, fileID string, filename string, req *http.Request) error {
	return al.LogActivity(ctx, userID, "download", "file", &fileID, &filename, nil, req)
}

// LogFileDelete logs a file deletion activity for data governance.
// This method records when users delete files, providing an audit trail
// for data retention policies and security investigations.
//
// Parameters:
//   - ctx: Context for the database operation
//   - userID: ID of the user deleting the file
//   - fileID: Unique identifier of the deleted file
//   - filename: Name of the deleted file
//   - req: HTTP request context for IP and user agent extraction
//
// Returns error if the audit log entry cannot be written.
func (al *AuditLogger) LogFileDelete(ctx context.Context, userID, fileID string, filename string, req *http.Request) error {
	return al.LogActivity(ctx, userID, "delete", "file", &fileID, &filename, nil, req)
}

// LogFolderCreate logs a folder creation activity for organizational tracking.
// This method records when users create new folders, helping track
// organizational changes and user behavior patterns.
//
// Parameters:
//   - ctx: Context for the database operation
//   - userID: ID of the user creating the folder
//   - folderID: Unique identifier of the created folder
//   - folderName: Name of the created folder
//   - req: HTTP request context for IP and user agent extraction
//
// Returns error if the audit log entry cannot be written.
func (al *AuditLogger) LogFolderCreate(ctx context.Context, userID, folderID string, folderName string, req *http.Request) error {
	return al.LogActivity(ctx, userID, "create_folder", "folder", &folderID, &folderName, nil, req)
}

// LogFolderDelete logs a folder deletion activity for data governance.
// This method records when users delete folders, providing an audit trail
// for organizational changes and potential data loss events.
//
// Parameters:
//   - ctx: Context for the database operation
//   - userID: ID of the user deleting the folder
//   - folderID: Unique identifier of the deleted folder
//   - folderName: Name of the deleted folder
//   - req: HTTP request context for IP and user agent extraction
//
// Returns error if the audit log entry cannot be written.
func (al *AuditLogger) LogFolderDelete(ctx context.Context, userID, folderID string, folderName string, req *http.Request) error {
	return al.LogActivity(ctx, userID, "delete_folder", "folder", &folderID, &folderName, nil, req)
}

// LogFileShare logs a file sharing activity for security and compliance tracking.
// This method records when users share files with others, capturing sharing
// details for access control auditing and collaboration monitoring.
//
// The method supports different sharing types (private sharing with specific users,
// public sharing, etc.) and optionally records the recipient for private shares.
//
// Parameters:
//   - ctx: Context for the database operation
//   - userID: ID of the user sharing the file
//   - fileID: Unique identifier of the shared file
//   - filename: Name of the shared file
//   - shareType: Type of sharing ("private", "public", etc.)
//   - recipientID: Optional ID of the recipient for private shares
//   - req: HTTP request context for IP and user agent extraction
//
// Returns error if the audit log entry cannot be written.
func (al *AuditLogger) LogFileShare(ctx context.Context, userID, fileID string, filename string, shareType string, recipientID *string, req *http.Request) error {
	details := &ActivityDetails{
		ShareType:   &shareType,
		RecipientID: recipientID,
	}
	return al.LogActivity(ctx, userID, "share", "file", &fileID, &filename, details, req)
}
