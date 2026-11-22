import http from "node:http";
import user from "./user.json" with { type: "json" };
import { randomUUID } from "node:crypto";

interface User {
  id?: string | number;
  name: string;
  email: string;
  role: string;
  createdAt: string | Date;
}
const PORT = 5000;
const users: User[] = user;

const getBody = async (req: import("node:http").IncomingMessage) => {
  let body = "";

  for await (const chunk of req) {
    body += chunk.toString();
  }

  return JSON.parse(body);
};

const userServer = http.createServer(async (req, res) => {
  if (req.method === "GET" && req.url === "/users") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(users));
    return;
  } else if (req.method === "POST" && req.url === "/create-users") {
    try {
      const body = await getBody(req);

      const newUser: User = {
        id: randomUUID(),
        name: body.name,
        email: body.email,
        role: body.role,
        createdAt: new Date().toISOString(),
      };

      users.push(newUser);

      res.writeHead(201);
      return res.end(
        JSON.stringify({
          message: "Created user successfully",
          data: newUser,
        }),
      );
    } catch (error) {
      console.error(error);

      res.writeHead(400);
      return res.end(
        JSON.stringify({
          message: "Failed to create new user",
        }),
      );
    }
  } else if (req.method === "PUT" && req.url === "/users") {
  } else if (req.method === "DELETE" && req.url === "/users") {
  } else {
    res.writeHead(500);
    res.end(JSON.stringify({ message: "method or url not found" }));
  }
});

userServer.listen(PORT, () => console.log("server is running on:", PORT));
