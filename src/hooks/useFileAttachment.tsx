
import { useState } from "react";

export function useFileAttachment() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileDataUrl, setFileDataUrl] = useState<string | null>(null);

  const handleFileSelect = (file: File | null) => {
    setSelectedFile(file);
    
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFileDataUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setFileDataUrl(null);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setFileDataUrl(null);
  };

  return {
    selectedFile,
    fileDataUrl,
    handleFileSelect,
    clearFile
  };
}
