# ⚠️ IMPORTANT: Merchant API Migration Required

## Content API is Deprecated!

According to [Google's official documentation](https://developers.google.com/merchant/api/guides/data-sources/api-sources), the **Content API is deprecated** and you must migrate to the **new Merchant API v1**.

---

## 🔴 What Changed

### **Old Way (Content API - Deprecated)**
```
❌ Direct product uploads
❌ Endpoint: content.googleapis.com/content/v2.1/
❌ No data source required
❌ Will stop working soon
```

### **New Way (Merchant API v1 - Required)**
```
✅ Data source required first
✅ Endpoint: merchantapi.googleapis.com/
✅ Better product management
✅ Currently supported
```

---

## 📊 API Comparison

| Feature | Content API (Old) | Merchant API v1 (New) |
|---------|-------------------|----------------------|
| **Base URL** | `content.googleapis.com` | `merchantapi.googleapis.com` |
| **Product Upload** | `/content/v2.1/{merchantId}/products` | `/products/v1/accounts/{merchantId}/products:insert` |
| **Data Source** | Not required | **Required** (create first) |
| **Product Format** | `productAttributes` field | `attributes` field |
| **Status** | **Deprecated** ⚠️ | **Active** ✅ |
| **Shutdown Date** | Soon | N/A |

**Reference:** [Google Merchant API - Manage API Data Sources](https://developers.google.com/merchant/api/guides/data-sources/api-sources)

---

## 🔄 Migration Steps

### **Step 1: Create a Data Source**

**Before you can upload any products**, you must create a data source.

**New Endpoint:**
```
POST https://merchantapi.googleapis.com/datasources/v1/accounts/{MERCHANT_ID}/dataSources
```

**Request Body:**
```json
{
  "displayName": "POS API Data Source",
  "primaryProductDataSource": {
    "countries": ["LK"]
  }
}
```

**Response:**
```json
{
  "name": "accounts/{MERCHANT_ID}/dataSources/{DATASOURCE_ID}",
  "dataSourceId": "1234567890",
  "displayName": "POS API Data Source",
  "input": "API"
}
```

**Save the `dataSourceId`** - you'll need it for product uploads!

---

### **Step 2: Update Product Upload**

**Old Content API Format (Deprecated):**
```json
{
  "offerId": "product123",
  "contentLanguage": "en",
  "targetCountry": "LK",
  "feedLabel": "LK",
  "productAttributes": {
    "title": "Product Name",
    "description": "Description",
    "link": "https://...",
    "imageLink": "https://...",
    "price": {
      "value": "1000",
      "currency": "LKR"
    }
  }
}
```

**New Merchant API Format (Required):**
```json
{
  "offerId": "product123",
  "contentLanguage": "en",
  "feedLabel": "LK",
  "dataSource": "accounts/{MERCHANT_ID}/dataSources/{DATASOURCE_ID}",
  "attributes": {
    "title": "Product Name",
    "description": "Description",
    "link": "https://...",
    "imageLink": "https://...",
    "price": {
      "value": "1000",
      "currency": "LKR"
    },
    "availability": "in stock",
    "brand": "Brand Name",
    "condition": "new"
  }
}
```

**Key Changes:**
- ✅ Added `dataSource` field (required)
- ✅ Renamed `productAttributes` to `attributes`
- ✅ Removed `targetCountry` (set in data source)

---

### **Step 3: Update Backend Endpoints**

**Required Backend Endpoints:**

**1. Create Data Source (One-Time):**
```typescript
POST /merchant/create-datasource

app.post('/merchant/create-datasource', async (req, res) => {
  const { merchantId, accessToken, displayName } = req.body;
  
  const url = `https://merchantapi.googleapis.com/datasources/v1/accounts/${merchantId}/dataSources`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      displayName: displayName || 'POS API Data Source',
      primaryProductDataSource: {
        countries: ['LK']
      }
    })
  });
  
  const result = await response.json();
  res.json(result);
});
```

**2. Upload Product (Updated):**
```typescript
POST /merchant/sync-product

app.post('/merchant/sync-product', async (req, res) => {
  const { merchantProduct, accessToken, merchantId } = req.body;
  
  const url = `https://merchantapi.googleapis.com/products/v1/accounts/${merchantId}/products:insert`;
  
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

## ✅ What We've Updated

### **Frontend Files:**
- ✅ `src/API/merchant.ts` - Updated to use Merchant API v1
- ✅ Added `createDataSource()` function
- ✅ Updated `syncProduct()` for new format
- ✅ Changed `productAttributes` to `attributes`
- ✅ Added `dataSource` reference

### **Documentation:**
- ✅ `GOOGLE-MERCHANT-SYNC.md` - Updated with new API info
- ✅ Added migration warnings
- ✅ Updated backend requirements
- ✅ Added data source setup instructions

---

## 🎯 What You Need to Do

### **1. Update Your Backend**

Add two endpoints:
- `POST /merchant/create-datasource` - Create data source (one-time)
- `POST /merchant/sync-product` - Update to use new Merchant API endpoints

### **2. Create a Data Source**

**Before syncing any products:**
```bash
# Call your backend endpoint
POST http://localhost:3003/merchant/create-datasource
{
  "merchantId": "YOUR_MERCHANT_ID",
  "accessToken": "ya29.a0...",
  "displayName": "POS API Data Source"
}

# Save the returned dataSourceId!
```

### **3. Update Product Syncs**

The frontend is already updated. Your product syncs will now:
- Reference the data source
- Use the new `attributes` format
- Call the new Merchant API endpoints

---

## 📖 Official Documentation

- **Merchant API Overview:** [https://developers.google.com/merchant/api](https://developers.google.com/merchant/api)
- **Data Sources Guide:** [https://developers.google.com/merchant/api/guides/data-sources/api-sources](https://developers.google.com/merchant/api/guides/data-sources/api-sources)
- **Products Guide:** [https://developers.google.com/merchant/api/guides/products/add-manage](https://developers.google.com/merchant/api/guides/products/add-manage)
- **Migration Guide:** [https://developers.google.com/merchant/api/guides/migrate-content-api](https://developers.google.com/merchant/api/guides/migrate-content-api)

---

## ⏰ Timeline

- ✅ **Now:** Content API still works but deprecated
- ⚠️ **Soon:** Content API will be shut down
- ✅ **Action:** Migrate to Merchant API v1 immediately

---

## 🆘 Need Help?

Common migration issues:

**"Data source not found"**
→ Create a data source first using `/merchant/create-datasource`

**"Invalid product format"**
→ Use `attributes` instead of `productAttributes`
→ Include `dataSource` field

**"Unauthorized"**
→ Make sure your OAuth scope includes `https://www.googleapis.com/auth/content`

**"Wrong endpoint"**
→ Use `merchantapi.googleapis.com` not `content.googleapis.com`

---

## ✨ Summary

The migration is simple:

1. ✅ **Create a data source** (one-time setup)
2. ✅ **Update backend endpoints** (use Merchant API v1)
3. ✅ **Reference data source** in product uploads
4. ✅ **Use new format** (`attributes` instead of `productAttributes`)

**Frontend is already updated!** Just update your backend and create a data source. 🚀

