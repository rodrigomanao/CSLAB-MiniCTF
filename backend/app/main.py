from collections.abc import Iterator

import psycopg
from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field

from .auth import hash_password, verify_password
from .database import get_connection

app = FastAPI(title="CS-Lab API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
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


class RegisterRequest(BaseModel):
    username: str = Field(min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class LoginRequest(BaseModel):
    identity: str = Field(min_length=1, max_length=255)
    password: str = Field(min_length=1, max_length=128)


class UserResponse(BaseModel):
    id: int
    username: str
    email: EmailStr
    role: str


def get_db() -> Iterator[psycopg.Connection]:
    yield from get_connection()


@app.get("/api/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/posts")
def list_posts() -> list[dict[str, str | int]]:
    return posts


@app.post("/api/auth/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register_user(payload: RegisterRequest, db: psycopg.Connection = Depends(get_db)) -> UserResponse:
    try:
        with db.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO users (username, email, password_hash)
                VALUES (%s, %s, %s)
                RETURNING id, username, email, role
                """,
                (payload.username, payload.email, hash_password(payload.password)),
            )
            user = cursor.fetchone()
    except psycopg.errors.UniqueViolation as error:
        raise HTTPException(status_code=409, detail="Username or email is already registered.") from error

    if user is None:
        raise HTTPException(status_code=500, detail="User could not be created.")
    return UserResponse(id=user[0], username=user[1], email=user[2], role=user[3])


@app.post("/api/auth/login", response_model=UserResponse)
def login_user(payload: LoginRequest, db: psycopg.Connection = Depends(get_db)) -> UserResponse:
    with db.cursor() as cursor:
        cursor.execute(
            """
            SELECT id, username, email, password_hash, role
            FROM users
            WHERE username = %s OR email = %s
            """,
            (payload.identity, payload.identity),
        )
        user = cursor.fetchone()

    if user is None or not verify_password(payload.password, user[3]):
        raise HTTPException(status_code=401, detail="Invalid username/email or password.")
    return UserResponse(id=user[0], username=user[1], email=user[2], role=user[4])
