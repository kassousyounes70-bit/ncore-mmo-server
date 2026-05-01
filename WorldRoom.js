const schema = require('@colyseus/schema');
const { Room } = require('@colyseus/core');
const Schema = schema.Schema;
const MapSchema = schema.MapSchema;
const type = schema.type;

// تعريف هيكل بيانات اللاعب
class Player extends Schema {
    constructor() {
        super();
        this.x = 2500; // نقطة البداية الافتراضية
        this.y = 2500;
        this.facingRight = false;
        this.isMoving = false;
    }
}
type("number")(Player.prototype, "x");
type("number")(Player.prototype, "y");
type("boolean")(Player.prototype, "facingRight");
type("boolean")(Player.prototype, "isMoving");

// تعريف حالة العالم التي تحتوي على كل اللاعبين
class WorldState extends Schema {
    constructor() {
        super();
        this.players = new MapSchema();
    }
}
type({ map: Player })(WorldState.prototype, "players");

// غرفة اللعبة
class WorldRoom extends Room {
    onCreate(options) {
        this.setState(new WorldState());
        this.maxClients = 100; // أقصى عدد للاعبين في القاعة

        // استقبال تحركات اللاعب وبثها للجميع
        this.onMessage("move", (client, data) => {
            const player = this.state.players.get(client.sessionId);
            if (player) {
                player.x = data.x;
                player.y = data.y;
                player.facingRight = data.facingRight;
                player.isMoving = data.isMoving;
            }
        });
    }

    onJoin(client, options) {
        console.log(`Player joined: ${client.sessionId}`);
        this.state.players.set(client.sessionId, new Player());
    }

    onLeave(client, consented) {
        console.log(`Player left: ${client.sessionId}`);
        this.state.players.delete(client.sessionId);
    }
}

module.exports = { WorldRoom };
