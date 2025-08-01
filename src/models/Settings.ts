import mongoose, { Schema, models, model, Document } from 'mongoose';

export interface ISettings extends Document {
  chatbotEnabled: boolean;
}

const SettingsSchema = new Schema<ISettings>({
  chatbotEnabled: { type: Boolean, default: true },
});

export default models.Settings || model<ISettings>('Settings', SettingsSchema); 