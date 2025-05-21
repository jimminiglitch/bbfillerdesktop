const path = require("path");
const fastify = require("fastify")({ logger: false });

// Serve static files from /public
fastify.register(require("@fastify/static"), {
  root: path.join(__dirname, "public"),
  prefix: "/"
});

// Enable form handling (for POST request bodies)
fastify.register(require("@fastify/formbody"));

// ===== ROUTES =====

// Login page as homepage
fastify.get("/", function (request, reply) {
  return reply.sendFile("login.html");
});

// Route for success screen
fastify.get("/success", function (request, reply) {
  return reply.sendFile("success.html");
});

// Route for failure screen
fastify.get("/glitch-fail", function (request, reply) {
  return reply.sendFile("glitch-fail.html");
});

// Routes for chapters
fastify.get("/chapter0", function (request, reply) {
  return reply.sendFile("chapter0.html");
});
fastify.get("/chapter1", function (request, reply) {
  return reply.sendFile("chapter1.html");
});
fastify.get("/chapter2", function (request, reply) {
  return reply.sendFile("chapter2.html");
});
fastify.get("/chapter3", function (request, reply) {
  return reply.sendFile("chapter3.html");
});

// Code verification logic
fastify.post("/verify-code", function (request, reply) {
  const code = request.body.code.trim().toUpperCase();
  if (code === "MAO") {
    return reply.redirect("/success");
  } else {
    return reply.redirect("/glitch-fail");
  }
});

// ===== START SERVER =====
fastify.listen({ port: process.env.PORT, host: "0.0.0.0" }, function (err, address) {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Your app is listening on ${address}`);
});
// Add this to the *end* of your server.js
fastify.setNotFoundHandler((req, reply) => {
  reply.code(404).type("text/html").send(`
    <html style="background:black; color:#ff1493; font-family:monospace;">
      <head><title>404 Not Found</title></head>
      <body style="text-align:center; padding-top:100px;">
        <h1>404 – RED ECHO</h1>
        <p>Reality fracture detected. Path not found.</p>
      </body>
    </html>
  `);
});
