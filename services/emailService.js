const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Create email transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// Email templates
const emailTemplates = {
  verification: (email, token) => ({
    from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
    to: email,
    subject: '🌈 Verify your Queer Grid subscription',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your Subscription</title>
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
              line-height: 1.6; 
              color: #333; 
              max-width: 600px; 
              margin: 0 auto; 
              padding: 20px; 
            }
            .header { 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
              color: white; 
              padding: 30px; 
              text-align: center; 
              border-radius: 10px 10px 0 0; 
            }
            .content { 
              background: #f8f9fa; 
              padding: 30px; 
              border-radius: 0 0 10px 10px; 
            }
            .button { 
              display: inline-block; 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
              color: white; 
              padding: 15px 30px; 
              text-decoration: none; 
              border-radius: 25px; 
              font-weight: bold; 
              margin: 20px 0; 
            }
            .footer { 
              margin-top: 30px; 
              padding-top: 20px; 
              border-top: 1px solid #eee; 
              font-size: 14px; 
              color: #666; 
            }
            .pride-flag {
              height: 4px;
              background: linear-gradient(to right, #e40303, #ff8c00, #ffed00, #008008, #004cff, #732982);
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🌈 Welcome to Queer Grid!</h1>
            <p>Thanks for joining our vibrant community</p>
          </div>
          
          <div class="content">
            <div class="pride-flag"></div>
            
            <h2>Almost there! Verify your email address</h2>
            
            <p>Hi there! 👋</p>
            
            <p>You've just subscribed to the Queer Grid newsletter. We're excited to have you join our community of queer activists, artists, and allies!</p>
            
            <p>To complete your subscription and ensure you receive our updates, please verify your email address by clicking the button below:</p>
            
            <div style="text-align: center;">
              <a href="${process.env.API_BASE_URL}/api/email/verify/${token}" class="button">
                ✨ Verify My Email ✨
              </a>
            </div>
            
            <p><strong>Why verify?</strong> Email verification helps us:</p>
            <ul>
              <li>Ensure you actually want to receive our content</li>
              <li>Protect your privacy and data security</li>
              <li>Comply with anti-spam regulations</li>
              <li>Keep our community safe from bots</li>
            </ul>
            
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p style="word-break: break-all; background: #fff; padding: 10px; border-radius: 5px; font-family: monospace;">
              ${process.env.API_BASE_URL}/api/email/verify/${token}
            </p>
            
            <div class="pride-flag"></div>
            
            <p><strong>What to expect:</strong></p>
            <ul>
              <li>📧 Monthly newsletters with community highlights</li>
              <li>🎨 Artist spotlights and creative showcases</li>
              <li>📅 Event announcements and meetup invitations</li>
              <li>🏳️‍🌈 Resources for queer rights and activism</li>
            </ul>
            
            <p>This verification link will expire in 24 hours for security reasons.</p>
          </div>
          
          <div class="footer">
            <p><strong>Privacy First:</strong> We take your data seriously. Read our <a href="${process.env.PRIVACY_POLICY_URL}">Privacy Policy</a> to learn how we protect your information.</p>
            
            <p>If you didn't sign up for this newsletter, you can safely ignore this email or <a href="mailto:${process.env.DPO_EMAIL}">contact us</a>.</p>
            
            <p style="margin-top: 20px;">
              <small>
                © ${new Date().getFullYear()} ${process.env.COMPANY_NAME} • 
                <a href="${process.env.PRIVACY_POLICY_URL}">Privacy</a> • 
                <a href="${process.env.TERMS_URL}">Terms</a>
              </small>
            </p>
          </div>
        </body>
      </html>
    `,
    text: `
      🌈 Welcome to Queer Grid!

      Hi there! 👋

      You've just subscribed to the Queer Grid newsletter. We're excited to have you join our community of queer activists, artists, and allies!

      To complete your subscription, please verify your email address by visiting this link:
      ${process.env.API_BASE_URL}/api/email/verify/${token}

      This verification link will expire in 24 hours for security reasons.

      What to expect:
      • Monthly newsletters with community highlights
      • Artist spotlights and creative showcases  
      • Event announcements and meetup invitations
      • Resources for queer rights and activism

      If you didn't sign up for this newsletter, you can safely ignore this email.

      © ${new Date().getFullYear()} ${process.env.COMPANY_NAME}
      Privacy Policy: ${process.env.PRIVACY_POLICY_URL}
    `
  }),

  welcome: (email) => ({
    from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
    to: email,
    subject: '🎉 Welcome to the Queer Grid community!',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to Queer Grid</title>
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
              line-height: 1.6; 
              color: #333; 
              max-width: 600px; 
              margin: 0 auto; 
              padding: 20px; 
            }
            .header { 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
              color: white; 
              padding: 30px; 
              text-align: center; 
              border-radius: 10px 10px 0 0; 
            }
            .content { 
              background: #f8f9fa; 
              padding: 30px; 
              border-radius: 0 0 10px 10px; 
            }
            .pride-flag {
              height: 4px;
              background: linear-gradient(to right, #e40303, #ff8c00, #ffed00, #008008, #004cff, #732982);
              margin: 20px 0;
            }
            .footer { 
              margin-top: 30px; 
              padding-top: 20px; 
              border-top: 1px solid #eee; 
              font-size: 14px; 
              color: #666; 
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🎉 You're officially part of the Grid!</h1>
            <p>Your email has been verified successfully</p>
          </div>
          
          <div class="content">
            <div class="pride-flag"></div>
            
            <h2>Welcome to our vibrant community! 🌈</h2>
            
            <p>Your email verification was successful! You're now officially part of the Queer Grid community.</p>
            
            <p><strong>Here's what happens next:</strong></p>
            <ul>
              <li>📧 You'll receive our monthly newsletter with community highlights</li>
              <li>🎨 Get first access to artist showcases and creative projects</li>
              <li>📅 Exclusive invites to community events and meetups</li>
              <li>🏳️‍🌈 Resources, tools, and support for queer rights activism</li>
            </ul>
            
            <div class="pride-flag"></div>
            
            <p><strong>Connect with us:</strong></p>
            <ul>
              <li>🌐 Visit our website: <a href="${process.env.FRONTEND_URL}">${process.env.FRONTEND_URL}</a></li>
              <li>📱 Follow us on social media for daily updates</li>
              <li>💬 Join our community discussions</li>
              <li>📧 Reply to any of our emails - we read every message!</li>
            </ul>
            
            <p>Thank you for being part of our mission to create a more inclusive and vibrant world. Together, we're building something amazing! ✨</p>
            
            <p style="background: #fff; padding: 15px; border-radius: 5px; border-left: 4px solid #667eea;">
              <strong>💡 Pro tip:</strong> Add <code>${process.env.FROM_EMAIL}</code> to your contacts to ensure our emails always reach your inbox!
            </p>
          </div>
          
          <div class="footer">
            <p>Want to manage your subscription preferences? <a href="${process.env.FRONTEND_URL}/preferences">Click here</a></p>
            
            <p>Questions? Just reply to this email or reach out to us at <a href="mailto:${process.env.FROM_EMAIL}">${process.env.FROM_EMAIL}</a></p>
            
            <p style="margin-top: 20px;">
              <small>
                © ${new Date().getFullYear()} ${process.env.COMPANY_NAME} • 
                <a href="${process.env.PRIVACY_POLICY_URL}">Privacy</a> • 
                <a href="${process.env.TERMS_URL}">Terms</a> • 
                <a href="${process.env.API_BASE_URL}/api/email/unsubscribe/{{unsubscribeToken}}">Unsubscribe</a>
              </small>
            </p>
          </div>
        </body>
      </html>
    `,
    text: `
      🎉 You're officially part of the Grid!

      Your email verification was successful! You're now officially part of the Queer Grid community.

      Here's what happens next:
      • You'll receive our monthly newsletter with community highlights
      • Get first access to artist showcases and creative projects
      • Exclusive invites to community events and meetups
      • Resources, tools, and support for queer rights activism

      Connect with us:
      • Visit our website: ${process.env.FRONTEND_URL}
      • Follow us on social media for daily updates
      • Join our community discussions
      • Reply to any of our emails - we read every message!

      Thank you for being part of our mission to create a more inclusive and vibrant world!

      © ${new Date().getFullYear()} ${process.env.COMPANY_NAME}
      Privacy Policy: ${process.env.PRIVACY_POLICY_URL}
    `
  }),

  dataRequest: (email, token, requestType) => ({
    from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
    to: email,
    subject: `🔒 Verify your ${requestType.toLowerCase()} request - Queer Grid`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Data Request</title>
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
              line-height: 1.6; 
              color: #333; 
              max-width: 600px; 
              margin: 0 auto; 
              padding: 20px; 
            }
            .header { 
              background: #343a40; 
              color: white; 
              padding: 30px; 
              text-align: center; 
              border-radius: 10px 10px 0 0; 
            }
            .content { 
              background: #f8f9fa; 
              padding: 30px; 
              border-radius: 0 0 10px 10px; 
            }
            .button { 
              display: inline-block; 
              background: #007bff; 
              color: white; 
              padding: 15px 30px; 
              text-decoration: none; 
              border-radius: 5px; 
              font-weight: bold; 
              margin: 20px 0; 
            }
            .warning { 
              background: #fff3cd; 
              border: 1px solid #ffeaa7; 
              color: #856404; 
              padding: 15px; 
              border-radius: 5px; 
              margin: 20px 0; 
            }
            .footer { 
              margin-top: 30px; 
              padding-top: 20px; 
              border-top: 1px solid #eee; 
              font-size: 14px; 
              color: #666; 
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🔒 Data ${requestType} Request</h1>
            <p>Verification required for security</p>
          </div>
          
          <div class="content">
            <h2>Verify your identity</h2>
            
            <p>We received a request to ${requestType.toLowerCase()} your personal data from our Queer Grid database.</p>
            
            <div class="warning">
              <strong>⚠️ Security Notice:</strong> To protect your privacy, we need to verify that this request was made by you.
            </div>
            
            <p><strong>Request details:</strong></p>
            <ul>
              <li><strong>Request type:</strong> ${requestType}</li>
              <li><strong>Email:</strong> ${email}</li>
              <li><strong>Date:</strong> ${new Date().toISOString()}</li>
            </ul>
            
            <p>If you made this request, please click the button below to verify your identity:</p>
            
            <div style="text-align: center;">
              <a href="${process.env.API_BASE_URL}/api/gdpr/verify-request/${token}" class="button">
                🔐 Verify Request
              </a>
            </div>
            
            <p>If the button doesn't work, copy and paste this link:</p>
            <p style="word-break: break-all; background: #fff; padding: 10px; border-radius: 5px; font-family: monospace;">
              ${process.env.API_BASE_URL}/api/gdpr/verify-request/${token}
            </p>
            
            <div class="warning">
              <strong>Important:</strong>
              <ul>
                <li>This verification link expires in 7 days</li>
                <li>If you didn't make this request, you can safely ignore this email</li>
                <li>For ${requestType === 'DELETE' ? 'deletion' : requestType.toLowerCase()} requests, this action cannot be undone</li>
              </ul>
            </div>
            
            <p><strong>Your rights under GDPR:</strong></p>
            <ul>
              <li><strong>Access:</strong> Get a copy of your personal data</li>
              <li><strong>Rectification:</strong> Correct inaccurate data</li>
              <li><strong>Erasure:</strong> Delete your data ("right to be forgotten")</li>
              <li><strong>Restriction:</strong> Limit how we process your data</li>
              <li><strong>Portability:</strong> Transfer data in a machine-readable format</li>
            </ul>
          </div>
          
          <div class="footer">
            <p>Questions about your data rights? Contact our Data Protection Officer: <a href="mailto:${process.env.DPO_EMAIL}">${process.env.DPO_EMAIL}</a></p>
            
            <p>This is an automated security email. We process these requests within 30 days as required by GDPR.</p>
            
            <p style="margin-top: 20px;">
              <small>
                © ${new Date().getFullYear()} ${process.env.COMPANY_NAME} • 
                <a href="${process.env.PRIVACY_POLICY_URL}">Privacy Policy</a> • 
                <a href="${process.env.TERMS_URL}">Terms</a>
              </small>
            </p>
          </div>
        </body>
      </html>
    `,
    text: `
      🔒 Data ${requestType} Request - Verification Required

      We received a request to ${requestType.toLowerCase()} your personal data from our Queer Grid database.

      Security Notice: To protect your privacy, we need to verify that this request was made by you.

      Request details:
      • Request type: ${requestType}
      • Email: ${email}
      • Date: ${new Date().toISOString()}

      If you made this request, please verify your identity by visiting:
      ${process.env.API_BASE_URL}/api/gdpr/verify-request/${token}

      Important:
      • This verification link expires in 7 days
      • If you didn't make this request, you can safely ignore this email
      • For ${requestType === 'DELETE' ? 'deletion' : requestType.toLowerCase()} requests, this action cannot be undone

      Questions? Contact our Data Protection Officer: ${process.env.DPO_EMAIL}

      © ${new Date().getFullYear()} ${process.env.COMPANY_NAME}
    `
  }),

  dataExport: (email, exportId, expiresAt) => ({
    from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
    to: email,
    subject: '📁 Your data export is ready - Queer Grid',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Data Export Ready</title>
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
              line-height: 1.6; 
              color: #333; 
              max-width: 600px; 
              margin: 0 auto; 
              padding: 20px; 
            }
            .header { 
              background: #28a745; 
              color: white; 
              padding: 30px; 
              text-align: center; 
              border-radius: 10px 10px 0 0; 
            }
            .content { 
              background: #f8f9fa; 
              padding: 30px; 
              border-radius: 0 0 10px 10px; 
            }
            .button { 
              display: inline-block; 
              background: #28a745; 
              color: white; 
              padding: 15px 30px; 
              text-decoration: none; 
              border-radius: 5px; 
              font-weight: bold; 
              margin: 20px 0; 
            }
            .info { 
              background: #d1ecf1; 
              border: 1px solid #bee5eb; 
              color: #0c5460; 
              padding: 15px; 
              border-radius: 5px; 
              margin: 20px 0; 
            }
            .footer { 
              margin-top: 30px; 
              padding-top: 20px; 
              border-top: 1px solid #eee; 
              font-size: 14px; 
              color: #666; 
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>📁 Your Data Export is Ready!</h1>
            <p>Download your personal data securely</p>
          </div>
          
          <div class="content">
            <h2>Download your data</h2>
            
            <p>Your data export has been processed and is ready for download. This export contains all the personal information we have about you in our Queer Grid database.</p>
            
            <div class="info">
              <strong>📋 What's included in your export:</strong>
              <ul>
                <li>Your subscription details and preferences</li>
                <li>Consent records and timestamps</li>
                <li>Audit logs of actions taken on your account</li>
                <li>Marketing tracking data (UTM parameters, etc.)</li>
              </ul>
            </div>
            
            <div style="text-align: center;">
              <a href="${process.env.API_BASE_URL}/api/gdpr/download-export/${exportId}" class="button">
                📥 Download My Data
              </a>
            </div>
            
            <div class="info">
              <strong>⏰ Important:</strong>
              <ul>
                <li>This download link expires on: <strong>${expiresAt.toLocaleString()}</strong></li>
                <li>The file is in JSON format for maximum compatibility</li>
                <li>Your data is encrypted and password-protected during transfer</li>
                <li>This link can only be used once for security</li>
              </ul>
            </div>
            
            <p><strong>Understanding your data:</strong></p>
            <ul>
              <li><strong>Subscriber data:</strong> Your email, subscription status, and preferences</li>
              <li><strong>Consent records:</strong> When and how you gave consent for data processing</li>
              <li><strong>Audit logs:</strong> A complete history of actions on your account</li>
              <li><strong>Metadata:</strong> Technical information like IP addresses and browser data</li>
            </ul>
            
            <p>The exported data is provided in a structured, machine-readable format that you can import into other services if needed.</p>
            
            <p>If you have any questions about your data or need help understanding the export, please don't hesitate to contact us.</p>
          </div>
          
          <div class="footer">
            <p>Questions about your data? Contact us: <a href="mailto:${process.env.DPO_EMAIL}">${process.env.DPO_EMAIL}</a></p>
            
            <p>This export was generated in compliance with GDPR Article 15 (Right of Access).</p>
            
            <p style="margin-top: 20px;">
              <small>
                © ${new Date().getFullYear()} ${process.env.COMPANY_NAME} • 
                <a href="${process.env.PRIVACY_POLICY_URL}">Privacy Policy</a> • 
                <a href="${process.env.TERMS_URL}">Terms</a>
              </small>
            </p>
          </div>
        </body>
      </html>
    `,
    text: `
      📁 Your Data Export is Ready!

      Your data export has been processed and is ready for download.

      Download link: ${process.env.API_BASE_URL}/api/gdpr/download-export/${exportId}

      Important:
      • This download link expires on: ${expiresAt.toLocaleString()}
      • The file is in JSON format for maximum compatibility
      • This link can only be used once for security

      What's included:
      • Your subscription details and preferences
      • Consent records and timestamps
      • Audit logs of actions taken on your account
      • Marketing tracking data (UTM parameters, etc.)

      Questions? Contact us: ${process.env.DPO_EMAIL}

      © ${new Date().getFullYear()} ${process.env.COMPANY_NAME}
    `
  })
};

// Email service functions
const sendVerificationEmail = async (email, token) => {
  if (process.env.MOCK_EMAIL_VERIFICATION === 'true') {
    console.log(`Mock email verification sent to ${email} with token: ${token}`);
    return { messageId: 'mock-message-id' };
  }

  const transporter = createTransporter();
  const emailData = emailTemplates.verification(email, token);
  
  try {
    const result = await transporter.sendMail(emailData);
    console.log('Verification email sent:', result.messageId);
    return result;
  } catch (error) {
    console.error('Failed to send verification email:', error);
    throw error;
  }
};

const sendWelcomeEmail = async (email) => {
  if (process.env.MOCK_EMAIL_VERIFICATION === 'true') {
    console.log(`Mock welcome email sent to ${email}`);
    return { messageId: 'mock-welcome-id' };
  }

  const transporter = createTransporter();
  const emailData = emailTemplates.welcome(email);
  
  try {
    const result = await transporter.sendMail(emailData);
    console.log('Welcome email sent:', result.messageId);
    return result;
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    throw error;
  }
};

const sendDataRequestEmail = async (email, token, requestType) => {
  if (process.env.MOCK_EMAIL_VERIFICATION === 'true') {
    console.log(`Mock data request email sent to ${email} for ${requestType} with token: ${token}`);
    return { messageId: 'mock-data-request-id' };
  }

  const transporter = createTransporter();
  const emailData = emailTemplates.dataRequest(email, token, requestType);
  
  try {
    const result = await transporter.sendMail(emailData);
    console.log('Data request email sent:', result.messageId);
    return result;
  } catch (error) {
    console.error('Failed to send data request email:', error);
    throw error;
  }
};

const sendDataExportEmail = async (email, exportId, expiresAt) => {
  if (process.env.MOCK_EMAIL_VERIFICATION === 'true') {
    console.log(`Mock data export email sent to ${email} with export ID: ${exportId}`);
    return { messageId: 'mock-export-id' };
  }

  const transporter = createTransporter();
  const emailData = emailTemplates.dataExport(email, exportId, expiresAt);
  
  try {
    const result = await transporter.sendMail(emailData);
    console.log('Data export email sent:', result.messageId);
    return result;
  } catch (error) {
    console.error('Failed to send data export email:', error);
    throw error;
  }
};

module.exports = {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendDataRequestEmail,
  sendDataExportEmail
}; 