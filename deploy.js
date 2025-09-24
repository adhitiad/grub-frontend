#!/usr/bin/env node

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

console.log("🚀 Starting Grub Frontend Deployment Process...\n");

// Check if required files exist
const requiredFiles = ["package.json", "next.config.ts", "netlify.toml"];

console.log("📋 Checking required files...");
for (const file of requiredFiles) {
  if (!fs.existsSync(file)) {
    console.error(`❌ Missing required file: ${file}`);
    process.exit(1);
  }
  console.log(`✅ Found: ${file}`);
}

// Check environment variables
console.log("\n🔧 Checking environment variables...");
const envFile = ".env.local";
if (!fs.existsSync(envFile)) {
  console.log(
    "⚠️  No .env.local found. Make sure to set environment variables in Netlify dashboard."
  );
  console.log("📝 Reference .env.example for required variables.");
} else {
  console.log("✅ Found .env.local");
}

// Install dependencies
console.log("\n📦 Installing dependencies...");
try {
  execSync("npm install", { stdio: "inherit" });
  console.log("✅ Dependencies installed successfully");
} catch (error) {
  console.error("❌ Failed to install dependencies");
  process.exit(1);
}

// Run linting
console.log("\n🔍 Running linter...");
try {
  execSync("npm run lint", { stdio: "inherit" });
  console.log("✅ Linting passed");
} catch (error) {
  console.log("⚠️  Linting issues found, but continuing...");
}

// Build the project
console.log("\n🏗️  Building project...");
try {
  execSync("npm run build", { stdio: "inherit" });
  console.log("✅ Build completed successfully");
} catch (error) {
  console.error("❌ Build failed");
  process.exit(1);
}

// Check if out directory exists
if (!fs.existsSync("out")) {
  console.error('❌ Build output directory "out" not found');
  process.exit(1);
}

console.log("\n🎉 Frontend is ready for deployment!");
console.log("\n📋 Next steps:");
console.log("1. Update netlify.toml with your backend URL");
console.log("2. Push your code to GitHub");
console.log("3. Connect your GitHub repo to Netlify");
console.log("4. Set environment variables in Netlify dashboard");
console.log("5. Deploy!");
console.log("\n🔗 Useful links:");
console.log("- Netlify: https://app.netlify.com/");
console.log("- GitHub: https://github.com/");
console.log("- Deployment Guide: ./DEPLOYMENT_GUIDE.md");

console.log("\n⚠️  IMPORTANT:");
console.log(
  '- Replace "https://your-backend-url.herokuapp.com" in netlify.toml'
);
console.log("- Set NEXT_PUBLIC_API_URL in Netlify environment variables");
console.log("- Ensure your backend is deployed first");
