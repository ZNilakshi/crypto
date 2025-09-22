// utils/emailService.js
import nodemailer from 'nodemailer';

let transporter = null;
let isInitialized = false;

function initializeTransporter() {
  console.log('📧 Initializing email transporter...');
  
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('❌ Email credentials missing - cannot initialize transporter');
    return null;
  }

  try {
    const newTransporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    console.log('✅ Email transporter created successfully');
    return newTransporter;
  } catch (error) {
    console.error('❌ Failed to create email transporter:', error.message);
    return null;
  }
}

async function verifyTransporter() {
  if (!transporter) {
    transporter = initializeTransporter();
    if (!transporter) return false;
  }

  try {
    await transporter.verify();
    console.log('✅ Email server connection verified');
    isInitialized = true;
    return true;
  } catch (error) {
    console.error('❌ Email connection verification failed:', error.message);
    transporter = null;
    isInitialized = false;
    return false;
  }
}

export async function sendWithdrawalStatusEmail(userEmail, username, status, withdrawalData, reason = '') {
  // Check if email is configured
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('⚠️ Email not configured. Skipping email notification.');
    return;
  }

  // Verify transporter connection
  const isReady = await verifyTransporter();
  if (!isReady) {
    console.error('❌ Email service not ready - cannot send withdrawal email');
    return;
  }

  let subject, body;

  switch (status) {
    case 'APPROVED':
      subject = '✅ Withdrawal Approved – Funds Sent';
      body = `
Dear ${username},

Your withdrawal request has been approved and the funds have been sent to your wallet.

Withdrawal Details:
- Amount: ${withdrawalData.amount} USDT
- Network: ${withdrawalData.walletType}
- Wallet Address: ${withdrawalData.toAddress}
- Transaction Fee: ${withdrawalData.fee || 0} USDT
- Net Amount Received: ${withdrawalData.amount - (withdrawalData.fee || 0)} USDT
- Date: ${new Date(withdrawalData.createdAt).toLocaleDateString()}
- Status: ✅ Completed

The transaction may take a few minutes to appear in your wallet depending on network congestion.

Thank you for using FortunePath!

Sincerely,  
FortunePath Team  
📩 support@fortunepathweb.com  
🌐 www.FortunePathWeb.com
      `;
      break;

      case 'REJECTED':
        subject = '❌ Withdrawal Request Rejected';
        body = `
      Dear ${username},
      
      Your withdrawal request has been rejected.
      
      Withdrawal Details:
      - Amount: ${withdrawalData.amount} USDT
      - Network: ${withdrawalData.walletType}
      - Wallet Address: ${withdrawalData.toAddress}
      - Date: ${new Date(withdrawalData.createdAt).toLocaleDateString()}
      - Status: ❌ Rejected
      
      Reason for Rejection:
      ${reason || 'No specific reason provided'}
      
      If you believe this is an error, please contact our support team for assistance.
      
      Sincerely,  
      FortunePath Team  
      📩 support@fortunepathweb.com  
      🌐 www.FortunePathWeb.com
        `;
        break;
    case 'HOLD':
      subject = '⏳ Withdrawal Request Received – Pending Processing';
      body = `
Dear ${username},

Your withdrawal request has been received and is currently under review by our system for standard verification.

Request Details:
- Amount: ${withdrawalData.amount} USDT
- Date: ${new Date(withdrawalData.createdAt).toLocaleDateString()}
- Wallet: ${withdrawalData.toAddress}
- Network: ${withdrawalData.walletType}
- Status: 🔄 Pending
${reason ? `- Reason: ${reason}\n` : ''}

This temporary delay may be due to:
- Ongoing KYC or AML checks
- Network congestion
- Routine platform security protocols

We'll notify you as soon as the transaction is approved and sent.

Thank you for your patience and for choosing FortunePath.

Warm regards,
FortunePath Security Team
📩 support@fortunepathweb.com
🌐 www.FortunePathWeb.com
      `;
      break;

    default:
      return;
  }

  try {
    const FROM_ADDRESS = process.env.EMAIL_FROM || `FortunePath <${process.env.EMAIL_USER}>`;
    const mailOptions = {
      from: FROM_ADDRESS,
      to: userEmail,
      subject,
      text: body,
    };

    await transporter.sendMail(mailOptions);
    console.log(`📧 Withdrawal email sent to ${userEmail} for status: ${status}`);
  } catch (error) {
    console.error('❌ Error sending withdrawal email:', error.message);
  }
}



export async function sendDepositStatusEmail(userEmail, username, status, depositData, reason = '') {
  // Initialize transporter on first use (lazy loading)
  if (!transporter) {
    transporter = initializeTransporter();
    if (!transporter) {
      console.warn('⚠️ Email not configured. Skipping email notification.');
      return;
    }
    
    // Verify connection
    try {
      await transporter.verify();
      console.log('✅ Email server is ready to send messages');
    } catch (error) {
      console.error('❌ Email connection failed:', error.message);
      transporter = null;
      return;
    }
  }

  // ... rest of your email sending code remains the same
  let subject, body;

  switch (status) {
    case 'APPROVED':
      subject = '✅ Deposit Successful — Your USDT Has Been Credited';
      body = `
Dear ${username},

We're excited to let you know that your recent USDT deposit has been successfully received and credited to your FortunePath account.

Deposit Details:
- Amount: ${depositData.amount} USDT
- Date: ${new Date(depositData.createdAt).toLocaleDateString()}
- Transaction ID: ${depositData.txHash}
- Wallet Address Used: ${depositData.systemWallet}
- Status: ✅ Confirmed on Blockchain

Your funds are now available for:
- AI-Powered Trading
- AI-Staking Pools (7 / 21 / 30-day cycles)
- Referral Earnings and Portfolio Growth

💡 Reminder: Always double-check the correct wallet address before depositing. Transactions on the blockchain are irreversible.

Sincerely,  
FortunePath Team  
📩 support@fortunepathweb.com  
🌐 www.FortunePathWeb.com
      `;
      break;

    case 'REJECTED':
      subject = '❌ Deposit Rejected';
      body = `
Dear ${username},

Your recent USDT deposit has been rejected.

Deposit Details:
- Amount: ${depositData.amount} USDT
- Date: ${new Date(depositData.createdAt).toLocaleDateString()}
- Transaction ID: ${depositData.txHash}

Reason: ${reason || 'No reason provided'}

If you believe this is an error, please contact support.

Sincerely,  
FortunePath Team  
📩 support@fortunepathweb.com  
🌐 www.FortunePathWeb.com
      `;
      break;

    case 'HOLD':
      subject = '⏳ Deposit On Hold';
      body = `
Dear ${username},

Your recent USDT deposit is currently on hold while we review it.

Deposit Details:
- Amount: ${depositData.amount} USDT
- Date: ${new Date(depositData.createdAt).toLocaleDateString()}
- Transaction ID: ${depositData.txHash}

Reason: ${reason || 'Under review'}

We will notify you once the review is complete (usually 24–48 hours).

Sincerely,  
FortunePath Team  
📩 support@fortunepathweb.com  
🌐 www.FortunePathWeb.com
      `;
      break;

    default:
      return;
  }

  try {
    const FROM_ADDRESS = process.env.EMAIL_FROM || `FortunePath <${process.env.EMAIL_USER}>`;
    const mailOptions = {
      from: FROM_ADDRESS,
      to: userEmail,
      subject,
      text: body,
    };

    await transporter.sendMail(mailOptions);
    console.log(`📧 Email sent to ${userEmail} for deposit status: ${status}`);
  } catch (error) {
    console.error('❌ Error sending email:', error);
  }
}

