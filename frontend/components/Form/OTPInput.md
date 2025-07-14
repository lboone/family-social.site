# OTPInput Component

A reusable, accessible, and feature-rich OTP (One-Time Password) input component for React applications.

## Features

- ✅ **Fully Accessible** - ARIA labels and keyboard navigation
- ✅ **Auto-focus Management** - Automatic focus on next/previous inputs
- ✅ **Paste Support** - Paste entire OTP codes from clipboard
- ✅ **Keyboard Navigation** - Arrow keys, backspace navigation
- ✅ **TypeScript Support** - Full type safety with TypeScript
- ✅ **Customizable** - Flexible styling and configuration options
- ✅ **Form Integration** - Works seamlessly with form libraries
- ✅ **Ref Support** - Imperative API for programmatic control

## Installation

The component is already included in your project at `components/Form/OTPInput.tsx`.

## Basic Usage

```tsx
import React, { useState } from "react";
import OTPInput from "@/components/Form/OTPInput";

function MyComponent() {
  const [otp, setOtp] = useState("");

  return (
    <OTPInput
      length={6}
      value={otp}
      onChange={setOtp}
      onComplete={(value) => console.log("OTP completed:", value)}
      autoFocus
    />
  );
}
```

## Props

| Prop             | Type                      | Default  | Description                        |
| ---------------- | ------------------------- | -------- | ---------------------------------- |
| `length`         | `number`                  | `6`      | Number of OTP digits               |
| `value`          | `string`                  | `""`     | Current OTP value                  |
| `onChange`       | `(value: string) => void` | required | Callback when OTP changes          |
| `onComplete`     | `(value: string) => void` | optional | Callback when OTP is fully entered |
| `className`      | `string`                  | `""`     | CSS class for the container        |
| `inputClassName` | `string`                  | `""`     | CSS class for individual inputs    |
| `disabled`       | `boolean`                 | `false`  | Disable all inputs                 |
| `autoFocus`      | `boolean`                 | `false`  | Auto-focus first input on mount    |
| `placeholder`    | `string`                  | `""`     | Placeholder text for inputs        |

## Ref API

You can get a reference to the component to control it programmatically:

```tsx
import React, { useRef } from "react";
import OTPInput, { OTPInputRef } from "@/components/Form/OTPInput";

function MyComponent() {
  const otpRef = useRef<OTPInputRef>(null);

  const handleClear = () => {
    otpRef.current?.clear();
  };

  const handleFocus = () => {
    otpRef.current?.focus();
  };

  const handleSetValue = () => {
    otpRef.current?.setValue("123456");
  };

  return (
    <div>
      <OTPInput ref={otpRef} length={6} onChange={setValue} />
      <button onClick={handleClear}>Clear</button>
      <button onClick={handleFocus}>Focus</button>
      <button onClick={handleSetValue}>Set Value</button>
    </div>
  );
}
```

### Ref Methods

| Method                    | Description                                |
| ------------------------- | ------------------------------------------ |
| `clear()`                 | Clear all inputs and focus first input     |
| `focus()`                 | Focus the first empty input or first input |
| `setValue(value: string)` | Set the OTP value programmatically         |

## Integration with useForm Hook

The component works seamlessly with the custom `useForm` hook:

```tsx
import React, { useRef } from "react";
import { useForm } from "@/hooks/useForm";
import OTPInput, { OTPInputRef } from "@/components/Form/OTPInput";

interface VerifyFormData {
  otp: string;
}

function VerifyComponent() {
  const otpRef = useRef<OTPInputRef>(null);

  const { formData, updateField, handleSubmit, isLoading, errors } =
    useForm<VerifyFormData>({
      otp: "",
    });

  const onSubmit = async (data: VerifyFormData) => {
    // Submit to your API
    return await api.verifyOTP(data.otp);
  };

  const validateForm = (data: VerifyFormData) => {
    const errors: Record<string, string> = {};

    if (!data.otp.trim()) {
      errors.otp = "OTP is required";
    } else if (data.otp.length !== 6 || !/^\\d+$/.test(data.otp)) {
      errors.otp = "OTP must be exactly 6 digits";
    }

    return Object.keys(errors).length > 0 ? errors : null;
  };

  const options = {
    validate: validateForm,
    onSuccess: (result) => {
      console.log("OTP verified successfully:", result);
    },
  };

  return (
    <form onSubmit={handleSubmit({ onSubmit, options })}>
      <OTPInput
        ref={otpRef}
        length={6}
        value={formData.otp}
        onChange={(value) => updateField("otp", value)}
        onComplete={(value) => console.log("OTP completed:", value)}
        autoFocus
      />

      {errors.otp && <p className="text-red-500 text-sm">{errors.otp}</p>}

      <button type="submit" disabled={isLoading || formData.otp.length !== 6}>
        {isLoading ? "Verifying..." : "Verify"}
      </button>
    </form>
  );
}
```

