export interface UseFormHandleSubmitOptions {
  validate?: (formData: T) => Record<string, string> | null;
  onSuccess?: (result: T) => void;
  onError?: (error: Error) => void;
  resetOnSuccess?: boolean;
}
export interface UseFormHandleSubmit {
  onSubmit: (formData: T) => Promise<T>;
  options?: UseFormHandleSubmitOptions;
}
export interface User {
  _id: string;
  username: string;
  email: string;
  password?: string;
  profilePicture?: string;
  bio?: string;
  followers: string[];
  following: string[];
  posts: Post[];
  savedPosts: string[] | Post[];
  isVerified: boolean;
  isActive: boolean;
  otpExpires?: Date;
  otp?: string;
  resetPasswordOTP?: string;
  resetPasswordOTPExpires?: Date;
  role: "user" | "admin";
}

export interface Comment {
  _id: string;
  text: string;
  user: {
    _id: string;
    username: string;
    profilePicture: string;
  };
  createdAt: string;
}

export interface Post {
  _id: string;
  caption: string;
  image?: {
    url: string;
    publicId: string;
  };
  user: User | undefined;
  likes: string[];
  comments: Comment[];
  hashtags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface SignUpFormData {
  username: string;
  email: string;
  password: string;
  passwordConfirm: string;
  [key: string]: string; // Index signature for compatibility
}

export interface LoginFormData {
  email: string;
  password: string;
  [key: string]: string; // Index signature for compatibility
}

export interface VerifyFormData {
  otp: string;
  [key: string]: string; // Index signature for compatibility
}

export interface ForgotPasswordFormData {
  email: string;
  [key: string]: string; // Index signature for compatibility
}

export interface ResetPasswordFormData {
  email: string;
  otp: string;
  password: string;
  passwordConfirm: string;
  [key: string]: string; // Index signature for compatibility
}

export interface SuggestedUsersFormData {
  data: {
    data: {
      users: Array<User>;
    };
  };
  [key: object]: object; // Index signature for compatibility
}

export interface UserProfileFormData {
  data: {
    data: {
      user: User | undefined;
    };
  };
  [key: object]: object; // Index signature for compatibility
}

export interface PostFormData {
  data: {
    data: {
      post: Post | undefined;
    };
  };
  [key: object]: object; // Index signature for compatibility
}

export interface EditProfileFormData {
  bio: string | undefined;
  file: File | undefined;
  [key: string]: string | File | undefined; // Index signature for compatibility
}

export interface ChangePasswordFormData {
  currentPassword: string;
  newPassword: string;
  newPasswordConfirm: string;
  [key: string]: string; // Index signature for compatibility
}

export interface PostFormData {
  caption: string;
  file: File | undefined;
  [key: string]: string | File | undefined; // Index signature for compatibility
}
