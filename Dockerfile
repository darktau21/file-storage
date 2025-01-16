FROM node:22 AS build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

FROM node:22 AS development

WORKDIR /app

COPY --from=build /app .

RUN npm install --only=development

CMD ["npm", "run", "dev"]

FROM node:22 AS production

WORKDIR /app

COPY --from=build /app .

RUN npm install --only=production

CMD ["node", "dist/index.js"]  # Adjust the entry point as needed