## Styling

### Default Styling

The component comes with responsive default styling:

- Small screens: 10x10 (w-10 h-10)
- Medium screens: 20x20 (sm:w-20 sm:h-20)
- Focus states with blue borders
- Gray background with transitions

### Custom Styling

You can override the default styles using the `className` and `inputClassName` props:

```tsx
<OTPInput
  length={4}
  value={otp}
  onChange={setOtp}
  className="space-x-3 justify-center"
  inputClassName="w-16 h-16 text-2xl border-2 border-purple-300 rounded-xl bg-purple-50 text-purple-700 focus:border-purple-500"
/>
```

### Example: Large Colorful OTP

```tsx
<OTPInput
  length={4}
  value={otp}
  onChange={setOtp}
  className="space-x-4"
  inputClassName="w-20 h-20 text-3xl border-3 border-blue-400 rounded-2xl bg-blue-50 text-blue-800 focus:border-blue-600 focus:bg-white shadow-lg"
/>
```

### Example: Minimal Style

```tsx
<OTPInput
  length={6}
  value={otp}
  onChange={setOtp}
  className="space-x-1"
  inputClassName="w-8 h-8 text-sm border border-gray-300 rounded bg-white focus:border-gray-500"
/>
```

## Keyboard Shortcuts

| Key                | Action                                    |
| ------------------ | ----------------------------------------- |
| `0-9`              | Enter digit                               |
| `Backspace`        | Delete current digit and move to previous |
| `Arrow Left`       | Move to previous input                    |
| `Arrow Right`      | Move to next input                        |
| `Ctrl+V` / `Cmd+V` | Paste OTP from clipboard                  |

## Accessibility Features

- ARIA labels for each input (`OTP digit 1`, `OTP digit 2`, etc.)
- Proper `inputMode="numeric"` for mobile keyboards
- Focus management for keyboard navigation
- Screen reader friendly

## Browser Support

- All modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Responsive design for all screen sizes

## Migration from Manual OTP Implementation

If you have existing manual OTP implementation, here's how to migrate:

### Before (Manual Implementation)

```tsx
const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

const handleChange = (e, index) => {
  // Complex manual logic...
};

const handleKeyDown = (e, index) => {
  // Complex manual logic...
};

const handleOnPaste = (e, index) => {
  // Complex manual logic...
};

return (
  <div className="flex space-x-4">
    {[0, 1, 2, 3, 4, 5].map((index) => (
      <input
        key={index}
        // ... lots of manual props and event handlers
      />
    ))}
  </div>
);
```

### After (OTPInput Component)

```tsx
const [otp, setOtp] = useState("");

return <OTPInput length={6} value={otp} onChange={setOtp} autoFocus />;
```

## Examples

See `examples/OTPInputExamples.tsx` for comprehensive usage examples including:

- Basic usage
- Form integration with useForm hook
- Custom styling
- Advanced features

## Contributing

When contributing to the OTPInput component:

1. Maintain backward compatibility
2. Add proper TypeScript types
3. Test on multiple browsers and devices
4. Update this documentation
5. Add examples for new features

## Troubleshooting

### Common Issues

**Issue**: OTP not updating when value prop changes
**Solution**: Make sure you're passing the correct value and onChange props

**Issue**: Auto-focus not working
**Solution**: Ensure `autoFocus={true}` is set and no other inputs are stealing focus

**Issue**: Paste not working
**Solution**: The component handles paste automatically. Make sure you're not preventing default paste behavior elsewhere

**Issue**: Styling not applied
**Solution**: Check that your CSS classes are not being overridden. Use `!important` or increase specificity if needed

### Performance Considerations

- The component uses `useCallback` for internal functions to prevent unnecessary re-renders
- Memoization is handled internally for optimal performance
- Large numbers of OTPInput components on the same page should perform well

### Testing

```tsx
// Example test with React Testing Library
import { render, fireEvent, screen } from "@testing-library/react";
import OTPInput from "@/components/Form/OTPInput";

test("should handle OTP input correctly", () => {
  const handleChange = jest.fn();
  render(<OTPInput length={6} value="" onChange={handleChange} />);

  const firstInput = screen.getByLabelText("OTP digit 1");
  fireEvent.change(firstInput, { target: { value: "1" } });

  expect(handleChange).toHaveBeenCalledWith("1");
});
```
