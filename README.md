# Ward Expenses

A simple, mobile-first web app for tracking **daily expenses** and **debts** (who owes you, whom you owe), with a dashboard and reports. It can be added to the iPhone home screen and opens like a native app.

Built with Next.js 16 (App Router, Server Actions), React 19, Tailwind CSS 4 and MongoDB Atlas (Mongoose).

## Pages

| Page | What it does |
| --- | --- |
| **Login** | Single account, set with environment variables |
| **Dashboard** | Spent this month / today, change vs last month, owed to me / I owe, last 7 days chart, top categories, recent expenses, debts due soon. Quick "Add expense" and "Add debt" buttons |
| **Expenses** | Add with an amount, a category (tap one or type your own), date and note. Browse by month, filter by category, search notes. Tap any expense to edit or delete it |
| **Debts** | Type the person's name (previous names are suggested). Choose "They owe me" or "I owe them", amount, optional due date. One row per person with the balance. Open a person to record partial payments ("Got paid" / "I paid"), edit, or delete |
| **Reports** | This month, last month, last 30 days, 3 months, this year or any custom range. Totals, average per day, spending per day/month chart, spending by category, biggest expenses, debt activity and balances per person. Download as CSV (opens in Excel) or print / save as PDF |

## Setup

### 1. MongoDB Atlas

1. Create a free cluster at <https://cloud.mongodb.com>.
2. **Database Access** → add a database user with a password.
3. **Network Access** → allow `0.0.0.0/0` (needed for Vercel, whose IPs change).
4. **Connect → Drivers** → copy the connection string and put a database name before the `?`, e.g. `.../ward-exp?retryWrites=true&w=majority`.

### 2. Environment variables

Copy `.env.example` to `.env.local` and fill it in:

```bash
MONGODB_URI="mongodb+srv://..."
AUTH_SECRET="<long random string>"   # node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
ADMIN_EMAIL="you@example.com"
ADMIN_PASSWORD="your-password"
NEXT_PUBLIC_CURRENCY="KWD"           # optional, defaults to KWD
APP_TIMEZONE="Asia/Kuwait"           # optional, defaults to Asia/Kuwait
```

The login email and password live only in these variables. They are never committed to the repository.

### 3. Run locally

```bash
npm install
npm run dev     # http://localhost:3000
```

### 4. Deploy (Vercel)

1. Import this repository at <https://vercel.com/new>.
2. Add the environment variables above under **Settings → Environment Variables**.
3. Deploy. Vercel gives you an `https://...vercel.app` address.

## Add to iPhone home screen

1. Open the deployed address in **Safari**.
2. Sign in.
3. Tap **Share** → **Add to Home Screen** → **Add**.

The app opens full screen with its own icon and stays signed in for 30 days.

## Scripts

- `npm run dev`: start the development server
- `npm run build`: production build
- `npm start`: run the production build
- `npm run lint`: ESLint
