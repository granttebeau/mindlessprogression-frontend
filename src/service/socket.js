
import io from "socket.io-client";

// export const socket = io('http://localhost:8000');
export const socket = process.env.NODE_ENV === "development" ? io('http://localhost:8000') : io('https://mindlessprogression-backend.herokuapp.com/');