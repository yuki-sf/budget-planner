# Budget Planner 📊💸

Hey there, budget-conscious human! Meet **Budget Planner**, a mobile app built with **Expo Go** to help you track your expenses before they track you. With colorful charts and easy-to-use features, this app makes managing your money less of a headache (and maybe even a little fun?).

## Features 🌟

- **Expense Categorization**: Sort your expenses into neat little boxes (because chaos is overrated).

- **Expense Limits**: Set monthly spending limits so you don’t cry at the end of the month.

- **Donut Chart Representation**: Because who doesn’t love donuts? 🍩 Visualize your spending habits in a sweet, circular chart.

- **Add & Manage Entries**: Easily add new expense entries and create custom categories like “Totally Necessary Coffee” ☕.

- **Recurring Expenses**: Set up expenses that come back **monthly, every 3 months, 6 months, or yearly**—like your gym membership you keep forgetting about.

- **Bar Graph for Recurring Expenses**: See your long-term spending trends in a clear bar graph (or use it to predict when you’ll finally go broke).

- **Run on Expo Go**: Just download **Expo Go** and scan a QR code—no complicated setup required!

## Getting Started 🚀

### Prerequisites
- Install [Expo Go](https://expo.dev/client) on your phone.
- Make sure you have Node.js and npm installed.
- Install Expo CLI if you haven’t already:
  ```sh
  npm install -g expo-cli
  ```

### Installation
1. Clone this glorious repo:
   ```sh
   git clone https://github.com/Yuki-sf/budget-planner.git
   ```
2. Navigate to the project folder:
   ```sh
   cd budget-planner
   ```
3. Install dependencies like a pro:
   ```sh
   npm install
   ```
4. Start the development server:
   ```sh
   expo start
   ```
5. Scan the QR code using **Expo Go** on your mobile device. Boom! You’re in. 🎉

## Setting Up API Keys 🔑
To use **Kinde for authentication** and **Supabase for cloud storage**, you need API keys. Here’s how to set them up:

### Kinde Configuration
1. Go to [Kinde](https://kinde.com) and sign up.
2. Create a new application and get your API credentials (Domain and Secret Key).
3. Open `KindeConfig.jsx` and add your API keys:
   ```js
   import { KindeSDK } from '@kinde-oss/react-native-sdk-0-7x';

   export const client = new KindeSDK(
       'https://your-kinde-domain.kinde.com', 
       'exp://localhost--', 
       'your-secret-key', 
       'exp://localhost--'
   );
   ```

### Supabase Configuration
1. Go to [Supabase](https://supabase.com) and create an account.
2. Start a new project and grab your **Project URL** and **Anon Key**.
3. Open `SupabaseConfig.jsx` and add your keys:
   ```js
   import { createClient } from '@supabase/supabase-js';

   // Create a single Supabase client for interacting with your database
   export const supabase = createClient(
       'https://your-supabase-url.supabase.co', 
       'your-secret-key'
   );
   ```

## How to Use 🧐
- Open the app and pretend to be responsible.
- Create categories for your spending (yes, “Impulse Buys” is a valid category).
- Add expense entries and set limits before your wallet disappears.
- Track your spending with **donut charts** (warning: not edible).
- Set up **recurring expenses** and analyze trends with the **bar graph** (spoiler: you spend too much).

## Tech Behind the Magic 🛠️
- **React Native** (Expo)
- **Recharts** (for all the fancy graphs)
- **AsyncStorage** (for local data storage)
- **Supabase** (for cloud storage, because backups are cool)
- **Kinde** (for authentication)

## Want to Contribute? 🤝
Fork it, improve it, and send a pull request! Let's make budgeting less boring together.

## License 📜
This masterpiece is licensed under the MIT License. 

---
**Made with ❤️ (and financial anxiety) by Yuki-sf using Expo**

