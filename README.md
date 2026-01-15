# Love-Link

Love-Link is a modern matchmaking application built with **Spring Boot** (backend) and **React** (frontend).  
Both frontend and backend run on the **same port**, providing a seamless full-stack experience.

> ⚠️ Note: The app is deployed on a basic Azure plan, so the first load may be slower than usual.

## Live Demo
[Explore Love-Link](https://love-link-1759327457370.azurewebsites.net/)

---

## Features

- User registration and JWT-based authentication
- Automatic admin role assignment based on registered email
- Email notifications via Gmail SMTP
- Rate limiting to prevent abuse
- Swagger UI documentation at `/docs`
- File uploads with configurable size limits
- Real-time communication via WebSocket
- React frontend bundled and served by Spring Boot

---

## Screenshots

### 1. Homepage
![Homepage](https://beeimg.com/images/c72257045113.jpg)

### 2. Admin Panel
![Admin Panel](https://beeimg.com/images/q47607328801.png)

### 3. Chat Feature
![Chat Feature](https://beeimg.com/images/s79463136314.jpg)

### 4. Matches View
![Matches](https://beeimg.com/images/r77153229181.jpg)

### 5. Likes History
![Likes History](https://beeimg.com/images/e10069638594.jpg)

### 6. Random Match Feature
![Random Match](https://beeimg.com/images/g18644269524.jpg)

---

## Getting Started

### Prerequisites

- Java 17
- Maven 3.x
- Node.js and npm (automatically handled during Maven build)

### Build

```bash
mvn clean install
