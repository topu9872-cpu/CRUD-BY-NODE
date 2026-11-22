import http from "node:http";
import { randomUUID } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

interface User {
  id?: string | number;
  name: string;
  email: string;
  role: string;
  createdAt?: string | Date;
}
const PORT = 5000;

const FILE_PATH = path.join(process.cwd(), "user.json");

const getBody = async (req: import("node:http").IncomingMessage) => {
  let body = "";

  for await (const chunk of req) {
    body += chunk.toString();
  }

  return JSON.parse(body);
};

const getUsers = async (): Promise<User[]> => {
  try {
    const data = await readFile(FILE_PATH, "utf-8");

    return JSON.parse(data) as User[];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      await writeFile(FILE_PATH, "[]", "utf-8");
      return [];
    }

    throw error;
  }
};

const saveUsers = async (users: User[]) => {
  await writeFile(FILE_PATH, JSON.stringify(users), "utf-8");
};

const userServer = http.createServer(async (req, res) => {
  if (req.method === "GET" && req.url === "/users") {
    try {
      const users = await getUsers();

      res.writeHead(200, {
        "Content-Type": "application/json",
      });

      return res.end(
        JSON.stringify({
          message: "Users fetched successfully",
          total: users.length,
          data: users,
        }),
      );
    } catch (error) {
      console.error("GET users error:", error);

      res.writeHead(500, {
        "Content-Type": "application/json",
      });

      return res.end(
        JSON.stringify({
          message: "Failed to fetch users",
        }),
      );
    }
  } else if (req.method === "POST" && req.url === "/create-users") {
    try {
      const body = await getBody(req);

      const users = await getUsers();

      const newUser: User = {
        id: randomUUID(),
        name: body.name,
        email: body.email,
        role: body.role,
        createdAt: new Date().toISOString(),
      };

      users.push(newUser);

      await saveUsers(users);

      res.writeHead(201);

      return res.end(
        JSON.stringify({
          message: "User created successfully",
          data: newUser,
        }),
      );
    } catch (error) {
      console.error(error);

      res.writeHead(400);

      return res.end(
        JSON.stringify({
          message: "Failed to create user",
        }),
      );
    }
  } else if (req.method === "PUT" && req.url?.startsWith("/update-users/")) {
    try {
      const id = req.url.split("/")[2];
      const body = await getBody(req);
      const users = await getUsers();
      const userIndex = users.findIndex((user) => user.id === id);

      if (userIndex === -1) {
        res.writeHead(404);
        return res.end(
          JSON.stringify({
            message: "user not found",
          }),
        );
      }

      const updateUser: User = {
        ...users[userIndex],
        name: body.name,
        email: body.email,
        role: body.role,
      };
      users[userIndex] = updateUser;
      await saveUsers(users);
      res.writeHead(200);
      return res.end(
        JSON.stringify({
          message: "User updated successfully",
          data: updateUser,
        }),
      );
    } catch (error: any) {
      console.error(error);
      res.writeHead(500);
      return res.end(
        JSON.stringify({
          message: "update to fail user",
          data: error.message,
        }),
      );
    }
  } else if (req.method === "DELETE" && req.url === "/delete-users") {
  } else {
    res.writeHead(500);
    res.end(JSON.stringify({ message: "method or url not found" }));
  }
});

userServer.listen(PORT, () => console.log("server is running on:", PORT));
