# Clear Browser Cookies

The JWE error is caused by a corrupted session cookie. Follow these steps:

## Option 1: Use Incognito/Private Mode (Easiest)
1. Open a new incognito/private browser window
2. Visit `http://localhost:3000`
3. The app should load without errors

## Option 2: Clear Cookies Manually
### Chrome/Edge
1. Open DevTools (F12)
2. Go to **Application** tab
3. Under **Storage** → **Cookies** → `http://localhost:3000`
4. Right-click → **Clear**
5. Refresh the page

### Firefox
1. Open DevTools (F12)
2. Go to **Storage** tab
3. Under **Cookies** → `http://localhost:3000`
4. Right-click → **Delete All**
5. Refresh the page

### Safari
1. Safari → Preferences → Privacy
2. Click **Manage Website Data**
3. Search for `localhost`
4. Click **Remove** → **Done**
5. Refresh the page

## After Clearing Cookies
1. Visit `http://localhost:3000`
2. The JWE errors should stop
3. Click "Sign in" to create a fresh Auth0 session
4. After login, everything should work normally

## Why This Happens
- The old Clerk session cookie is encrypted with a different secret
- Auth0 can't decrypt it, causing JWE errors
- Clearing cookies removes the bad session
- Fresh login creates a valid Auth0 session
