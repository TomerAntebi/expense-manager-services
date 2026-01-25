# 💰 Expense Manager Services

This repository contains the backend implementation of the Expense Manager project.
The project was developed as part of an academic course on asynchronous server side development.
The system is implemented using Node.js Express and MongoDB and follows a multi service architecture.

---

## 🧩 Project Overview

The Expense Manager system provides RESTful web services that allow clients to manage users.
Add and retrieve expense records.
Generate monthly expense reports.
Collect and store logs for all HTTP requests.

Each responsibility is handled by a dedicated service.
Each service runs as an independent Express application and is deployed separately.

---

## 🏗 Architecture

The project is structured as a monorepo that contains multiple independent services.

## expense-manager-services
└── src
├── user_service
├── costs_service
├── reports_service
└── logs_service



Each service:
Has its own package.json.
Runs independently.
Is deployed as a separate web service on Render.
Communicates with other services via HTTP.

---

## 🔧 Services

### 👤 User Service

Purpose:
Manages user data.

Main endpoints:
POST /users/api/add  
GET /users/api/all  
GET /users/api/:id  

Live URL:
https://user-services-fqb9.onrender.com

Example:
GET https://user-services-fqb9.onrender.com/api/users

---

### 💸 Costs Service

Purpose:
Handles expense records and generates monthly cost reports.

Main endpoints:
POST /costs/api/add  
GET api/report?userid=&year=&month=  

Live URL:
https://cost-service-1d44.onrender.com

Example:
GET https://cost-service-1d44.onrender.com/api/report?userid=12334&year=2026&month=1

---

### 📊 Reports Service

Purpose:
Stores and serves cached monthly reports.
Implements the computed design pattern to avoid recalculating reports.

Main endpoints:
GET /reports/api/:userid/:year/:month  

Live URL:
https://reports-service.onrender.com

---

### 📝 Logs Service

Purpose:
Centralized logging service for all HTTP requests.

Main endpoints:
POST /logs/api/add  
GET /logs/api/all  

Live URL:
https://log-service-1oo2.onrender.com/api/logs

---

## 📜 Logging

All services use Pino for structured logging.
Each incoming HTTP request is logged.
Logs are sent asynchronously to the Logs Service.

---

## 🗄 Database

MongoDB Atlas is used as the database.
Each service connects independently using environment variables.

Collections:
users  
costs  
reports  
logs  

---

## 🚀 Deployment

Each service is deployed as a separate Render web service.
All services are deployed from this single GitHub repository.
Each Render service is configured with a different root directory.
Services communicate using public Render URLs.

---

## 🛠 Technologies Used

Node.js  
Express.js  
MongoDB Atlas  
Mongoose  
Pino  
REST APIs  
Render  

---

## 👨‍💻 Author

Tomer Antebi
