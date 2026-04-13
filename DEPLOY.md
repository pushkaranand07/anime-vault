# 🚀 Deploy Your Anime Tracker

## Quick Deploy Options

### Option 1: Vercel (Recommended)

1. **Create GitHub Account** (if you don't have one)
   - Visit [github.com](https://github.com)
   - Sign up and create a free account

2. **Upload to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Anime Tracker"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/anime-tracker.git
   git push -u origin main
   ```

3. **Deploy to Vercel**
   - Visit [vercel.com](https://vercel.com)
   - Click "Sign Up" → "Continue with GitHub"
   - Authorize Vercel
   - Click "New Project"
   - Select your `anime-tracker` repository
   - Click "Deploy"
   - Your app is live! 🎉

### Option 2: Netlify

1. **Connect GitHub**
   - Visit [netlify.com](https://netlify.com)
   - Click "Sign up" → "Sign up with GitHub"
   - Authorize Netlify

2. **Import and Deploy**
   - Click "New site from Git"
   - Select your GitHub repository
   - Build command: `npm run build`
   - Publish directory: `.next`
   - Click "Deploy"

### Option 3: Self-Host with Node.js

1. **Prepare Server**
   - SSH into your server
   - Install Node.js 16+
   - Install PM2: `npm i -g pm2`

2. **Deploy App**
   ```bash
   git clone https://github.com/YOUR_USERNAME/anime-tracker.git
   cd anime-tracker
   npm install
   npm run build
   pm2 start "npm start" --name anime-tracker
   pm2 save
   ```

3. **Setup Domain**
   - Point your domain DNS to server IP
   - Use Nginx as reverse proxy (port 3000 → 80/443)

### Option 4: Docker Container

1. **Create Dockerfile**
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci
   COPY . .
   RUN npm run build
   EXPOSE 3000
   CMD ["npm", "start"]
   ```

2. **Build and Run**
   ```bash
   docker build -t anime-tracker .
   docker run -p 3000:3000 anime-tracker
   ```

## Domain Setup

### Using Vercel Custom Domain
1. In Vercel project settings
2. Go to "Domains"
3. Enter your custom domain
4. Follow DNS instructions

### Using Cloudflare
1. Add your domain to Cloudflare
2. Update nameservers at registrar
3. Create CNAME record pointing to your host

## Environment Variables

Create `.env.local` file (optional):

```env
# These are examples - generally not needed for anime tracker
NEXT_PUBLIC_API_URL=https://api.example.com
```

## Performance Optimization

### Image Optimization
- Images are automatically optimized by Next.js
- WebP conversion happens automatically
- Set `imageURL` from CDN sources for best performance

### Caching
- LocalStorage caching: Done automatically
- Browser caching: Set by Next.js
- CDN caching: Set by Vercel/hosting provider

## Monitoring (Optional)

### Vercel Analytics
1. In Vercel dashboard
2. Go to "Analytics"
3. View performance metrics

### Sentry (Error Tracking)
```bash
npm install @sentry/nextjs
```

Add to `next.config.js`:
```javascript
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig = { /* your config */ };

export default withSentryConfig(nextConfig, {
  org: "your-org",
  project: "your-project",
});
```

## Backup Strategy

1. **Export Regularly**
   - Download XLSX file weekly
   - Save to cloud storage (Google Drive, Dropbox)

2. **GitHub Backup**
   - All code is backed up on GitHub
   - Uses Git version control

3. **Database Backup** (if using cloud sync)
   - Your hosting provider handles backups
   - Check provider's backup policy

## Troubleshooting Deployment

### Build Fails
```bash
npm ci
npm run build
```

Check for:
- Node version compatibility
- Missing dependencies
- TypeScript errors

### White Screen
- Check browser console (F12)
- Look at server logs
- Try clearing cache (Ctrl+Shift+R)

### Data Not Showing
- LocalStorage might be cleared
- Import your backup XLSX file
- Re-seed with sample data

## CI/CD with GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm run lint
```

## Bandwidth & Cost

### Vercel
- Plans: Free → Pro
- Free tier includes 100GB bandwidth/month
- Sufficient for personal anime tracker

### Netlify
- Plans: Free → Pro
- Free tier includes 100GB bandwidth
- Automatic deployments from GitHub

### Self-Hosted
- Costs: Server rental + domain
- DigitalOcean: $4-6/month
- Linode: Similar pricing

## Performance Tips

1. **Lazy Load Images**
   - Already implemented in AnimeCard

2. **Code Splitting**
   - Done automatically by Next.js

3. **Minification**
   - Done by build process

4. **Caching**
   - LocalStorage for data
   - Browser cache for assets

## Security Checklist

- ✅ No sensitive data in .env
- ✅ Input validation (already implemented)
- ✅ HTTPS enforced
- ✅ No server-side vulnerabilities (client-side only)
- ✅ Safe Excel import handling

## Maintenance

### Weekly
- Check Vercel analytics
- Monitor error logs

### Monthly
- Review deployed version
- Check dependency updates
- Export data backup

### Quarterly
- Update dependencies: `npm update`
- Test all features
- Review performance metrics

## Support URLs

- **Status Page**: Check Vercel/Netlify status
- **Documentation**: See README.md
- **GitHub Issues**: Report bugs

---

**Your anime tracker is now live!** 🎉

Share your deployment URL with friends to show off your awesome watchlist!
