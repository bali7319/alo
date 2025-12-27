# Deployment Instructions for Fixing /ilanlar Page

## Problem
- `/ilanlar` page showing demo listings
- `/api/listings` returning `405 Method Not Allowed`

## Solution
Deploy updated files and clear Next.js cache.

## Step 1: Transfer Files to Server

From your local Windows machine, run these commands in PowerShell:

```powershell
# Transfer API route file
scp src/app/api/listings/route.ts root@alo17.tr:/var/www/alo17/src/app/api/listings/route.ts

# Transfer ilanlar page
scp src/app/ilanlar/page.tsx root@alo17.tr:/var/www/alo17/src/app/ilanlar/page.tsx

# Transfer deployment script
scp deploy-fix-listings.sh root@alo17.tr:/var/www/alo17/deploy-fix-listings.sh
```

## Step 2: SSH into Server and Deploy

```bash
# SSH into server
ssh root@alo17.tr

# Navigate to project directory
cd /var/www/alo17

# Make script executable
chmod +x deploy-fix-listings.sh

# Run deployment script
./deploy-fix-listings.sh
```

## Step 3: Test the API

After deployment, test the API endpoint:

```bash
# Test API endpoint
curl -v http://localhost:3000/api/listings?page=1&limit=10

# Check PM2 logs
pm2 logs alo17 --lines 50
```

## Step 4: Clear Browser Cache

After deployment, clear your browser cache:
1. Open Developer Tools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"
4. Or use Ctrl+Shift+Delete to clear cache

## Manual Deployment (Alternative)

If the script doesn't work, run these commands manually on the server:

```bash
cd /var/www/alo17

# Backup files
cp src/app/api/listings/route.ts src/app/api/listings/route.ts.backup
cp src/app/ilanlar/page.tsx src/app/ilanlar/page.tsx.backup

# Clear Next.js cache
rm -rf .next

# Install dependencies (if needed)
npm install

# Build
npm run build

# Restart PM2
pm2 restart alo17

# Check logs
pm2 logs alo17 --lines 20
```

## Verification

After deployment, verify:
1. API endpoint returns 200 OK: `curl -v http://localhost:3000/api/listings?page=1&limit=10`
2. `/ilanlar` page shows only real listings from database
3. No demo listings appear
4. Browser console shows no errors

## Troubleshooting

If you still see `405 Method Not Allowed`:
1. Check that `src/app/api/listings/route.ts` has `export async function GET`
2. Verify the file was transferred correctly: `cat src/app/api/listings/route.ts | head -20`
3. Check PM2 logs for errors: `pm2 logs alo17 --err`
4. Restart PM2: `pm2 restart alo17`

If demo listings still appear:
1. Clear browser cache completely
2. Test in incognito/private mode
3. Check database: `sudo -u postgres psql -d alo17_db -c "SELECT COUNT(*) FROM \"Listing\" WHERE \"isActive\" = true AND \"approvalStatus\" = 'approved';"`
4. Check API response in browser DevTools Network tab

