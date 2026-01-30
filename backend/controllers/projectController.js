import ProjectLineItem from '../models/ProjectLineItem.js'
import { sendTDSEmail } from '../services/emailService.js'

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
