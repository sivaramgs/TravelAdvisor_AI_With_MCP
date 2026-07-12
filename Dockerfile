FROM python:3.12-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV UV_COMPILE_BYTECODE=1
ENV UV_LINK_MODE=copy

RUN apt-get update && apt-get install -y \
    build-essential \
    git \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /usr/local/bin/

# Copy dependency files first for better layer caching
COPY pyproject.toml uv.lock ./

# Install dependencies only (not the project itself yet)
RUN uv sync --frozen --no-install-project --no-dev

# Now copy the rest of the app
COPY . .

# Install the project itself
RUN uv sync --frozen --no-dev

# Make the venv's binaries available on PATH
ENV PATH="/app/.venv/bin:$PATH"

EXPOSE 8000

# Use shell form so $PORT is expanded at runtime (Render sets this dynamically)
CMD uvicorn app:app --host 0.0.0.0 --port $PORT