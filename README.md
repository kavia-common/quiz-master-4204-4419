# quiz-master-4204-4419

## Quiz Frontend (React)

This React app consumes the FastAPI backend. It does not connect directly to the database.

### Environment configuration

Copy `quiz_frontend/.env.example` to `quiz_frontend/.env`:

- REACT_APP_API_BASE_URL: Base URL for the backend API.  
  Example (local dev): `http://localhost:8000`

The frontend reads this in `src/api.js` to build API requests.

### Install and run locally

1) Navigate to the frontend folder:
   cd quiz_frontend

2) Install dependencies:
   npm install

3) Run the app:
   npm start

The app will be served at http://localhost:3000 and will call the backend at `REACT_APP_API_BASE_URL`.

### End-to-end quickstart (local)

1) Start database and seed:
   bash ../quiz-master-4204-4418/quiz_database/startup.sh
   $(cat ../quiz-master-4204-4418/quiz_database/db_connection.txt) < ../quiz-master-4204-4418/quiz_database/schema.sql
   $(cat ../quiz-master-4204-4418/quiz_database/db_connection.txt) < ../quiz-master-4204-4418/quiz_database/seed.sql

2) Start backend at http://localhost:8000:
   cd ../quiz-master-4204-4420/quiz_backend
   cp .env.example .env
   pip install -r requirements.txt
   uvicorn src.api.main:app --host 0.0.0.0 --port 8000 --reload

3) Start frontend:
   cd ../../quiz-master-4204-4419/quiz_frontend
   cp .env.example .env
   npm install
   npm start

### Troubleshooting

- If the quiz list fails to load, confirm the backend is reachable at `REACT_APP_API_BASE_URL` and that CORS is allowed (the backend enables permissive CORS in development).
- Verify the database tables exist and data is seeded if questions or quizzes are empty.