import { ObjectId } from 'mongodb';

export interface QuoteRequest {
  birthDate: string;
  topic: string;
  mood: string;
  author: string;
  count: number;
  language: string;
}

export interface Quote {
  quote: string;
  author: string;
}

export interface QuoteResponse {
  quotes: Quote[];
  famousPeople: string[];
  message?: string;
}

// Famous Bengali authors for authentic quotes
export const famousBengaliAuthors = [
  "Rabindranath Tagore", "Kazi Nazrul Islam", "Michael Madhusudan Dutt", "Bankim Chandra Chattopadhyay",
  "Dwijendralal Ray", "Sarat Chandra Chattopadhyay", "Jibanananda Das", "Suman Chattopadhyay",
  "Rammohan Roy", "Iswarchandra Vidyasagar", "Krittibas Ojha", "Hemchandra Bandopadhyay",
  "Bani Kanta Kundu", "Rashsundari Debi", "Jagadish Gupta", "Madhusree Mukherjee", "Shibram Chakraborty"
];

// Fallback quotes for when AI is not available
export const fallbackQuotes: (Quote & { topic: string; mood: string })[] = [
  { quote: "Let your life lightly dance on the edges of time like dew on the tip of a leaf.", author: "Rabindranath Tagore", topic: "life", mood: "thoughtful" },
  { quote: "Love is an endless mystery, for it has nothing else to explain it.", author: "Rabindranath Tagore", topic: "love", mood: "romantic" },
  { quote: "You can't cross the sea merely by standing and staring at the water.", author: "Rabindranath Tagore", topic: "success", mood: "motivational" },
  { quote: "The only way to do great work is to love what you do.", author: "Steve Jobs", topic: "success", mood: "motivational" },
  { quote: "Where there is love there is life.", author: "Mahatma Gandhi", topic: "love", mood: "motivational" },
  { quote: "The best way to find yourself is to lose yourself in the service of others.", author: "Mahatma Gandhi", topic: "life", mood: "thoughtful" },
  { quote: "If you want to live a happy life, tie it to a goal, not to people or things.", author: "Albert Einstein", topic: "happiness", mood: "motivational" },
  { quote: "A friend is someone who gives you total freedom to be yourself.", author: "Jim Morrison", topic: "friendship", mood: "thoughtful" },
  { quote: "Let us celebrate the occasion with wine and sweet words.", author: "Plautus", topic: "birthday", mood: "celebratory" },
  { quote: "May your birthday be the start of a year filled with good luck, good health, and much happiness.", author: "Unknown", topic: "birthday", mood: "uplifting" },
];

export const fallbackFamous: Record<string, string[]> = {
  'March 14': ['Albert Einstein'],
  'January 15': ['Martin Luther King Jr.'],
  'February 12': ['Abraham Lincoln', 'Charles Darwin'],
  'July 18': ['Nelson Mandela'],
  'October 2': ['Mahatma Gandhi'],
  'December 25': ['Isaac Newton', 'Humphrey Bogart'],
};

// Basic Database Operations
import { getDatabase } from '@/lib/mongodb';

export class QuoteSchema {
  private static collectionName = 'quote_requests';

  static async saveRequest(userId: string, request: QuoteRequest, response: QuoteResponse): Promise<boolean> {
    const db = await getDatabase();
    
    const result = await db.collection(this.collectionName).insertOne({
      userId,
      request,
      response,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return result.insertedId !== undefined;
  }

  static async getRequestHistory(userId: string, limit: number = 10): Promise<any[]> {
    const db = await getDatabase();
    
    return db.collection(this.collectionName)
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();
  }
} 