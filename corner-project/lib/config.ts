// lib/config.ts

// ✅ Hard-code for now to test (change in production!)
export const JWT_SECRET =
  process.env.JWT_SECRET ||
  "SALDFKJ993828JRFPD98FJ3294F9UJDF230498JFSDOIGUJ8XCVNNPDOUJDSPVNP9";

export const TOKEN_NAME = "corner_auth_token";

console.log("⚙️ Config loaded - JWT_SECRET exists:", !!JWT_SECRET);
