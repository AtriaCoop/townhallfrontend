# Atria Frontend

Welcome to the Atria Frontend repository! This project powers the web interface of the Atria platform — a tool for community members to connect, share updates, and collaborate through posts, group chats, and more.

Built with Next.js and styled using SCSS, this app follows a mobile-first, component-driven architecture.

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone [REPO_URL]
cd atria-frontend
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Add environment variables

Create a `.env` file in the root directory with the following:

```
NEXT_PUBLIC_API_BASE=http://localhost:8000
```

✅ Make sure .env is listed in your .gitignore so it doesn't get committed.

Ask a lead dev if you're unsure what the correct API URL is (e.g. staging vs. production).

## 💻 Run the development server

```bash
npm run dev
# or
pnpm dev
```

Once running, go to http://localhost:3000 in your browser.

🔌 Backend Dependency
This project requires the Atria backend (Django) to be running locally or remotely. Without the backend API running, most pages like the homepage, login, and data views will not load properly.

🔐 Accessing the App
You’ll need to create **a dummy user account** to log in and access the platform. Once registered, you’ll be redirected to the homepage and other core features.

Ask Ryan, Gagenvir, or Ansel for help setting up the backend if needed.

## 📁 Project Structure

/components         → Reusable UI components (Navigation, Post, MessageBubble, etc.)  
/pages              → Route-based pages (Home, WorkingGroupsPage, ProfilePage, etc.)  
/styles             → Global styles and SCSS modules  
/public             → Static files (images, logos, icons)  

## 🎨 UI & Styling Guidelines

- SCSS is used for styling (see `/styles/mixins.scss` for breakpoints)
- Layouts follow a mobile-first design
- Use `lucide-react` for icons (already included)
- Match the Figma design when implementing new components
- Keep styling consistent across breakpoints — especially for 1024px and below


## ✅ Best Practices

- Use consistent class and component naming
- Keep components modular and reusable
- Avoid unnecessary duplication
- Test across devices and resolutions
- Use meaningful commit messages


## 🚀 Deployment

The app is optimized for deployment on Vercel, but other platforms like Netlify or AWS Amplify also work.


## 📚 Learn More

- https://nextjs.org/docs  
- https://sass-lang.com/documentation/  
- https://lucide.dev/  
- https://reactjs.org/docs/getting-started.html  

## 👋 Questions?

Reach out to **Ryan Yee** or **Ansel Hartanto** if you're stuck or unsure about anything.

© Atria Community — All rights reserved.
