// Test setup file for backend tests with mocked database
const mongoose = require("mongoose");

// Mock environment variables for testing
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-jwt-secret-key-for-testing-purposes-only";
process.env.JWT_EXPIRES_IN = "7d";

// Mock mongoose to avoid actual database connections
jest.mock("mongoose", () => {
  const mockModel = {
    find: jest.fn().mockReturnThis(),
    findById: jest.fn().mockReturnThis(),
    findOne: jest.fn().mockReturnThis(),
    findByIdAndUpdate: jest.fn().mockReturnThis(),
    findByIdAndDelete: jest.fn().mockReturnThis(),
    create: jest.fn().mockImplementation((userData) => {
      // Validation logic for test cases
      if (!userData.username) {
        return Promise.reject(new Error("Username is required"));
      }
      if (userData.email && !userData.email.includes("@")) {
        return Promise.reject(new Error("Please provide a valid email"));
      }
      if (
        userData.password &&
        userData.passwordConfirm &&
        userData.password !== userData.passwordConfirm
      ) {
        return Promise.reject(new Error("Passwords do not match"));
      }
      if (userData.password && userData.password.length < 8) {
        return Promise.reject(
          new Error("Password must be at least 8 characters")
        );
      }
      if (
        userData.username &&
        (userData.username.length < 3 || userData.username.length > 30)
      ) {
        return Promise.reject(
          new Error("Username must be between 3 and 30 characters")
        );
      }
      if (userData.bio && userData.bio.length > 150) {
        return Promise.reject(new Error("Bio cannot exceed 150 characters"));
      }
      if (
        userData.usernameColor &&
        !userData.usernameColor.match(/^#[0-9A-Fa-f]{6}$/)
      ) {
        return Promise.reject(new Error("Invalid username color format"));
      }

      const mockUser = {
        _id: "mock-user-id",
        username: userData.username || "testuser",
        email: userData.email || "test@example.com",
        password: "hashed-password", // Should be different from input
        passwordConfirm: undefined, // Should be removed
        usernameColor: userData.usernameColor || "#000000",
        bio: userData.bio || "",
        role: userData.role || "user",
        isAdmin: userData.isAdmin || false,
        isVerified: false,
        isActive: false,
        followers: [],
        following: [],
        posts: [],
        savedPosts: [],
        profileBackgroundPosition: { x: 50, y: 50 },
        save: jest.fn().mockResolvedValue(this),
        correctPassword: jest
          .fn()
          .mockImplementation((inputPassword, storedPassword) => {
            return Promise.resolve(inputPassword === "password123");
          }),
        isAdmin: jest.fn().mockImplementation(function () {
          return this.role === "admin";
        }),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      return Promise.resolve(mockUser);
    }),
    save: jest.fn().mockReturnThis(),
    populate: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue(null),
    deleteMany: jest.fn().mockResolvedValue({ deletedCount: 0 }),
    aggregate: jest.fn().mockResolvedValue([]),
  };

  const MockSchema = function (definition, options) {
    this.definition = definition;
    this.options = options;
    this.methods = {}; // Initialize methods object
    this._pre = [];
    this._post = [];
    return this;
  };

  MockSchema.prototype.pre = function (event, fn) {
    this._pre.push({ event, fn });
    return this;
  };

  MockSchema.prototype.post = function (event, fn) {
    this._post.push({ event, fn });
    return this;
  };

  // Add the missing index method
  MockSchema.prototype.index = function (fields, options) {
    this._indexes = this._indexes || [];
    this._indexes.push({ fields, options });
    return this;
  };

  MockSchema.Types = {
    ObjectId: "ObjectId",
    String: String,
    Number: Number,
    Boolean: Boolean,
    Date: Date,
    Array: Array,
  };

  return {
    connect: jest.fn().mockResolvedValue({}),
    connection: {
      readyState: 1,
      close: jest.fn().mockResolvedValue({}),
      collections: {},
    },
    Schema: MockSchema,
    model: jest.fn().mockReturnValue(mockModel),
    Types: {
      ObjectId: jest.fn().mockImplementation((id) => id || "mock-object-id"),
    },
  };
});

// Mock bcrypt for faster tests
jest.mock("bcryptjs", () => ({
  genSalt: jest.fn().mockResolvedValue("mock-salt"),
  hash: jest.fn().mockResolvedValue("mock-hashed-password"),
  compare: jest.fn().mockImplementation((password, hash) => {
    return Promise.resolve(password === "testPassword123");
  }),
}));

// Mock JWT
jest.mock("jsonwebtoken", () => ({
  sign: jest.fn().mockReturnValue("mock-jwt-token"),
  verify: jest.fn().mockReturnValue({ id: "mock-user-id", iat: Date.now() }),
}));

// Mock cloudinary
jest.mock("../utils/cloudinary", () => ({
  cloudinary: {
    uploader: {
      upload: jest.fn().mockResolvedValue({
        public_id: "test-image-id",
        secure_url: "https://test-cloudinary-url.com/test-image.jpg",
      }),
      destroy: jest.fn().mockResolvedValue({ result: "ok" }),
    },
  },
}));

// Mock email utility
jest.mock("../utils/email", () => ({
  sendEmail: jest.fn().mockResolvedValue(true),
}));

// Shorter timeout for mocked tests
jest.setTimeout(10000);

// Clean console output
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
};

// Global test utilities
global.testUser = {
  username: "testuser",
  email: "test@example.com",
  password: "testPassword123",
  passwordConfirm: "testPassword123",
  usernameColor: "#3B82F6",
};

global.testPost = {
  caption: "This is a test post #testing",
  hashtags: ["testing"],
};

global.createMockUser = (overrides = {}) => ({
  _id: "mock-user-id",
  username: "testuser",
  email: "test@example.com",
  usernameColor: "#3B82F6",
  isAdmin: false,
  followers: [],
  following: [],
  posts: [],
  savedPosts: [],
  bio: "",
  profilePicture: "",
  profileBackgroundPosition: { x: 50, y: 50 },
  createdAt: new Date(),
  updatedAt: new Date(),
  save: jest.fn().mockResolvedValue(this),
  toJSON: jest.fn().mockReturnValue(this),
  ...overrides,
});

global.createMockPost = (overrides = {}) => ({
  _id: "mock-post-id",
  caption: "Test post",
  user: "mock-user-id",
  likes: [],
  comments: [],
  hashtags: [],
  image: "",
  createdAt: new Date(),
  updatedAt: new Date(),
  save: jest.fn().mockResolvedValue(this),
  toJSON: jest.fn().mockReturnValue(this),
  ...overrides,
});

// Reset all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});
