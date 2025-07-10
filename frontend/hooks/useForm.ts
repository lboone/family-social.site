import { handleAuthRequest } from "@/components/utils/apiRequests";
import { UseFormHandleSubmit } from "@/types";
import { ChangeEvent, FormEvent, useState } from "react";
import { toast } from "sonner";

// Generic form hook that can work with any form data type
export function useForm<T extends Record<string, string | number | boolean>>(
  initialValues: T
) {
  const [formData, setFormData] = useState<T>(initialValues);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ): void => {
    const { name, value, type } = e.target;

    // Handle different input types
    let newValue: string | number | boolean = value;

    if (type === "checkbox") {
      newValue = (e.target as HTMLInputElement).checked;
    } else if (type === "number") {
      newValue = value === "" ? "" : Number(value);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = ({ onSubmit, options }: UseFormHandleSubmit) => {
    return async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      // Clear previous errors
      setErrors({});

      // Run validation if provided
      if (options?.validate) {
        const validationErrors = options.validate(formData);
        if (validationErrors) {
          setErrors(validationErrors);
          return;
        }
      }

      const result = await handleAuthRequest(formData, onSubmit, setIsLoading);

      if (result) {
        options?.onSuccess?.();
        if (options?.resetOnSuccess) {
          resetForm();
        }
        toast.success(result.data.message || "Form submitted successfully");
      } else {
        const err =
          result instanceof Error
            ? result
            : new Error("An unknown error occurred");

        // Call error callback if provided
        if (options?.onError) {
          options.onError(err);
        } else {
          // Default error handling
          console.error("Form submission error:", err);
          setErrors({ submit: err.message });
        }
      }
    };
  };

  const resetForm = (): void => {
    setFormData(initialValues);
    setErrors({});
  };

  const updateField = (field: keyof T, value: T[keyof T]): void => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateMultipleFields = (updates: Partial<T>): void => {
    setFormData((prev) => ({
      ...prev,
      ...updates,
    }));
  };

  const setFieldError = (field: string, error: string): void => {
    setErrors((prev) => ({
      ...prev,
      [field]: error,
    }));
  };

  const clearErrors = (): void => {
    setErrors({});
  };

  return {
    formData,
    handleChange,
    handleSubmit,
    resetForm,
    updateField,
    updateMultipleFields,
    isLoading,
    setIsLoading,
    setFormData,
    errors,
    setErrors,
    setFieldError,
    clearErrors,
  };
}

export default useForm;
