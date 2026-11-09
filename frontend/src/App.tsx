import { Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { AppLayout } from '@/layouts/AppLayout'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { LeadsPage } from '@/pages/LeadsPage'
import { DealsPage } from '@/pages/DealsPage'
import { CustomersPage } from '@/pages/CustomersPage'
import { PipelinePage } from '@/pages/PipelinePage'
import { TasksPage } from '@/pages/TasksPage'
import { AnalyticsPage } from '@/pages/AnalyticsPage'
import { RevenuePage } from '@/pages/RevenuePage'
import { ReportsPage } from '@/pages/ReportsPage'
import { ForecastPage } from '@/pages/ForecastPage'
import { AutomationPage } from '@/pages/AutomationPage'
import { CampaignsPage } from '@/pages/CampaignsPage'
import { EmailMarketingPage } from '@/pages/EmailMarketingPage'
import { IntegrationsPage } from '@/pages/IntegrationsPage'
import { TeamPage } from '@/pages/TeamPage'
import { HelpPage } from '@/pages/HelpPage'
import { FeedbackPage } from '@/pages/FeedbackPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { PricingPage } from '@/pages/PricingPage'
import { PublicHome } from '@/routes/PublicHome'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<PublicHome />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="leads" element={<LeadsPage />} />
        <Route path="deals" element={<DealsPage />} />
        <Route path="customers" element={<CustomersPage />} />
        <Route path="pipeline" element={<PipelinePage />} />
        <Route path="tasks" element={<TasksPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="revenue" element={<RevenuePage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="forecast" element={<ForecastPage />} />
        <Route path="automation" element={<AutomationPage />} />
        <Route path="campaigns" element={<CampaignsPage />} />
        <Route path="email-marketing" element={<EmailMarketingPage />} />
        <Route path="integrations" element={<IntegrationsPage />} />
        <Route path="team" element={<TeamPage />} />
        <Route path="roles" element={<Navigate to="/team?tab=groups" replace />} />
        <Route path="help" element={<HelpPage />} />
        <Route path="feedback" element={<FeedbackPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="pricing" element={<PricingPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
