FROM python:3

WORKDIR /usr/src/app

# COPY requirements.txt ./

COPY . ./

RUN pip install pipenv

RUN pipenv install

# RUN pip install --no-cache-dir -r requirements.txt

CMD ["pipenv", "run", "gunicorn"  , "-b", "0.0.0.0:8000", "wsgi:app"]