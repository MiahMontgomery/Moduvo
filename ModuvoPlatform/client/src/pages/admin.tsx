import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  DollarSign, 
  Users, 
  Eye, 
  Plus, 
  Upload, 
  BarChart3, 
  Settings,
  TrendingUp,
  Clock,
  CheckCircle
} from "lucide-react";

export default function Admin() {
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

  const { data: quotes = [], isLoading: quotesLoading } = useQuery({
    queryKey: ["/api/admin/quotes"],
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

  // Calculate stats from quotes
  const totalQuotes = quotes?.length || 0;
  const pendingQuotes = quotes?.filter((q: any) => q.status === 'pending').length || 0;
  const totalRevenue = quotes?.reduce((sum: number, q: any) => sum + parseFloat(q.totalPrice || '0'), 0) || 0;
  const recentQuotes = quotes?.slice(0, 5) || [];

  return (
    <div className="min-h-screen bg-moduvo-ivory">
      <Navigation />
      
      <section className="pt-16 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-light mb-4">Admin Dashboard</h1>
            <p className="text-xl text-moduvo-gray">Comprehensive management tools for products, quotes, and analytics</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-moduvo-gray">Total Quotes</p>
                    <p className="text-2xl font-bold text-moduvo-charcoal">{totalQuotes}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <p className="text-sm text-green-600 mt-2">
                  <TrendingUp className="w-3 h-3 inline mr-1" />
                  Active system
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-moduvo-gray">Pending Quotes</p>
                    <p className="text-2xl font-bold text-moduvo-charcoal">{pendingQuotes}</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
                <p className="text-sm text-orange-600 mt-2">Require attention</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-moduvo-gray">Total Revenue</p>
                    <p className="text-2xl font-bold text-moduvo-charcoal">${totalRevenue.toLocaleString()}</p>
                  </div>
                  <div className="w-12 h-12 bg-moduvo-gold/20 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-moduvo-gold" />
                  </div>
                </div>
                <p className="text-sm text-green-600 mt-2">Quote value</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-moduvo-gray">System Status</p>
                    <p className="text-2xl font-bold text-moduvo-charcoal">Online</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <p className="text-sm text-green-600 mt-2">All systems operational</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Quotes */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Quote Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  {quotesLoading ? (
                    <div className="text-center py-8">
                      <div className="w-8 h-8 border-4 border-moduvo-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <p>Loading quotes...</p>
                    </div>
                  ) : recentQuotes.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Customer
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Value
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {recentQuotes.map((quote: any) => (
                            <tr key={quote.id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{quote.customerName}</div>
                                <div className="text-sm text-gray-500">{quote.customerEmail}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                ${quote.totalPrice}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  quote.status === 'sent' ? 'bg-green-100 text-green-800' :
                                  quote.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {quote.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="text-moduvo-gold border-moduvo-gold hover:bg-moduvo-gold hover:text-white"
                                >
                                  Review
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Quotes Yet</h3>
                      <p className="text-moduvo-gray">Quotes will appear here as they are submitted</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start">
                      <Plus className="w-4 h-4 mr-3 text-moduvo-gold" />
                      Add New Product
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Upload className="w-4 h-4 mr-3 text-moduvo-gold" />
                      Upload 3D Model
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <BarChart3 className="w-4 h-4 mr-3 text-moduvo-gold" />
                      View Analytics
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Settings className="w-4 h-4 mr-3 text-moduvo-gold" />
                      System Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">API Status</span>
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Online</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">3D Assets CDN</span>
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Healthy</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">AR Service</span>
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Active</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Email Service</span>
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Connected</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
