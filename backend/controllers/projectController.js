import ProjectLineItem from '../models/ProjectLineItem.js'
import { sendTDSEmail } from '../services/emailService.js'
import nodemailer from 'nodemailer'
import ExcelJS from 'exceljs'

const parseAndValidateEmails = (emails) => {
  if (!emails) return []

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  return emails
    .split(',')
    .map((e) => e.trim())
    .filter((e) => e.length > 0)
    .filter((e) => emailRegex.test(e))
}

// Get dashboard summary
export const getSummary = async (req, res) => {
  try {
    const { siteName } = req.query
    const filter = siteName ? { siteName } : {}

    const summary = await ProjectLineItem.getSummary(filter)
    res.json(summary)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Get all line items
export const getAllLineItems = async (req, res) => {
  try {
    const data = await ProjectLineItem.aggregate([
      {
        $group: {
          _id: '$siteName',
          totalProjectValue: { $sum: '$amount' },
          totalWorkCompletionAmount: { $sum: '$workCompletionAmount' },
          itemCount: { $sum: 1 },
        },
      },
      {
        $addFields: {
          totalWorkCompletionPercentage: {
            $cond: [
              { $gt: ['$totalProjectValue', 0] },
              {
                $multiply: [
                  {
                    $divide: ['$totalWorkCompletionAmount', '$totalProjectValue'],
                  },
                  100,
                ],
              },
              0,
            ],
          },
        },
      },
      {
        $project: {
          _id: 0,
          siteName: '$_id',
          totalProjectValue: { $round: ['$totalProjectValue', 2] },
          totalWorkCompletionAmount: {
            $round: ['$totalWorkCompletionAmount', 2],
          },
          totalWorkCompletionPercentage: {
            $round: ['$totalWorkCompletionPercentage', 2],
          },
          itemCount: 1,
        },
      },
      { $sort: { siteName: 1 } },
    ])

    res.json(data)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Get alert card data (delayed items)
export const getAlertCardData = async (req, res) => {
  try {
    const { siteName } = req.query
    const filter = siteName ? { siteName } : {}

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const delayedItems = await ProjectLineItem.find({
      ...filter,
      endDate: { $exists: true, $ne: null, $lt: today },
    }).sort({ endDate: 1 })

    const materialNotDelivered = delayedItems.filter(
      (item) => item.materialStatus === 'Not Delivered',
    )

    const materialDeliveredButIncomplete = delayedItems.filter(
      (item) =>
        item.materialStatus === 'Intialized/Delivered' && item.workCompletionPercentage < 100,
    )

    const materialNotDeliveredStats = {
      count: materialNotDelivered.length,
      totalAmount: materialNotDelivered.reduce((sum, item) => sum + item.amount, 0),
      totalDelayDays: materialNotDelivered.reduce((sum, item) => {
        const delay = Math.ceil((today - new Date(item.endDate)) / (1000 * 60 * 60 * 24))
        return sum + (delay > 0 ? delay : 0)
      }, 0),
    }

    const materialDeliveredButIncompleteStats = {
      count: materialDeliveredButIncomplete.length,
      totalAmount: materialDeliveredButIncomplete.reduce((sum, item) => sum + item.amount, 0),
      totalRemainingAmount: materialDeliveredButIncomplete.reduce(
        (sum, item) => sum + (item.amount - item.workCompletionAmount),
        0,
      ),
      totalDelayDays: materialDeliveredButIncomplete.reduce((sum, item) => {
        const delay = Math.ceil((today - new Date(item.endDate)) / (1000 * 60 * 60 * 24))
        return sum + (delay > 0 ? delay : 0)
      }, 0),
      averageCompletion:
        materialDeliveredButIncomplete.length > 0
          ? materialDeliveredButIncomplete.reduce(
              (sum, item) => sum + item.workCompletionPercentage,
              0,
            ) / materialDeliveredButIncomplete.length
          : 0,
    }

    res.json({
      materialNotDelivered: {
        items: materialNotDelivered,
        stats: {
          ...materialNotDeliveredStats,
          totalAmount: Number(materialNotDeliveredStats.totalAmount.toFixed(2)),
        },
      },
      materialDeliveredButIncomplete: {
        items: materialDeliveredButIncomplete,
        stats: {
          ...materialDeliveredButIncompleteStats,
          totalAmount: Number(materialDeliveredButIncompleteStats.totalAmount.toFixed(2)),
          totalRemainingAmount: Number(
            materialDeliveredButIncompleteStats.totalRemainingAmount.toFixed(2),
          ),
          averageCompletion: Number(
            materialDeliveredButIncompleteStats.averageCompletion.toFixed(2),
          ),
        },
      },
      summary: {
        totalDelayedItems: delayedItems.length,
        totalCriticalAlerts: materialNotDelivered.length,
        totalExecutionDelays: materialDeliveredButIncomplete.length,
      },
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const getLineItemById = async (req, res) => {
  try {
    const { siteName } = req.query
    const filter = siteName ? { siteName } : {}

    const items = await ProjectLineItem.find(filter).sort({ createdAt: 1 })
    res.json(items)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Create line item
export const createLineItem = async (req, res) => {
  try {
    const lineItem = new ProjectLineItem(req.body)
    await lineItem.save()
    res.status(201).json(lineItem)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

// Update line item
export const updateLineItem = async (req, res) => {
  try {
    const lineItem = await ProjectLineItem.findById(req.params.id)

    if (!lineItem) {
      return res.status(404).json({ error: 'Line item not found' })
    }

    const {
      startDate,
      endDate,
      quantity,
      workStatusInUnits,
      materialStatus,
      materials,
      shopDrawing,
      TDS,
      Samples,
      ...otherUpdates
    } = req.body

    /* ===========================
       DATE CHANGE TRACKING
    ============================ */

    if (startDate) {
      if (lineItem.startDate) {
        const oldStart = new Date(lineItem.startDate).getTime()
        const newStart = new Date(startDate).getTime()

        if (oldStart !== newStart) {
          lineItem.previousDates.startDates.push(lineItem.startDate)
          lineItem.startDateCounter += 1
          lineItem.dateFlag = true
        }
      }
      lineItem.startDate = startDate
    }

    if (endDate) {
      if (lineItem.endDate) {
        const oldEnd = new Date(lineItem.endDate).getTime()
        const newEnd = new Date(endDate).getTime()

        if (oldEnd !== newEnd) {
          lineItem.previousDates.endDates.push(lineItem.endDate)
          lineItem.endDateCounter += 1
          lineItem.dateFlag = true
        }
      }
      lineItem.endDate = endDate
    }

    /* ===========================
       WORK / MATERIAL HISTORY (ONLY THESE FIELDS)
    ============================ */

    const historyFields = ['quantity', 'workStatusInUnits', 'materialStatus']

    historyFields.forEach((field) => {
      if (req.body[field] !== undefined && req.body[field] !== lineItem[field]) {
        lineItem.history.push({
          field,
          oldValue: lineItem[field],
          newValue: req.body[field],
          changedAt: new Date(),
        })
        lineItem[field] = req.body[field]
      }
    })

    /* ===========================
       MATERIALS UPDATE (NO HISTORY)
    ============================ */

    if (materials !== undefined) {
      lineItem.materials = materials
    }

    /* ===========================
       SHOP DRAWING, TDS, SAMPLES (NO HISTORY)
    ============================ */

    if (shopDrawing !== undefined) {
      lineItem.shopDrawing = shopDrawing
    }

    if (TDS !== undefined) {
      lineItem.TDS = TDS
    }

    if (Samples !== undefined) {
      lineItem.Samples = Samples
    }

    /* ===========================
       APPLY OTHER UPDATES
    ============================ */

    Object.keys(otherUpdates).forEach((key) => {
      lineItem[key] = otherUpdates[key]
    })

    await lineItem.save()

    res.json(lineItem)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

// Delete line item
export const deleteLineItem = async (req, res) => {
  try {
    const lineItem = await ProjectLineItem.findByIdAndDelete(req.params.id)

    if (!lineItem) {
      return res.status(404).json({ error: 'Line item not found' })
    }

    res.json({ message: 'Line item deleted successfully' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// controllers/projectController.js
export const getUniqueMaterials = async (req, res) => {
  try {
    const { siteName } = req.query
    const filter = siteName ? { siteName } : {}

    const lineItems = await ProjectLineItem.find(filter)
      .populate('materials.materialId', 'name unit category')
      .select('materials itemDescription')

    const materialsMap = new Map()

    lineItems.forEach((item) => {
      if (!item.materials || item.materials.length === 0) return

      item.materials.forEach((material) => {
        if (!material.materialId) return

        // ✅ UNIQUE KEY = materialId ONLY
        const key = material.materialId._id.toString()

        const tdsStatus = material.TDS === 'yes' ? 'yes' : material.TDS === 'no' ? 'no' : 'Pending'

        const sampleStatus =
          material.Samples === 'yes' ? 'yes' : material.Samples === 'no' ? 'no' : 'Pending'

        if (materialsMap.has(key)) {
          const existing = materialsMap.get(key)

          // Add quantity
          existing.quantity += material.quantity

          // If ANY item is pending/yes/no, keep most "critical" state
          if (tdsStatus === 'Pending') existing.tdsCertificate = 'Pending'
          if (sampleStatus === 'Pending') existing.samples = 'Pending'

          existing.usedInItems.push({
            itemDescription: item.itemDescription,
            quantity: material.quantity,
            lineItemId: item._id,
          })
        } else {
          materialsMap.set(key, {
            materialName: material.materialId.name,
            materialId: material.materialId._id,
            quantity: material.quantity,
            unit: material.unit || material.materialId.unit || '',
            tdsCertificate: tdsStatus,
            samples: sampleStatus,
            usedInItems: [
              {
                itemDescription: item.itemDescription,
                quantity: material.quantity,
                lineItemId: item._id,
              },
            ],
          })
        }
      })
    })

    const uniqueMaterials = Array.from(materialsMap.values())
    res.json(uniqueMaterials)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// export const sendTDSMail = async (req, res) => {
//   try {
//     const { to, subject, content, materialName } = req.body
//     const ccList = parseAndValidateEmails(req.body.cc)

//     const file = req.file

//     // Validate required fields
//     if (!to || !subject || !content || !materialName) {
//       return res.status(400).json({
//         error: 'Missing required fields: to, subject, content, materialName',
//       })
//     }

//     // Validate email format
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
//     if (!emailRegex.test(to)) {
//       return res.status(400).json({ error: 'Invalid email address' })
//     }

//     // Calculate file size before sending
//     let fileSizeMB = 0
//     let fileName = ''
//     if (file) {
//       fileSizeMB = parseFloat((file.size / (1024 * 1024)).toFixed(2))
//       fileName = file.originalname
//     }

//     // Send email with size validation
//     const emailResult = await sendTDSEmail({
//       to,
//       cc: ccList,
//       subject,
//       content,
//       file,
//       materialName,
//     })

//     // Find all line items with this material and update their TDS mail history
//     const lineItems = await ProjectLineItem.find({
//       'materials.materialName': materialName,
//     })

//     const mailRecord = {
//       to,
//       cc: ccList?.length ? ccList : undefined,

//       subject,
//       content,
//       attachmentName: emailResult.attachmentName || fileName,
//       attachmentSizeMB: emailResult.attachmentSizeMB || fileSizeMB,
//       attachmentSent: emailResult.attachmentSent,
//       attachmentSkippedReason: emailResult.attachmentSkippedReason || null,
//       fileUrl: file ? `/uploads/tds/${file.filename}` : null, // If you're storing files
//       sentAt: new Date(),
//     }

//     // Update all matching materials across all line items
//     for (const lineItem of lineItems) {
//       for (const material of lineItem.materials) {
//         if (material.materialName === materialName) {
//           if (!material.tdsMailHistory) {
//             material.tdsMailHistory = []
//           }
//           material.tdsMailHistory.push(mailRecord)
//         }
//       }
//       await lineItem.save()
//     }

//     res.json({
//       success: true,
//       message: 'Email sent successfully',
//       details: {
//         messageId: emailResult.messageId,
//         attachmentSent: emailResult.attachmentSent,
//         attachmentSizeMB: emailResult.attachmentSizeMB,
//         attachmentSkippedReason: emailResult.attachmentSkippedReason,
//       },
//       mailRecord,
//     })
//   } catch (error) {
//     console.error('Send TDS mail error:', error)
//     res.status(500).json({
//       error: 'Failed to send email',
//       details: error.message,
//     })
//   }
// }
export const sendTDSMail = async (req, res) => {
  try {
    const { to, subject, content, materialName } = req.body
    const ccList = parseAndValidateEmails(req.body.cc)
    const files = req.files || [] // Array of files

    if (!to || !subject || !content || !materialName) {
      return res.status(400).json({
        error: 'Missing required fields: to, subject, content, materialName',
      })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(to)) {
      return res.status(400).json({ error: 'Invalid email address' })
    }

    // Send email with multiple files
    const emailResult = await sendTDSEmail({
      to,
      cc: ccList,
      subject,
      content,
      files, // Pass all files
      materialName,
    })

    // Find all line items with this material
    const lineItems = await ProjectLineItem.find({
      'materials.materialName': materialName,
    })

    const mailRecord = {
      to,
      cc: ccList?.length ? ccList : undefined,
      subject,
      content,
      attachments: emailResult.attachments, // Array of attachment details
      sentAt: new Date(),
    }

    // Update all matching materials
    for (const lineItem of lineItems) {
      for (const material of lineItem.materials) {
        if (material.materialName === materialName) {
          if (!material.tdsMailHistory) {
            material.tdsMailHistory = []
          }
          material.tdsMailHistory.push(mailRecord)
        }
      }
      await lineItem.save()
    }

    res.json({
      success: true,
      message: 'Email sent successfully',
      details: {
        messageId: emailResult.messageId,
        attachmentsSent: emailResult.attachmentsSent,
        attachmentsSkipped: emailResult.attachmentsSkipped,
        totalFiles: files.length,
      },
      mailRecord,
    })
  } catch (error) {
    console.error('Send TDS mail error:', error)
    res.status(500).json({
      error: 'Failed to send email',
      details: error.message,
    })
  }
}
// Add this new controller function in projectController.js

export const getTDSMailHistory = async (req, res) => {
  try {
    const { materialName } = req.query

    if (!materialName) {
      return res.status(400).json({ error: 'materialName is required' })
    }

    // Find all line items that contain this material
    const lineItems = await ProjectLineItem.find({
      'materials.materialName': materialName,
    }).select('materials')

    // Extract all mail history for this specific material
    const allMailHistory = []

    lineItems.forEach((lineItem) => {
      lineItem.materials.forEach((material) => {
        if (material.materialName === materialName && material.tdsMailHistory) {
          allMailHistory.push(...material.tdsMailHistory)
        }
      })
    })

    // Sort by date (newest first) and remove duplicates
    const uniqueMailHistory = allMailHistory
      .sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt))
      .filter(
        (mail, index, self) =>
          index === self.findIndex((m) => m.sentAt.getTime() === mail.sentAt.getTime()),
      )

    res.json(uniqueMailHistory)
  } catch (error) {
    console.error('Get TDS mail history error:', error)
    res.status(500).json({
      error: 'Failed to fetch mail history',
      details: error.message,
    })
  }
}

// Get distinct site names
export const getSites = async (req, res) => {
  try {
    const sites = await ProjectLineItem.distinct('siteName')
    res.json(sites)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// export const sendBulkShopDrawings = async (req, res) => {
//   try {
//     const { siteName, force } = req.body

//     const INTERNAL = process.env.SHOP_DRAWING_INTERNAL
//     const EXTERNAL = process.env.SHOP_DRAWING_EXTERNAL

//     const lineItems = await ProjectLineItem.find({
//       siteName,
//       shopDrawing: { $in: ['Internal', 'External'] },
//     })

//     if (!lineItems.length) {
//       return res.status(400).json({
//         error: 'No line items with shop drawing set',
//       })
//     }

//     const transporter = nodemailer.createTransport({
//       service: 'gmail',
//       auth: {
//         user: process.env.SMTP_USER,
//         pass: process.env.SMTP_PASS,
//       },
//     })

//     let sentCount = 0
//     let skippedCount = 0

//     for (const item of lineItems) {
//       // HARD SKIP SAFETY CHECK
//       if (item.shopDrawingMail?.sent === true && !force) {
//         skippedCount++
//         continue
//       }

//       const to = item.shopDrawing === 'Internal' ? INTERNAL : EXTERNAL

//       const subject = `Shop Drawing Request | ${item.siteName} | ${item.sno}`
//       const htmlContent = `
// <div style="font-family: Arial, sans-serif; background-color: #f5f7fa; padding: 20px;">
//   <div style="max-width: 700px; margin: auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 5px 15px rgba(0,0,0,0.1);">

//     <!-- Header -->
//     <div style="background: #773090; color: white; padding: 16px;">
//       <h2 style="margin: 0;">📐 Shop Drawing Request</h2>
//       <p style="margin: 4px 0 0; font-size: 13px;">
//         Shomli Interiors Pvt. Ltd.
//       </p>
//     </div>

//     <!-- Auto Alert -->
//     <div style="background: #fff3cd; color: #856404; padding: 12px; font-size: 13px; border-bottom: 1px solid #ffeeba;">
//       ⚠ This email was sent <strong>automatically</strong> from the Shomli Project System.
//       Please do not reply directly to this email.
//     </div>

//     <!-- Table -->
//     <div style="padding: 20px;">
//       <table width="100%" cellpadding="8" cellspacing="0" style="border-collapse: collapse; font-size: 14px;">
//         <thead>
//           <tr style="background-color: #f0f2f5;">
//             <th align="left" style="border: 1px solid #ddd;">S.No</th>
//             <th align="left" style="border: 1px solid #ddd;">Site Name</th>
//             <th align="left" style="border: 1px solid #ddd;">Category</th>
//             <th align="left" style="border: 1px solid #ddd;">Item Description</th>
//             <th align="right" style="border: 1px solid #ddd;">Quantity</th>
//             <th align="center" style="border: 1px solid #ddd;">UOM</th>
//           </tr>
//         </thead>
//         <tbody>
//           <tr>
//             <td style="border: 1px solid #ddd;">${item.sno}</td>
//             <td style="border: 1px solid #ddd;">${item.siteName}</td>
//             <td style="border: 1px solid #ddd;">${item.category}</td>
//             <td style="border: 1px solid #ddd;">${item.itemDescription}</td>
//             <td align="right" style="border: 1px solid #ddd;">${item.quantity}</td>
//             <td align="center" style="border: 1px solid #ddd;">${item.units}</td>
//           </tr>
//         </tbody>
//       </table>
//     </div>

//     <!-- Footer -->
//     <div style="background: #f0f2f5; padding: 12px; font-size: 12px; color: #555; text-align: center;">
//       This message was generated by the <strong>Shomli Interiors Project Management System</strong><br>
//       © ${new Date().getFullYear()} Shomli Interiors Pvt. Ltd.
//     </div>

//   </div>
// </div>
// `
//       const content = `
// SHOP DRAWING REQUEST

// S.No: ${item.sno}
// Site Name: ${item.siteName}
// Category: ${item.category}
// Item Description: ${item.itemDescription}
// Quantity: ${item.quantity}
// Units: ${item.units}
// `

//       await transporter.sendMail({
//         from: `"Shomli Interiors" <${process.env.MAIL_USER}>`,
//         to,
//         subject,
//         html: htmlContent,
//         // text: content,
//       })

//       item.shopDrawingMail = {
//         sent: true,
//         sentAt: new Date(),
//         sentTo: to,
//         subject,
//         content,
//       }

//       await item.save()
//       sentCount++
//     }

//     return res.status(200).json({
//       success: true,
//       message: 'Bulk shop drawing process completed',
//       summary: {
//         sent: sentCount,
//         skipped: skippedCount,
//         forced: !!force,
//       },
//     })
//   } catch (err) {
//     console.error(err)
//     return res.status(500).json({ error: 'Bulk shop drawing mail failed' })
//   }
// }

const buildExcelBuffer = async (items, sheetName = 'Shop Drawings') => {
  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet(sheetName)

  // Columns
  sheet.columns = [
    { header: 'S.No', key: 'sno', width: 10 },
    { header: 'Site Name', key: 'siteName', width: 25 },
    { header: 'Category', key: 'category', width: 20 },
    { header: 'Item Description', key: 'itemDescription', width: 40 },
    { header: 'Quantity', key: 'quantity', width: 12 },
    { header: 'UOM', key: 'units', width: 10 },
  ]

  // Header styling
  sheet.getRow(1).eachCell((cell) => {
    cell.font = { bold: true }
    cell.alignment = { vertical: 'middle', horizontal: 'center' }
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    }
  })

  // Rows
  items.forEach((item) => {
    sheet.addRow({
      sno: item.sno,
      siteName: item.siteName,
      category: item.category,
      itemDescription: item.itemDescription,
      quantity: item.quantity,
      units: item.units,
    })
  })

  // Borders for all rows
  sheet.eachRow((row) => {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      }
    })
  })

  return workbook.xlsx.writeBuffer()
}

// export const sendBulkShopDrawings = async (req, res) => {
//   try {
//     const { siteName, force } = req.body

//     const INTERNAL = process.env.SHOP_DRAWING_INTERNAL
//     const EXTERNAL = process.env.SHOP_DRAWING_EXTERNAL

//     const lineItems = await ProjectLineItem.find({
//       siteName,
//       shopDrawing: { $in: ['Internal', 'External'] },
//     })

//     if (!lineItems.length) {
//       return res.status(400).json({ error: 'No line items with shop drawing set' })
//     }

//     // Filter items based on already-sent unless force = true
//     const eligibleItems = lineItems.filter((item) => {
//       if (item.shopDrawingMail?.sent === true && !force) return false
//       return true
//     })

//     if (!eligibleItems.length) {
//       return res.status(200).json({
//         success: true,
//         message: 'No emails sent (all items already mailed). Use force=true to resend.',
//         summary: { sent: 0, skipped: lineItems.length, forced: !!force },
//       })
//     }

//     // Split into Internal / External groups
//     const internalItems = eligibleItems.filter((i) => i.shopDrawing === 'Internal')
//     const externalItems = eligibleItems.filter((i) => i.shopDrawing === 'External')

//     const transporter = nodemailer.createTransport({
//       service: 'gmail',
//       auth: {
//         user: process.env.SMTP_USER,
//         pass: process.env.SMTP_PASS,
//       },
//     })

//     const escapeHtml = (v = '') =>
//       String(v)
//         .replace(/&/g, '&amp;')
//         .replace(/</g, '&lt;')
//         .replace(/>/g, '&gt;')
//         .replace(/"/g, '&quot;')
//         .replace(/'/g, '&#039;')

//     const buildRows = (items) =>
//       items
//         .map(
//           (item) => `
//           <tr>
//             <td style="border:1px solid #ddd;">${escapeHtml(item.sno)}</td>
//             <td style="border:1px solid #ddd;">${escapeHtml(item.siteName)}</td>
//             <td style="border:1px solid #ddd;">${escapeHtml(item.category)}</td>
//             <td style="border:1px solid #ddd;">${escapeHtml(item.itemDescription)}</td>
//             <td align="right" style="border:1px solid #ddd;">${escapeHtml(item.quantity)}</td>
//             <td align="center" style="border:1px solid #ddd;">${escapeHtml(item.units)}</td>
//           </tr>
//         `,
//         )
//         .join('')

//     const buildTable = (title, items) => {
//       if (!items.length) return ''
//       return `
//         <div style="padding: 16px 20px 0;">
//           <h3 style="margin: 0 0 10px; color:#333;">${title} (${items.length})</h3>
//         </div>
//         <div style="padding: 0 20px 20px;">
//           <table width="100%" cellpadding="8" cellspacing="0" style="border-collapse: collapse; font-size: 14px;">
//             <thead>
//               <tr style="background-color: #f0f2f5;">
//                 <th align="left" style="border: 1px solid #ddd;">S.No</th>
//                 <th align="left" style="border: 1px solid #ddd;">Site Name</th>
//                 <th align="left" style="border: 1px solid #ddd;">Category</th>
//                 <th align="left" style="border: 1px solid #ddd;">Item Description</th>
//                 <th align="right" style="border: 1px solid #ddd;">Quantity</th>
//                 <th align="center" style="border: 1px solid #ddd;">UOM</th>
//               </tr>
//             </thead>
//             <tbody>
//               ${buildRows(items)}
//             </tbody>
//           </table>
//         </div>
//       `
//     }

//     const buildHtmlEmail = ({ siteName, title, items }) => `
//       <div style="font-family: Arial, sans-serif; background-color: #f5f7fa; padding: 20px;">
//         <div style="max-width: 900px; margin: auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 5px 15px rgba(0,0,0,0.1);">

//           <div style="background: #773090; color: white; padding: 16px;">
//             <h2 style="margin: 0;">📐 Shop Drawing Request</h2>
//             <p style="margin: 4px 0 0; font-size: 13px;">
//               Site: <b>${escapeHtml(siteName)}</b> • ${escapeHtml(title)}
//             </p>
//           </div>

//           <div style="background: #fff3cd; color: #856404; padding: 12px; font-size: 13px; border-bottom: 1px solid #ffeeba;">
//             ⚠ This email was sent <strong>automatically</strong> from the Shomli Project System.
//             Please do not reply directly to this email.
//           </div>

//           ${items}

//           <div style="background: #f0f2f5; padding: 12px; font-size: 12px; color: #555; text-align: center;">
//             This message was generated by the <strong>Shomli Interiors Project Management System</strong><br/>
//             © ${new Date().getFullYear()} Shomli Interiors Pvt. Ltd.
//           </div>

//         </div>
//       </div>
//     `

//     let sentCount = 0
//     let skippedCount = lineItems.length - eligibleItems.length

//     if (internalItems.length) {
//       const subject = `Shop Drawing Request | ${siteName} | INTERNAL | ${internalItems.length} Items`

//       const html = buildHtmlEmail({
//         siteName,
//         title: 'Internal Items',
//         items: buildTable('Internal Items', internalItems),
//       })

//       const excelBuffer = await buildExcelBuffer(internalItems, `${siteName} - Internal`)

//       await transporter.sendMail({
//         from: `"Shomli Interiors" <${process.env.MAIL_USER}>`,
//         to: INTERNAL,
//         subject,
//         html,
//         attachments: [
//           {
//             filename: `${siteName}_Internal_Shop_Drawings.xlsx`,
//             content: excelBuffer,
//             contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
//           },
//         ],
//       })

//       sentCount++
//     }

//     if (externalItems.length) {
//       const subject = `Shop Drawing Request | ${siteName} | EXTERNAL | ${externalItems.length} Items`

//       const html = buildHtmlEmail({
//         siteName,
//         title: 'External Items',
//         items: buildTable('External Items', externalItems),
//       })

//       const excelBuffer = await buildExcelBuffer(externalItems, `${siteName} - External`)

//       await transporter.sendMail({
//         from: `"Shomli Interiors" <${process.env.MAIL_USER}>`,
//         to: EXTERNAL,
//         subject,
//         html,
//         attachments: [
//           {
//             filename: `${siteName}_External_Shop_Drawings.xlsx`,
//             content: excelBuffer,
//             contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
//           },
//         ],
//       })

//       sentCount++
//     }

//     // Update all eligible items as mailed
//     const now = new Date()
//     for (const item of eligibleItems) {
//       const to = item.shopDrawing === 'Internal' ? INTERNAL : EXTERNAL
//       item.shopDrawingMail = {
//         sent: true,
//         sentAt: now,
//         sentTo: to,
//         subject: `Shop Drawing Request | ${siteName} | ${item.shopDrawing}`,
//         content: `Included in bulk email (${item.shopDrawing}) on ${now.toISOString()}`,
//       }
//       await item.save()
//     }

//     return res.status(200).json({
//       success: true,
//       message: 'Bulk shop drawing grouped emails sent successfully',
//       summary: {
//         emailsSent: sentCount, // 0, 1, or 2
//         itemsUpdated: eligibleItems.length,
//         internalItems: internalItems.length,
//         externalItems: externalItems.length,
//         skippedItems: skippedCount,
//         forced: !!force,
//       },
//     })
//   } catch (err) {
//     console.error(err)
//     return res.status(500).json({ error: 'Bulk shop drawing mail failed' })
//   }
// }
export const sendBulkShopDrawings = async (req, res) => {
  try {
    const { siteName, force, internalMessage, externalMessage } = req.body

    const INTERNAL = process.env.SHOP_DRAWING_INTERNAL
    const EXTERNAL = process.env.SHOP_DRAWING_EXTERNAL

    const lineItems = await ProjectLineItem.find({
      siteName,
      shopDrawing: { $in: ['Internal', 'External'] },
    })

    if (!lineItems.length) {
      return res.status(400).json({ error: 'No line items with shop drawing set' })
    }

    // Filter items based on already-sent unless force = true
    const eligibleItems = lineItems.filter((item) => {
      if (item.shopDrawingMail?.sent === true && !force) return false
      return true
    })

    if (!eligibleItems.length) {
      return res.status(200).json({
        success: true,
        message: 'No emails sent (all items already mailed). Use force=true to resend.',
        summary: { sent: 0, skipped: lineItems.length, forced: !!force },
      })
    }

    // Split into Internal / External groups
    const internalItems = eligibleItems.filter((i) => i.shopDrawing === 'Internal')
    const externalItems = eligibleItems.filter((i) => i.shopDrawing === 'External')

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })

    const escapeHtml = (v = '') =>
      String(v)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')

    const buildRows = (items) =>
      items
        .map(
          (item) => `
          <tr>
            <td style="border:1px solid #ddd;">${escapeHtml(item.sno)}</td>
            <td style="border:1px solid #ddd;">${escapeHtml(item.siteName)}</td>
            <td style="border:1px solid #ddd;">${escapeHtml(item.category)}</td>
            <td style="border:1px solid #ddd;">${escapeHtml(item.itemDescription)}</td>
            <td align="right" style="border:1px solid #ddd;">${escapeHtml(item.quantity)}</td>
            <td align="center" style="border:1px solid #ddd;">${escapeHtml(item.units)}</td>
          </tr>
        `,
        )
        .join('')

    const buildTable = (title, items) => {
      if (!items.length) return ''
      return `
        <div style="padding: 16px 20px 0;">
          <h3 style="margin: 0 0 10px; color:#333;">${title} (${items.length})</h3>
        </div>
        <div style="padding: 0 20px 20px;">
          <table width="100%" cellpadding="8" cellspacing="0" style="border-collapse: collapse; font-size: 14px;">
            <thead>
              <tr style="background-color: #f0f2f5;">
                <th align="left" style="border: 1px solid #ddd;">S.No</th>
                <th align="left" style="border: 1px solid #ddd;">Site Name</th>
                <th align="left" style="border: 1px solid #ddd;">Category</th>
                <th align="left" style="border: 1px solid #ddd;">Item Description</th>
                <th align="right" style="border: 1px solid #ddd;">Quantity</th>
                <th align="center" style="border: 1px solid #ddd;">UOM</th>
              </tr>
            </thead>
            <tbody>
              ${buildRows(items)}
            </tbody>
          </table>
        </div>
      `
    }

    const buildHtmlEmail = ({ siteName, title, items, message }) => `
      <div style="font-family: Arial, sans-serif; background-color: #f5f7fa; padding: 20px;">
        <div style="max-width: 900px; margin: auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 5px 15px rgba(0,0,0,0.1);">

          <div style="background: #773090; color: white; padding: 16px;">
            <h2 style="margin: 0;">📐 Shop Drawing Request</h2>
            <p style="margin: 4px 0 0; font-size: 13px;">
              Site: <b>${escapeHtml(siteName)}</b> • ${escapeHtml(title)}
            </p>
          </div>

          <div style="background: #fff3cd; color: #856404; padding: 12px; font-size: 13px; border-bottom: 1px solid #ffeeba;">
            ⚠ This email was sent <strong>automatically</strong> from the Shomli Project System.
            Please do not reply directly to this email.
          </div>
${
  message
    ? `
  <div style="padding: 16px 20px;">
    <div style="background:#e8f0fe; border-left: 4px solid #1a73e8; padding: 12px; border-radius: 4px; font-size: 14px;">
      <strong>Message from Project Team:</strong><br/>
      ${escapeHtml(message).replace(/\n/g, '<br/>')}
    </div>
  </div>
  `
    : ''
}
          ${items}

          <div style="background: #f0f2f5; padding: 12px; font-size: 12px; color: #555; text-align: center;">
            This message was generated by the <strong>Shomli Interiors Project Management System</strong><br/>
            © ${new Date().getFullYear()} Shomli Interiors Pvt. Ltd.
          </div>

        </div>
      </div>
    `

    let sentCount = 0
    let skippedCount = lineItems.length - eligibleItems.length

    if (internalItems.length) {
      const subject = `Shop Drawing Request | ${siteName} | INTERNAL | ${internalItems.length} Items`

      const html = buildHtmlEmail({
        siteName,
        title: 'Internal Items',
        items: buildTable('Internal Items', internalItems),
        message: internalMessage,
      })

      const excelBuffer = await buildExcelBuffer(internalItems, `${siteName} - Internal`)

      await transporter.sendMail({
        from: `"Shomli Interiors" <${process.env.MAIL_USER}>`,
        to: INTERNAL,
        subject,
        html,
        attachments: [
          {
            filename: `${siteName}_Internal_Shop_Drawings.xlsx`,
            content: excelBuffer,
            contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          },
        ],
      })

      sentCount++
    }

    if (externalItems.length) {
      const subject = `Shop Drawing Request | ${siteName} | EXTERNAL | ${externalItems.length} Items`

      const html = buildHtmlEmail({
        siteName,
        title: 'External Items',
        items: buildTable('External Items', externalItems),
        message: externalMessage,
      })

      const excelBuffer = await buildExcelBuffer(externalItems, `${siteName} - External`)

      await transporter.sendMail({
        from: `"Shomli Interiors" <${process.env.MAIL_USER}>`,
        to: EXTERNAL,
        subject,
        html,
        attachments: [
          {
            filename: `${siteName}_External_Shop_Drawings.xlsx`,
            content: excelBuffer,
            contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          },
        ],
      })

      sentCount++
    }

    // Update all eligible items as mailed
    const now = new Date()
    for (const item of eligibleItems) {
      const to = item.shopDrawing === 'Internal' ? INTERNAL : EXTERNAL
      item.shopDrawingMail = {
        sent: true,
        sentAt: now,
        sentTo: to,
        subject: `Shop Drawing Request | ${siteName} | ${item.shopDrawing}`,
        content: `Included in bulk email (${item.shopDrawing}) on ${now.toISOString()}`,
        message:
          item.shopDrawing === 'Internal' ? internalMessage || null : externalMessage || null,
      }
      await item.save()
    }

    return res.status(200).json({
      success: true,
      message: 'Bulk shop drawing grouped emails sent successfully',
      summary: {
        emailsSent: sentCount, // 0, 1, or 2
        itemsUpdated: eligibleItems.length,
        internalItems: internalItems.length,
        externalItems: externalItems.length,
        skippedItems: skippedCount,
        forced: !!force,
      },
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Bulk shop drawing mail failed' })
  }
}
