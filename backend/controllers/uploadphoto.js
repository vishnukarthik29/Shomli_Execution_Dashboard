export const uploadPhotos = async (req, res) => {
  try {
    const { lineItemId, photoType } = req.body

    if (!lineItemId || !photoType) {
      return res.status(400).json({ error: 'Line item ID and photo type are required' })
    }

    if (!['materialPhoto', 'workCompletionPhoto', 'finishedPhoto'].includes(photoType)) {
      return res.status(400).json({ error: 'Invalid photo type' })
    }

    const lineItem = await ProjectLineItem.findById(lineItemId)
    if (!lineItem) {
      return res.status(404).json({ error: 'Line item not found' })
    }

    const photoUrls = req.files.map((file) => `/uploads/${file.filename}`)

    lineItem[photoType].push(...photoUrls)
    await lineItem.save()

    res.json({
      message: 'Photos uploaded successfully',
      photos: photoUrls,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
}
