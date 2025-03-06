// OCRComponent.tsx
import React, { useState, useRef } from "react";
import "./OCRComponent.module.css"; // Create OCRComponent.css

interface OCRComponentProps {
  apiKey: string;
  onOCRComplete: (text: string) => void;
  onOCRError: (error: string) => void;
  onOCRLoading: (loading: boolean) => void;
  selectedImage: string | null;
  setSelectedImage: (image: string | null) => void;
}

const OCRComponent: React.FC<OCRComponentProps> = ({
  apiKey,
  onOCRComplete,
  onOCRError,
  onOCRLoading,
  selectedImage,
  setSelectedImage,
}) => {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [captchaId, setCaptchaId] = useState<number | null>(null);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadAndOCR = async () => {
    if (!selectedImage) {
      onOCRError("Please select an image.");
      return;
    }

    onOCRLoading(true);
    onOCRError("");

    try {
      const base64Image = selectedImage.split(",")[1];
      const formData = new FormData();
      formData.append("key", apiKey);
      formData.append("method", "base64");
      formData.append("body", base64Image);
      formData.append("json", "1");

      const response = await fetch("http://azcaptcha.com/in.php", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      if (data.request) {
        setCaptchaId(parseInt(data.request));
        await getOcrResult(parseInt(data.request));
      } else {
        throw new Error("No captcha ID received.");
      }
    } catch (error: any) {
      onOCRError(error.message || "An error occurred during OCR.");
      onOCRLoading(false);
    }
  };

  const getOcrResult = async (captchaId: number) => {
    let attempts = 0;
    const maxAttempts = 10;
    const interval = 5000;

    const checkResult = async () => {
      try {
        const response = await fetch(
          `http://azcaptcha.com/res.php?key=${apiKey}&action=get&id=${captchaId}&json=1`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.request && data.request !== "CAPCHA_NOT_READY") {
          onOCRComplete(data.request);
          onOCRLoading(false);
          return;
        }

        if (attempts < maxAttempts) {
          attempts++;
          setTimeout(checkResult, interval);
        } else {
          onOCRError("OCR timed out.");
          onOCRLoading(false);
        }
      } catch (error: any) {
        onOCRError(
          error.message || "An error occurred while fetching OCR result."
        );
        onOCRLoading(false);
      }
    };

    checkResult();
  };

  return (
    <div className="ocr-component">
      {/* <div className="image-upload-container">
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          ref={imageInputRef}
          style={{ display: "none" }}
        />
        <button
          onClick={() => imageInputRef.current?.click()}
          className="camera-button"
        >
          <span role="img" aria-label="camera">
            📷
          </span>
        </button>
        {selectedImage && (
          <img src={selectedImage} alt="Selected" className="selected-image" />
        )}
      </div>
      <button onClick={handleUploadAndOCR} className="upload-button">
        Upload and OCR
      </button> */}
    </div>
  );
};

export default OCRComponent;
