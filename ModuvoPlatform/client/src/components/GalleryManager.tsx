import { useState } from "react";
import { ObjectUploader } from "./ObjectUploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Upload } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { UploadResult } from "@uppy/core";

interface GalleryImage {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  tags: string[];
}

interface GalleryManagerProps {
  images: GalleryImage[];
  onImagesUpdate: (images: GalleryImage[]) => void;
}

export function GalleryManager({ images, onImagesUpdate }: GalleryManagerProps) {
  const [newImage, setNewImage] = useState({
    title: "",
    description: "",
    imageUrl: "",
    tags: "",
  });
  const [isUploading, setIsUploading] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async (fileName: string) => {
      const response = await fetch('/api/gallery/upload', {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ fileName }),
      });
      if (!response.ok) throw new Error('Upload failed');
      return response.json();
    },
  });

  const handleGetUploadParameters = async () => {
    try {
      const fileName = "gallery-image.jpg"; // Will be replaced with timestamp on server
      const response = await uploadMutation.mutateAsync(fileName);
      return {
        method: "PUT" as const,
        url: response.uploadURL,
      };
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to get upload URL. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleUploadComplete = (result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
    if (result.successful && result.successful.length > 0) {
      const uploadedFile = result.successful[0];
      const uploadURL = (uploadedFile as any).uploadURL as string;
      
      // Convert the uploadURL to our public path
      const fileName = uploadURL.split('/').pop()?.split('?')[0];
      const publicPath = `/public-objects/${fileName}`;
      
      setNewImage(prev => ({
        ...prev,
        imageUrl: publicPath
      }));
      
      toast({
        title: "Upload Successful",
        description: "Image uploaded successfully! Fill in the details below.",
      });
    }
  };

  const handleAddImage = () => {
    if (!newImage.title || !newImage.description || !newImage.imageUrl) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields and upload an image.",
        variant: "destructive",
      });
      return;
    }

    const tags = newImage.tags.split(",").map(tag => tag.trim()).filter(tag => tag.length > 0);
    
    const updatedImages = [
      ...images,
      {
        id: Math.max(...images.map(img => img.id), 0) + 1,
        title: newImage.title,
        description: newImage.description,
        imageUrl: newImage.imageUrl,
        tags,
      }
    ];

    onImagesUpdate(updatedImages);
    setNewImage({ title: "", description: "", imageUrl: "", tags: "" });
    
    toast({
      title: "Image Added",
      description: "New gallery image has been added successfully!",
    });
  };

  const handleRemoveImage = (id: number) => {
    const updatedImages = images.filter(img => img.id !== id);
    onImagesUpdate(updatedImages);
    
    toast({
      title: "Image Removed",
      description: "Gallery image has been removed.",
    });
  };

  return (
    <div className="space-y-8">
      <Card className="bg-white border-moduvo-sage/20">
        <CardHeader>
          <CardTitle className="text-moduvo-charcoal flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add New Gallery Image
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-moduvo-charcoal mb-2">
              Upload Image
            </label>
            <ObjectUploader
              maxNumberOfFiles={1}
              maxFileSize={5242880} // 5MB
              allowedFileTypes={[".jpg", ".jpeg", ".png", ".webp"]}
              onGetUploadParameters={handleGetUploadParameters}
              onComplete={handleUploadComplete}
              buttonClassName="w-full bg-moduvo-sage hover:bg-moduvo-sage/80"
            >
              <div className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Choose Image File
              </div>
            </ObjectUploader>
            {newImage.imageUrl && (
              <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-700">
                Image uploaded successfully: {newImage.imageUrl}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-moduvo-charcoal mb-2">
              Title
            </label>
            <Input
              value={newImage.title}
              onChange={(e) => setNewImage(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., Modern Bedroom Wardrobe"
              className="border-moduvo-sage/30 focus:border-moduvo-sage"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-moduvo-charcoal mb-2">
              Description
            </label>
            <Textarea
              value={newImage.description}
              onChange={(e) => setNewImage(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe the project and what makes it special..."
              className="border-moduvo-sage/30 focus:border-moduvo-sage"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-moduvo-charcoal mb-2">
              Tags (comma-separated)
            </label>
            <Input
              value={newImage.tags}
              onChange={(e) => setNewImage(prev => ({ ...prev, tags: e.target.value }))}
              placeholder="e.g., Bedroom, White, Sliding Doors, Built-in"
              className="border-moduvo-sage/30 focus:border-moduvo-sage"
            />
          </div>

          <Button
            onClick={handleAddImage}
            className="w-full bg-moduvo-gold hover:bg-moduvo-gold/80 text-moduvo-charcoal"
          >
            Add to Gallery
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {images.map((image) => (
          <Card key={image.id} className="bg-white border-moduvo-sage/20">
            <div className="aspect-w-4 aspect-h-3 overflow-hidden rounded-t-lg">
              <img
                src={image.imageUrl}
                alt={image.title}
                className="w-full h-48 object-cover"
              />
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold text-moduvo-charcoal mb-2">{image.title}</h3>
              <p className="text-sm text-moduvo-gray mb-3 line-clamp-2">{image.description}</p>
              <div className="flex flex-wrap gap-1 mb-3">
                {image.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
              <Button
                onClick={() => handleRemoveImage(image.id)}
                variant="destructive"
                size="sm"
                className="w-full"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Remove
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}