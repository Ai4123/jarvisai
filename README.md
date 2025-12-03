#  Jarvis – AI Service Desk Agent

**Live Deployment:** [https://jarvis-client.onrender.com](https://jarvis-client.onrender.com)

Jarvis is a fully functional **RAG-based AI Service Desk Agent** built using **N8N, Supabase, Google Drive, Cohere embeddings, and Google Gemini**.
It supports **authenticated chat**, **RAG answers**, **ticket creation**, **feedback logging**, **survey collection**, and **complete chat history persistence**.

This project contains the **frontend (React)** and integrates with **multiple N8N workflows** acting as the backend logic.

---

##  **Core Features**

###  1. User Authentication (JWT)

* Users log in and receive a signed **JWT token**.
* All chat, feedback, and survey routes are **JWT-protected**.

###  2. RAG-based Chat Agent

* Uses **Supabase Vector Store** + **Cohere embeddings**.
* Retrieves relevant knowledge base documents from Google Drive ingested files.
* Ensures **no hallucinations** by restricting answers to the RAG context.

###  3. Multi-turn Conversations

* Chat history stored per user.
* Allows continuing a chat even after page refresh.

###  4. Automatic Ticket Creation

Tickets are created when:

* User explicitly says **"create a ticket"**
* Issue is unresolved after **5 bot replies**
* RAG confidence < 0.4 (“KB insufficient”)
* User says issue is **resolved** → ticket created with status *resolved*

Each ticket contains:

* Title
* Description
* Full chat transcript
* Category
* Priority
* Status

###  5. Feedback System

Frontend sends **thumbs-up/down** for every bot message.
Stored in Supabase for analytics.

###  6. Customer Satisfaction Survey

After ticket closure, user can submit:

* Rating (1–5)
* Optional comments

Saved in Supabase.

###  7. Automatic KB Updating

A separate workflow watches a **Google Drive folder (“RAG documents”)**, and whenever a file is added:

* File is downloaded
* Text extracted
* Embeddings generated
* Stored in Supabase

You get **automatic knowledge base updates** with no coding.

---

# 🧩 **System Architecture**

```
Frontend (React)
      |
      V
N8N Workflows (Backend-as-Automation)
      |
      |-- JWT Authentication Workflow
      |-- Chat Workflow (RAG + Ticketing)
      |-- Google Drive Vector Ingestion Workflow
      |-- Feedback Workflow
      |-- Survey Workflow
      |
Supabase (Database + Vector Store)
Google Drive (Documents)
Cohere (Embeddings)
Google Gemini (LLM)
Gmail API (Email Ticket Alerts)
```

---

# ⚙️ **Tech Stack**

### **Frontend**

* React + Vite
* Tailwind CSS
* Context API (Auth + Chat Store)
* Render deployment

### **Backend (N8N Workflows)**

* JWT authentication
* RAG agent using LangChain nodes
* Supabase DB operations
* Google Drive triggers
* Gmail API for emails
* Conditional + Code nodes for logic

### **Databases & Storage**

* Supabase tables:

  * chats
  * messages
  * tickets
  * feedback
  * survey_responses
  * documents (vector store)

---

# 🔗 **N8N Workflows Included**

### 1️⃣ JWT Authentication

Issues JWT tokens and returns them to frontend.

### 2️⃣ Chat Workflow

* Validates JWT
* Loads/creates chat sessions
* Stores messages
* Builds context
* RAG retrieval + Gemini
* CONTROL parsing
* Escalation logic (5 replies)
* Ticket creation & closing chat
* Email notification

### 3️⃣ Supabase Vector Ingestion

Listens to Google Drive folder → extracts PDF → pushes to vector DB.

### 4️⃣ Feedback Workflow

Stores thumbs-up/down rating.

### 5️⃣ Survey Workflow

Stores post-ticket user survey.

---

# 🎯 **Final Deliverables Included**

* Fully working frontend
* Complete N8N backend workflows
* Automated RAG ingestion system
* Ticketing logic
* Feedback + Survey
* Detailed PDF documentation
* This README
