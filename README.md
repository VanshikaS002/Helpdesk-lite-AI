# Helpdesk Lite AI Middleware

This is the FastAPI-based middleware for the **Helpdesk Lite** project, designed to handle AI-powered chatbot responses using OpenAI's GPT models.

## 🚀 Features

- Lightweight FastAPI server
- Accepts user queries and returns AI-generated responses
- Connects to OpenAI's GPT-4 via the `openai` Python SDK
- CORS enabled for seamless frontend (React) integration

## 📁 Project Structure

```
helpdesk-lite-ai/
└── ai-middleware/
    ├── main.py         # FastAPI backend logic
    ├── .env            # Environment variables (contains your OpenAI API key)
    └── venv/           # Virtual environment (optional, should be in .gitignore)
```

## 🔧 Setup Instructions

### 1. Clone the repository

```bash
git clone https://your-repo-url.git
cd helpdesk-lite-ai/ai-middleware
```

### 2. Create and activate a virtual environment

```bash
python -m venv venv
# For Windows
venv\Scripts\activate
# For macOS/Linux
source venv/bin/activate
```

### 3. Install dependencies

```bash
pip install fastapi uvicorn openai python-dotenv
```

### 4. Create a `.env` file

Inside the `ai-middleware/` directory, add your OpenAI API key:

```
OPENAI_API_KEY=your_openai_api_key_here
```

### 5. Run the FastAPI server

```bash
uvicorn main:app --reload
```

The server will run at: [http://localhost:8000](http://localhost:8000)

## 🧪 API Usage

**Endpoint:** `/ask-ai`  
**Method:** `POST`  
**Request Body:**

```json
{
  "message": "How do I reset my password?"
}
```

**Response:**

```json
{
  "reply": "To reset your password, go to the settings page and click on 'Forgot Password'."
}
```

## 🧩 Frontend Integration

- CORS is already configured to allow requests from `http://localhost:3000`
- Built to work directly with the Helpdesk Lite React frontend chatbot panel

## ⚠️ Notes

- Do **not** commit the `.env` file or `venv/` folder to version control
- Ensure your OpenAI account has billing setup if you're using GPT-4
- You can switch to `gpt-3.5-turbo` in `main.py` if needed for cost efficiency

---

## 📬 License

This project is for educational or internal use. Customize and extend it as needed.
