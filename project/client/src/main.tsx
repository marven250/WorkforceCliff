import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import React from "react";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import ReactDOM from "react-dom/client";
import App from "./Components/App/App.tsx";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import ErrorPage from "./Components/Error/Error.tsx";
import Providers from "./Components/Providers/Providers.tsx";
import LandingPage from "./Components/LandingPage/LandingPage.tsx";
import ContactUs from "./Components/ContactUs/ContactUs.tsx";
import PrivacyPolicy from "./Components/PrivacyPolicy/PrivacyPolicy.tsx";
import CookiePolicy from "./Components/CookiePolicy/CookiePolicy.tsx";
import TermsOfUse from "./Components/TermsOfUse/TermsOfUse.tsx";
import { workforceCliffTheme } from "./theme.ts";
import { AuthProvider } from "./context/AuthContext.tsx";
import RequireAuth from "./Components/Auth/RequireAuth.tsx";
import SignIn from "./Components/Auth/SignIn.tsx";
import SignUpLearner from "./Components/Auth/SignUpLearner.tsx";
import Dashboard from "./Components/Dashboard/Dashboard.tsx";
import AdminInquiries from "./Components/Admin/AdminInquiries.tsx";
import EmployerInquiryPage from "./Components/ForEmployers/EmployerInquiryPage.tsx";
import ProviderInquiryPage from "./Components/ForPartners/ProviderInquiryPage.tsx";
import ForLearnersPage from "./Components/ForLearners/ForLearnersPage.tsx";
import SelectTenantPage from "./Components/Tenant/SelectTenantPage.tsx";
import TenantLayout from "./Components/Tenant/TenantLayout.tsx";
import TenantHomePage from "./Components/Tenant/TenantHomePage.tsx";
import DashboardRedirect from "./Components/Auth/DashboardRedirect.tsx";
import ProvidersRedirect from "./Components/Auth/ProvidersRedirect.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <LandingPage />,
      },
      {
        path: "/sign-in",
        element: <SelectTenantPage />,
      },
      {
        path: "/sign-up",
        element: <Navigate to="/sign-in" replace />,
      },
      {
        path: "/dashboard",
        element: <DashboardRedirect />,
      },
      {
        path: "org/:tenantSlug",
        element: <TenantLayout />,
        children: [
          {
            index: true,
            element: <TenantHomePage />,
          },
          {
            path: "sign-in",
            element: <SignIn />,
          },
          {
            path: "sign-up",
            element: <SignUpLearner />,
          },
          {
            path: "dashboard",
            element: (
              <RequireAuth>
                <Dashboard />
              </RequireAuth>
            ),
          },
          {
            path: "providers",
            element: (
              <RequireAuth roles={["learner"]}>
                <Providers />
              </RequireAuth>
            ),
          },
        ],
      },
      {
        path: "/admin/inquiries",
        element: (
          <RequireAuth roles={["platform_admin"]}>
            <AdminInquiries />
          </RequireAuth>
        ),
      },
      {
        path: "/for-employers",
        element: <EmployerInquiryPage />,
      },
      {
        path: "/for-partners",
        element: <ProviderInquiryPage />,
      },
      {
        path: "/for-learners",
        element: <ForLearnersPage />,
      },
      {
        path: "/contact-us",
        element: <ContactUs />,
      },
      {
        path: "/providers",
        element: <ProvidersRedirect />,
      },
      {
        path: "/privacy",
        element: <PrivacyPolicy />,
      },
      {
        path: "/cookie-policy",
        element: <CookiePolicy />,
      },
      {
        path: "/terms",
        element: <TermsOfUse />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider theme={workforceCliffTheme}>
      <AuthProvider>
        <CssBaseline />
        <RouterProvider router={router} />
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>,
);
