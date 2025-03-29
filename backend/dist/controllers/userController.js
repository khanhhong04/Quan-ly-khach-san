const db = require("../config/database");

const getUsers = async (req, res) => {
    try {
        const [results] = await db.execute("SELECT * FROM User");
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getUsers };
