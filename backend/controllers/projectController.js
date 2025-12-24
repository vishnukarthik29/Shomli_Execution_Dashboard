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
// export const getAllLineItems = async (req, res) => {
//   try {
//     const { siteName } = req.query
//     const filter = siteName ? { siteName } : {}

//     const items = await ProjectLineItem.find(filter).sort({ createdAt: 1 })
//     res.json(items)
//   } catch (error) {
//     res.status(500).json({ error: error.message })
//   }
// }
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

// Get single line item
// export const getLineItemById = async (req, res) => {
//   try {
//     const item = await ProjectLineItem.findById(req.params.id)

//     if (!item) {
//       return res.status(404).json({ error: 'Line item not found' })
//     }

//     res.json(item)
//   } catch (error) {
//     res.status(500).json({ error: error.message })
//   }
// }
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

    // Update fields dynamically
    Object.keys(req.body).forEach((key) => {
      lineItem[key] = req.body[key]
    })

    // Recalculate completion amount
    if (typeof lineItem.calculateCompletionAmount === 'function') {
      lineItem.calculateCompletionAmount()
    }

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
