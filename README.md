<div align="center">
  <br />
  <h1>💘 LoveLink</h1>
  <h3>The "Monolith" Modernized.</h3>
  <p>
    <b>Real-Time Matchmaking & Social Discovery Platform</b>
  </p>
  
  <p>
    A full-stack social application that bridges the gap between traditional monolithic architectures and modern SPAs using a <b>Single Artifact Deployment</b> strategy.
  </p>

  <p>
    <img src="https://img.shields.io/badge/Java_17-ED8B00?style=for-the-badge&logo=java&logoColor=white" />
    <img src="https://img.shields.io/badge/Spring_Boot-3-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white" />
    <img src="https://img.shields.io/badge/React-18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
    <img src="https://img.shields.io/badge/WebSockets-RealTime-FF4B4B?style=for-the-badge&logo=socket.io&logoColor=white" />
    <img src="https://img.shields.io/badge/Security-JWT_&_RBAC-black?style=for-the-badge&logo=json-web-tokens&logoColor=white" />
  </p>

  <p>
    <a href="https://love-link-1759327457370.azurewebsites.net/"><strong>🚀 View Live Demo</strong></a>
    <br />
    <sub><em>⚠️ Hosted on Azure Free Tier. Please allow ~30 seconds for the "Cold Start" warm-up.</em></sub>
  </p>
  <br />
</div>

---

## 📸 Application Visuals

> **Design Philosophy:** A seamless, reactive UI served directly by a robust Spring backend.

<table>
  <tr>
    <td align="center" width="33%"><b>🔥 Smart Matching</b></td>
    <td align="center" width="33%"><b>💬 Real-Time Chat</b></td>
    <td align="center" width="33%"><b>🛡️ Admin Control</b></td>
  </tr>
  <tr>
    <td><img src="https://beeimg.com/images/c72257045113.jpg" width="100%" alt="Homepage Card Swiping"></td>
    <td><img src="https://beeimg.com/images/s79463136314.jpg" width="100%" alt="WebSocket Chat Interface"></td>
    <td><img src="https://beeimg.com/images/q47607328801.png" width="100%" alt="Admin Dashboard"></td>
  </tr>
  <tr>
    <td><em>Tinder-style card stack with optimistic UI updates.</em></td>
    <td><em>Instant messaging powered by STOMP & WebSockets.</em></td>
    <td><em>RBAC-protected dashboard for user management.</em></td>
  </tr>
</table>

<table>
  <tr>
    <td align="center" width="33%"><b>🧩 Matches & Grid</b></td>
    <td align="center" width="33%"><b>📅 Activity History</b></td>
    <td align="center" width="33%"><b>🎲 Random Discovery</b></td>
  </tr>
  <tr>
    <td><img src="https://beeimg.com/images/r77153229181.jpg" width="100%" alt="Matches Grid"></td>
    <td><img src="https://beeimg.com/images/e10069638594.jpg" width="100%" alt="User History"></td>
    <td><img src="https://beeimg.com/images/g18644269524.jpg" width="100%" alt="Random Matching"></td>
  </tr>
</table>

---

### ⚡ Key Engineering Features

* **Unified Deployment:** The React build (`npm run build`) is automatically copied into `src/main/resources/static` during the Maven build lifecycle. The result is a **single executable JAR** that serves both the API and the UI.
* **Security First:**
* **Stateless Auth:** Custom JWT implementation with filter chains.
* **Rate Limiting:** Integrated **Bucket4j** to protect endpoints from brute-force and DDoS attacks.
* **Strict Validation:** `@Valid` DTOs prevent malformed data from reaching the service layer.


* **Real-Time Capabilities:**
* Utilizes **Spring WebSocket** with a STOMP broker for bi-directional chat.
* Frontend manages socket subscriptions via React Context to prevent connection leaks.



---

## 🛠️ Getting Started

### Prerequisites

* **Java 17+**
* **Maven 3.x**
* *(Node.js is handled automatically by the frontend-maven-plugin)*

### Run Locally

1. **Clone the Repo**
```bash
git clone https://github.com/DakshArora342/LoveLink.git
cd LoveLink

```


2. **Build & Run (One Command)**
```bash
mvn clean spring-boot:run

```


*This will install Node, build React, package the JAR, and start the server.*


---

## 🔮 Future Roadmap

* [ ] **Dockerization:** Containerize the unified JAR for easier cloud deployment.
* [ ] **OAuth2:** Add "Sign in with Google" support.
* [ ] **Redis:** Offload WebSocket session state to Redis for horizontal scaling.

---

<div align="center">
  <p>
    <a href="https://www.linkedin.com/in/daksharora342">
      <img src="https://img.shields.io/badge/LinkedIn-Daksh_Arora-blue?style=for-the-badge&logo=linkedin" alt="LinkedIn"/>
    </a>
    <a href="mailto:aroratheaksh@gmail.com">
      <img src="https://img.shields.io/badge/Email-Contact_Me-red?style=for-the-badge&logo=gmail" alt="Email"/>
    </a>
  </p>
</div>

```
