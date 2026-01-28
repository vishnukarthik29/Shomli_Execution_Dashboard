import ProjectLineItem from '../models/ProjectLineItem.js'

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
// // Get unique materials from all line items
// export const getUniqueMaterials = async (req, res) => {
//   try {
//     const { siteName } = req.query
//     const filter = siteName ? { siteName } : {}

//     const lineItems = await ProjectLineItem.find(filter, {
//       materials: 1,
//       shopDrawing: 1,
//       TDS: 1,
//       Samples: 1,
//       itemDescription: 1,
//     })

//     // Create a map to track unique materials
//     const materialsMap = new Map()

//     lineItems.forEach((item) => {
//       if (item.materials && item.materials.length > 0) {
//         item.materials.forEach((material) => {
//           const key = material.name.toLowerCase().trim()

//           if (materialsMap.has(key)) {
//             // Add quantity to existing material
//             const existing = materialsMap.get(key)
//             existing.quantity += material.quantity
//             existing.usedInItems.push({
//               itemDescription: item.itemDescription,
//               quantity: material.quantity,
//             })
//           } else {
//             // Create new material entry
//             materialsMap.set(key, {
//               materialName: material.name,
//               quantity: material.quantity,
//               unit: '', // Can be derived from line item if needed
//               tdsCertificate: item.TDS === 'yes' ? 'yes' : item.TDS === 'no' ? 'no' : 'Pending',
//               samples: item.Samples === 'yes' ? 'yes' : item.Samples === 'no' ? 'no' : 'Pending',
//               shopDrawing: item.shopDrawing || 'Not Required',
//               usedInItems: [
//                 {
//                   itemDescription: item.itemDescription,
//                   quantity: material.quantity,
//                 },
//               ],
//             })
//           }
//         })
//       }
//     })

//     // Convert map to array
//     const uniqueMaterials = Array.from(materialsMap.values())

//     res.json(uniqueMaterials)
//   } catch (error) {
//     res.status(500).json({ error: error.message })
//   }
// }
// Get unique materials from all line items
export const getUniqueMaterials = async (req, res) => {
  try {
    const { siteName } = req.query
    const filter = siteName ? { siteName } : {}

    const lineItems = await ProjectLineItem.find(filter, {
      materials: 1,
      shopDrawing: 1,
      TDS: 1,
      Samples: 1,
      itemDescription: 1,
    })

    const materialsMap = new Map()

    lineItems.forEach((item) => {
      if (!item.materials || item.materials.length === 0) return

      // Normalize status values
      const tdsStatus = item.TDS === 'yes' ? 'yes' : item.TDS === 'no' ? 'no' : 'Pending'

      const sampleStatus = item.Samples === 'yes' ? 'yes' : item.Samples === 'no' ? 'no' : 'Pending'

      const shopDrawingStatus = item.shopDrawing || 'Not Required'

      item.materials.forEach((material) => {
        const materialName = material.name.toLowerCase().trim()

        // 🔑 KEY = TDS + SAMPLE + SHOP + MATERIAL
        const key = `${materialName}_${tdsStatus}_${sampleStatus}_${shopDrawingStatus}`

        if (materialsMap.has(key)) {
          const existing = materialsMap.get(key)
          existing.quantity += material.quantity

          existing.usedInItems.push({
            itemDescription: item.itemDescription,
            quantity: material.quantity,
          })
        } else {
          materialsMap.set(key, {
            materialName: material.name,
            quantity: material.quantity,
            unit: material.unit || '',
            tdsCertificate: tdsStatus,
            samples: sampleStatus,
            shopDrawing: shopDrawingStatus,
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

// Get distinct site names
export const getSites = async (req, res) => {
  try {
    const sites = await ProjectLineItem.distinct('siteName')
    res.json(sites)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
