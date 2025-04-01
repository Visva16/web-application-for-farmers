```markdown
# Major Project 2

Major Project 2 is a comprehensive platform that connects farmers directly with vendors for buying and selling produce. The platform facilitates an efficient and transparent flow where vendors can browse, negotiate, and place orders for produce listed by farmers, and vice versa. It also allows vendors to list their own products if they engage in repackaging or processing.

## Overview

The platform is built with a modern architecture that includes a ReactJS-based frontend using the Vite devserver and an Express.js-based backend. The frontend is styled with Tailwind CSS and uses shadcn-ui for components. The backend is designed to provide RESTful API endpoints and interfaces with a MongoDB database using Mongoose.

### Project Structure

#### Frontend
- **Framework:** ReactJS
- **Development Server:** Vite
- **Component Library and Styling:** shadcn-ui, Tailwind CSS
- **Routing:** `react-router-dom`
- **Folder Structure:**
  - `client/`: Root directory for the frontend
  - `client/src/pages/`: Contains page components
  - `client/src/components/`: Contains UI components
  - `client/src/api/`: Contains API request functions with mock data

#### Backend
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose
- **Authentication:** Token-based with JWT
- **Folder Structure:**
  - `server/`: Root directory for the backend
  - `server/routes/`: Contains route definitions
  - `server/models/`: Contains Mongoose models
  - `server/services/`: Contains business logic and service classes

## Features

### Vendor Features
- **Product Listing:** Vendors can optionally list their own processed or repackaged products.
- **Ordering:** Vendors can browse produce listings, place orders, and negotiate prices with farmers.
- **Order Management:** Vendors can track the status of their orders and communicate with farmers.

### Farmer Features
- **Produce Listing:** Farmers can list their produce with detailed descriptions, prices, and images.
- **Receiving Orders:** Farmers receive and manage orders placed by vendors, with the ability to negotiate and confirm orders.
- **Order Fulfillment:** Farmers can update order statuses and provide shipping details and tracking information.

## Getting Started

### Requirements

To set up and run the project locally, you will need the following tools installed on your machine:
- Node.js (version 14.x or later)
- npm (Node Package Manager)
- MongoDB (local installation or a remote instance)

### Quickstart

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd <repository-directory>
   ```

2. **Install dependencies:**
   - Install frontend dependencies:
     ```bash
     cd client
     npm install
     ```

   - Install backend dependencies:
     ```bash
     cd ../server
     npm install
     ```

3. **Set up environment variables:**
   - Create a `.env` file in the `server/` directory and add the following environment variables:
     ```
     PORT=3000
     DATABASE_URL=mongodb://localhost:27017/major-project-2
     JWT_SECRET=your-jwt-secret-key
     JWT_REFRESH_SECRET=your-jwt-refresh-secret-key
     ACCESS_TOKEN_SECRET=your_access_token_secret_here
     REFRESH_TOKEN_SECRET=your_refresh_token_secret_here
     ```

4. **Run the application:**
   - Start both frontend and backend servers concurrently:
     ```bash
     cd server
     npm run start
     ```

   The frontend will be available at `http://localhost:5173` and the backend at `http://localhost:3000`.

## License

The project is proprietary. Copyright (c) 2024.
```