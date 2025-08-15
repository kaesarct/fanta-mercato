FROM python:3.12-slim

WORKDIR /app

COPY ./requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt debugpy

COPY ./app /app/app

# Comando per il debug
CMD ["python", "-Xfrozen_modules=off", "-m", "debugpy", "--listen", "0.0.0.0:5678", "--wait-for-client", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]