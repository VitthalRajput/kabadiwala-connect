# Kabadiwala Connect - Frontend

A desktop-first responsive web application connecting **Kabadiwalas (Collectors / Sellers)** and **Recyclers (Aggregators / Buyers)** across India.

## Tech Stack
- **Framework:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS (Custom Saffron `#FF6B00` branding + Indian heritage motifs)
- **Icons:** Lucide React
- **Routing:** React Router DOM v6
- **Data Visualization:** Recharts
- **HTTP Client:** Axios (Centralized interceptor, automatic token refresh, error handling)

## Project Structure
```
Frontend/
├── src/
│   ├── api/             # Central Axios client and service modules
│   │   ├── client.ts
│   │   ├── auth.api.ts
│   │   ├── lots.api.ts
│   │   ├── ml.api.ts
│   │   ├── matchmaking.api.ts
│   │   ├── transactions.api.ts
│   │   ├── prices.api.ts
│   │   ├── notifications.api.ts
│   │   ├── materials.api.ts
│   │   ├── sync.api.ts
│   │   └── audit.api.ts
│   ├── components/
│   │   ├── common/      # AshokaPillar, Button, Input, Select, Card, Badge, Modal, Stepper, Loader
│   │   ├── layout/      # PublicNavbar, PublicFooter, Sidebar, TopHeader, OfflineBanner, DashboardLayout
│   │   ├── seller/      # PriceTrendChart, MarketInsightsCard, MaterialPhotoUploader, RecyclerMatchCard
│   │   └── recycler/    # FilterSidebar, LotCard, PickupTimeline
│   ├── context/         # AuthContext, ToastContext, OfflineContext
│   ├── pages/
│   │   ├── public/      # LandingPage, RoleSelectionPage, NotFoundPage
│   │   ├── auth/        # LoginPage, RegisterPage
│   │   ├── seller/      # SellerDashboard, CreateLotPage, PriceEstimatePage, SellerLotsPage, LotDetails, Matches, Pickups, Transactions, Notifications
│   │   ├── recycler/    # RecyclerDashboard, BrowseLotsPage, RecyclerLotDetailsPage, AcceptedLotsPage, PickupHandoverPage, Transactions, Prices, Notifications
│   │   └── shared/      # ProfilePage
│   ├── routes/          # AppRoutes, ProtectedRoute
│   ├── types/           # Strongly-typed DTOs and backend entities
│   └── utils/           # Formatters, Geolocation, LocalStorage
```

## Running Locally

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure Environment:**
   Create `.env` file (already configured by default):
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api/v1
   ```

3. **Start Development Server:**
   ```bash
   npm run dev
   ```
   Opens on `http://localhost:3000`

4. **Production Build:**
   ```bash
   npm run build
   ```

