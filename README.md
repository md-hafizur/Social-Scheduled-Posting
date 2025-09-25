# Fullstack Challenge

This project is a fullstack application with a FastAPI backend and a Next.js frontend.

## Project Structure

```
fullstack-challenge/
├── backend/                # FastAPI
│   ├── app/
│   │   ├── main.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   ├── database.py
│   │   ├── routes/
│   │   │   ├── posts.py
│   │   │   ├── products.py
│   │   │   └── analytics.py
│   │   ├── services/
│   │   │   ├── scheduler.py
│   │   │   └── ai_helper.py
│   └── requirements.txt
│
├── frontend/               # Next.js + React
│   ├── app/
│   │   ├── posts/          # Challenge 1 UI
│   │   ├── products/       # Challenge 2 UI
│   │   └── dashboard/      # Challenge 3 UI
│   ├── components/
│   ├── lib/
│   ├── package.json
│   └── tailwind.config.js
│
└── README.md
```

## Getting Started

### Prerequisites

*   Python 3.9+
*   Node.js and npm

### Backend Setup (FastAPI)

1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```

2.  **Create and activate a virtual environment:**
    ```bash
    # For Windows
    python -m venv venv
    .\venv\Scripts\activate

    # For macOS/Linux
    python3 -m venv venv
    source venv/bin/activate
    ```

3.  **Install the dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Run the FastAPI server:**
    ```bash
    uvicorn app.main:app --reload
    ```
    The backend will be running at `http://127.0.0.1:8000`.

### Frontend Setup (Next.js)

1.  **Navigate to the frontend directory:**
    ```bash
    cd frontend
    ```

2.  **Install the dependencies:**
    ```bash
    npm install
    ```

3.  **Run the Next.js development server:**
    ```bash
    npm run dev
    ```
    The frontend will be running at `http://localhost:3000`.
"# Social-Scheduled-Posting" 
