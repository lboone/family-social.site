// Example usage of the useForm hook with handleSubmit functionality

import { useForm } from "@/hooks/useForm";

// Example 1: Login Form with handleSubmit and validation
interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
  [key: string]: string | boolean;
}

export const LoginExample = () => {
  const { formData, handleChange, handleSubmit, isLoading, errors, resetForm } =
    useForm<LoginFormData>({
      email: "",
      password: "",
      rememberMe: false,
    });

  // Define the submit function
  const onSubmit = async (data: LoginFormData) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Simulate error for demo
    if (data.email === "error@test.com") {
      throw new Error("Invalid credentials");
    }

    console.log("Login successful:", data);
  };

  // Validation function
  const validateForm = (data: LoginFormData) => {
    const errors: Record<string, string> = {};

    if (!data.email) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(data.email)) {
      errors.email = "Email is invalid";
    }

    if (!data.password) {
      errors.password = "Password is required";
    } else if (data.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    return Object.keys(errors).length > 0 ? errors : null;
  };

  return (
    <form
      onSubmit={handleSubmit({
        onSubmit,
        options: {
          validate: validateForm,
          onSuccess: () => {
            alert("Login successful!");
          },
          onError: (error) => {
            alert(`Login failed: ${error.message}`);
          },
          resetOnSuccess: false, // Don't reset login form on success
        },
      })}
    >
      <div>
        <input
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email"
        />
        {errors.email && <span style={{ color: "red" }}>{errors.email}</span>}
      </div>

      <div>
        <input
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Password"
        />
        {errors.password && (
          <span style={{ color: "red" }}>{errors.password}</span>
        )}
      </div>

      <div>
        <label>
          <input
            name="rememberMe"
            type="checkbox"
            checked={formData.rememberMe}
            onChange={handleChange}
          />
          Remember Me
        </label>
      </div>

      {errors.submit && <div style={{ color: "red" }}>{errors.submit}</div>}

      <button type="submit" disabled={isLoading}>
        {isLoading ? "Logging in..." : "Login"}
      </button>
      <button type="button" onClick={resetForm}>
        Reset
      </button>
    </form>
  );
};

// Example 2: Contact Form with validation and reset on success
interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  [key: string]: string;
}

export const ContactFormExample = () => {
  const { formData, handleChange, handleSubmit, isLoading, errors } =
    useForm<ContactFormData>({
      name: "",
      email: "",
      subject: "",
      message: "",
    });

  const onSubmit = async (data: ContactFormData) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    console.log("Message sent:", data);
  };

  const validateForm = (data: ContactFormData) => {
    const errors: Record<string, string> = {};

    if (!data.name.trim()) errors.name = "Name is required";
    if (!data.email.trim()) errors.email = "Email is required";
    if (!data.subject.trim()) errors.subject = "Subject is required";
    if (!data.message.trim()) errors.message = "Message is required";
    if (data.message.length > 0 && data.message.length < 10) {
      errors.message = "Message must be at least 10 characters";
    }

    return Object.keys(errors).length > 0 ? errors : null;
  };

  return (
    <form
      onSubmit={handleSubmit({
        onSubmit,
        options: {
          validate: validateForm,
          onSuccess: () => {
            alert("Message sent successfully!");
          },
          resetOnSuccess: true, // Reset form after successful submission
        },
      })}
    >
      <div>
        <input
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Your Name"
        />
        {errors.name && <span style={{ color: "red" }}>{errors.name}</span>}
      </div>

      <div>
        <input
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Your Email"
        />
        {errors.email && <span style={{ color: "red" }}>{errors.email}</span>}
      </div>

      <div>
        <input
          name="subject"
          value={formData.subject}
          onChange={handleChange}
          placeholder="Subject"
        />
        {errors.subject && (
          <span style={{ color: "red" }}>{errors.subject}</span>
        )}
      </div>

      <div>
        <textarea
          name="message"
          value={formData.message}
          onChange={handleChange}
          placeholder="Your Message"
          rows={4}
        />
        {errors.message && (
          <span style={{ color: "red" }}>{errors.message}</span>
        )}
      </div>

      {errors.submit && <div style={{ color: "red" }}>{errors.submit}</div>}

      <button type="submit" disabled={isLoading}>
        {isLoading ? "Sending..." : "Send Message"}
      </button>
    </form>
  );
};

// Example 3: User Registration with complex validation
interface RegistrationFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  age: number;
  acceptTerms: boolean;
  [key: string]: string | number | boolean;
}

export const RegistrationExample = () => {
  const {
    formData,
    handleChange,
    handleSubmit,
    isLoading,
    errors,
    setFieldError,
  } = useForm<RegistrationFormData>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    age: 18,
    acceptTerms: false,
  });

  const onSubmit = async (data: RegistrationFormData) => {
    // Simulate checking if username exists
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (data.username === "admin") {
      throw new Error("Username 'admin' is not available");
    }

    console.log("User registered:", data);
  };

  const validateForm = (data: RegistrationFormData) => {
    const errors: Record<string, string> = {};

    if (!data.username.trim()) {
      errors.username = "Username is required";
    } else if (data.username.length < 3) {
      errors.username = "Username must be at least 3 characters";
    }

    if (!data.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(data.email)) {
      errors.email = "Email is invalid";
    }

    if (!data.password) {
      errors.password = "Password is required";
    } else if (data.password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    }

    if (data.password !== data.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    if (data.age < 13) {
      errors.age = "You must be at least 13 years old";
    }

    if (!data.acceptTerms) {
      errors.acceptTerms = "You must accept the terms and conditions";
    }

    return Object.keys(errors).length > 0 ? errors : null;
  };

  return (
    <form
      onSubmit={handleSubmit({
        onSubmit,
        options: {
          validate: validateForm,
          onSuccess: () => {
            alert(
              "Registration successful! Please check your email for verification."
            );
          },
          onError: (error) => {
            // You can also set field-specific errors here
            if (error.message.includes("username")) {
              setFieldError("username", error.message);
            }
          },
          resetOnSuccess: true,
        },
      })}
    >
      <div>
        <input
          name="username"
          value={formData.username}
          onChange={handleChange}
          placeholder="Username"
        />
        {errors.username && (
          <span style={{ color: "red" }}>{errors.username}</span>
        )}
      </div>

      <div>
        <input
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email"
        />
        {errors.email && <span style={{ color: "red" }}>{errors.email}</span>}
      </div>

      <div>
        <input
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Password"
        />
        {errors.password && (
          <span style={{ color: "red" }}>{errors.password}</span>
        )}
      </div>

      <div>
        <input
          name="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="Confirm Password"
        />
        {errors.confirmPassword && (
          <span style={{ color: "red" }}>{errors.confirmPassword}</span>
        )}
      </div>

      <div>
        <input
          name="age"
          type="number"
          value={formData.age}
          onChange={handleChange}
          min="1"
          max="120"
        />
        {errors.age && <span style={{ color: "red" }}>{errors.age}</span>}
      </div>

      <div>
        <label>
          <input
            name="acceptTerms"
            type="checkbox"
            checked={formData.acceptTerms}
            onChange={handleChange}
          />
          I accept the terms and conditions
        </label>
        {errors.acceptTerms && (
          <span style={{ color: "red" }}>{errors.acceptTerms}</span>
        )}
      </div>

      {errors.submit && <div style={{ color: "red" }}>{errors.submit}</div>}

      <button type="submit" disabled={isLoading}>
        {isLoading ? "Creating Account..." : "Create Account"}
      </button>
    </form>
  );
};
