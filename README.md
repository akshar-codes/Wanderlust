# AirNook 🌍

AirNook is a production-style full-stack web application that allows users to explore travel listings, upload images, post reviews, and manage content securely using authentication and authorization.

---

## 🚀 Features

- User authentication & authorization (Passport.js)
- Role-based access control (owner / author checks)
- Create, edit, delete travel listings
- Review system with ownership validation
- Image upload & management using Cloudinary
- Secure session handling with MongoDB session store
- Server-side validation using Joi
- Centralized error handling
- MVC-based scalable project structure

---

## 🛠 Tech Stack

**Backend**

- Node.js
- Express.js
- MongoDB & Mongoose
- Passport.js (Local Strategy)
- Joi (validation)

**Frontend**

- EJS
- CSS
- Vanilla JavaScript

**Other Tools**

- Cloudinary (image storage)
- Multer (file uploads)
- MongoDB Atlas
- Express Session + Connect-Mongo

---

## 📂 Project Structure

```bash
src/
├── app.js
├── server.js
│
├── config/
│   ├── cloudConfig.js
│   └── passport.js
│
├── controllers/
├── routes/
├── models/
├── middlewares/
├── validators/
├── utils/
├── seeds/
├── public/
└── views/

```

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory and add:

```bash
PORT=8080
MONGO_URL=your_mongodb_connection_string
SESSION_SECRET=your_session_secret
ADMIN_PASS=your_admin_password
CLOUD_NAME=your_cloudinary_name
CLOUD_API_KEY=your_cloudinary_key
CLOUD_API_SECRET=your_cloudinary_secret
MAP_TOKEN=your_map_token
```

---

## 🧪 Database Seeding (Optional)

Initialize the database with sample listings, reviews, and an admin user:

```bash
npm install
node src/seeds/index.js
node src/server.js
```

Visit: `http://localhost:8080`
