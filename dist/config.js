
// Runtime configuration for Queer Grid
window.QUEER_GRID_CONFIG = {
  environment: 'development',
  apiBaseUrl: 'http://localhost:3001',
  features: {
    emailSignup: true, // Disable in production until backend is deployed
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
