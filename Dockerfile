FROM python:3

WORKDIR /usr/src/app

COPY requirements.txt ./

RUN pip install --no-cache-dir -r requirements.txt

CMD ["gunicorn"  , "-b", "0.0.0.0:8000", "wsgi:app"]