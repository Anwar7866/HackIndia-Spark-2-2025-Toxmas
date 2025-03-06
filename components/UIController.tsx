import { useChatStore } from "@/stores/ChatStore";
import { Button, Loader, px, createStyles, MantineTheme } from "@mantine/core";
import {
  IconMicrophone,
  IconMicrophoneOff,
  IconX,
  IconPlayerPlay,
  IconPlayerPause,
  IconVolumeOff,
  IconVolume,
  IconCamera,
  IconPhotoScan,
} from "@tabler/icons-react";
import ChatTextInput from "./ChatTextInput";
import { useRouter } from "next/router";
import UIControllerSettings from "./UIControllerSettings";
import * as OpusRecorder from "@/stores/RecorderActions";
import * as AzureRecorder from "@/stores/AzureRecorderActions";
import { setPushToTalkMode } from "@/stores/ChatActions";
import { useRef, useState } from "react";

// OCR API configuration
const OCR_API_KEY = "cqrykct3wwhhdkxgpl72n6mrpztjv9xq"; // Replace with your actual API key
const OCR_API_URL = "http://azcaptcha.com/in.php";
const OCR_RESULT_URL = "http://azcaptcha.com/res.php";

const styles = createStyles((theme: MantineTheme) => ({
  container: {
    display: "flex",
    justifyContent: "space-between",
    position: "fixed",
    bottom: 0,
    left: 0,
    [`@media (min-width: ${theme.breakpoints.sm})`]: {
      left: 200,
    },
    [`@media (min-width: ${theme.breakpoints.md})`]: {
      left: 250,
    },
    right: 0,
    zIndex: 1,
    maxWidth: 820,
    margin: "0 auto",
    paddingBottom: 16,
    paddingLeft: 8,
    paddingRight: 8,
  },
  playerControls: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end",
    minHeight: "72px",
  },
  textAreaContainer: {
    display: "flex",
    flexGrow: 1,
    alignItems: "flex-end",
  },
  textArea: {
    flexGrow: 1,
  },
  recorderButton: {
    width: "72px",
  },
  recorderControls: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end",
    minHeight: "72px",
  },
  fileInput: {
    display: "none", // Hide the actual file input
  },
  photoUploadButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: "40px",
    height: "40px",
    marginLeft: "8px",
    alignSelf: "flex-end",
    marginBottom: "16px", // Align with text input
    position: "absolute",
    right: "14px",
    top: "5px",
  },
  loadingIndicator: {
    marginRight: "5px",
  },
}));

const ChatInput = () => {
  const { classes } = styles();
  const editingMessage = useChatStore((state) => state.editingMessage);
  const pushToTalkMode = useChatStore((state) => state.pushToTalkMode);
  const audioState = useChatStore((state) => state.audioState);
  const showTextDuringPTT = useChatStore((state) => state.showTextDuringPTT);
  const showTextInput = !pushToTalkMode || showTextDuringPTT || editingMessage;
  console.log("rendered with audioState", audioState);

  return (
    <div className={classes.textAreaContainer}>
      {showTextInput && <ChatTextInput className={classes.textArea} />}
    </div>
  );
};

// Add a photo upload component with OCR functionality
const PhotoUpload = () => {
  const { classes } = styles();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Function to convert file to base64
  interface FileToBase64Result {
    (file: File): Promise<string>;
  }

  const fileToBase64: FileToBase64Result = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        // Extract the base64 part from the data URL
        let base64String = reader.result?.toString() || "";
        base64String = base64String.split(",")[1];
        resolve(base64String);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  // Function to get OCR result
  interface GetOcrResultParams {
    (captchaId: string): Promise<string>;
  }

  const getOcrResult: GetOcrResultParams = async (captchaId) => {
    // We need to poll for results
    let attempts = 0;
    const maxAttempts = 20; // 20 * 5 seconds = 100 seconds max wait time

    while (attempts < maxAttempts) {
      attempts++;

      // Wait 5 seconds between requests as per API docs
      await new Promise((resolve) => setTimeout(resolve, 5000));

      try {
        const response = await fetch(
          `${OCR_RESULT_URL}?key=${OCR_API_KEY}&action=get&id=${captchaId}`
        );
        const result = await response.text();

        if (result.startsWith("OK|")) {
          // Return the recognized text
          return result.substring(3); // Remove "OK|" prefix
        } else if (result === "CAPCHA_NOT_READY") {
          // Keep polling
          continue;
        } else {
          // Error occurred
          throw new Error(`OCR API error: ${result}`);
        }
      } catch (error) {
        console.error("Error getting OCR result:", error);
        throw error;
      }
    }

    throw new Error("OCR timeout: Maximum polling attempts reached");
  };

  // Function to process image with OCR
  interface ProcessImageWithOcrParams {
    (file: File): Promise<void>;
  }

  interface GetOcrResultParams {
    (captchaId: string): Promise<string>;
  }

  const processImageWithOcr: ProcessImageWithOcrParams = async (file) => {
    try {
      setIsProcessing(true);

      // Convert file to base64
      const base64Image = await fileToBase64(file);

      // Send to OCR API
      const formData = new FormData();
      formData.append("key", OCR_API_KEY);
      formData.append("method", "base64");
      formData.append("body", base64Image);

      const response = await fetch(OCR_API_URL, {
        method: "POST",
        body: formData,
      });

      const result = await response.text();

      if (result.startsWith("OK|")) {
        // Get captcha ID
        const captchaId = result.substring(3); // Remove "OK|" prefix

        // Poll for result
        const ocrText = await getOcrResult(captchaId);

        // Set the text in the chat input
        const chatStore = useChatStore.getState();
        if (chatStore.setInputText) {
          chatStore.setInputText(ocrText);
        } else {
          console.warn("setInputText function not found in chat store");
        }

        console.log("OCR Result:", ocrText);
      } else {
        throw new Error(`OCR API error: ${result}`);
      }
    } catch (error) {
      console.error("OCR processing error:", error);
      // You might want to show an error notification to the user here
    } finally {
      setIsProcessing(false);
    }
  };

  // Function to handle file selection
  interface HandleFileSelectParams {
    (event: React.ChangeEvent<HTMLInputElement>): Promise<void>;
  }

  const handleFileSelect: HandleFileSelectParams = async (event) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const selectedFile = files[0];

      // Only process image files
      if (selectedFile.type.startsWith("image/")) {
        await processImageWithOcr(selectedFile);
      } else {
        console.error("Selected file is not an image");
        // You might want to show an error notification to the user here
      }

      // Reset input so the same file can be selected again
      event.target.value = "";
    }
  };

  // Function to trigger the file input click
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        className={classes.fileInput}
        accept="image/*"
        onChange={handleFileSelect}
      />
      <Button
        className={classes.photoUploadButton}
        color="blue"
        variant="light"
        onClick={triggerFileInput}
        title="Upload a photo for OCR"
        disabled={isProcessing}
      >
        {isProcessing ? (
          <>
            <Loader size="sm" className={classes.loadingIndicator} />
            <IconPhotoScan size={20} />
          </>
        ) : (
          <IconCamera size={20} />
        )}
      </Button>
    </>
  );
};

export default function UIController() {
  const { classes } = styles();
  return (
    <div className={classes.container}>
      <ChatInput />
      <PhotoUpload />
    </div>
  );
}
