# Dockerfile for Next.js Frontend
FROM node:18

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json files
COPY ./package.json ./package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the Next.js application
RUN npm run build

# Expose the application on port 3000
EXPOSE 3000

# Command to run the application
CMD ["npm", "start"]
