import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Mail, Check, Loader2 } from "lucide-react";

interface EmailCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  configuration: any;
  arSessionData?: {
    placementCompleted: boolean;
    placementTimestamp?: Date;
    modelType: string;
  };
}

export default function EmailCaptureModal({ 
  isOpen, 
  onClose, 
  configuration,
  arSessionData 
}: EmailCaptureModalProps) {
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    installationAddress: '',
    additionalNotes: ''
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const submitQuoteMutation = useMutation({
    mutationFn: async (data: any) => {
      const quoteData = {
        ...data,
        productConfiguration: configuration,
        arSessionCompleted: arSessionData?.placementCompleted || false,
        placementTimestamp: arSessionData?.placementTimestamp,
        modelType: arSessionData?.modelType || 'geometric',
        emailCapturedAfterAR: !!arSessionData?.placementCompleted,
        leadSource: arSessionData?.placementCompleted ? 'ar_visualization' : 'direct_quote'
      };
      
      return await apiRequest('/api/quotes', 'POST', quoteData);
    },
    onSuccess: () => {
      toast({
        title: "Quote Request Submitted",
        description: "Your detailed quote will be sent to your email within 24 hours.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/quotes'] });
      onClose();
      setFormData({
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        installationAddress: '',
        additionalNotes: ''
      });
    },
    onError: (error) => {
      toast({
        title: "Submission Failed",
        description: "Please try again or contact our support team.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerEmail || !formData.customerName) {
      toast({
        title: "Missing Information",
        description: "Please provide your name and email address.",
        variant: "destructive",
      });
      return;
    }
    submitQuoteMutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {arSessionData?.placementCompleted ? (
              <>
                <Check className="w-5 h-5 text-green-600" />
                AR Experience Complete
              </>
            ) : (
              <>
                <Mail className="w-5 h-5 text-moduvo-sage" />
                Request Your Quote
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {arSessionData?.placementCompleted 
              ? "You've successfully visualized your furniture in AR! Now get a detailed quote sent to your email."
              : "Get a detailed quote for your custom modular storage solution sent directly to your email."
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customerName">Full Name *</Label>
              <Input
                id="customerName"
                value={formData.customerName}
                onChange={(e) => handleInputChange('customerName', e.target.value)}
                placeholder="John Doe"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerEmail">Email Address *</Label>
              <Input
                id="customerEmail"
                type="email"
                value={formData.customerEmail}
                onChange={(e) => handleInputChange('customerEmail', e.target.value)}
                placeholder="john@example.com"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="customerPhone">Phone Number (Optional)</Label>
            <Input
              id="customerPhone"
              type="tel"
              value={formData.customerPhone}
              onChange={(e) => handleInputChange('customerPhone', e.target.value)}
              placeholder="+1 (555) 123-4567"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="installationAddress">Installation Address (Optional)</Label>
            <Textarea
              id="installationAddress"
              value={formData.installationAddress}
              onChange={(e) => handleInputChange('installationAddress', e.target.value)}
              placeholder="123 Main St, Toronto, ON M5V 3A8"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="additionalNotes">Additional Notes (Optional)</Label>
            <Textarea
              id="additionalNotes"
              value={formData.additionalNotes}
              onChange={(e) => handleInputChange('additionalNotes', e.target.value)}
              placeholder="Any specific requirements, timing preferences, or questions..."
              rows={3}
            />
          </div>

          {arSessionData?.placementCompleted && (
            <div className="p-4 bg-moduvo-sage/10 rounded-lg border border-moduvo-sage/30">
              <div className="flex items-center gap-2 text-moduvo-charcoal">
                <Check className="w-4 h-4 text-moduvo-sage" />
                <span className="text-sm font-medium">AR Visualization Completed</span>
              </div>
              <p className="text-sm text-moduvo-gray mt-1">
                Your quote will include the exact dimensions and placement you visualized.
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={submitQuoteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-moduvo-sage hover:bg-moduvo-gold text-white transition-colors duration-200"
              disabled={submitQuoteMutation.isPending}
            >
              {submitQuoteMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Get My Quote
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}