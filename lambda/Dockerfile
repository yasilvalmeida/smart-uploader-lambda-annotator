FROM public.ecr.aws/lambda/python:3.9

# Copy requirements file
COPY requirements.txt .

# Install dependencies
RUN pip install -r requirements.txt

# Copy function code
COPY . .

# Set the CMD to your handler
CMD ["handler.process_image"] 