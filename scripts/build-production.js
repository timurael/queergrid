#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🏳️‍🌈 Building Queer Grid for production...');

// Configuration
const config = {
  development: {
    API_BASE_URL: 'http://localhost:3001',
    ENVIRONMENT: 'development'
  },
  production: {
    API_BASE_URL: 'https://your-backend-domain.com', // Update this with your actual backend URL
    ENVIRONMENT: 'production'
  }
};

// Determine environment
const environment = process.env.NODE_ENV || 'production';
const envConfig = config[environment];

console.log(`📦 Building for ${environment} environment`);
console.log(`🔗 API Base URL: ${envConfig.API_BASE_URL}`);

// Read the original script.js
const scriptPath = path.join(__dirname, '../script.js');
const scriptContent = fs.readFileSync(scriptPath, 'utf8');

// Replace API_BASE_URL in the script
let processedScript = scriptContent.replace(
  /const API_BASE_URL = ['"][^'"]*['"];?/g,
  `const API_BASE_URL = '${envConfig.API_BASE_URL}';`
);

// Add environment detection for graceful degradation
const environmentDetection = `
// Environment detection and graceful degradation
const ENVIRONMENT = '${envConfig.ENVIRONMENT}';
const IS_PRODUCTION = ENVIRONMENT === 'production';

// Override backend functions for production if backend is not available
if (IS_PRODUCTION) {
  // Check if backend is available
  let backendAvailable = true;
  
  // Test backend connectivity
  fetch(API_BASE_URL + '/health')
    .catch(() => {
      backendAvailable = false;
      console.warn('🚨 Backend not available - running in frontend-only mode');
      
      // Show a friendly message to users
      setTimeout(() => {
        showNotification(
          currentMode === 'cute' ? 
          'hey bb! our backend is taking a nap 😴 email signup will be back soon!' : 
          'BACKEND TEMPORARILY OFFLINE. EMAIL COLLECTION DISABLED. ⚡',
          'info'
        );
      }, 2000);
    });
  
  // Override email signup for production without backend
  const originalHandleEmailSignup = handleEmailSignup;
  handleEmailSignup = async function(event) {
    event.preventDefault();
    
    if (!backendAvailable) {
      showError(
        currentMode === 'cute' ? 
        'aww, our email system is sleeping! try again later, bb 💤' : 
        'EMAIL SYSTEM OFFLINE. TRY AGAIN LATER. ⚡'
      );
      return;
    }
    
    return originalHandleEmailSignup(event);
  };
  
  // Override consent backend calls for production
  const originalSendConsentToBackend = sendConsentToBackend;
  sendConsentToBackend = async function(consentData) {
    if (!backendAvailable) {
      console.log('Consent saved locally only (backend unavailable)');
      return;
    }
    
    return originalSendConsentToBackend(consentData);
  };
}
`;

// Add environment detection to the script
processedScript = environmentDetection + '\n' + processedScript;

// Create dist directory if it doesn't exist
const distDir = path.join(__dirname, '..');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Write the processed script to root
const distScriptPath = path.join(__dirname, '../script.js');
fs.writeFileSync(distScriptPath, processedScript);

// Create a config.js file for runtime configuration
const configJs = `
// Runtime configuration for Queer Grid
window.QUEER_GRID_CONFIG = {
  environment: '${environment}',
  apiBaseUrl: '${envConfig.API_BASE_URL}',
  features: {
    emailSignup: ${environment === 'development' ? 'true' : 'false'}, // Disable in production until backend is deployed
    analytics: true,
    consentPopup: true
  },
  messages: {
    backendOffline: {
      cute: 'hey bb! our backend is taking a nap 😴 email signup will be back soon!',
      angry: 'BACKEND TEMPORARILY OFFLINE. EMAIL COLLECTION DISABLED. ⚡'
    },
    emailDisabled: {
      cute: 'aww, our email system is sleeping! try again later, bb 💤',
      angry: 'EMAIL SYSTEM OFFLINE. TRY AGAIN LATER. ⚡'
    }
  }
};
`;

const configPath = path.join(__dirname, '../config.js');
fs.writeFileSync(configPath, configJs);

// Update index.html to include config.js
const indexPath = path.join(__dirname, '../index.html');
const indexContent = fs.readFileSync(indexPath, 'utf8');

const updatedIndexContent = indexContent.replace(
  '<script src="script.js"></script>',
  '<script src="config.js"></script>\n    <script src="script.js"></script>'
);

fs.writeFileSync(indexPath, updatedIndexContent);

// Create a deployment info file
const deploymentInfo = {
  buildTime: new Date().toISOString(),
  environment: environment,
  apiBaseUrl: envConfig.API_BASE_URL,
  version: require('../package.json').version,
  commit: process.env.GITHUB_SHA || 'local-build',
  features: {
    consentPopup: true,
    emailSignup: environment === 'development',
    analytics: true,
    gdprCompliance: true
  }
};

const deploymentInfoPath = path.join(__dirname, '../deployment-info.json');
fs.writeFileSync(deploymentInfoPath, JSON.stringify(deploymentInfo, null, 2));

console.log('✨ Build complete!');
console.log('📁 Files created in root directory:');
console.log('  - index.html (with config.js included)');
console.log('  - script.js (environment-configured)');
console.log('  - config.js (runtime configuration)');
console.log('  - deployment-info.json (build metadata)');

if (environment === 'production') {
  console.log('');
  console.log('🚨 PRODUCTION BUILD NOTES:');
  console.log('1. Update API_BASE_URL in this script with your actual backend URL');
  console.log('2. Deploy your backend to a hosting service (Railway, Heroku, etc.)');
  console.log('3. Email signup will be disabled until backend is available');
  console.log('4. GDPR consent popup will work in frontend-only mode');
  console.log('');
} 