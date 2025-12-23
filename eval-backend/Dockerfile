# ---------- Base image ----------
FROM node:18-slim

# ---------- App directory ----------
WORKDIR /app

# ---------- Runtime directories ----------
RUN mkdir -p /app/uploads

# ---------- Node dependencies ----------
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# ---------- App source ----------
COPY . .

# ---------- Runtime configuration ----------
ENV NODE_ENV=production
EXPOSE 5001

# ---------- Start server ----------
CMD ["node", "src/server.js"]
