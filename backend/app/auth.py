import secrets

from pwdlib import PasswordHash

password_hash = PasswordHash.recommended()

TOKEN_BYTES = 32


def hash_password(password: str) -> str:
    return password_hash.hash(password)


def verify_password(password: str, stored_hash: str) -> bool:
    return password_hash.verify(password, stored_hash)


def generate_access_token() -> str:
    return secrets.token_urlsafe(TOKEN_BYTES)


def extract_bearer_token(authorization: str | None) -> str | None:
    if not authorization:
        return None

    scheme, separator, credentials = authorization.partition(" ")
    if not separator or scheme.lower() != "bearer":
        return None

    return credentials.strip() or None
