# CS628_PetSupplies_TeamProject
CS628 Team Project for hypothetical pet supplies company

# Server Side (Backend)

## Navigate to Server(Backend) Folder

```bash
cd server
```

## Install Dependencies

```bash
npm install
```
## Generate JWT_SECRET

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## env file example
```bash
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster_url>/<database_name>?retryWrites=true&w=majority&appName=<DB_Cluster>
PORT=<port_number>
JWT_SECRET=<paste-the-generated-string-here>
```
## Run Migration for Database
```bash
node run-migration.js
```

## Seed Admin Users
```bash
node seedAdmins.js
```

## Run Local Developement (Server Side)

```bash
node App.js
```
# Client Side (Frontend)

## Navigate to Client(Frontend) Folder

```bash
cd client
```

## Install Dependencies

```bash
npm install
```

## Run Local Development (Client Side)

```bash
npm start
```