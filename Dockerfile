FROM node:20

WORKDIR /app
# optional but recommended - sets working directory of container to /app directory within container, any command we run will be run from here e.g. node index.js command; any files copied to container will also be sent here by default.

COPY package.json .

ARG NODE_ENV

# Install dependencies (at build time)
# RUN npm install
# RUN npm install nodemon
RUN if [ "NODE_ENV" = "production" ] ; then npm install --only=production; else npm install ; fi
# NODE_ENV is an argument that gets passed in, so we define it above.

COPY . ./ 
# . or ./ both work.
# Why split COPY into 2 steps? When one creates an image, it takes each of these steps and treats as a layer of an image. After each layer, Docker caches the result of each layer, i.e. when we run 'docker build' for the first time, it will run the first step and cache the result, and so on. If we decide to rebuild the image, Docker is efficient, it will take the final cached result of Step 5 and provide that.
# During dev process, package.json doesn't change very often... For the most part the source code changes, so by splitting it up into different steps, we cache each of these layers. Otherwise anytime we changed source code, it would also rerun COPY package.json and RUN npm install.

# Default value
ENV PORT=3000

# Our container will expose port 3000.
EXPOSE $PORT
# We're exposing the port, so we should be able to access it right? WRONG. This line has no impact and is solely for documentation purposes. By default, Docker containers can talk to the outside world (Internet and other devices in our host network). By default, the outside world (including our local host machine) cannot talk to our Docker container.

# When we start container, what command to run (at runtime)
CMD ["node", "index.js"]
