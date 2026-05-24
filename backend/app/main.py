from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import router
from app.auth.routes import (
    router as auth_router
)
from app.users.routes import (
    router as users_router
)
from app.notes.routes import (
    router as notes_router
)


app = FastAPI(
    title="Notes DevOps API",
    version="1.0.0"
)

# CORS Configuration
# Allows frontend (running on different port/container) to make requests
# In production, restrict to specific domain
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production: ["https://yourdomain.com"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(router)
app.include_router(auth_router)
app.include_router(users_router)
app.include_router(notes_router)