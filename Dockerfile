FROM python:3

WORKDIR /usr/src/app

COPY ./Pipfile.lock ./

RUN pip install pipenv

RUN pipenv install

RUN apt-get update && apt-get -y install cron

# Copy hello-cron file to the cron.d directory
COPY  cron /etc/cron.d/cron
 
# Give execution rights on the cron job
RUN chmod 0644 /etc/cron.d/cron

# Apply cron job
RUN crontab /etc/cron.d/cron

CMD ["pipenv", "run", "gunicorn"  , "-b", "0.0.0.0:8000", "wsgi:app"]