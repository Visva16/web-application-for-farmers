# Major Project - web application for farmers

Major Project is a comprehensive platform designed to connect farmers and vendors, enabling direct transactions and fostering a more efficient marketplace ecosystem. The application incorporates advanced features such as location-based searches, competitive pricing insights, demand-wise pricing recommendations, and robust community engagement tools. Additionally, the platform includes troubleshooting functionalities to enhance usability and stability.

## Overview

Major Project 2 leverages modern web technologies to deliver a seamless user experience. The architecture involves a ReactJS-based frontend powered by Vite, with a Tailwind CSS framework for styling and Shadcn-ui component library for reusable UI components. The backend is built using Express.js, integrating a MongoDB database with Mongoose for handling data operations.

### Project Structure

- **Frontend**
  - Located in the `client/` folder, implemented using ReactJS with Vite.
  - Client-side routing handled by `react-router-dom`.
  - State management and API interactions facilitated by React hooks and context.
  - Uses Tailwind CSS for styling and Shadcn-ui component library for UI components.
  - Mock data and API requests handled in the `client/src/api/` folder.

- **Backend**
  - Located in the `server/` folder, implemented using Express.js.
  - REST API endpoints defined in the `api/` folder.
  - MongoDB database management via Mongoose.
  - Token-based authentication using JWTs (access and refresh tokens).
  - Concurrency handled by scripts in the `server/scripts/` folder.

The development environment is configured to run both frontend and backend simultaneously using the `npm run start` command, facilitated by the `concurrently` package.

## Features

- **Vendor Product Listing**: Vendors can list processed or repackaged products with detailed forms and validation.
- **Vendor Ordering Process**: Vendors can browse produce listings from farmers and initiate orders with negotiation capabilities.
- **Farmers Selling Directly**: Facilitates direct sales from farmers to vendors with transparent order management.
- **Location-Based Searching**: Users can locate vendors based on city-level data, enhancing searchability.
- **Competitive Pricing Analysis**: Vendors gain insight into competitive pricing by comparing similar products.
- **Demand-Wise Pricing Recommendations**: Dynamic pricing suggestions based on product demand metrics.
- **Community Engagement**: Users can interact through a re-introduced discussions feature.
- **Troubleshooting and Stability Enhancements**: Guidance and fixes for common client-side issues, including session management improvements.

## Getting Started

### Requirements

Ensure the following technologies are installed on your computer to run the project:

- Node.js (LTS version recommended)
- npm (comes with Node.js)
- MongoDB (running locally or accessible via a connection string)

### Quickstart

1. **Clone the repository**:
   ```sh
   git clone <repository-url>
   cd <repository-directory>
   ```

2. **Install dependencies**:
   ```sh
   npm install
   ```

3. **Set up environment variables**:
   Create a `.env` file in the `server/` directory and define your environment variables like MongoDB connection URL and JWT secrets.

4. **Start the application**:
   ```sh
   npm run start
   ```
   This will concurrently run both the frontend (on port 5173) and the backend (on port 3000).

5. **Access the application**:
   Open your browser and navigate to `http://localhost:5173` to start using Major Project 2.

### License

The project is proprietary and is not open source. All rights are reserved.

```
© 2024. All rights reserved.
```
