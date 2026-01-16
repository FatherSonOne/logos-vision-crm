<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1T2L3Of7nwhY-YIzDn7zbga3WLBR1Am0b

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Deploy to Production

### GitHub Actions Deployment

This project includes automated deployment via GitHub Actions. When you push to the main/master branch, it automatically builds and deploys to Vercel.

**Getting deployment errors?**
- **Error: `Input required and not supplied: vercel-token`** → See [GitHub Actions Troubleshooting Guide](./GITHUB_ACTIONS_TROUBLESHOOTING.md)
- For general setup → See [GitHub Deployment Setup Guide](./GITHUB_DEPLOYMENT_SETUP.md)

### Manual Deployment

See [Deployment Quick Reference](./DEPLOYMENT_QUICK_REF.md) for manual deployment commands and setup instructions.
