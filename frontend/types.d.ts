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
  profileBackground?: string;
  profileBackgroundPosition?: {
    x: number;
    y: number;
    scale: number;
    width: number;
    height: number;
  };
  usernameColor?: string;
  bio?: string;
  followers: User[] | string[]; // Can be populated User objects or just IDs
  following: User[] | string[]; // Can be populated User objects or just IDs
  posts: Post[];
  savedPosts: string[] | Post[];
  isVerified: boolean;
  isActive: boolean;
  otpExpires?: Date;
  otp?: string;
  resetPasswordOTP?: string;
  resetPasswordOTPExpires?: Date;
  role: "user" | "admin";
  pushNotificationSettings: {
    pushEnabled: boolean;
    postType: "all" | "following" | "none";
    likes: boolean;
    comments: boolean;
    follow: boolean;
    unfollow: boolean;
    fcmToken: string | null;
    // NEW FIELDS FOR REDUX-BASED APPROACH
    tokenTimestamp?: string | null;
    tokenValid?: boolean;
    deviceInfo?: string | null;
    lastSyncAt?: string | null;
  };
  // Add timestamps for tracking
  createdAt?: string;
  updatedAt?: string;
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
  video?: {
    url: string;
    publicId: string;
    thumbnail?: string;
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
  usernameColor: string | undefined;
  [key: string]: string | File | undefined; // Index signature for compatibility
}

export interface ChangePasswordFormData {
  currentPassword: string;
  newPassword: string;
  newPasswordConfirm: string;
  [key: string]: string; // Index signature for compatibility
}

export interface CreatePostFormData {
  caption: string;
  file: File | undefined;
  [key: string]: string | File | undefined; // Index signature for compatibility
}
