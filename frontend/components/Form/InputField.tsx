"use client";

import { cn } from "@/lib/utils";

interface InputFieldProps {
  name: string;
  label?: string;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
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
  containerClassName,
  inputClassName,
  labelClassName,
}: InputFieldProps) => {
  return (
    <div className={cn("mb-4", containerClassName)}>
      {label && (
        <label className={cn("auth_label", labelClassName)} htmlFor={name}>
          {label}
        </label>
      )}
      <input
        type={type}
        id={name}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={cn("auth_text_input", inputClassName)}
      />
    </div>
  );
};
export default InputField;
