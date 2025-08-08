const mongoose = require('mongoose');
require('dotenv').config();

// Import the schema
const contactSettingsSchema = require('../src/schemas/contactSettingsSchema');

// Create the model
const ContactSettingsModel = mongoose.models.ContactSettings || 
  mongoose.model('ContactSettings', contactSettingsSchema);

async function seedContactSettings() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if settings already exist
    const existingSettings = await ContactSettingsModel.findOne();
    
    if (existingSettings) {
      console.log('⚠️  Contact settings already exist, skipping seed');
      return;
    }

    // Default contact settings
    const defaultSettings = {
      contactMethods: [
        {
          title: "Email Support",
          description: "Get detailed responses via email",
          value: "contact@aitoolbox.com",
          href: "mailto:contact@aitoolbox.com",
          icon: "Mail",
          color: "bg-gradient-to-br from-blue-500 to-blue-600",
          isActive: true,
          order: 0
        },
        {
          title: "Phone Support",
          description: "Speak directly with our experts",
          value: "+1 (555) 123-4567",
          href: "tel:+15551234567",
          icon: "Phone",
          color: "bg-gradient-to-br from-green-500 to-green-600",
          isActive: true,
          order: 1
        },
        {
          title: "WhatsApp",
          description: "Chat with us on WhatsApp",
          value: "+1 (555) 123-4567",
          href: "https://wa.me/15551234567",
          icon: "MessageCircle",
          color: "bg-gradient-to-br from-green-500 to-green-600",
          isActive: true,
          order: 2
        },
        {
          title: "Office Location",
          description: "Visit us in person",
          value: "San Francisco, CA",
          href: "https://maps.google.com/?q=San+Francisco,+CA",
          icon: "MapPin",
          color: "bg-gradient-to-br from-orange-500 to-orange-600",
          isActive: true,
          order: 3
        },
        {
          title: "GitHub",
          description: "Check out our projects",
          value: "github.com/aitoolbox",
          href: "https://github.com/aitoolbox",
          icon: "Github",
          color: "bg-gradient-to-br from-gray-500 to-gray-600",
          isActive: true,
          order: 4
        },
        {
          title: "LinkedIn",
          description: "Connect with us on LinkedIn",
          value: "linkedin.com/company/aitoolbox",
          href: "https://linkedin.com/company/aitoolbox",
          icon: "Linkedin",
          color: "bg-gradient-to-br from-blue-500 to-blue-600",
          isActive: true,
          order: 5
        },
        {
          title: "X (Twitter)",
          description: "Follow us on X",
          value: "@aitoolbox",
          href: "https://twitter.com/aitoolbox",
          icon: "Twitter",
          color: "bg-gradient-to-br from-blue-400 to-blue-500",
          isActive: true,
          order: 6
        },
        {
          title: "Website",
          description: "Visit our main website",
          value: "aitoolbox.com",
          href: "https://aitoolbox.com",
          icon: "Globe",
          color: "bg-gradient-to-br from-purple-500 to-purple-600",
          isActive: true,
          order: 7
        }
      ],
      pageTitle: "Contact Us",
      pageDescription: "Have questions about our AI tools? Need technical support? We're here to help you succeed.",
      features: [
        {
          icon: "Clock",
          title: "24/7 Support",
          description: "Round-the-clock assistance whenever you need us",
          isActive: true,
          order: 0
        },
        {
          icon: "Shield",
          title: "Secure & Private",
          description: "Your data is protected with enterprise-grade security",
          isActive: true,
          order: 1
        },
        {
          icon: "Zap",
          title: "Fast Response",
          description: "Get answers within 2 hours during business hours",
          isActive: true,
          order: 2
        },
        {
          icon: "Headphones",
          title: "Expert Team",
          description: "AI specialists ready to help with any questions",
          isActive: true,
          order: 3
        }
      ],
      additionalInfo: {
        title: "Need Immediate Help?",
        description: "For urgent technical issues or account problems, our support team is available 24/7.",
        responseTime: "< 2 hours",
        isActive: true
      },
      updatedBy: null // Will be set when first admin updates
    };

    // Create the settings
    const settings = await ContactSettingsModel.create(defaultSettings);
    
    console.log('✅ Contact settings seeded successfully');
    console.log('📋 Created settings with ID:', settings._id);
    
  } catch (error) {
    console.error('❌ Error seeding contact settings:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the seed function
seedContactSettings(); 