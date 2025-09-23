#!/usr/bin/env node

/**
 * Dependency Installation Script for Grub Frontend
 * This script helps install all required dependencies for the Grub frontend application
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🍽️  Grub Frontend - Dependency Installation');
console.log('==========================================\n');

// Check if we're in the right directory
const packageJsonPath = path.join(process.cwd(), 'package.json');
if (!fs.existsSync(packageJsonPath)) {
  console.error('❌ Error: package.json not found. Please run this script from the project root.');
  process.exit(1);
}

// Read package.json to verify it's the Grub frontend
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
if (!packageJson.name || !packageJson.name.includes('grub-frontend')) {
  console.log('⚠️  Warning: This doesn\'t appear to be the Grub frontend project.');
  console.log('   Continuing anyway...\n');
}

// Function to run commands with error handling
function runCommand(command, description) {
  console.log(`📦 ${description}...`);
  try {
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${description} completed successfully\n`);
    return true;
  } catch (error) {
    console.error(`❌ Error during ${description.toLowerCase()}`);
    console.error(`   Command: ${command}`);
    console.error(`   Error: ${error.message}\n`);
    return false;
  }
}

// Main installation process
async function installDependencies() {
  console.log('Starting dependency installation...\n');

  // Clean npm cache
  console.log('🧹 Cleaning npm cache...');
  runCommand('npm cache clean --force', 'Cache cleaning');

  // Install core dependencies
  const corePackages = [
    '@tanstack/react-query@^5.0.0',
    '@tanstack/react-query-devtools@^5.0.0',
    'axios@^1.6.0',
    'react-hook-form@^7.48.0',
    '@hookform/resolvers@^3.3.0',
    'zod@^3.22.0',
    'clsx@^2.0.0',
    'tailwind-merge@^2.0.0'
  ];

  console.log('📦 Installing core dependencies...');
  const coreInstallCommand = `npm install ${corePackages.join(' ')}`;
  
  if (!runCommand(coreInstallCommand, 'Core dependencies installation')) {
    console.log('⚠️  Core installation failed. Trying individual packages...\n');
    
    // Try installing packages individually
    for (const pkg of corePackages) {
      console.log(`   Installing ${pkg}...`);
      runCommand(`npm install ${pkg}`, `${pkg} installation`);
    }
  }

  // Install optional UI dependencies
  const uiPackages = [
    'lucide-react@^0.300.0',
    '@radix-ui/react-dialog@^1.0.0',
    '@radix-ui/react-dropdown-menu@^2.0.0',
    '@radix-ui/react-toast@^1.1.0',
    '@radix-ui/react-tabs@^1.0.0',
    '@radix-ui/react-select@^2.0.0',
    'class-variance-authority@^0.7.0'
  ];

  console.log('🎨 Installing UI dependencies (optional)...');
  const uiInstallCommand = `npm install ${uiPackages.join(' ')}`;
  
  if (!runCommand(uiInstallCommand, 'UI dependencies installation')) {
    console.log('⚠️  Some UI packages failed to install. The app will still work with basic components.\n');
  }

  // Install development dependencies
  const devPackages = [
    '@types/node@^20',
    '@types/react@^19',
    '@types/react-dom@^19',
    'eslint@^8',
    'eslint-config-next@15.5.3',
    'postcss@^8',
    'tailwindcss@^3.4.1',
    'typescript@^5'
  ];

  console.log('🛠️  Installing development dependencies...');
  const devInstallCommand = `npm install --save-dev ${devPackages.join(' ')}`;
  
  if (!runCommand(devInstallCommand, 'Development dependencies installation')) {
    console.log('⚠️  Some dev dependencies failed to install. Development features may be limited.\n');
  }

  // Verify installation
  console.log('🔍 Verifying installation...');
  
  try {
    const updatedPackageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const dependencies = { ...updatedPackageJson.dependencies, ...updatedPackageJson.devDependencies };
    
    const requiredPackages = [
      '@tanstack/react-query',
      'axios',
      'react-hook-form',
      'zod',
      'clsx',
      'tailwind-merge',
      'typescript',
      'tailwindcss'
    ];
    
    const missingPackages = requiredPackages.filter(pkg => !dependencies[pkg]);
    
    if (missingPackages.length === 0) {
      console.log('✅ All required packages installed successfully!\n');
    } else {
      console.log('⚠️  Some required packages are missing:');
      missingPackages.forEach(pkg => console.log(`   - ${pkg}`));
      console.log('');
    }
  } catch (error) {
    console.log('⚠️  Could not verify installation. Please check manually.\n');
  }

  // Final steps
  console.log('🎯 Installation Summary');
  console.log('=======================');
  console.log('✅ Core dependencies: React Query, Axios, React Hook Form, Zod');
  console.log('✅ UI utilities: clsx, tailwind-merge');
  console.log('✅ Development tools: TypeScript, Tailwind CSS, ESLint');
  console.log('');
  console.log('🚀 Next Steps:');
  console.log('1. Copy .env.local.example to .env.local and configure');
  console.log('2. Start the development server: npm run dev');
  console.log('3. Open http://localhost:3000 in your browser');
  console.log('');
  console.log('📚 Documentation: Check README.md for detailed setup instructions');
  console.log('🆘 Support: Create an issue if you encounter problems');
  console.log('');
  console.log('Happy coding! 🎉');
}

// Run the installation
installDependencies().catch(error => {
  console.error('❌ Installation failed:', error.message);
  process.exit(1);
});
