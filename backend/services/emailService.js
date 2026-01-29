// services/emailService.js
import nodemailer from 'nodemailer'
import 'dotenv/config'
import fs from 'fs'
import path from 'path'

const MAX_ATTACHMENT_SIZE_MB = 25
const MAX_ATTACHMENT_SIZE_BYTES = MAX_ATTACHMENT_SIZE_MB * 1024 * 1024

// Configure your email transporter
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export const sendTDSEmail = async ({ to, cc, subject, content, file, materialName }) => {
  try {
    let attachmentSent = false
    let attachmentSkippedReason = null
    let attachmentSizeMB = 0
    let attachmentName = ''

    const mailOptions = {
      from: process.env.SMTP_FROM || 'noreply@company.com',
      to,
      cc: cc || undefined,
      subject,
      html: `
        <div>
    
          <div>
            ${content.replace(/\n/g, '<br>')}
          </div>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p font-size: 12px;">
            This is an automated email from the Materials Tracking System.
          </p>
        </div>
      `,
      attachments: [],
    }

    // Check file size and decide whether to attach
    if (file) {
      attachmentName = file.originalname
      attachmentSizeMB = parseFloat((file.size / (1024 * 1024)).toFixed(2))

      if (file.size <= MAX_ATTACHMENT_SIZE_BYTES) {
        // Attachment is within limits - send it
        mailOptions.attachments.push({
          filename: file.originalname,
          content: file.buffer,
        })
        attachmentSent = true
      } else {
        // Attachment exceeds limits - skip it
        attachmentSent = false
        attachmentSkippedReason = `File size (${attachmentSizeMB} MB) exceeds the ${MAX_ATTACHMENT_SIZE_MB} MB limit`

        // Add note to email body about skipped attachment
        mailOptions.html += `
          <div >
            <strong>Note:</strong> The attachment was too large to send via email (${attachmentSizeMB} MB). 
            It was send via link to OneDrive.
          </div>
        `
      }
    }

    // Send the email
    const info = await transporter.sendMail(mailOptions)

    return {
      success: true,
      messageId: info.messageId,
      attachmentSent,
      attachmentSkippedReason,
      attachmentSizeMB,
      attachmentName,
    }
  } catch (error) {
    console.error('Email send error:', error)
    throw new Error(`Failed to send email: ${error.message}`)
  }
}
