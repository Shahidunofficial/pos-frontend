# 🎯 Google Merchant Sync - POS System

Automatically sync all your products from POS to Google Merchant Center!

---

## ✅ What's Added

### **New Page**: `/merchant-sync`

A complete sync interface in your POS system where you can:
- ✅ View all products from your inventory
- ✅ Enter Google Access Token once
- ✅ Sync all products with one click
- ✅ Sync individual products
- ✅ Track real-time progress
- ✅ See success/error status for each product
- ✅ Retry failed syncs

---

## 🚀 How to Use

### **Step 1: Access the Sync Page**

In your POS system, navigate to:
```
http://localhost:3003/merchant-sync
```

### **Step 2: Get Google Access Token**

1. Go to: https://developers.google.com/oauthplayground/
2. Find: **"Content API for Shopping"**
3. Check: `https://www.googleapis.com/auth/content`
4. Click: **"Authorize APIs"**
5. Sign in with your Google account
6. Click: **"Exchange authorization code for tokens"**
7. Copy the **"Access token"** (starts with `ya29.`)

### **Step 3: Enter Token**

Paste the access token in the input field on the sync page.

### **Step 4: Sync Products**

**Option A: Sync All**
- Click **"Sync All X Products"**
- Confirm the action
- Wait for completion (shows progress bar)

**Option B: Sync Individual**
- Click **"Sync"** button next to any product
- Only that product will sync

### **Step 5: Monitor & Verify**

- Watch real-time status updates
- Green = Success ✅
- Red = Error ❌ (click "Retry")
- Verify at https://merchants.google.com/

---

## 🎨 What It Looks Like

```
┌──────────────────────────────────────────────┐
│  Google Merchant Sync                        │
├──────────────────────────────────────────────┤
│  Access Token:                               │
│  [ya29.a0AfH6SMB____________]                │
│  Get from OAuth Playground →                 │
│                                              │
│  [Sync All 25 Products]                      │
├──────────────────────────────────────────────┤
│  Syncing... 10 / 25                          │
│  ████████░░░░░░░░ 40%                       │
├──────────────────────────────────────────────┤
│  Total: 25 | Synced: 8 | Failed: 2          │
├──────────────────────────────────────────────┤
│  Product              Brand    Price  Status │
│  ─────────────────────────────────────────── │
│  [📱] iPhone 14 Pro   Apple   450000  ✓      │
│  [📱] Samsung S23     Samsung 350000  🔄      │
│  [🔋] Power Bank      Generic   5000  ✗      │
└──────────────────────────────────────────────┘
```

---

## 📁 Files Added

1. **`src/API/merchant.ts`**
   - Merchant API integration
   - Product sync functions
   - Error handling

2. **`src/app/merchant-sync/page.tsx`**
   - Full sync UI
   - Product table
   - Progress tracking
   - Status management

---

## ⚡ Features

### **Automatic:**
✅ Fetches products from your POS database  
✅ Transforms to Google Merchant format  
✅ Syncs with progress tracking  
✅ Handles rate limiting (2 sec delay)  
✅ Shows detailed errors  
✅ Allows retry  

### **Smart:**
✅ Auto-formats product data  
✅ Converts prices to LKR  
✅ Generates product links  
✅ Sets availability status  
✅ Prevents rate limiting  

---

## 🔄 Sync Process

```
1. User opens /merchant-sync
   ↓
2. POS fetches all products
   ↓
3. User enters access token
   ↓
4. User clicks "Sync All"
   ↓
5. For each product:
   - Show "Syncing" status
   - Transform to Google format
   - Send to Google Merchant
   - Update status (Success/Error)
   - Wait 2 seconds
   ↓
6. Show final summary
   ↓
7. User can retry failed products
```

---

## 📋 Product Requirements

Each product needs:
- ✅ Name
- ✅ Brand
- ✅ Description
- ✅ Price (sellingPrice)
- ✅ At least one image (public URL)

Products missing these will show errors.

---

## 🔧 Backend Requirement

You need to add this endpoint to your backend:

**`POST /merchant/sync-product`**

```typescript
app.post('/merchant/sync-product', async (req, res) => {
  const { merchantProduct, accessToken } = req.body;
  
  // Call Google Merchant API
  const url = 'https://merchantapi.googleapis.com/accounts/v1beta/...'
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(merchantProduct)
  });
  
  const result = await response.json();
  res.json(result);
});
```

---

## 🎯 Quick Start

1. **Go to**: `http://localhost:3003/merchant-sync`
2. **Get token**: OAuth Playground
3. **Paste token**: In input field
4. **Click**: "Sync All Products"
5. **Wait**: Progress completes ✅

**Done!** All products on Google Merchant Center! 🎉

---

## 🔍 Verify Synced Products

After syncing:
1. Go to: https://merchants.google.com/
2. Click: **Products** → **All Products**
3. See your products (1-2 min delay)
4. Check status:
   - ✅ Green = Active
   - ⚠️ Yellow = Issues
   - ❌ Red = Rejected

---

## 🆘 Troubleshooting

### **"Please enter access token"**
→ Get token from OAuth Playground

### **"Failed to fetch products"**
→ Check POS backend is running at localhost:3003

### **Access token expired**
→ Get new token (expires after 1 hour)

### **Product showing error**
→ Check error message in table
→ Common issues:
  - Missing image
  - Invalid image URL
  - Missing required fields

### **Backend endpoint not found**
→ Add `/merchant/sync-product` endpoint to backend
→ See "Backend Requirement" section above

---

## 💡 Pro Tips

1. **Test first**: Sync 1 product before all
2. **Save token**: Keep it handy (expires in 1 hour)
3. **Check images**: Must be public https:// URLs
4. **Regular sync**: Re-sync when prices change
5. **Monitor errors**: Fix issues and retry

---

## 🔄 Regular Updates

When you add/update products:
1. Go to `/merchant-sync`
2. Enter token (if expired)
3. Click "Sync All" or sync individual product
4. Done! ✅

---

## ✨ Summary

You now have **one-click product syncing** in your POS system!

### **What you can do:**
- ✅ Sync all inventory to Google Shopping
- ✅ Sync individual products
- ✅ Track progress in real-time
- ✅ Retry failed products
- ✅ See detailed errors
- ✅ No complex coding!

### **What's automatic:**
- ✅ Product fetching
- ✅ Data transformation
- ✅ Rate limiting
- ✅ Error handling
- ✅ Progress tracking

---

## 🚀 Ready!

Access the sync page in your POS:
```
http://localhost:3003/merchant-sync
```

Start syncing your products to Google Shopping! 🎉

