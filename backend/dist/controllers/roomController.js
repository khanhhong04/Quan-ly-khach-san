const db = require("../config/database");

exports.getRooms = async (req, res) => {
    try {
        const [results] = await db.execute("SELECT * FROM Room");
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
