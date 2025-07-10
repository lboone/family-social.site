import React, { 
  useRef, 
  useState, 
  useEffect, 
  forwardRef, 
  useImperativeHandle,
  useCallback
} from "react";

interface OTPInputProps {
  length?: number;
  value?: string;
  onChange: (otp: string) => void;
  onComplete?: (otp: string) => void;
  className?: string;
  inputClassName?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  placeholder?: string;
}

export interface OTPInputRef {
  clear: () => void;
  focus: () => void;
  setValue: (value: string) => void;
}

const OTPInput = forwardRef<OTPInputRef, OTPInputProps>(({
  length = 6,
  value = "",
  onChange,
  onComplete,
  className = "",
  inputClassName = "",
  disabled = false,
  autoFocus = false,
  placeholder = "",
}, ref) => {
  const [otp, setOtp] = useState<string[]>(Array(length).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Initialize OTP from value prop
  useEffect(() => {
    if (value) {
      const otpArray = value.split("").slice(0, length);
      const paddedOtp = [...otpArray, ...Array(length - otpArray.length).fill("")];
      setOtp(paddedOtp);
    }
  }, [value, length]);

  // Auto-focus first input if autoFocus is true
  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0]?.focus();
    }
  }, [autoFocus]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ): void => {
    const inputValue = e.target.value;
    
    // Only allow digits and single character
    if (/^\d*$/.test(inputValue) && inputValue.length <= 1) {
      const newOtp = [...otp];
      newOtp[index] = inputValue;
      setOtp(newOtp);

      const otpString = newOtp.join("");
      onChange(otpString);

      // Move to next input if current input is filled
      if (inputValue.length === 1 && inputRefs.current[index + 1]) {
        inputRefs.current[index + 1]?.focus();
      }

      // Call onComplete if all digits are filled
      if (otpString.length === length && onComplete) {
        onComplete(otpString);
      }
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ): void => {
    // Handle backspace navigation
    if (
      e.key === "Backspace" &&
      !inputRefs.current[index]?.value &&
      inputRefs.current[index - 1]
    ) {
      inputRefs.current[index - 1]?.focus();
    }

    // Handle arrow key navigation
    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowRight" && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOnPaste = (
    e: React.ClipboardEvent<HTMLInputElement>,
    index: number
  ): void => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    const newOtp = [...otp];

    // Fill from current index
    for (let i = 0; i < pastedData.length && index + i < length; i++) {
      newOtp[index + i] = pastedData[i];
    }

    setOtp(newOtp);
    
    const otpString = newOtp.join("");
    onChange(otpString);

    // Focus the next empty input after pasting or the last filled input
    const nextEmptyIndex = newOtp.findIndex((digit, i) => i >= index && !digit);
    const focusIndex = nextEmptyIndex !== -1 ? nextEmptyIndex : Math.min(index + pastedData.length, length - 1);
    
    if (inputRefs.current[focusIndex]) {
      inputRefs.current[focusIndex]?.focus();
    }

    // Call onComplete if all digits are filled
    if (otpString.length === length && onComplete) {
      onComplete(otpString);
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    // Select all text when input is focused
    e.target.select();
  };

  // Clear all inputs
  const clear = useCallback(() => {
    const newOtp = Array(length).fill("");
    setOtp(newOtp);
    onChange("");
    inputRefs.current[0]?.focus();
  }, [length, onChange]);

  // Set value programmatically
  const setValue = useCallback((newValue: string) => {
    const otpArray = newValue.split("").slice(0, length);
    const paddedOtp = [...otpArray, ...Array(length - otpArray.length).fill("")];
    setOtp(paddedOtp);
    onChange(newValue);
  }, [length, onChange]);

  // Expose methods through ref
  useImperativeHandle(ref, () => ({
    clear,
    focus: () => inputRefs.current[0]?.focus(),
    setValue,
  }), [clear, setValue]);

  return (
    <div className={`flex space-x-2 sm:space-x-4 ${className}`}>
      {Array.from({ length }, (_, index) => (
        <input
          key={index}
          type="text"
          inputMode="numeric"
          pattern="\d*"
          maxLength={1}
          className={`sm:w-20 sm:h-20 w-10 h-10 rounded-lg bg-gray-200 text-lg sm:text-3xl font-bold outline-gray-500 text-center no-spinner transition-colors focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none ${
            disabled ? "opacity-50 cursor-not-allowed" : ""
          } ${inputClassName}`}
          value={otp[index] || ""}
          placeholder={placeholder}
          disabled={disabled}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onChange={(e) => handleChange(e, index)}
          onPaste={(e) => handleOnPaste(e, index)}
          onFocus={handleFocus}
          autoComplete="off"
        />
      ))}
    </div>
  );
});

OTPInput.displayName = "OTPInput";

export default OTPInput;
