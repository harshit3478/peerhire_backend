# PeerHire - Job Posting & Bidding Platform

PeerHire is a platform that allows employers to post jobs and freelancers to bid on them. This project includes a backend API built with Node.js, Express, and MongoDB, and a frontend built with Next.js.

## Features
- User authentication (JWT-based)
- Employers can post jobs and manage bids
- Freelancers can browse jobs and place bids
- Role-based access control
- API documentation with Swagger/Postman

---

## Setup Instructions

### Prerequisites
- Node.js (v16 or later)
- MongoDB (local or cloud instance)
- npm or yarn package manager

### Backend Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/peerhire.git
   cd peerhire/backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the `backend` directory and add the following:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   ```

4. Start the backend server:
   ```bash
   npm start
   ```

   The backend will run on `http://localhost:5000`.

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the frontend development server:
   ```bash
   npm run dev
   ```

   The frontend will run on `http://localhost:3000`.

---

## API Usage

### Authentication
- **Register a new user**
  ```http
  POST /auth/register
  ```
  **Body:**
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "freelancer"
  }
  ```

- **Login**
  ```http
  POST /auth/login
  ```
  **Body:**
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```

### Job Posting (Employer Only)
- **Create a job**
  ```http
  POST /jobs/create
  ```
  **Body:**
  ```json
  {
    "title": "React Developer Needed",
    "description": "Looking for a React developer to build a dashboard.",
    "budget": 500,
    "duration": 7,
    "skillsRequired": ["react", "javascript"]
  }
  ```

- **Get all jobs**
  ```http
  GET /jobs
  ```

- **Get job details**
  ```http
  GET /jobs/:jobId
  ```

- **Filter jobs by skills**
  ```http
  GET /jobs?skills=react,nodejs
  ```

### Freelancer Bidding
- **Place a bid**
  ```http
  POST /bids/:jobId
  ```
  **Body:**
  ```json
  {
    "bidAmount": 400,
    "timeline": 5,
    "message": "I can deliver this project within 5 days."
  }
  ```

- **Get all bids for a job**
  ```http
  GET /bids/:jobId
  ```

### Bid Management (Employer Only)
- **Accept a bid**
  ```http
  PATCH /bids/:bidId/accept
  ```

- **Reject a bid**
  ```http
  PATCH /bids/:bidId/reject
  ```

---

## API Documentation
- Swagger documentation is available at `http://localhost:5000/api-docs` (if implemented).
- A Postman collection is included in the repository for testing API endpoints.

---

## Bonus Features
- **WebSockets**: Real-time notifications for bid acceptance.
- **Docker**: Backend is dockerized for easy deployment.
- **Rate Limiting**: Prevents spam requests.

---

## Contribution
Feel free to fork the repository and submit pull requests for improvements or bug fixes.

---

## License
This project is licensed under the MIT License.