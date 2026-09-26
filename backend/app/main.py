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
        "id": 1,
        "title": "CTF Shift APPens'26",
        "excerpt": "CSLab hosted the CTF Shift APPens'26 challenge for the DEI community. The event encouraged interest in cybersecurity, strengthened logical reasoning, and offered participants a hands-on experience in a dynamic and collaborative environment.",
        "author": "João R. Campos",
        "published": "May, 2026",
        "image": "/articles/ctf.png",
    },
    {
        "id": 2,
        "title": "CTF Trial Challenge for ShiftAppens",
        "excerpt": "We hosted a Capture The Flag (CTF) Trial Challenge as a warm-up event for the main competition at ShiftAppens. The challenge helped us test the resilience and security of the infrastructure. Although it featured fewer challenges than the main event, it still gave participants an opportunity to practise their hacking skills in a controlled environment.",
        "author": "João R. Campos",
        "published": "2025",
        "image": "/articles/trialshift25.png",
    },
    {
        "id": 3,
        "title": "CTF Shift APPens'25",
        "excerpt": "As part of our training and event initiatives, we organized a CTF competition at ShiftAppens, a 48-hour programming and entrepreneurship event where teams collaborated on innovative technology projects. The competition challenged participants with cybersecurity scenarios that strengthened their ethical hacking, vulnerability analysis, and security problem-solving skills. It included challenges for beginners and experienced participants, as well as a dedicated training environment with guided challenges and step-by-step tutorials.",
        "author": "João R. Campos",
        "published": "2025",
        "image": "/articles/shiftappens25.png",
    },
]


@app.get("/api/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/posts")
def list_posts() -> list[dict[str, str | int]]:
    return posts
