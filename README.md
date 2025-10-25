# 🪑 SeatSense: Real-Time Study Space Availability App  

> **“No more wandering to find a seat.”**  
> Built for **HackOHI/O 2025 – Honda Challenge**, SeatSense helps students instantly discover the best on-campus study spots based on live crowd data, noise levels, and walking distance.

---

## 🌟 Overview  

SeatSense is an AI-powered campus assistant that analyzes **occupancy trends**, **noise levels**, and **proximity** to recommend the most optimal study environments.  
It combines real-time student feedback with Supabase Edge Functions that simulate intelligent predictions — delivering actionable insights right from a friendly chat interface.  

---

## 🚀 Key Features  

- 🤖 **Chat-Based Study Assistant** – Interactive interface that understands user preferences (duration, group size, whiteboard needs, etc.)  
- 📊 **Live Occupancy Analytics** – Backend functions estimate how busy each space is using user-submitted updates and AI-style heuristics  
- 🔊 **Noise-Level Monitoring** – Simulated ambient readings for quiet or busy areas  
- 🗺️ **Walking-Distance Estimator** – Calculates distance and time from the user’s location to study spots  
- 💬 **Instant Updates** – Students can “Submit Quick Update” to refresh space status in real time  
- 🧠 **Proof-of-Concept AI Engine** – Demonstrates how large-language-model logic could infer crowd levels from historical data  

---

## 🧩 Tech Stack  

| Layer | Technology | Purpose |
|-------|-------------|----------|
| **Frontend** | React + TypeScript + Vite + Tailwind CSS + shadcn/ui | Fast, modern UI with responsive design |
| **Backend** | Supabase (PostgreSQL + Edge Functions) | Database, authentication, and serverless logic |
| **Deployment** | Lovable .dev / Vercel | Continuous preview and deployment |
| **Extras** | Sonner (toast alerts), Lucide React (icons) | User feedback & icons |

---

## 🛠️ Setup & Run Locally  

### 1️⃣ Clone the repository
```bash
git clone <YOUR_GIT_URL>
cd SeatSense
