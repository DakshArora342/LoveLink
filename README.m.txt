# Love-Link

Love-Link is a modern matchmaking application built with **Spring Boot** (backend) and **React** (frontend). Both frontend and backend run on the **same port**, providing a seamless full-stack experience.

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

## Getting Started

### Prerequisites

- Java 17
- Maven 3.x
- Node.js and npm (automatically handled during Maven build)

### Build

```bash
mvn clean install