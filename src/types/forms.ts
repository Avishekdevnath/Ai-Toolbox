export type DisplayMode = 'all' | 'paginated' | 'one-at-a-time';

export type FormType = 'general' | 'survey' | 'quiz' | 'attendance';

export interface IdentitySchema {
  requireName: boolean;
  requireEmail: boolean;
  requireStudentId: boolean;
}

export interface FormSettings {
  isPublic: boolean;
  allowMultipleSubmissions: boolean;
  allowAnonymous: boolean;
  identitySchema: IdentitySchema;
  startAt: string | null;
  endAt: string | null;
  timer: { enabled: boolean; minutes: number };
  displayMode: DisplayMode;
}

export interface FormField {
  id: string;
  label: string;
  type: 'short_text' | 'long_text' | 'number' | 'email' | 'date' | 'time' |
        'dropdown' | 'radio' | 'checkbox' | 'section';
  required: boolean;
  options: string[];
  placeholder: string;
  helpText: string;
  wordLimit?: number;
  quiz: {
    points: number;
    correctOptions: string[];
    explanation: string;
  };
}

export interface FormSchema {
  _id: string;
  title: string;
  description: string;
  type: FormType;
  status: 'draft' | 'published' | 'archived';
  slug: string;
  fields: FormField[];
  settings: FormSettings;
  responseCount?: number;
  createdAt: string;
  updatedAt?: string;
}
