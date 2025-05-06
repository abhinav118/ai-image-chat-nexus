
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, Check, File, Image, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadPreviewProps {
  file: File;
  previewUrl: string | null;
  onRemove: () => void;
  onApplyText: (text: string) => void;
}

const UploadPreview: React.FC<UploadPreviewProps> = ({ 
  file, 
  previewUrl, 
  onRemove,
  onApplyText 
}) => {
  const [fileDescription, setFileDescription] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isImageFile, setIsImageFile] = useState(false);

  useEffect(() => {
    setIsImageFile(file.type.startsWith('image/'));

    // For text-based files, we could read their content
    if (file.type === 'text/plain' || file.name.endsWith('.md') || file.name.endsWith('.txt')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        // Take first 100 chars as preview
        const preview = content.substring(0, 100) + (content.length > 100 ? '...' : '');
        setFileDescription(preview);
      };
      reader.readAsText(file);
    }
  }, [file]);

  const getFileIcon = () => {
    if (file.type.startsWith('image/')) return <Image className="h-5 w-5" />;
    if (file.type === 'text/plain' || file.name.endsWith('.md') || file.name.endsWith('.txt')) {
      return <FileText className="h-5 w-5" />;
    }
    return <File className="h-5 w-5" />;
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center">
          <span className="text-muted-foreground mr-1">{getFileIcon()}</span>
          <span className="text-sm font-medium truncate max-w-[180px]">{file.name}</span>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-6 w-6 p-0 rounded-full" 
          onClick={onRemove}
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>

      {isImageFile && previewUrl && (
        <div className="relative mb-3">
          <img 
            src={previewUrl} 
            alt="Preview" 
            className="w-full h-auto rounded-md max-h-[150px] object-contain bg-black/10"
          />
        </div>
      )}

      {fileDescription && (
        <div className="mb-3">
          <div className="text-xs bg-muted/30 p-2 rounded-md max-h-[80px] overflow-y-auto">
            {fileDescription}
          </div>
        </div>
      )}

      {(fileDescription || isImageFile) && (
        <Button 
          size="sm"
          variant="outline"
          className="w-full text-xs h-8"
          onClick={() => {
            if (isImageFile) {
              onApplyText(`Similar to the uploaded image`);
            } else if (fileDescription) {
              onApplyText(fileDescription.substring(0, 50));
            }
          }}
        >
          <Check className="h-3.5 w-3.5 mr-1" />
          Apply to prompt
        </Button>
      )}
    </div>
  );
};

export default UploadPreview;
