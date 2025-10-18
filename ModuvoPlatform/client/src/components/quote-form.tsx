import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Send, CheckCircle } from "lucide-react";

const quoteFormSchema = z.object({
  customerName: z.string().min(1, "Name is required"),
  customerEmail: z.string().email("Valid email is required"),
  customerPhone: z.string().optional(),
  installationAddress: z.string().optional(),
  additionalNotes: z.string().optional(),
  preferredContact: z.enum(["email", "phone", "both"]).default("email"),
  newsletter: z.boolean().default(false),
});

type QuoteFormData = z.infer<typeof quoteFormSchema>;

interface QuoteFormProps {
  configuration: any;
  onSubmit: () => void;
}

export default function QuoteForm({ configuration, onSubmit }: QuoteFormProps) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const form = useForm<QuoteFormData>({
    resolver: zodResolver(quoteFormSchema),
    defaultValues: {
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      installationAddress: "",
      additionalNotes: "",
      preferredContact: "email",
      newsletter: false,
    },
  });

  const submitQuoteMutation = useMutation({
    mutationFn: async (data: QuoteFormData) => {
      return await apiRequest("POST", "/api/quotes", {
        ...data,
        configuration,
      });
    },
    onSuccess: () => {
      setIsSubmitted(true);
      toast({
        title: "Quote Submitted Successfully",
        description: "We'll send your detailed quote to your email within 24 hours.",
      });
      setTimeout(() => {
        onSubmit();
      }, 3000);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to submit quote. Please try again.",
        variant: "destructive",
      });
      console.error("Quote submission error:", error);
    },
  });

  const handleSubmit = (data: QuoteFormData) => {
    submitQuoteMutation.mutate(data);
  };

  if (isSubmitted) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card>
          <CardContent className="p-12 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
            <h2 className="text-3xl font-semibold mb-4">Quote Submitted Successfully!</h2>
            <p className="text-lg text-moduvo-gray mb-6">
              Thank you for your interest in Moduvo. We'll send your detailed quote to your email within 24 hours.
            </p>
            <p className="text-moduvo-gray">
              A Moduvo representative will contact you shortly to discuss next steps.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-light mb-4">Request Your Custom Quote</h2>
        <p className="text-xl text-moduvo-gray">Get a detailed price estimate delivered directly to your inbox</p>
      </div>

      <Card>
        <CardContent className="p-8 md:p-12">
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Configuration Summary */}
            <div className="bg-gray-50 p-6 rounded-xl mb-8">
              <h3 className="text-lg font-semibold mb-4">Your Configuration</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="text-sm text-moduvo-gray mb-1">Product</div>
                  <div className="font-medium">{configuration?.product?.name || "Modular Storage System"}</div>
                </div>
                <div>
                  <div className="text-sm text-moduvo-gray mb-1">Dimensions</div>
                  <div className="font-medium">
                    {configuration?.dimensions?.width}cm × {configuration?.dimensions?.height}cm × {configuration?.dimensions?.depth}cm
                  </div>
                </div>
                <div>
                  <div className="text-sm text-moduvo-gray mb-1">Finish</div>
                  <div className="font-medium">{configuration?.finish?.name || "White"}</div>
                </div>
                <div>
                  <div className="text-sm text-moduvo-gray mb-1">Estimated Total</div>
                  <div className="font-semibold text-xl text-moduvo-gold">
                    ${((configuration?.product?.basePrice || 0) + 
                       (configuration?.selectedComponents?.reduce((sum: number, c: any) => sum + parseFloat(c.price || '0'), 0) || 0)
                      ).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="customerName">First Name *</Label>
                <Input
                  id="customerName"
                  {...form.register("customerName")}
                  className="mt-2"
                  placeholder="Enter your first name"
                />
                {form.formState.errors.customerName && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.customerName.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="customerEmail">Email Address *</Label>
                <Input
                  id="customerEmail"
                  type="email"
                  {...form.register("customerEmail")}
                  className="mt-2"
                  placeholder="your.email@example.com"
                />
                {form.formState.errors.customerEmail && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.customerEmail.message}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="customerPhone">Phone Number</Label>
              <Input
                id="customerPhone"
                type="tel"
                {...form.register("customerPhone")}
                className="mt-2"
                placeholder="+1 (555) 123-4567"
              />
            </div>

            {/* Project Details */}
            <div>
              <Label htmlFor="installationAddress">Installation Address</Label>
              <Textarea
                id="installationAddress"
                {...form.register("installationAddress")}
                className="mt-2"
                rows={3}
                placeholder="Enter the address where this will be installed"
              />
            </div>

            <div>
              <Label htmlFor="additionalNotes">Additional Notes</Label>
              <Textarea
                id="additionalNotes"
                {...form.register("additionalNotes")}
                className="mt-2"
                rows={4}
                placeholder="Any special requirements, timeline considerations, or questions..."
              />
            </div>

            {/* Preferences */}
            <div>
              <Label className="block text-sm font-medium mb-3">Preferred Contact Method</Label>
              <RadioGroup
                value={form.watch("preferredContact")}
                onValueChange={(value) => form.setValue("preferredContact", value as "email" | "phone" | "both")}
                className="flex space-x-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="email" id="email" />
                  <Label htmlFor="email">Email</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="phone" id="phone" />
                  <Label htmlFor="phone">Phone</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="both" id="both" />
                  <Label htmlFor="both">Both</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Newsletter Signup */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="newsletter"
                checked={form.watch("newsletter")}
                onCheckedChange={(checked) => form.setValue("newsletter", !!checked)}
              />
              <Label htmlFor="newsletter" className="text-sm">
                Subscribe to our newsletter for design inspiration and exclusive offers
              </Label>
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <Button
                type="submit"
                disabled={submitQuoteMutation.isPending}
                className="w-full bg-moduvo-gold text-white py-4 text-lg hover:bg-moduvo-gold-light transition-all duration-300 font-semibold shadow-lg hover:shadow-xl"
              >
                {submitQuoteMutation.isPending ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Submitting...
                  </div>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-3" />
                    Request Full Quote
                  </>
                )}
              </Button>
              <p className="text-sm text-moduvo-gray text-center mt-4">
                You'll receive your detailed quote within 24 hours
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
