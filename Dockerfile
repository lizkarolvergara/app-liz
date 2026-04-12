FROM node:18

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]

#conectar con health deck del pipeline

HEALTHCHECK --interval=10s --timeout=5s CMD curl -f http://localhost:3000/ || exit 1  

