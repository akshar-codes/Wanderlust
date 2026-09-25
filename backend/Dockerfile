FROM node:24.16.0-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev && mkdir -p logs && chown node:node logs
COPY --chown=node:node . .
ENV NODE_ENV=production
EXPOSE 8080
USER node
CMD ["npm", "start"]
