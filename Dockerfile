FROM python:3

WORKDIR /usr/src/app

COPY ./Pipfile.lock ./

RUN pip install pipenv

RUN pipenv install

RUN echo "0 0 1 * * /usr/src/app/cron.py" | crontab -

CMD ["pipenv", "run", "gunicorn"  , "-b", "0.0.0.0:8000", "wsgi:app"]