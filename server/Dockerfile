FROM node:22-alpine

ENV NODE_ENV=production

WORKDIR /app/server

COPY server/package*.json ./
RUN npm ci --omit=dev

COPY server/src ./src
COPY server/supabase ./supabase
COPY server/.env.example ./.env.example

EXPOSE 5000

CMD ["npm", "start"]
