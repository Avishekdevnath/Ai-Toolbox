import mongoose from 'mongoose';

const contactMethodSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  value: {
    type: String,
    required: true,
    trim: true
  },
  href: {
    type: String,
    required: true,
    trim: true
  },
  icon: {
    type: String,
    required: true,
    trim: true
  },
  color: {
    type: String,
    required: true,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  }
});

const contactSettingsSchema = new mongoose.Schema({
  contactMethods: [contactMethodSchema],
  pageTitle: {
    type: String,
    default: 'Contact Us',
    trim: true
  },
  pageDescription: {
    type: String,
    default: 'Have questions about our AI tools? Need technical support? We\'re here to help you succeed.',
    trim: true
  },
  features: [{
    icon: {
      type: String,
      required: true,
      trim: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    order: {
      type: Number,
      default: 0
    }
  }],
  additionalInfo: {
    title: {
      type: String,
      default: 'Need Immediate Help?',
      trim: true
    },
    description: {
      type: String,
      default: 'For urgent technical issues or account problems, our support team is available 24/7.',
      trim: true
    },
    responseTime: {
      type: String,
      default: '< 2 hours',
      trim: true
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AdminUser',
    required: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create a compound index to ensure only one settings document exists
contactSettingsSchema.index({}, { unique: true });

export default contactSettingsSchema; 