# Gupshap ChatApp Backend

Welcome to Gupshap Backend Repository! This repository is designed to provide an in-depth look on Backend Part of the Application, covering everything from its highlights to detailed setup instructions. Whether you're a developer looking to contribute, a user interested in the APIs, or just someone curious about the project, you'll find all the necessary information here😎.

## Table of Contents

1. [Project Highlights](#project-highlights)
2. [About Authors](#about-the-authors)
3. [Project Directory](#project-directory)
4. [Set UP Project](#set-up-project)
5. [APIs](#apis)
6. [Sockets](#socket)
7. [Support Us](#give-us-a-hand)
8. [Licence](#licence)

## Project Highlights

-   **Node.js**: A JavaScript runtime built on Chrome's V8 JavaScript engine.
-   **Express.js**: A fast, unopinionated, minimalist web framework for Node.js.
-   **MongoDB**: A NoSQL database for storing and retrieving data.
-   **Mongoose**: An ODM (Object Data Modeling) library for MongoDB and Node.js.
-   **Cookie Parser**: Middleware for parsing cookies attached to the client request object.
-   **CORS**: A middleware to enable Cross-Origin Resource Sharing in web applications.
-   **Dotenv**: A module to load environment variables from a .env file.
-   **Socket.io**: A library for real-time web applications.
-   **Bcrypt**: A library to help hash passwords.
-   **JSON Web Tokens (JWT)**: A compact, URL-safe means of representing claims to be transferred between two parties.
-   **Cloudinary**: A cloud service for managing images and videos.
-   **Multer**: A middleware for handling multipart/form-data, primarily for file uploads.
-   **Nodemon**: A tool that helps develop Node.js applications by automatically restarting the node application when file changes are detected.
-   **UUID**: A library to generate unique identifiers.

## About the Authors

### Atharva Sugandhi

Atharva Sugandhi is a proficient Full Stack Developer with a strong focus on MERN stack projects. He is deeply passionate about web development and problem-solving, always eager to tackle new challenges with his coding skills. Currently, he is in the final year of his Information Technology studies at the Institute of Engineering and Technology, DAVV, Indore.

**Let’s Connect:**

-   [LinkedIn](https://www.linkedin.com/in/atharva-sugandhi-391a4b225/)
-   [GitHub](https://github.com/Atom-Atharva)

---

### Raghav Kanungo

Raghav Kanungo is an enthusiastic developer dedicated to sharpening his skills to become an exceptional developer. He is currently in the final year of his Information Technology studies at the Institute of Engineering and Technology, DAVV, Indore. Raghav has a keen interest in problem-solving and is always looking for opportunities to learn and grow.

**Let’s Connect:**

-   [LinkedIn](https://www.linkedin.com/in/raghav-kanungo-362386247/)
-   [GitHub](https://github.com/Raghav-kanungo)

## Project Directory

```
│
├─── .env
├─── .gitingore
├─── package-lock.json
├─── package.json
├─── README.md
│
├─── public
│   └─── temp
│       └─── .gitkeep
│
└─── src
    ├─── app.js
    ├─── constants.js
    ├─── index.js
    ├─── server.js
    │
    ├─── controllers
    │   ├─── chat.controller.js
    │   └─── user.controller.js
    │
    ├─── db
    │   └─── index.js
    │
    ├─── middlewares
    │   ├─── auth.middleware.js
    │   └─── multer.middleware.js
    │
    ├─── models
    │   ├─── chat.model.js
    │   ├─── message.model.js
    │   ├─── request.model.js
    │   └─── user.model.js
    │
    ├─── routes
    │   ├─── chat.route.js
    │   └─── user.route.js
    │
    └─── utils
        ├─── ApiError.js
        ├─── ApiResponse.js
        ├─── asyncHandler.js
        ├─── cloudinary.js
        ├─── emitEvent.js
        └─── generateAccessAndRefreshToken.js

```

## Set Up Project

This guide will walk you through the steps necessary to set up the backend of the chat application on your local machine or server. Follow the instructions below to get started.

### Prerequisites

Before setting up the project, ensure that you have the following software installed on your machine:

-   **Node.js** (version 14 or above): [Download Node.js](https://nodejs.org/)
-   **npm** (Node Package Manager) or **yarn**: Typically installed with Node.js.
-   **MongoDB**: Ensure you have a running MongoDB instance. [Install MongoDB](https://docs.mongodb.com/manual/installation/)
-   **Git**: For cloning the repository. [Install Git](https://git-scm.com/downloads)

### Step 1: Clone the Repository

Open your terminal and execute the following commands to clone the repository and navigate into the project directory:

```bash
git clone https://github.com/Atom-Atharva/Gupshap-ChatApp-Backend.git
```

### Step 2: Install dependency

Install the required dependencies for the project using either npm or yarn.

Using npm:

```bash
npm i
```

or

Using yarn:

```bash
yarn i
```

### Step 3: Set Up Environment Variables

Create a .env file in the root directory of the project and configure the necessary environment variables. Use the provided .env.example file as a template.
Edit the .env file to include your configuration settings, such as:

#### Server Configuration

-   PORT=3000

#### MongoDB Configuration

-   MONGODB_URL=your_mongodb_url

#### JWT Configuration

-   JWT_SECRET=your_secret_key

#### Tokens and Expiry

-   REFRESH_TOKEN_SECRET=your_secret
-   REFRESH_TOKEN_EXPIRY=your_expiry
-   ACCESS_TOKEN_SECRET=your_secret
-   REFRESH_TOKEN_EXPIRY=your_expiry

#### Cloudinary config

-   CLOUDINARY_API_SECRET=your_secret
-   CLOUDINARY_API_KEY=your_api_key
-   CLOUDINARY_CLOUD_NAME

### Step 4: Start the Application

To start the backend server, use the following command:

```bash
npm start
```

or

```bash
yarn start
```

## APIs

APIs are devided into 2 types:

1. [User APIs](#user-apis)
2. [Chat APIs](#chat-apis)

### USER APIs

This includes apis related to user and its relations

USE ENDPOINT LIKE THIS : `backend_url/api/v1/users/api_end_point`

#### **Register**

**Endpoint:** `/register`  
**Method:** POST  
**Description:** Registers a new user.

**Request Body:**

```json
{
    "email": "user@example.com",
    "name": "name",
    "password": "password",
    "avatar": "avatarFile"
}
```

_Note: The avatar file should be sent as a multipart/form-data._

#### **Login**

**Endpoint:** `/login`  
**Method:** POST  
**Description:** Authenticates a user.

**Request Body:**

```json
{
    "email": "user@example.com",
    "password": "password"
}
```

#### **Logout**

**Endpoint:** `/logout`  
**Method:** POST  
**Description:** Logs out the authenticated user.

**Headers:**

```
Authorization: Bearer <JWT Token>
```

#### **Get All Users**

**Endpoint:** `/getAllUser`  
**Method:** GET  
**Description:** Retrieves a list of all users.

**Headers:**

```
Authorization: Bearer <JWT Token>
```

#### **Get My Profile**

**Endpoint:** `/getMyProfile`  
**Method:** GET  
**Description:** Retrieves the profile of the authenticated user.

**Headers:**

```
Authorization: Bearer <JWT Token>
```

#### **Get My Friends**

**Endpoint:** `/getMyFriends`  
**Method:** GET  
**Description:** Retrieves the friend list of the authenticated user.

**Headers:**

```
Authorization: Bearer <JWT Token>
```

#### **Get My Notifications**

**Endpoint:** `/getMyNotifications`  
**Method:** GET  
**Description:** Retrieves the notifications for the authenticated user.

**Headers:**

```
Authorization: Bearer <JWT Token>
```

#### **Send Friend Request**

**Endpoint:** `/sendFriendRequest`  
**Method:** POST  
**Description:** Sends a friend request to another user.

**Headers:**

```
Authorization: Bearer <JWT Token>
```

**Request Body:**

```json
{
    "reciever": "friendUserId"
}
```

#### **Accept Friend Request**

**Endpoint:** `/acceptFriendRequest`  
**Method:** POST  
**Description:** Accepts a friend request from another user.

**Headers:**

```
Authorization: Bearer <JWT Token>
```

**Request Body:**

```json
{
    "accept": "true/false",
    "sender": "sendersUserId",
    "requestId": "friendRequestId"
}
```

### **Third-Party Authentication**

#### **Google Authentication**

**Endpoint:** `/auth/google`  
**Method:** POST  
**Description:** Authenticates a user via Google OAuth2.

**Request Body:**

```json
{
    "code": "authorizationCode"
}
```

#### **GitHub Authentication**

**Endpoint:** `/auth/github`  
**Method:** POST  
**Description:** Authenticates a user via GitHub OAuth2.

**Request Body:**

```json
{
    "code": "authorizationCode"
}
```

---

---

### CHAT APIs

This includes APIs related to Chat Application and Functioning.

USE ENDPOINT LIKE THIS : `backend_url/api/v1/chat/api_end_point`

### **New Group**

---

**Endpoint:** `/new-group`

**Method:** `POST`

**Description:** Creates a new group chat.

**Headers:**

```
Authorization: Bearer <JWT Token>
```

**Request Body:**

```json
{
    "name": "New Group",
    "members": ["user1@example.com", "user2@example.com"],
    "avatar": "avatarfile"
}
```

### **Get My Chats**

---

**Endpoint:** `/my-chat`

**Method:** `GET`

**Description:** Retrieves a list of the user’s chats.

**Headers:**

```
Authorization: Bearer <JWT Token>
```

### **Get My Groups**

---

**Endpoint:** `/my-chat/groups`

**Method:** `GET`

**Description:** Retrieves a list of the user’s group chats.

**Headers:**

```
Authorization: Bearer <JWT Token>
```

### **Add Members**

---

**Endpoint:** `/add-members`

**Method:** `PUT`

**Description:** Adds new members to a group chat.

**Headers:**

```
Authorization: Bearer <JWT Token>
```

**Request Body:**

```json
{
    "chatId": "12345",
    "member": ["user1@example.com", "user2@example.com"]
}
```

### **Remove Members**

---

**Endpoint:** `/remove-member`

**Method:** `PUT`

**Description:** Removes members from a group chat.

**Headers:**

```
Authorization: Bearer <JWT Token>
```

**Request Body:**

```json
{
    "chatId": "12345",
    "userId": "user@example.com"
}
```

### **Leave Group**

---

**Endpoint:** `/leave-group/:id`

**Method:** `DELETE`

**Description:** Removes the current user from a group chat.

**Headers:**

```
Authorization: Bearer <JWT Token>
```

### **Change Group Picture**

---

**Endpoint:** `/changeGroupPicture/:id`

**Method:** `PUT`

**Description:** Changes the picture of a group chat.

**Headers:**

```
Authorization: Bearer <JWT Token>
```

**Request Body:**

```json
{
    "avatar": "avatarfile"
}
```

### **Rename Group**

---

**Endpoint:** `/renameGroup/:id`

**Method:** `PUT`

**Description:** Renames a group chat.

**Headers:**

```
Authorization: Bearer <JWT Token>
```

**Request Body:**

```json
{
    "name": "New Group Name"
}
```

### **Send Attachments**

---

**Endpoint:** `/send-attachments`

**Method:** `POST`

**Description:** Sends multiple attachments in a chat.

**Headers:**

```
Authorization: Bearer <JWT Token>
```

**Request Body:**

```json
{
    "files": "An array of files (up to 5)"
}
```

### **Get Chat Details**

---

**Endpoint:** `/get-chat-details/:id`

**Method:** `GET`

**Description:** Retrieves details of a specific chat by its ID.

**Headers:**

```
Authorization: Bearer <JWT Token>
```

### **Get Messages**

---

**Endpoint:** `/get-message/:id`

**Method:** `GET`

**Description:** Retrieves messages from a specific chat by its ID.

**Headers:**

```
Authorization: Bearer <JWT Token>
```

---

## Socket

Socket.IO enables real-time, bidirectional communication between web clients and servers. In Gupshap ChatApp, it manages chat messages, user connections, and other real-time interactions to create a seamless and interactive user experience.

### Socket.io Setup

The Socket.IO server is initialized alongside the HTTP server created using Express. The setup includes CORS configuration to allow cross-origin requests from specified origins:

```js
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.CORS_ORIGIN,
        credentials: true,
    },
    // FOR DEVELOPMENT USE
    // cors: {
    //     origin: process.env.CORS_ORIGIN_DEVELOPMENT,
    //     credentials: true,
    // },
});
const userSocketIDs = new Map();
```

### Middleware

#### JWT Verification

The verifyJWTSocket middleware function authenticates socket connections using JSON Web Tokens (JWT). This ensures that only authorized users can establish socket connections:

```js
io.use(verifyJWTSocket);
```

### Events

#### Connection

The `CONNECTION` event is triggered when a user connects. The user's socket ID is stored in the `userSocketIDs` map, associating it with the user's ID:

```js
io.on(CONNECTION, (socket) => {
    console.log("User Connected", socket.id);

    // Associate socket ID with user ID
    userSocketIDs.set(socket.user._id.toString(), socket.id);
});
```

#### New Message

The `NEW_MESSAGE` event is triggered when a user sends a new message. The event handler performs the following steps:

-   Validates the chat ID.
-   Creates a real-time message object.
-   Identifies other online members in the chat.
-   Emits the new message to the identified members.
-   Saves the message to the database.

#### Disconnect

The `DISCONNECT` event is triggered when a user disconnects. The user's socket ID is removed from the `userSocketIDs` map:

```js
socket.on(DISCONNECT, () => {
    console.log(`User ${socket.id} got Disconnected!`);
    userSocketIDs.delete(socket.user._id.toString());
});
```

### Future Features

Planned enhancements include:

-   **Typing Indicators:** Events to indicate when a user is typing (START_TYPING and STOP_TYPING).
-   **Read Receipts:** Events to mark messages as read.

---

---

## Give Us a Hand!

This project wouldn't be flying high without some awesome peeps behind the scenes. Here's how you can join the crew:

-   **Slap a ⭐ on this repo:** Like a virtual high five for our hard work (and totally helps us get noticed!).
-   **Spill the tea (good kind!):** Feedback and ideas are always welcome. Open an issue or a pull request to join the party.
-   **Spread the word:** Share this project with your coding crew or tweet it out to the world (we won't judge your memes ).

Basically, anything you do to keep this project soaring is epic!
