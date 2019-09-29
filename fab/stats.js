// generic statistics for bank
const query =  `select sum(qty) as itemcount
from inventory;`

const stats = (args, message, db) => {
    stmt = db.prepare(query)
    row = stmt.get()
    return `Wir haben insgesamt: `+row.itemcount+` Gegenstände.\nVorschläge für andere Statistiken bitte an Vann/Syrana.`
}

module.exports = stats