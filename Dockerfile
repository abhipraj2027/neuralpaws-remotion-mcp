FROM node:20-slim

# Install Chromium for Remotion rendering
RUN apt-get update && apt-get install -y \
  chromium \
  fonts-liberation \
  fonts-noto-color-emoji \
  fonts-dejavu-core \
  fonts-freefont-ttf \
  --no-install-recommends \
  && rm -rf /var/lib/apt/lists/*

# Set Chromium path for Remotion
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
ENV REMOTION_CHROME_EXECUTABLE=/usr/bin/chromium

WORKDIR /app

# Copy package files
COPY package.json ./
RUN npm install --production

# Copy source
COPY src/ ./src/

# Create output directory
RUN mkdir -p /app/out

# Expose port
EXPOSE 3100

# Health check
HEALTHCHECK --interval=30s --timeout=5s CMD curl -f http://localhost:3100/health || exit 1

CMD ["node", "src/server/index.js"]
