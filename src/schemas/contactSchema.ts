import mongoose, { Schema, Document } from 'mongoose';

export interface IContact extends Document {
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'pending' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'general' | 'technical' | 'feature-request' | 'bug-report' | 'billing' | 'other';
  assignedTo?: string;
  response?: string;
  respondedAt?: Date;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
  updatedAt: Date;
}

const contactSchema = new Schema<IContact>({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email address']
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true,
    maxlength: [200, 'Subject cannot exceed 200 characters']
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true,
    maxlength: [2000, 'Message cannot exceed 2000 characters']
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'resolved', 'closed'],
    default: 'pending',
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
    required: true
  },
  category: {
    type: String,
    enum: ['general', 'technical', 'feature-request', 'bug-report', 'billing', 'other'],
    default: 'general',
    required: true
  },
  assignedTo: {
    type: String,
    trim: true
  },
  response: {
    type: String,
    trim: true,
    maxlength: [2000, 'Response cannot exceed 2000 characters']
  },
  respondedAt: {
    type: Date
  },
  ipAddress: {
    type: String,
    trim: true
  },
  userAgent: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  collection: 'contacts'
});

// Indexes for better query performance
contactSchema.index({ status: 1, createdAt: -1 });
contactSchema.index({ priority: 1, createdAt: -1 });
contactSchema.index({ category: 1, createdAt: -1 });
contactSchema.index({ email: 1 });
contactSchema.index({ assignedTo: 1 });

// Virtual for formatted date
contactSchema.virtual('formattedCreatedAt').get(function() {
  return this.createdAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
});

// Virtual for time since creation
contactSchema.virtual('timeSinceCreation').get(function() {
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - this.createdAt.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return 'Just now';
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  
  const diffInWeeks = Math.floor(diffInDays / 7);
  return `${diffInWeeks} week${diffInWeeks > 1 ? 's' : ''} ago`;
});

// Ensure virtuals are included when converting to JSON
contactSchema.set('toJSON', { virtuals: true });
contactSchema.set('toObject', { virtuals: true });

// Pre-save middleware to auto-assign priority based on keywords
contactSchema.pre('save', function(next) {
  const urgentKeywords = ['urgent', 'critical', 'broken', 'error', 'not working', 'down'];
  const highKeywords = ['important', 'issue', 'problem', 'help', 'support'];
  
  const messageLower = this.message.toLowerCase();
  const subjectLower = this.subject.toLowerCase();
  
  if (urgentKeywords.some(keyword => messageLower.includes(keyword) || subjectLower.includes(keyword))) {
    this.priority = 'urgent';
  } else if (highKeywords.some(keyword => messageLower.includes(keyword) || subjectLower.includes(keyword))) {
    this.priority = 'high';
  }
  
  next();
});

// Static method to get contact statistics
contactSchema.statics.getStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
        inProgress: { $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] } },
        resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } },
        closed: { $sum: { $cond: [{ $eq: ['$status', 'closed'] }, 1, 0] } },
        urgent: { $sum: { $cond: [{ $eq: ['$priority', 'urgent'] }, 1, 0] } },
        high: { $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] } }
      }
    }
  ]);
  
  return stats[0] || {
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
    closed: 0,
    urgent: 0,
    high: 0
  };
};

// Static method to get contacts by status
contactSchema.statics.getByStatus = function(status: string, limit = 10, skip = 0) {
  return this.find({ status })
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip)
    .lean();
};

// Static method to get recent contacts
contactSchema.statics.getRecent = function(limit = 10) {
  return this.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
};

export const ContactModel = mongoose.models.Contact || mongoose.model<IContact>('Contact', contactSchema); 