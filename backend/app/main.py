from collections.abc import Iterator

import psycopg
from fastapi import Depends, FastAPI, HTTPException, Request, status
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

class AdminLoginRequest(BaseModel):
    username: str = Field(min_length=1, max_length=255)
    pin: str = Field(min_length=4, max_length=4)

class UserResponse(BaseModel):
    id: int
    username: str
    email: EmailStr
    role: str

class PageCreateRequest(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    html: str = Field(min_length=1, max_length=200_000) 
    author: str = Field(min_length=1, max_length=100)
    published: str = Field(min_length=1, max_length=50)
    image: str = Field(default="", max_length=500)

class PageResponse(BaseModel):
    id: int
    title: str
    excerpt: str
    author: str
    published: str
    image: str

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
                INSERT INTO users (username, email, password_hash, pin)
                VALUES (%s, %s, %s, NULL)
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

@app.post("/api/auth/admin-login", response_model=UserResponse)
def admin_login(payload: AdminLoginRequest, db: psycopg.Connection = Depends(get_db)) -> UserResponse:
    with db.cursor() as cursor:
        # Nota: Precisas de garantir que a tabela 'users' tem a coluna 'pin'.
        cursor.execute(
            """
            SELECT id, username, email, role, pin
            FROM users
            WHERE username = %s
            """,
            (payload.username,)
        )
        user = cursor.fetchone()

    if user is None or user[4] != payload.pin:
        raise HTTPException(status_code=401, detail="Credenciais inválidas.")

    if user[3] != 'admin':
        raise HTTPException(status_code=403, detail="Acesso negado. A conta não possui privilégios de Administrador.")

    return UserResponse(id=user[0], username=user[1], email=user[2], role=user[3])

@app.get("/api/user", response_model=UserResponse)
def get_user_by_id(
    id: int,
    db: psycopg.Connection = Depends(get_db),
) -> UserResponse:
    with db.cursor() as cursor:
        cursor.execute(
            "SELECT id, username, email, role FROM users WHERE id = %s",
            (id,),
        )
        user = cursor.fetchone()

    if user is None:
        raise HTTPException(status_code=404, detail="User not found.")

    return UserResponse(id=user[0], username=user[1], email=user[2], role=user[3])

@app.post("/api/pages", response_model=PageResponse, status_code=status.HTTP_201_CREATED)
def create_page(payload: PageCreateRequest, db: psycopg.Connection = Depends(get_db)) -> PageResponse:
    with db.cursor() as cursor:
        cursor.execute(
            """
            INSERT INTO pages (title, html, author, published, image)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING id, title, html, author, published, image
            """,
            (payload.title, payload.html, payload.author, payload.published, payload.image),
        )
        row = cursor.fetchone()

    if row is None:
        raise HTTPException(status_code=500, detail="Page could not be created.")
    return PageResponse(id=row[0], title=row[1], excerpt=row[2], author=row[3], published=row[4], image=row[5])


@app.get("/api/pages", response_model=list[PageResponse])
def list_pages(db: psycopg.Connection = Depends(get_db)) -> list[PageResponse]:
    with db.cursor() as cursor:
        cursor.execute(
            """
            SELECT id, title, html, author, published, image
            FROM pages
            ORDER BY created_at DESC
            """
        )
        rows = cursor.fetchall()

    return [
        PageResponse(id=r[0], title=r[1], excerpt=r[2], author=r[3], published=r[4], image=r[5])
        for r in rows
    ]