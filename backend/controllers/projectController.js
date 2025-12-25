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
    today.setHours(0, 0, 0, 0) // Set to start of day for accurate comparison

    // Find all items that are delayed (endDate < today)
    const delayedItems = await ProjectLineItem.find({
      ...filter,
      endDate: { $exists: true, $ne: null, $lt: today },
    }).sort({ endDate: 1 }) // Sort by end date, oldest first

    // Categorize delayed items
    const materialNotDelivered = delayedItems.filter(
      (item) => item.materialStatus === 'Not Delivered',
    )

    const materialDeliveredButIncomplete = delayedItems.filter(
      (item) =>
        item.materialStatus === 'Intialized/Delivered' && item.workCompletionPercentage < 100,
    )

    // Calculate summary statistics
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

    const { startDate, endDate, quantity, workStatusInUnits, materialStatus, ...otherUpdates } =
      req.body

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
   WORK / MATERIAL HISTORY
=========================== */

    const historyFields = ['quantity', 'workStatusInUnits', 'materialStatus']

    historyFields.forEach((field) => {
      if (req.body[field] !== undefined && req.body[field] !== lineItem[field]) {
        // Save history BEFORE updating
        lineItem.history.push({
          field,
          oldValue: lineItem[field],
          newValue: req.body[field],
          changedAt: new Date(),
        })

        // Apply update
        lineItem[field] = req.body[field]
      }
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

// Get distinct site names
export const getSites = async (req, res) => {
  try {
    const sites = await ProjectLineItem.distinct('siteName')
    res.json(sites)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
