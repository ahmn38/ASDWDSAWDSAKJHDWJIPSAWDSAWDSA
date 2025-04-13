import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";

import MainLayout from "./layouts/MainLayout";
import Dashboard from "./pages/Dashboard";
import CaseDetail from "./pages/CaseDetail";
import CreateCase from "./pages/CreateCase";
import EvidenceVault from "./pages/EvidenceVault";
import WitnessManagement from "./pages/WitnessManagement";
import AIAnalytics from "./pages/AIAnalytics";
import NotFound from "./pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/cases/create" component={CreateCase} />
      <Route path="/cases/:id" component={CaseDetail} />
      <Route path="/evidence" component={EvidenceVault} />
      <Route path="/witnesses" component={WitnessManagement} />
      <Route path="/ai-analysis" component={AIAnalytics} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MainLayout>
        <Router />
      </MainLayout>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
