import os
from collections.abc import Iterator

import psycopg
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError(
        "DATABASE_URL is not configured. Copy .env.example to .env and set the PostgreSQL password."
    )


def get_connection() -> Iterator[psycopg.Connection]:
    with psycopg.connect(DATABASE_URL) as connection:
        yield connection
