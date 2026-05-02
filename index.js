const { Server } = require('@colyseus/core');
const { WebSocketTransport } = require('@colyseus/ws-transport');
const express = require('express');
const http = require('http');
const { WorldRoom } = require('./WorldRoom.js');

const app = express();
const port = Number(process.env.PORT || 3000);

// مسار الاستيقاظ
app.get('/wakeup', (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.status(200).json({ status: "awake", message: "N-CORE Server is ready!" });
});

const server = http.createServer(app);

const gameServer = new Server({
    transport: new WebSocketTransport({
        server: server
    })
});

// تسجيل غرفة العالم المفتوح
gameServer.define('world', WorldRoom);

// تشغيل الخادم مع التقاط صارم للأخطاء
gameServer.listen(port).then(() => {
    console.log(`[N-CORE] MMO Server successfully listening on port ${port}`);
}).catch((err) => {
    console.error("[N-CORE] FATAL ERROR: Failed to start server!");
    console.error(err);
    process.exit(1);
});

// التقاط أي انهيار غير متوقع لمنع صمت السيرفر
process.on('uncaughtException', (err) => {
    console.error('[N-CORE] Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('[N-CORE] Unhandled Rejection at:', promise, 'reason:', reason);
});
