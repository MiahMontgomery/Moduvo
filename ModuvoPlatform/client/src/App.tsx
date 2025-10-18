import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import Customize from "@/pages/customize";
import Visualize from "@/pages/visualize";
import Gallery from "@/pages/gallery";
import Account from "@/pages/account";
import Admin from "@/pages/admin";
import GalleryAdmin from "@/pages/gallery-admin";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <>
          <Route path="/" component={Landing} />
          <Route path="/customize" component={Customize} />
          <Route path="/visualize" component={Visualize} />
          <Route path="/gallery" component={Gallery} />
        </>
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/customize" component={Customize} />
          <Route path="/visualize" component={Visualize} />
          <Route path="/gallery" component={Gallery} />
          <Route path="/gallery-admin" component={GalleryAdmin} />
          <Route path="/account" component={Account} />
          <Route path="/admin" component={Admin} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
