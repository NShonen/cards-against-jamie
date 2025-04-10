import { toast } from "@/components/ui/use-toast";

export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string = "UNKNOWN_ERROR",
    public readonly details?: Record<string, any>
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function handleError(
  error: unknown,
  fallbackMessage = "An error occurred"
) {
  console.error("Error:", error);

  if (error instanceof AppError) {
    toast({
      title: "Error",
      description: error.message,
      variant: "destructive",
    });
    return;
  }

  if (error instanceof Error) {
    toast({
      title: "Error",
      description: error.message || fallbackMessage,
      variant: "destructive",
    });
    return;
  }

  toast({
    title: "Error",
    description: fallbackMessage,
    variant: "destructive",
  });
}

export function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    // Check for common network error messages
    const networkErrorMessages = [
      "Failed to fetch",
      "Network request failed",
      "Network Error",
      "net::ERR_INTERNET_DISCONNECTED",
      "net::ERR_PROXY_CONNECTION_FAILED",
      "net::ERR_CONNECTION_TIMED_OUT",
    ];

    return networkErrorMessages.some((msg) =>
      error.message.toLowerCase().includes(msg.toLowerCase())
    );
  }
  return false;
}

export function handleNetworkError(error: unknown) {
  console.error("Network error:", error);

  toast({
    title: "Network Error",
    description: "Please check your internet connection and try again.",
    variant: "destructive",
  });
}

export function handleApiError(error: unknown) {
  console.error("API error:", error);

  if (error instanceof Response) {
    toast({
      title: "API Error",
      description: `Request failed with status ${error.status}`,
      variant: "destructive",
    });
    return;
  }

  toast({
    title: "API Error",
    description: "Failed to communicate with the server. Please try again.",
    variant: "destructive",
  });
}

export function handleValidationError(
  errors: Array<{ path: string; message: string }>
) {
  console.error("Validation errors:", errors);

  const firstError = errors[0];
  if (firstError) {
    toast({
      title: "Validation Error",
      description: firstError.message,
      variant: "destructive",
    });
    return;
  }

  toast({
    title: "Validation Error",
    description: "Please check your input and try again.",
    variant: "destructive",
  });
}
