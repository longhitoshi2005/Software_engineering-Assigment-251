# Sử dụng Python 3.10
FROM python:3.10-slim

# Thiết lập thư mục làm việc
WORKDIR /code

# Copy file cài đặt và cài thư viện trước (để tận dụng cache của Docker)
COPY ./requirements.txt /code/requirements.txt
RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

# Copy toàn bộ source code vào container
COPY ./app /code/app
COPY ./.env /code/.env
COPY ./tests /code/tests

# Lệnh chạy server (Hot reload enabled)
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]