import { gql } from '@apollo/client'

export const GET_AUDIT_LOGS = gql`
  query GetAuditLogs($limit: Int, $offset: Int, $userId: ID, $action: String, $resourceType: String) {
    getAuditLogs(limit: $limit, offset: $offset, userId: $userId, action: $action, resourceType: $resourceType) {
      logs {
        id
        user {
          id
          username
          email
        }
        action
        resourceType
        resourceId
        resourceName
        details
        ipAddress
        userAgent
        createdAt
      }
      totalCount
      hasMore
    }
  }
`

export const GET_USER_AUDIT_LOGS = gql`
  query GetUserAuditLogs($limit: Int, $offset: Int) {
    getUserAuditLogs(limit: $limit, offset: $offset) {
      logs {
        id
        action
        resourceType
        resourceId
        resourceName
        details
        ipAddress
        userAgent
        createdAt
      }
      totalCount
      hasMore
    }
  }
`