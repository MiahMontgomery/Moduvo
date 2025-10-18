import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, Calculator } from "lucide-react";

interface ProductConfiguratorProps {
  products: any[];
  components: any[];
  finishes: any[];
  configuration: any;
  onConfigurationChange: (config: any) => void;
  onVisualize: () => void;
  onQuoteRequest: () => void;
}

export default function ProductConfigurator({
  products,
  components,
  finishes,
  configuration,
  onConfigurationChange,
  onVisualize,
  onQuoteRequest,
}: ProductConfiguratorProps) {
  const [selectedComponents, setSelectedComponents] = useState<string[]>([]);

  useEffect(() => {
    if (configuration?.selectedComponents) {
      setSelectedComponents(configuration.selectedComponents.map((c: any) => c.id));
    }
  }, [configuration]);

  const handleProductChange = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product && configuration) {
      onConfigurationChange({
        ...configuration,
        product,
      });
    }
  };

  const handleFinishChange = (finishId: string) => {
    const finish = finishes.find(f => f.id === finishId);
    if (finish && configuration) {
      onConfigurationChange({
        ...configuration,
        finish,
      });
    }
  };

  const handleDimensionChange = (dimension: string, value: string) => {
    if (configuration) {
      onConfigurationChange({
        ...configuration,
        dimensions: {
          ...configuration.dimensions,
          [dimension]: parseInt(value),
        },
      });
    }
  };

  const handleComponentToggle = (componentId: string, checked: boolean) => {
    const component = components.find(c => c.id === componentId);
    if (!component || !configuration) return;

    let newSelectedComponents;
    if (checked) {
      newSelectedComponents = [...(configuration.selectedComponents || []), component];
      setSelectedComponents([...selectedComponents, componentId]);
    } else {
      newSelectedComponents = (configuration.selectedComponents || []).filter((c: any) => c.id !== componentId);
      setSelectedComponents(selectedComponents.filter(id => id !== componentId));
    }

    onConfigurationChange({
      ...configuration,
      selectedComponents: newSelectedComponents,
    });
  };

  const calculatePrice = () => {
    if (!configuration?.product) return 0;
    
    let total = parseFloat(configuration.product.basePrice || '0');
    
    // Add component costs
    if (configuration.selectedComponents) {
      for (const component of configuration.selectedComponents) {
        total += parseFloat(component.price || '0');
      }
    }
    
    // Apply finish multiplier
    if (configuration.finish?.priceMultiplier) {
      total *= parseFloat(configuration.finish.priceMultiplier);
    }
    
    return total;
  };

  if (!configuration) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading configuration...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6 space-y-6">
        <h3 className="text-xl font-semibold mb-4">Base Configuration</h3>
        
        {/* Product Selection */}
        <div>
          <Label className="block text-sm font-medium mb-3">Product Type</Label>
          <Select 
            value={configuration.product?.id || ""} 
            onValueChange={handleProductChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a product" />
            </SelectTrigger>
            <SelectContent>
              {products.map((product) => (
                <SelectItem key={product.id} value={product.id}>
                  {product.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Dimensions */}
        <div>
          <Label className="block text-sm font-medium mb-3">Dimensions</Label>
          <div className="space-y-3">
            <div>
              <Label className="block text-xs text-moduvo-gray mb-1">Width (cm)</Label>
              <Select 
                value={configuration.dimensions?.width?.toString() || "200"} 
                onValueChange={(value) => handleDimensionChange('width', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="120">120cm</SelectItem>
                  <SelectItem value="160">160cm</SelectItem>
                  <SelectItem value="200">200cm</SelectItem>
                  <SelectItem value="240">240cm</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="block text-xs text-moduvo-gray mb-1">Height (cm)</Label>
              <Select 
                value={configuration.dimensions?.height?.toString() || "240"} 
                onValueChange={(value) => handleDimensionChange('height', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="200">200cm</SelectItem>
                  <SelectItem value="220">220cm</SelectItem>
                  <SelectItem value="240">240cm</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="block text-xs text-moduvo-gray mb-1">Depth (cm)</Label>
              <Select 
                value={configuration.dimensions?.depth?.toString() || "58"} 
                onValueChange={(value) => handleDimensionChange('depth', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="58">58cm</SelectItem>
                  <SelectItem value="68">68cm</SelectItem>
                  <SelectItem value="78">78cm</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Finish Options */}
        <div>
          <Label className="block text-sm font-medium mb-3">Finish</Label>
          <div className="grid grid-cols-3 gap-2">
            {finishes.map((finish) => (
              <button
                key={finish.id}
                onClick={() => handleFinishChange(finish.id)}
                className={`aspect-square border-2 rounded-lg relative overflow-hidden group transition-all duration-200 ${
                  configuration.finish?.id === finish.id 
                    ? 'border-moduvo-gold' 
                    : 'border-gray-200 hover:border-moduvo-gold'
                }`}
                style={{ backgroundColor: finish.color }}
              >
                {configuration.finish?.id === finish.id && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                    <div className="w-6 h-6 bg-moduvo-gold rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>
          {configuration.finish && (
            <p className="text-sm text-moduvo-gray mt-2">{configuration.finish.name}</p>
          )}
        </div>

        {/* Components */}
        <div>
          <Label className="block text-sm font-medium mb-3">Components</Label>
          <div className="space-y-3">
            {components.map((component) => (
              <label key={component.id} className="flex items-center space-x-3">
                <Checkbox
                  checked={selectedComponents.includes(component.id)}
                  onCheckedChange={(checked) => handleComponentToggle(component.id, !!checked)}
                  className="data-[state=checked]:bg-moduvo-gold data-[state=checked]:border-moduvo-gold"
                />
                <span className="flex-1">{component.name}</span>
                <span className="text-sm text-moduvo-gray">+${component.price}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Price Summary */}
        <div className="border-t pt-4">
          <div className="flex justify-between items-center text-lg font-semibold">
            <span>Estimated Total</span>
            <span className="text-moduvo-gold">${calculatePrice().toFixed(2)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Button 
            onClick={onVisualize}
            className="w-full bg-moduvo-gold hover:bg-moduvo-gold-light text-white"
          >
            <Eye className="w-4 h-4 mr-2" />
            Visualize Your Space
          </Button>
          <Button 
            onClick={onQuoteRequest}
            variant="outline"
            className="w-full border-moduvo-gold text-moduvo-gold hover:bg-moduvo-gold hover:text-white"
          >
            <Calculator className="w-4 h-4 mr-2" />
            Request Quote
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
