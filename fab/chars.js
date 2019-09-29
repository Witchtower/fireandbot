// inventory filterable by bankchars
const query =  `select name from chars;`

const chars = (args, message, db) => {
    console.log('calling chars')
    stmt = db.prepare(query)
    rows = stmt.all()
    return rows.map((row)=>{
        return row.name
    })
}

module.exports = chars