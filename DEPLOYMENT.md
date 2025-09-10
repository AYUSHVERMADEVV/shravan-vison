# Deployment Guide for Shravan Vision

## Prerequisites

- A GitHub account
- A Vercel account (free tier works fine)
- A Supabase account with a project set up

## Environment Variables

Before deploying, make sure you have the following environment variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://ohamqpoblontdzdcyije.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9oYW1xcG9ibG9udGR6ZGN5aWplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwOTMzMzgsImV4cCI6MjA3MjY2OTMzOH0.2MEIn0iplhASnya3ADUusAejBwHwRKV5VRwhbSHuBl8
```

## Deployment Steps

### 1. Prepare Your Project

1. Make sure your project has a `.env.example` file (which we've created)
2. Ensure your `next.config.js` is properly configured (which we've updated)
3. Verify your `vercel.json` file is present (which we've created)

### 2. Push to GitHub

```bash
# Initialize Git repository (if not already done)
git init

# Add all files to Git
git add .

# Commit changes
git commit -m "Ready for deployment"

# Add GitHub repository as remote
git remote add origin https://github.com/yourusername/your-repo-name.git

# Push to GitHub
git push -u origin main
```

### 3. Deploy to Vercel

1. Go to [Vercel](https://vercel.com) and sign in
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Configure the project:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: npm run build
   - Output Directory: out
5. Add Environment Variables:
   - Add the Supabase environment variables from your `.env.example` file
6. Click "Deploy"

### 4. Configure Supabase Authentication

1. Go to your Supabase project dashboard
2. Navigate to Authentication → URL Configuration
3. Add your Vercel deployment URL to the Site URL and Redirect URLs

### 5. Test Your Deployment

1. Visit your deployed site
2. Test authentication
3. Test the camera functionality
4. Verify all features are working correctly

## Troubleshooting

### Common Issues

1. **Authentication Redirect Issues**
   - Make sure your Supabase Site URL and Redirect URLs are correctly set

2. **Camera Not Working**
   - Ensure your site is served over HTTPS
   - Check browser permissions

3. **Environment Variables Not Working**
   - Verify they are correctly set in Vercel
   - Redeploy after making changes

4. **Static Export Issues**
   - If using `output: 'export'` in next.config.js, ensure all APIs are properly handled
   - Consider using server-side rendering if needed

### Need More Help?

If you encounter issues not covered here, check:
- Vercel deployment logs
- Browser console for errors
- Supabase logs for authentication issues