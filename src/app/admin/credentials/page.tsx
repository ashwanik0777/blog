export default function AdminCredentialsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Admin Credentials
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Use these credentials to access the admin dashboard
            </p>
          </div>

          <div className="space-y-6">
            {/* Admin Account 1 */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                Admin Account 1
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Email:</span>
                  <span className="ml-2 text-gray-900 dark:text-white">
                    {process.env.ADMIN_EMAIL || 'admin@example.com'}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Password:</span>
                  <span className="ml-2 text-gray-900 dark:text-white">
                    {process.env.ADMIN_PASSWORD || 'admin123'}
                  </span>
                </div>
              </div>
            </div>

            {/* Admin Account 2 */}
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
              <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                Admin Account 2
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Email:</span>
                  <span className="ml-2 text-gray-900 dark:text-white">
                    {process.env.SUPER_ADMIN_EMAIL || 'superadmin@example.com'}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Password:</span>
                  <span className="ml-2 text-gray-900 dark:text-white">
                    {process.env.SUPER_ADMIN_PASSWORD || 'superadmin123'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <a 
              href="/admin" 
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Go to Admin Login
            </a>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Keep these credentials secure and change passwords in production
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 