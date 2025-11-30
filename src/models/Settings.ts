import mongoose, { Schema, models, model, Document } from 'mongoose';

export interface ISettings extends Document {
  chatbotEnabled: boolean;
  socialMedia: {
    twitter?: string;
    facebook?: string;
    linkedin?: string;
    github?: string;
    instagram?: string;
    youtube?: string;
  };
  designBy: {
    name: string;
    portfolioUrl: string;
  };
  developedBy: {
    name: string;
    portfolioUrl: string;
  };
}

const SettingsSchema = new Schema<ISettings>({
  chatbotEnabled: { type: Boolean, default: true },
  socialMedia: {
    twitter: { type: String, default: '' },
    facebook: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    github: { type: String, default: '' },
    instagram: { type: String, default: '' },
    youtube: { type: String, default: '' },
  },
  designBy: {
    name: { type: String, default: '' },
    portfolioUrl: { type: String, default: '' },
  },
  developedBy: {
    name: { type: String, default: '' },
    portfolioUrl: { type: String, default: '' },
  },
}, { timestamps: true });

export default models.Settings || model<ISettings>('Settings', SettingsSchema); 