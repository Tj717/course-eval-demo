FROM node:22.14.0

WORKDIR /eval-frontend
COPY package*.json ./
RUN npm install
COPY . .

EXPOSE 5173
CMD ["npm", "run", "dev"]
VOLUME ["/eval-frontend/node_modules"]
