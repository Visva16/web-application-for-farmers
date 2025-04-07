/**
 * Service to provide troubleshooting guides and information
 */
class TroubleshootingService {
  /**
   * Get client-side troubleshooting guide
   * @returns {Object} Troubleshooting guide data
   */
  async getClientSideTroubleshootingGuide() {
    // This could eventually be stored in a database, but for now we'll return it directly
    return {
      title: "Client-Side Troubleshooting Guide",
      issues: [
        {
          id: "node-modules",
          title: "App Won't Start - Node Modules Issues",
          description: "If you're experiencing issues starting the application, it might be due to corrupted or outdated node modules.",
          steps: [
            {
              title: "Delete node_modules folder and package-lock.json",
              command: "rm -rf node_modules package-lock.json",
              description: "This removes all installed dependencies and the lock file to ensure a clean start."
            },
            {
              title: "Clear npm cache",
              command: "npm cache clean --force",
              description: "This clears the npm cache which might contain corrupted packages."
            },
            {
              title: "Reinstall dependencies",
              command: "npm install",
              description: "This will reinstall all dependencies as specified in package.json."
            },
            {
              title: "Start the application",
              command: "npm run start",
              description: "Attempt to start the application after reinstalling dependencies."
            }
          ]
        },
        {
          id: "vite-issues",
          title: "Vite Build/Dev Server Issues",
          description: "If you're experiencing issues with the Vite dev server or build process.",
          steps: [
            {
              title: "Clear Vite cache",
              command: "rm -rf node_modules/.vite",
              description: "This removes Vite's cache which might cause issues with the build."
            },
            {
              title: "Update Vite and related packages",
              command: "npm install vite@latest @vitejs/plugin-react@latest",
              description: "This updates Vite and its React plugin to the latest version."
            }
          ]
        }
      ],
      additionalResources: [
        {
          title: "Node.js Documentation",
          url: "https://nodejs.org/en/docs/"
        },
        {
          title: "Vite Documentation",
          url: "https://vitejs.dev/guide/"
        },
        {
          title: "npm Troubleshooting",
          url: "https://docs.npmjs.com/cli/v8/using-npm/troubleshooting"
        }
      ]
    };
  }
}

module.exports = new TroubleshootingService();