import http from "node:http";
import user from "./user.json" with { type: "json" };

interface User {
  name: string;
  email: string;
  role: string;
  createdAt: string;
}
const PORT = 5000;
const users: User[] = user;
const userServer = http.createServer(async (req, res) => {
  if (req.method === "GET" && req.url === "/users") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(users, null, 2));
    return;
  } 
  else {
    res.end(JSON.stringify({ message: "method or url not found" }));
  }
});

userServer.listen(PORT, () => console.log("server is running on:", PORT));
