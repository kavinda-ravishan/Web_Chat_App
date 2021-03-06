const router = require("express").Router();
const os = require("os");
const authAdmin = require("../utility/checkAuthenticated").authAdmin;
const Messages = require("../utility/socketIO").Messages;
const Message = require("../model/message");

router.get("/sys", authAdmin, (_req, res) => {
  res.end(
    `CPUs : ${os.cpus()[0].model}, Freemem : ${
      os.freemem / 1000000000
    } GB, Total Mem : ${os.totalmem / 1000000000} GB, Uptime : ${
      os.uptime / 3600
    } Hrs, Version : ${os.version}`
  );
});

router.get("/clc", authAdmin, (_req, res) => {
  Message.deleteMany({}, function (_err, _noMessages) {});
  Messages.length = 0;
  res.end("Messages removed.");
});

module.exports = router;
