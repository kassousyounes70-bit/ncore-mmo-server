const schema = require('@colyseus/schema');
const { Room } = require('@colyseus/core');
const Schema = schema.Schema;
const MapSchema = schema.MapSchema;

// تعريف هيكل بيانات اللاعب بالطريقة الحديثة لـ JS
class Player extends Schema {
    constructor() {
        super();
        this.x = 2500;
        this.y = 2500;
        this.facingRight = false;
        this.isMoving = false;
    }
}
schema.defineTypes(Player, {
    x: "number",
    y: "number",
    facingRight: "boolean",
    isMoving: "boolean"
});

// تعريف حالة العالم التي تحتوي على كل اللاعبين
class WorldState extends Schema {
    constructor() {
        super();
        this.players = new MapSchema();
    }
}
schema.defineTypes(WorldState, {
    players: { map: Player }
});

// غرفة اللعبة
class WorldRoom extends Room {
    onCreate(options) {
        this.setState(new WorldState());
        this.maxClients = 100;

        this.onMessage("move", (client, data) => {
            const player = this.state.players.get(client.sessionId);
            if (player) {
                player.x = data.x;
                player.y = data.y;
                player.facingRight = data.facingRight;
                player.isMoving = data.isMoving;
            }
        });
        
        console.log("[N-CORE] WorldRoom initialized.");
    }

    onJoin(client, options) {
        console.log(`[N-CORE] Player joined: ${client.sessionId}`);
        this.state.players.set(client.sessionId, new Player());
    }

    onLeave(client, consented) {
        console.log(`[N-CORE] Player left: ${client.sessionId}`);
        this.state.players.delete(client.sessionId);
    }
}

module.exports = { WorldRoom };
