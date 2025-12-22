"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Twitter, Facebook, Linkedin, Github, Instagram, Youtube, Palette, Code } from "lucide-react";

interface WebsiteSettings {
  enableChatbot: boolean;
  enableAIGeneration: boolean;
  enableComments: boolean;
  enableNewsletter: boolean;
  enableAnalytics: boolean;
  siteName: string;
  siteDescription: string;
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

export default function SettingsPage() {
  const router = useRouter();
  const [adminUser, setAdminUser] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [settings, setSettings] = useState<WebsiteSettings>({
    enableChatbot: true,
    enableAIGeneration: true,
    enableComments: true,
    enableNewsletter: true,
    enableAnalytics: true,
    siteName: 'TechUpdatesZone Blog',
    siteDescription: 'TechUpdatesZone Blog — AI-powered tech news, tutorials, and insights with Google Gemini integration.',
    socialMedia: {
      twitter: '',
      facebook: '',
      linkedin: '',
      github: '',
      instagram: '',
      youtube: '',
    },
    designBy: {
      name: '',
      portfolioUrl: '',
    },
    developedBy: {
      name: '',
      portfolioUrl: '',
    },
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Check if user is admin and fetch settings
  useEffect(() => {
    async function checkAuthAndFetchSettings() {
      try {
        const response = await fetch('/api/auth/admin-session');
        if (response.ok) {
          const data = await response.json();
          setAdminUser(data.user);
          
          // Fetch settings
          const settingsRes = await fetch('/api/admin/settings');
          if (settingsRes.ok) {
            const settingsData = await settingsRes.json();
            setSettings(prev => ({
              ...prev,
              ...settingsData,
              socialMedia: settingsData.socialMedia || prev.socialMedia,
              designBy: settingsData.designBy || prev.designBy,
              developedBy: settingsData.developedBy || prev.developedBy,
            }));
          }
        } else {
          router.push('/admin');
        }
      } catch (error) {
        router.push('/admin');
      } finally {
        setCheckingAuth(false);
        setFetching(false);
      }
    }
    checkAuthAndFetchSettings();
  }, [router]);

  async function handleSaveSettings() {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        alert('Settings saved successfully!');
      } else {
        alert('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error saving settings');
    } finally {
      setLoading(false);
    }
  }

  if (checkingAuth || fetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!adminUser) {
    return null;
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Website Settings
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Configure website features and settings
            </p>
          </div>
          <Link
            href="/admin/dashboard/settings/password"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Lock className="h-4 w-4" />
            Update Password
          </Link>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="space-y-6">
          {/* Feature Toggles */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Feature Controls
            </h3>
            <div className="space-y-4">
              {[
                { key: 'enableChatbot', label: 'AI Chatbot', description: 'Enable the AI chatbot on the website' },
                { key: 'enableAIGeneration', label: 'AI Content Generation', description: 'Allow AI-powered content generation' },
                { key: 'enableComments', label: 'Comments System', description: 'Enable user comments on blog posts' },
                { key: 'enableNewsletter', label: 'Newsletter', description: 'Enable newsletter subscription' },
                { key: 'enableAnalytics', label: 'Analytics', description: 'Enable website analytics tracking' }
              ].map((feature) => (
                <div key={feature.key} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">{feature.label}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{feature.description}</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings[feature.key as keyof WebsiteSettings] as boolean}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        [feature.key]: e.target.checked
                      }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Website Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Website Information
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Site Name
                </label>
                <input
                  type="text"
                  value={settings.siteName}
                  onChange={(e) => setSettings(prev => ({ ...prev, siteName: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Site Description
                </label>
                <textarea
                  value={settings.siteDescription}
                  onChange={(e) => setSettings(prev => ({ ...prev, siteDescription: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Social Media Links */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Twitter className="h-5 w-5 text-blue-500" />
              Social Media Links
            </h3>
            <div className="space-y-4">
              {[
                { key: 'twitter', label: 'Twitter/X', icon: Twitter, color: 'text-blue-400' },
                { key: 'facebook', label: 'Facebook', icon: Facebook, color: 'text-blue-600' },
                { key: 'linkedin', label: 'LinkedIn', icon: Linkedin, color: 'text-blue-700' },
                { key: 'github', label: 'GitHub', icon: Github, color: 'text-gray-800 dark:text-gray-200' },
                { key: 'instagram', label: 'Instagram', icon: Instagram, color: 'text-pink-500' },
                { key: 'youtube', label: 'YouTube', icon: Youtube, color: 'text-red-600' },
              ].map((social) => {
                const Icon = social.icon;
                return (
                  <div key={social.key} className="flex items-center gap-3">
                    <Icon className={`h-5 w-5 ${social.color}`} />
                    <input
                      type="url"
                      placeholder={`${social.label} URL`}
                      value={settings.socialMedia[social.key as keyof typeof settings.socialMedia] || ''}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        socialMedia: {
                          ...prev.socialMedia,
                          [social.key]: e.target.value
                        }
                      }))}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Design & Developed By */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Footer Credits
            </h3>
            <div className="space-y-4">
              <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Palette className="h-5 w-5 text-purple-500" />
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Design & Developed By
                  </label>
                </div>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Designer Name"
                    value={settings.designBy.name}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      designBy: { ...prev.designBy, name: e.target.value }
                    }))}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="url"
                    placeholder="Portfolio URL"
                    value={settings.designBy.portfolioUrl}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      designBy: { ...prev.designBy, portfolioUrl: e.target.value }
                    }))}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSaveSettings}
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
            >
              {loading ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 