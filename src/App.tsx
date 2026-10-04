import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import { RoleCode } from './types/enums'

// Auth Pages
import { Login } from './pages/(auth)/Login'
import { ForceChangePassword } from './pages/(auth)/ForceChangePassword'
import { AcceptInvitation } from './pages/(auth)/AcceptInvitation'

// PM Pages
import { PMLayout } from './pages/(pm)/PMLayout'
import { PMDashboard } from './pages/(pm)/PMDashboard'
import { ProjectList } from './pages/(pm)/ProjectList'
import { ProjectOverview } from './pages/(pm)/ProjectOverview'
import { AlignmentSegments } from './pages/(pm)/AlignmentSegments'
import { SurveyRequests } from './pages/(pm)/SurveyRequests'
import { CreateSurvey } from './pages/(pm)/CreateSurvey'
import { AIReviewInbox } from './pages/(pm)/AIReviewInbox'
import { DefectDetailVerify } from './pages/(pm)/DefectDetailVerify'
import { RepairBatching } from './pages/(pm)/RepairBatching'
import { SubmitApproval } from './pages/(pm)/SubmitApproval'
import { AssignCrew } from './pages/(pm)/AssignCrew'
import { DroneMissionAIReview } from './pages/(pm)/DroneMissionAIReview'
import { FieldTasks } from './pages/(pm)/FieldTasks'
import { FastTrackDispatch } from './pages/(pm)/FastTrackDispatch'
import { RepairProposals } from './pages/(pm)/RepairProposals'
import { NotificationsHandoffHub } from './pages/(pm)/NotificationsHandoffHub'

// Supervisor Pages
import { SupLayout } from './pages/(sup)/SupLayout'
import { SupDashboard } from './pages/(sup)/SupDashboard'
import { BatchRejection } from './pages/(sup)/BatchRejection'
import { ProposalApprovalDetail } from './pages/(sup)/ProposalApprovalDetail'
import { EvidenceCloseoutDetail } from './pages/(sup)/EvidenceCloseoutDetail'
import { FieldAcceptance } from './pages/(sup)/FieldAcceptance'
import { RiskAnalytics } from './pages/(sup)/RiskAnalytics'
import { ResearchValidation } from './pages/(sup)/ResearchValidation'
import { AuditTrail } from './pages/(sup)/AuditTrail'
import { SystemControl } from './pages/(sup)/SystemControl'

