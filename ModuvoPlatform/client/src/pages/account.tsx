import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import { useAuth, useLogout } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, FileText, Settings, LogOut, Plus, Edit, DollarSign } from "lucide-react";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function Account() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const logout = useLogout();
  const { toast } = useToast();

  const { data: designs = [], isLoading: designsLoading } = useQuery({
    queryKey: ["/api/designs"],
    enabled: isAuthenticated,
  });

  const { data: quotes = [], isLoading: quotesLoading } = useQuery({
    queryKey: ["/api/quotes"],
    enabled: isAuthenticated,
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-moduvo-ivory flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-moduvo-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-moduvo-ivory">
      <Navigation />
      
      <section className="pt-16 py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-light mb-4">Your Account</h1>
            <p className="text-xl text-moduvo-gray">Manage your saved designs and quote history</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Account Sidebar */}
            <div className="lg:col-span-1">
              <Card>
                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    <div className="w-20 h-20 bg-moduvo-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <User className="w-8 h-8 text-moduvo-gold" />
                    </div>
                    <h3 className="font-semibold">
                      {(user as any)?.firstName && (user as any)?.lastName 
                        ? `${(user as any).firstName} ${(user as any).lastName}` 
                        : (user as any)?.email || 'User'
                      }
                    </h3>
                    <p className="text-sm text-moduvo-gray">{(user as any)?.email}</p>
                  </div>
                  
                  <nav className="space-y-2">
                    <a href="#" className="flex items-center space-x-3 p-3 bg-moduvo-gold/10 text-moduvo-gold rounded-lg font-medium">
                      <FileText className="w-4 h-4" />
                      <span>My Designs</span>
                    </a>
                    <a href="#" className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors duration-200">
                      <DollarSign className="w-4 h-4" />
                      <span>Quotes</span>
                    </a>
                    <a href="#" className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors duration-200">
                      <Settings className="w-4 h-4" />
                      <span>Settings</span>
                    </a>
                    <button 
                      onClick={() => logout.mutate()}
                      className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors duration-200 w-full text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </nav>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <Card>
                <CardHeader>
                  <CardTitle>My Saved Designs</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {designsLoading ? (
                    <div className="text-center py-8">
                      <div className="w-8 h-8 border-4 border-moduvo-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <p>Loading designs...</p>
                    </div>
                  ) : designs && designs.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {designs.map((design: any) => (
                        <div key={design.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-200">
                          <div className="aspect-video bg-gray-100 flex items-center justify-center">
                            <FileText className="w-12 h-12 text-gray-400" />
                          </div>
                          <div className="p-4">
                            <h4 className="font-semibold mb-2">{design.name}</h4>
                            <p className="text-sm text-moduvo-gray mb-3">
                              {design.dimensions?.width}cm × {design.dimensions?.height}cm × {design.dimensions?.depth}cm
                            </p>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-moduvo-gray">
                                {new Date(design.createdAt).toLocaleDateString()}
                              </span>
                              <div className="flex space-x-2">
                                <Button size="sm" variant="outline">
                                  <Edit className="w-3 h-3 mr-1" />
                                  Edit
                                </Button>
                                <Button size="sm" className="bg-moduvo-gold hover:bg-moduvo-gold-light">
                                  Quote
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {/* Add New Design Card */}
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center text-center hover:border-moduvo-gold transition-colors duration-200 cursor-pointer">
                        <div className="w-12 h-12 bg-moduvo-gold/20 rounded-full flex items-center justify-center mb-4">
                          <Plus className="w-6 h-6 text-moduvo-gold" />
                        </div>
                        <h4 className="font-semibold mb-2">Create New Design</h4>
                        <p className="text-sm text-moduvo-gray">Start customizing a new modular storage solution</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Designs Yet</h3>
                      <p className="text-moduvo-gray mb-6">Create your first modular storage design</p>
                      <Button className="bg-moduvo-gold hover:bg-moduvo-gold-light">
                        <Plus className="w-4 h-4 mr-2" />
                        Create First Design
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quotes Section */}
              {quotes && quotes.length > 0 && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Recent Quotes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {quotes.slice(0, 3).map((quote: any) => (
                        <div key={quote.id} className="flex justify-between items-center p-4 border border-gray-200 rounded-lg">
                          <div>
                            <p className="font-medium">${quote.totalPrice}</p>
                            <p className="text-sm text-moduvo-gray">
                              {new Date(quote.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            quote.status === 'sent' ? 'bg-green-100 text-green-800' :
                            quote.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {quote.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
