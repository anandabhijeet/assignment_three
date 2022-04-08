const fs = require("fs");
const http = require("http");

//async method for reading file
const readFilePro = async (file) => {
  return new Promise((resolve, reject) => {
    fs.readFile(file, "utf-8", (error, data) => {
      if (error) reject(error);

      console.log(data);
      resolve(JSON.parse(data));
    });
  });
};

//async fs method for writting file
const writeFilePro = async (file, data) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(file, data, (error) => {
      if (error) reject(error);

      console.log("success");
      resolve("success");
    });
  });
};

//creating server
const server = http.createServer((req, res) => {
  const pathname = req.url;
  const method = req.method;
  let found = false;

  //trying to write patch method
  if (pathname === "/:id" && method === "PATCH") {
    console.log(req.param.id);
    console.log("update");

    res.end("updating user details....");
  }
  //delete method
  else if (pathname === "/delete" && method === "DELETE") {
    var idData = "";
    req.on("data", (chunks) => {
      idData = idData + chunks;
    });

    req.on("end", async () => {
      const userDatabase = await readFilePro("./txt/database.json").catch(
        (err) => {
          console.log(err);
        }
      );

      const idDataObj = JSON.parse(idData);

      for (let i = 0; i < userDatabase.persons.length; i++) {
        if (userDatabase.persons[i].id === idDataObj.id) {
          userDatabase.persons.splice(i, 1);
          res.write(JSON.stringify("success"));
          res.end("success");
          found = true;
          break;
        }
      }

      if (found) {
        console.log(JSON.stringify(userDatabase, null, 2));
        fs.writeFile(
          "./txt/database.json",
          JSON.stringify(userDatabase, null, 2),
          (err) => {
            if (err) {
              console.log(err);
            }

            console.log(err);
          }
        );
      }
      if (!found) {
        console.log("invalid id");
        res.writeHead(200, { "content-type": "text/html" });
        res.write(JSON.stringify("Wrong id"));
        res.end("<h1>Invalid idl</h1>");
      }
    });
  }
  //login method
  else if (pathname === "/login" && method === "POST") {
    var userCredentials = "";
    req.on("data", (chunks) => {
      userCredentials = userCredentials + chunks;
    });

    req.on("end", async () => {
      const users = await readFilePro("./txt/database.json").catch((err) => {
        console.log(err);
      });

      console.log("users :" + users.persons.length);
      const newUserCredentials = JSON.parse(userCredentials);

      for (let i = 0; i < users.persons.length; i++) {
        if (
          users.persons[i].email === newUserCredentials.email &&
          users.persons[i].password === newUserCredentials.password
        ) {
          console.log("success");

          res.writeHead(200, { "content-type": "text/html" });
          res.write(JSON.stringify("success"));
          res.end("success");
          found = true;
          break;
        }
      }
      if (!found) {
        console.log("invalid credentials");
        res.writeHead(200, { "content-type": "text/html" });
        res.write(JSON.stringify("Error logging in"));
        res.end("<h1>Invalid Credential</h1>");
      }
    });
  }
  //register method
  else if (pathname === "/register" && method === "POST") {
    var newUser = "";
    req.on("data", (chunks) => {
      newUser = newUser + chunks;
    });

    req.on("end", async () => {
      const userData = await readFilePro("./txt/database.json").catch((err) => {
        console.log(err);
      });

      var newUserObj = JSON.parse(newUser);
      const userDatabase = await readFilePro("./txt/database.json").catch(
        (err) => {
          console.log(err);
        }
      );

      console.log(newUserObj);

      for (let i = 0; i < userData.persons.length; i++) {
        if (userData.persons[i].email == newUserObj.email) {
          console.log(newUserObj.email + " already exist");
          res.end("User already exist!!!");
          found = true;
        }
      }
      if (!found) {
        const newId =
          userDatabase.persons[userDatabase.persons.length - 1].id + 1;
        const newUserObject = Object.assign({ id: newId }, newUserObj);

        userDatabase.persons.push(newUserObject);
        console.log("users" + JSON.stringify(userDatabase, null, 2));

        await writeFilePro(
          "./txt/database.json",
          JSON.stringify(userDatabase, null, 2)
        ).catch((error) => {
          console.log(error);
        });

        res.end("success");
        res.end("new user found");
      }
    });
  }
});

server.listen(8000, "127.0.0.1", () => {
  console.log("Listening...");
});
