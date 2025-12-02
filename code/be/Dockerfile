# Sử dụng Python 3.10
FROM python:3.10-slim

# Thiết lập thư mục làm việc
WORKDIR /code

# Copy file cài đặt và cài thư viện trước
COPY ./requirements.txt /code/requirements.txt
RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

# Copy toàn bộ source code vào container
COPY ./app /code/app
COPY ./.env /code/.env
COPY ./scripts /code/scripts

# Copy startup script and sanitize line endings (handle Windows CRLF)
COPY docker-entrypoint.sh /code/docker-entrypoint.sh
# Ensure script has Unix line endings and is executable inside image
RUN sed -i 's/\r$//' /code/docker-entrypoint.sh && \
	chmod +x /code/docker-entrypoint.sh

# Lệnh chạy server (Hot reload enabled)
ENTRYPOINT ["/code/docker-entrypoint.sh"]