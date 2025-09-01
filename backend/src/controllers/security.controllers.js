import User from '../models/User.js';
import bcrypt from 'bcryptjs';

// Check if user has security password
export const hasSecurityPassword = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('securityPassword');
    
    res.status(200).json({
      success: true,
      hasSecurityPassword: !!user.securityPassword
    });
  } catch (error) {
    console.error('Error checking security password:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Change security password
export const changeSecurityPassword = async (req, res) => {
  try {
    const { currentSecurityPassword, newSecurityPassword } = req.body;
    const user = await User.findById(req.userId).select('+securityPassword');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // If user has existing security password, verify current one
    if (user.securityPassword) {
      if (!currentSecurityPassword) {
        return res.status(400).json({
          success: false,
          message: 'Current security password is required'
        });
      }
      
      const isCurrentValid = await bcrypt.compare(
        currentSecurityPassword, 
        user.securityPassword
      );
      
      if (!isCurrentValid) {
        return res.status(401).json({
          success: false,
          message: 'Current security password is incorrect'
        });
      }
    }
    
    // Hash and save new security password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newSecurityPassword, saltRounds);
    
    user.securityPassword = hashedPassword;
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Security password updated successfully'
    });
  } catch (error) {
    console.error('Error changing security password:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Verify security password (for transactions, etc.)
export const verifySecurityPassword = async (req, res) => {
  try {
    const { securityPassword } = req.body;
    const user = await User.findById(req.userId).select('+securityPassword');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    if (!user.securityPassword) {
      return res.status(400).json({
        success: false,
        message: 'Security password not set'
      });
    }
    
    const isValid = await bcrypt.compare(securityPassword, user.securityPassword);
    
    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: 'Security password is incorrect'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Security password verified successfully'
    });
  } catch (error) {
    console.error('Error verifying security password:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};