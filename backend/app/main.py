from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Blog API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

posts = [
    {
        "id": index,
        "title": "CTF Shift APPens'26",
        "excerpt": "CSLab (Cybersecurity Lab) is excited to announce a Capture The Flag (CTF) challenge for the DEI community. This event is designed to spark interest in cybersecurity, stimulate logical reasoning and provide a hands-on experience in a dynamic and collaborative environment.",
        "author": "João R. Campos",
        "published": "May, 2026",
    }
    for index in range(1, 7)
]


@app.get("/api/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/posts")
def list_posts() -> list[dict[str, str | int]]:
    return posts
