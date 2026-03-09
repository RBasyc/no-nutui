# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a laboratory inventory management system built with **Taro 4.1 + Vue 3 + TypeScript**. It compiles to multiple platforms including WeChat Mini Program, Alipay Mini Program, and H5. The app manages laboratory inventory, user profiles, and laboratory information.

**Design Width:** 750rpx (Taro's responsive pixel units)

## Development Commands

### Primary Development
```bash
# WeChat Mini Program (primary target)
npm run dev:weapp

# H5 web version
npm run dev:h5

# Alipay Mini Program
npm run dev:alipay
```

### Build for Production
```bash
npm run build:weapp   # WeChat Mini Program
npm run build:h5      # H5
npm run build:alipay  # Alipay Mini Program
```

### Code Quality
```bash
npm run prepare       # Sets up Husky git hooks
```

## Architecture

### API Layer (`src/api/`)
All backend endpoints are centralized in the API layer. When adding new API endpoints:

1. **Add to appropriate API file:**
   - `userapi.ts` - User authentication, profile, avatar upload
   - `inventoryAPI.ts` - Inventory items, search, records
   - `labapi.ts` - Laboratory CRUD operations

2. **API Configuration:**
   - Base URL configured in `src/api/config.ts`
   - Currently points to `http://localhost:3000` (change for production)

3. **API Response Format:**
   - Success: `{ errCode: '0', data: {...} }`
   - Error: `{ errCode: '-1', errorInfo: 'error message' }`

### Page Structure (`src/pages/`)
Each page follows this pattern:
```
pages/[page-name]/
├── [page-name].vue   # Template and logic
├── [page-name].scss  # Page-specific styles
```

**Adding a new page:**
1. Create page directory in `src/pages/`
2. Add page route to `src/app.config.ts` pages array
3. For tab bar pages, add to `tabBar.list` in `app.config.ts`

**Current Inventory Pages:**
- `pages/inventory/inventory` - Main inventory list with search and filters
- `pages/inventory/inventory-record` - **Primary stock operation interface** (use/return items)
- `pages/inventory/inventory-detail` - View detailed item information
- `pages/inventory/inventory-edit` - Edit existing inventory items

### Navigation Patterns
```javascript
// Navigate to new page
Taro.navigateTo({ url: '/pages/target-page/target-page' })

// Navigate back
Taro.navigateBack()

// Pass query parameters
Taro.navigateTo({ url: '/pages/target-page/target-page?from=profile&id=123' })

// Read parameters in target page
const instance = Taro.getCurrentInstance()
const params = instance.router?.params
```

### Storage Patterns
```javascript
// Set storage
Taro.setStorageSync('key', value)

// Get storage
const value = Taro.getStorageSync('key')

// Remove storage
Taro.removeStorageSync('key')
```

**Common storage keys:**
- `token` - Authentication token
- `user_id` - Current user ID
- `userInfo` - Complete user object
- `labName` - Current user's laboratory name
- `laboratoryInfo` - Laboratory information cache

## Common Code Patterns

### Form with Validation
Forms use reactive data with error tracking:
```javascript
const formData = reactive({
    field1: '',
    field2: ''
})

const errors = reactive({
    field1: '',
    field2: ''
})

const handleFieldBlur = (field) => {
    const value = formData[field]
    // Validation logic
    if (!value) {
        errors.field1 = 'Field is required'
    } else {
        errors.field1 = ''
    }
}
```

### API Request Pattern
```javascript
Taro.request({
    url: apiUrl,
    method: 'POST',
    header: {
        'Content-Type': 'application/json',
        Authorization: Taro.getStorageSync('token') || ''
    },
    data: requestData,
    success: (res) => {
        if (res.statusCode === 200 && res.data.errCode === '0') {
            // Success handling
        }
    },
    fail: (err) => {
        // Error handling
    }
})
```

### Page Lifecycle
- `onMounted()` - Runs when page first loads
- `useDidShow()` - Runs every time page is shown (including returning from other pages)

### Styling Conventions
- All pages use SCSS with `.scss` extension
- Design system uses 750rpx design width
- Glassmorphism UI pattern with `backdrop-filter: blur(20rpx)`
- Primary color: `#1E90FF` (Dodger Blue)
- Background gradient: `#F0F5FA` → `#E8EEF5` → `#D9E6F2`

Component class naming:
- Page wrapper: `[page-name]-page`
- Sections: `setting-section`
- Items: `setting-item`
- Buttons: `btn-primary`, `btn-secondary`

## Important Files

- `src/app.config.ts` - Page routes, tab bar, navigation config
- `src/api/config.ts` - Backend API base URL
- `config/index.ts` - Taro framework configuration

## Laboratory Feature Architecture

The laboratory feature has two distinct modes:

1. **View/Edit Mode** (`fromPage: 'profile'`):
   - User selects a laboratory from dropdown
   - Updates their profile with the selected laboratory
   - Calls `userApi.updateProfile`

2. **Create Mode** (default):
   - User fills out laboratory details
   - Creates a new laboratory
   - Calls `labApi.create`

The `laboratory.vue` page determines mode via URL parameter `?from=profile`.

When creating a new lab from `laboratory.vue`, it navigates to `create-lab.vue` with `?from=laboratory`. After creation, the new lab name is stored in `newlyCreatedLab` and auto-selected when returning.

## Stock Operations

### Primary Interface: inventory-record Page

The `inventory-record` page (`pages/inventory/inventory-record/`) is the main interface for stock operations:

**Features:**
- Two operation modes: **Use** (consume_out) and **Return** (return_in)
- Real-time stock calculation and validation
- Prevents operations that would result in negative stock
- Supports QR code scanning to switch items
- Records all operations to Transaction table with user info

**API Call:**
```javascript
Taro.request({
  url: inventoryApi.quantity(itemId),
  method: 'PUT',
  data: {
    quantity: 5,
    operation: 'subtract'  // or 'add'
  },
  header: {
    Authorization: Taro.getStorageSync('token')
  }
})
```

**Backend automatically creates Transaction record with:**
- `userName` - Current user's nickName/realName
- `contact` - Current user's phone/email
- `operationTime` - Timestamp of operation
- Complete audit trail (quantityBefore, quantityAfter, type, etc.)
