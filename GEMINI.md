# WEEZY AI BANK - MERGED SYSTEM

Unified platform combining the **Weezy Core Banking System (CBS)** with the **AI Agent Management & Workflow Orchestration Platform**.

## 📂 Project Structure

- `/backend`: FastAPI (Python) based Core Banking and AI Orchestration.
  - `weezy_cbs/`: Modular banking core.
  - `weezy_cbs/ai_automation_layer/`: AI models, agents, and workflow engine.
- `/frontend`: Vite + React + TypeScript + shadcn/ui.
  - Modern dashboard for users, bankers, and admins.

## 🚀 Core Principles

1.  **AI-First Orchestration**: Every banking process (loans, onboarding, fraud) can be defined as a workflow orchestrated by AI agents or human checkers.
2.  **Modular Core**: The banking engine is strictly modular, allowing independent scaling of modules like ledger, loans, or cards.
3.  **Regulatory Compliance**: Built-in support for Nigerian banking standards (CBN, BVN, NIN).

## 🛠 Tech Stack

- **Backend**: Python 3.9+, FastAPI, SQLAlchemy (PostgreSQL), Pydantic.
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui.
- **Database**: PostgreSQL (shared between Core Banking and AI Orchestration).

## 📜 Development Guidelines

- **UUIDs for AI Layer**: All AI-related entities (Workflows, Runs, Tasks, Agents) MUST use UUIDs for primary keys to ensure consistency with the frontend.
- **Service Layer**: Business logic must reside in `services.py` within each module.
- **API Versioning**: All endpoints should follow `/api/v1/` prefixing.
- **Maker-Checker**: Use the workflow engine to implement Maker-Checker controls for sensitive operations.
