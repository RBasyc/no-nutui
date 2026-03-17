/**
 * Laboratory Member Management API
 * Handles all lab member-related API endpoints
 */

const API_BASE_URL = 'http://localhost:3000/adminapi/lab-member'

const labMemberApi = {
  /**
   * Get user's laboratories
   * GET /adminapi/lab-member/my-labs
   */
  myLabs: `${API_BASE_URL}/my-labs`,

  /**
   * Get current active lab
   * GET /adminapi/lab-member/current
   */
  current: `${API_BASE_URL}/current`,

  /**
   * Switch active lab
   * PUT /adminapi/lab-member/current/:labId
   */
  currentLab: (labId: string): string => `${API_BASE_URL}/current/${labId}`,

  /**
   * Apply to join lab
   * POST /adminapi/lab-member/apply
   */
  apply: `${API_BASE_URL}/apply`,

  /**
   * Get pending members for lab (admin only)
   * GET /adminapi/lab-member/pending/:labId
   */
  pending: (labId: string): string => `${API_BASE_URL}/pending/${labId}`,

  /**
   * Approve application (admin only)
   * PUT /adminapi/lab-member/approve/:memberId
   */
  approve: (memberId: string): string => `${API_BASE_URL}/approve/${memberId}`,

  /**
   * Reject application (admin only)
   * PUT /adminapi/lab-member/reject/:memberId
   */
  reject: (memberId: string): string => `${API_BASE_URL}/reject/${memberId}`,

  /**
   * Get lab members (admin only)
   * GET /adminapi/lab-member/:labId/members
   */
  members: (labId: string): string => `${API_BASE_URL}/${labId}/members`,

  /**
   * Change member role (admin only)
   * PUT /adminapi/lab-member/:memberId/role
   */
  role: (memberId: string): string => `${API_BASE_URL}/${memberId}/role`,

  /**
   * Remove member (admin only)
   * DELETE /adminapi/lab-member/:memberId
   */
  remove: (memberId: string): string => `${API_BASE_URL}/${memberId}`,

  /**
   * Leave lab
   * POST /adminapi/lab-member/leave/:labId
   */
  leave: (labId: string): string => `${API_BASE_URL}/leave/${labId}`,

  /**
   * Get member logs (admin only)
   * GET /adminapi/lab-member/:labId/logs
   */
  logs: (labId: string): string => `${API_BASE_URL}/${labId}/logs`
}

export default labMemberApi