export const App: React.FC = () => {
  const { user, isAuthenticated } = useAuthStore()

  return (
    <BrowserRouter>
      <Routes>
        {/* Auth routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/force-change-password" element={<ForceChangePassword />} />
        <Route path="/accept-invitation" element={<AcceptInvitation />} />
        <Route path="/invite/:token" element={<AcceptInvitation />} />

        {/* Project Manager routes */}
        <Route path="/pm" element={<PMLayout />}>
          <Route index element={<Navigate to="/pm/dashboard" replace />} />
          <Route path="dashboard" element={<PMDashboard />} />
          <Route path="projects" element={<ProjectList />} />
          <Route path="projects/:id" element={<ProjectOverview />} />
          <Route path="projects/:id/alignment" element={<AlignmentSegments />} />
          <Route path="alignment" element={<AlignmentSegments />} />
          <Route path="surveys" element={<SurveyRequests />} />
          <Route path="surveys/create" element={<CreateSurvey />} />
          <Route path="surveys/:id" element={<DroneMissionAIReview />} />
          <Route path="surveys/:id/review" element={<DroneMissionAIReview />} />
          <Route path="drone-mission" element={<DroneMissionAIReview />} />
          <Route path="drone-mission/:id" element={<DroneMissionAIReview />} />
          <Route path="ai-inbox" element={<AIReviewInbox />} />
          <Route path="defects/:id/verify" element={<DefectDetailVerify />} />
          <Route path="defects/:id/verify-a" element={<DefectDetailVerify />} />
          <Route path="defects/:id/verify-b" element={<DefectDetailVerify />} />
          <Route path="repair-batches/create" element={<RepairBatching />} />
          <Route path="repair-batches/:id/submit" element={<SubmitApproval />} />
          <Route path="repair-batches/assign" element={<AssignCrew />} />
          <Route path="field-tasks" element={<FieldTasks />} />
          <Route path="conflict-center" element={<FieldTasks />} />
          <Route path="fast-track" element={<FastTrackDispatch />} />
          <Route path="dispatch" element={<FastTrackDispatch />} />
          <Route path="proposals" element={<RepairProposals />} />
          <Route path="proposals/:id" element={<ProposalApprovalDetail />} />
          <Route path="work-packages" element={<RepairProposals />} />
          <Route path="work-packages/:id" element={<ProposalApprovalDetail />} />
          <Route path="repair-batches" element={<RepairProposals />} />
          <Route path="repair-batches/:id" element={<ProposalApprovalDetail />} />
          <Route path="work-orders/confirm" element={<EvidenceCloseoutDetail />} />
          <Route path="work-orders/:id/confirm" element={<EvidenceCloseoutDetail />} />
          <Route path="evidence-closeout" element={<EvidenceCloseoutDetail />} />
          <Route path="evidence-closeout/:id" element={<EvidenceCloseoutDetail />} />
          <Route path="acceptance" element={<EvidenceCloseoutDetail />} />
          <Route path="research-validation" element={<ResearchValidation />} />
          <Route path="rpt-09" element={<ResearchValidation />} />
          <Route path="audit-trail" element={<AuditTrail />} />
          <Route path="rpt-10" element={<AuditTrail />} />
          <Route path="reports" element={<RiskAnalytics />} />
          <Route path="risk-analytics" element={<RiskAnalytics />} />
          <Route path="retention" element={<SystemControl />} />
          <Route path="system-control" element={<SystemControl />} />
          <Route path="wf-12" element={<SystemControl />} />
          <Route path="legal-hold" element={<SystemControl />} />
          <Route path="notifications" element={<NotificationsHandoffHub />} />
        </Route>

        {/* Supervisor routes */}
        <Route path="/sup" element={<SupLayout />}>
          <Route index element={<Navigate to="/sup/dashboard" replace />} />
          <Route path="dashboard" element={<SupDashboard />} />
          <Route path="projects" element={<ProjectList />} />
          <Route path="projects/:id" element={<ProjectOverview />} />
          <Route path="projects/:id/alignment" element={<AlignmentSegments />} />
          <Route path="alignment" element={<AlignmentSegments />} />
          <Route path="surveys" element={<SurveyRequests />} />
          <Route path="surveys/:id" element={<DroneMissionAIReview />} />
          <Route path="surveys/:id/review" element={<DroneMissionAIReview />} />
          <Route path="drone-mission" element={<DroneMissionAIReview />} />
          <Route path="drone-mission/:id" element={<DroneMissionAIReview />} />
          <Route path="ai-inbox" element={<AIReviewInbox />} />
          <Route path="fast-track" element={<FastTrackDispatch />} />
          <Route path="dispatch" element={<FastTrackDispatch />} />
          <Route path="field-tasks" element={<FieldTasks />} />
          <Route path="conflict-center" element={<FieldTasks />} />
          <Route path="proposals" element={<RepairProposals />} />
          <Route path="proposals/:id" element={<ProposalApprovalDetail />} />
          <Route path="work-packages" element={<RepairProposals />} />
          <Route path="work-packages/:id" element={<ProposalApprovalDetail />} />
          <Route path="repair-batches" element={<RepairProposals />} />
          <Route path="approvals" element={<Navigate to="/sup/proposals" replace />} />
          <Route path="approvals/:id" element={<ProposalApprovalDetail />} />
          <Route path="approvals/:id/reject" element={<BatchRejection />} />
          <Route path="acceptance" element={<EvidenceCloseoutDetail />} />
          <Route path="acceptance/:batchId" element={<EvidenceCloseoutDetail />} />
          <Route path="field-acceptance" element={<FieldAcceptance />} />
          <Route path="research-validation" element={<ResearchValidation />} />
          <Route path="rpt-09" element={<ResearchValidation />} />
          <Route path="audit-trail" element={<AuditTrail />} />
          <Route path="rpt-10" element={<AuditTrail />} />
          <Route path="evidence-closeout" element={<EvidenceCloseoutDetail />} />
          <Route path="evidence-closeout/:id" element={<EvidenceCloseoutDetail />} />
          <Route path="reports" element={<RiskAnalytics />} />
          <Route path="risk-analytics" element={<RiskAnalytics />} />
          <Route path="system-control" element={<SystemControl />} />
          <Route path="admin" element={<SystemControl />} />
          <Route path="retention" element={<SystemControl />} />
          <Route path="wf-12" element={<SystemControl />} />
          <Route path="legal-hold" element={<SystemControl />} />
          <Route path="signoff" element={<Navigate to="/sup/acceptance" replace />} />
          <Route path="notifications" element={<NotificationsHandoffHub />} />
        </Route>

        {/* Default route */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              user?.role === RoleCode.SUPERVISOR ? (
                <Navigate to="/sup/dashboard" replace />
              ) : (
                <Navigate to="/pm/dashboard" replace />
              )
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Top-level Notifications route */}
        <Route
          path="/notifications"
          element={
            isAuthenticated ? (
              user?.role === RoleCode.SUPERVISOR ? (
                <Navigate to="/sup/notifications" replace />
              ) : (
                <Navigate to="/pm/notifications" replace />
              )
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
