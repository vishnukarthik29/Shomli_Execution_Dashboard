import mongoose from 'mongoose'

const projectLineItemSchema = new mongoose.Schema(
  {
    siteName: {
      type: String,
      required: true,
      index: true,
    },
    sno: {
      type: String,
      required: true,
    },
    projectName: {
      type: String,
      //   required: true,
    },
    category: {
      type: String,
      required: true,
    },
    itemDescription: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    units: {
      type: String,
      required: true,
    },
    rate: {
      type: Number,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    materialStatus: {
      type: String,
      enum: ['Pending', 'In Progress', 'Completed', 'Intialized/Delivered', 'Not Delivered'],
      default: 'Pending',
    },
    workStatusInUnits: {
      type: Number,
      default: 0,
    },
    workCompletionPercentage: {
      type: Number,
      min: 0,
      default: 0,
    },
    workCompletionAmount: {
      type: Number,
      default: 0,
    },
    startDate: { type: Date },
    endDate: { type: Date },
    previousDates: {
      startDates: [{ type: Date }],
      endDates: [{ type: Date }],
    },
    history: [
      {
        field: {
          type: String,
          enum: ['quantity', 'workStatusInUnits', 'materialStatus'],
          required: true,
        },
        oldValue: mongoose.Schema.Types.Mixed,
        newValue: mongoose.Schema.Types.Mixed,
        changedAt: { type: Date, default: Date.now },
      },
    ],

    startDateCounter: {
      type: Number,
      default: 0,
    },
    endDateCounter: {
      type: Number,
      default: 0,
    },
    dateFlag: {
      type: Boolean,
      default: false,
    },

    materialPhoto: [
      {
        url: { type: String, required: true },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    workCompletionPhoto: [
      {
        url: { type: String, required: true },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],

    finishedPhoto: [
      {
        url: { type: String, required: true },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  },
)

/* ===========================
   Hooks
=========================== */

// Pre-save hook (create / save)
projectLineItemSchema.pre('save', function (next) {
  this.workCompletionPercentage = (
    this.quantity > 0 ? (this.workStatusInUnits / this.quantity) * 100 : 0
  ).toFixed(2)
  this.workCompletionAmount = (this.amount * this.workCompletionPercentage) / 100
})
// Pre-save hook (create / save)
projectLineItemSchema.pre('save', function (next) {
  this.amount = this.quantity * this.rate
  this.workCompletionPercentage = (
    this.quantity > 0 ? (this.workStatusInUnits / this.quantity) * 100 : 0
  ).toFixed(2)
  this.workCompletionAmount = (this.amount * this.workCompletionPercentage) / 100
})

/* ===========================
   Instance Methods
=========================== */

projectLineItemSchema.methods.calculateCompletionAmount = function () {
  this.workCompletionAmount = (this.amount * this.workCompletionPercentage) / 100
  return this.workCompletionAmount
}

/* ===========================
   Static Methods
=========================== */

projectLineItemSchema.statics.getSummary = async function (filter = {}) {
  const items = await this.find(filter)

  const totalProjectValue = items.reduce((sum, item) => sum + item.amount, 0)

  const totalWorkCompletionAmount = items.reduce((sum, item) => sum + item.workCompletionAmount, 0)

  const totalWorkCompletionPercentage =
    totalProjectValue > 0 ? (totalWorkCompletionAmount / totalProjectValue) * 100 : 0

  return {
    totalProjectValue: Number(totalProjectValue.toFixed(2)),
    totalWorkCompletionPercentage: Number(totalWorkCompletionPercentage.toFixed(2)),
    totalWorkCompletionAmount: Number(totalWorkCompletionAmount.toFixed(2)),
    itemCount: items.length,
  }
}

const ProjectLineItem = mongoose.model('ProjectLineItem', projectLineItemSchema)

export default ProjectLineItem
