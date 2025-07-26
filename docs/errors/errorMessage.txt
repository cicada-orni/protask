=> Failed to build the preview
SB_FRAMEWORK_NEXTJS_0003 (IncompatiblePostCssConfigError): Incompatible PostCSS configuration format detected.

Next.js uses an array-based format for plugins which is not compatible with Vite:

// ❌ Incompatible format (used by Next.js)
const config = {
plugins: ["@tailwindcss/postcss"],
};

Please transform your PostCSS config to use the object-based format, which is compatible with Next.js and Vite:

// ✅ Compatible format (works with Next.js and Vite)
const config = {
plugins: {
"@tailwindcss/postcss": {},
},
};

Original error: Invalid PostCSS Plugin found at: plugins[0]

(@.\postcss.config.mjs)
