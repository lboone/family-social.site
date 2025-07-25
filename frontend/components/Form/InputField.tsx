"use client";

import { cn } from "@/lib/utils";

interface InputFieldProps {
  name: string;
  label?: string;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  errors: Record<string, string>;
  hidden?: boolean;
  containerClassName?: string;
  inputClassName?: string;
  labelClassName?: string;
  iconClassName?: string;
}
const InputField = ({
  name,
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  errors,
  hidden = false,
  containerClassName,
  inputClassName,
  labelClassName,
}: InputFieldProps) => {
  return (
    <div className={cn("mb-4", containerClassName)}>
      {label && !hidden && (
        <label className={cn("auth_label", labelClassName)} htmlFor={name}>
          {label}
        </label>
      )}
      <input
        type={hidden ? "hidden" : type}
        id={name}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={cn("auth_text_input", inputClassName)}
      />
      {errors[name] && (
        <span className="text-red-500 text-sm">{errors[name]}</span>
      )}
    </div>
  );
};
export default InputField;
