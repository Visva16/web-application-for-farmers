# 🌾 Major Project – Web Application for Farmers

**Major Project** is a comprehensive platform designed to connect farmers and vendors, enabling direct transactions and fostering a more efficient agricultural marketplace. It features advanced tools such as **location-based search**, **competitive pricing insights**, **demand-wise price recommendations**, and **community engagement features**. To ensure a seamless experience, the platform also includes troubleshooting mechanisms to improve usability and system stability.

---

## 📌 Overview

This full-stack web application leverages **modern technologies** to deliver a responsive and intuitive experience for both farmers and vendors.

- **Frontend:** Built with **ReactJS** using **Vite** as the build tool, styled with **Tailwind CSS**, and powered by reusable components from **Shadcn-ui**.
- **Backend:** Developed with **Express.js**, connected to a **MongoDB** database using **Mongoose**, and secured via **JWT**-based authentication.

Simultaneous frontend and backend development is facilitated through the `concurrently` package with a single start command.

---

## 🗂️ Project Structure

### 🌐 Frontend (`client/`)

- Built with **ReactJS** + **Vite**
- Routing handled using `react-router-dom`
- State management with React **Hooks** and **Context API**
- Styled with **Tailwind CSS**
- UI components from **Shadcn-ui**
- API interactions and mock data located in `client/src/api/`

### 🛠️ Backend (`server/`)

- Built with **Express.js**
- API routes defined in `server/api/`
- MongoDB interactions via **Mongoose**
- Authentication via **JWT** (access + refresh tokens)
- Concurrency support with helper scripts in `server/scripts/`

---

## ✨ Features

- ✅ **Vendor Product Listing**  
  Detailed forms with validation for vendors to list processed or repackaged products.

- 🛒 **Vendor Ordering Process**  
  Browse farmer listings, initiate orders, and negotiate directly.

- 🌱 **Direct Farmer Sales**  
  Facilitates transparent transactions from farmers to vendors.

- 📍 **Location-Based Search**  
  City-level vendor discovery for buyers.

- 📊 **Competitive Pricing Analysis**  
  View similar product pricing for strategic decisions.

- 💹 **Demand-Wise Pricing Suggestions**  
  AI-based dynamic pricing based on product demand.

- 🧑‍🤝‍🧑 **Community Engagement**  
  Re-introduced discussion threads for communication and collaboration.

- 🛠️ **Troubleshooting & Stability Enhancements**  
  Improvements to session handling and client-side stability.

---

## 🚀 Getting Started

### 📦 Prerequisites

Ensure the following are installed on your system:

- [Node.js](https://nodejs.org/) (LTS version)
- npm (comes bundled with Node.js)
- [MongoDB](https://www.mongodb.com/) (local or cloud instance)

---

### ⚙️ Quickstart

1. **Clone the repository**:
   ```bash
   git clone <your-repository-url>
   cd <your-repository-folder>


2. **📦 Install Dependencies**:

    ```bash
    npm install
    ```

3. **⚙️ Setup Environment Variables**:

   Inside the `server/` folder, create a `.env` file and define the following:
    ```bash
    MONGO DB URL=your mongo connection string
    JWT TOKEN SECRET=your access and refresh token secret
    ```

4. **▶️ Start the Application**:

   ```bash
   npm run start
   ```
   This will concurrently run both the frontend (on `port 5173`) and the backend (on `port 3000`).


5. **🌐 Visit the Frontend/Access**:

   Open your browser and navigate to 👉 `http://localhost:5173` to start using Application.

### 📄 License

The project is proprietary and is not open source. All rights are reserved.

```
© 2024. All rights reserved.
```

