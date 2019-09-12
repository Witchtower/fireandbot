const Base64 = require('js-base64').Base64
const request = require('request')
const parseXML = require('xml2js').parseString;

const wasnda = async (message, db) => {
  try {
    rows = wasnda_query(db)
    console.log(rows)
    message.reply( '\n\n```'+
      rows.map((row)=>{
        return row.qty+'x '+row.de
      }).join('\n')+'```'
    )
  }
  catch (ex){
    console.log(ex)
    message.reply('ERROR: wasnda ('+ex.message+')')
  }
}

const wasnda_query = (db) => {
  query = `select items.de, sum(inv.qty) as qty 
           from inventory as inv 
           join items on inv.item_id = items.id 
           group by item_id;`
  stmt = db.prepare(query)
  return stmt.all()
}

const itisknown = async (message, db) => {
  try {
    rows = itisknown_query(db)

    message.reply( '\n\n'+
      rows.map((row)=>{
        return row.de
      }).join('\n')
    )
  }
  catch (ex) {
    console.log(ex)
    message.reply('ERROR: itisknown ('+ex.message+')')
  }
}

const itisknown_query = (db) => {
  query = `select * from items;`
  stmt = db.prepare(query)
  return stmt.all()
}

const letitbeknown = async (message, db) => {
  try {
    ar = message.content.split(' ')
    if (ar.count < 2){
      message.reply('Du musst schon diesen langen Komplizierten Text aus dem Addon kopieren und hier einfügen...')
    } else {
      [charname, ...items] = parse(ar[1])
      charname = charname.split(',')[0]
      char = get_char_by_name(charname, db)
      items.pop()
      //sum qty for grouped item.ids
      summed = [];
      items = items.reduce(function(res, value) {
        if (!res[value.id]) {
          res[value.id] = { id: value.id, qty: 0 };
          summed.push(res[value.id])
        }
        res[value.id].qty += value.qty;
        return res;
      }, {});
      items = Object.values(items)
      //end_sum
      delete_for_char(char, db)
      items.forEach(item => {
        let_item_be_known(item, char, db)
      });
      await update_item_names(db)
      display_inventory(char, message, db)
    }
  }
  catch (ex) {
    console.log(ex)
    message.reply('ERROR: letitbeknown ('+ex.message+')')
  }
}

const delete_for_char = (char, db) => {
  db.prepare(`delete from inventory where char_id = ?`).run(char.id)
}

const parse = (text) => {
  [bankchar, , ...stacks] = 
    Base64.decode(text).split(';')
      .map((x)=>x.substr(1,x.length-2))
  stacks = stacks.map((x)=>x.split(','))
  items = stacks.map( (x)=>{ 
    y = {id: parseInt(x[2]), qty: parseInt(x[3])}
    return y }
  )
  return [bankchar, ...items]
}

const get_char_by_name = (char_name, db) => {
  char = db.prepare(`select id from chars where name = ?`).get(char_name)
  if (typeof char !== 'undefined') return char
  db.prepare(`insert into chars (id, name) values ((select max(id)+1 from chars),?)`).run(char_name)
  return db.prepare(`select id from chars where name = ?`).get(char_name)
}

const let_item_be_known = (item, char, db) => {
  console.log('announcing item '+item.id)
  query_items = `insert or replace into items (id, de, en)
                 values (
                   $id, 
                   (select de from items where id = $id),
                   (select en from items where id = $id)
                 )`
  db.prepare(query_items).run({id: item.id})
  query_inventory = `insert or replace into inventory (char_id, item_id, qty) values (
    $char_id,
    $item_id,
    $qty
  )`
  db.prepare(query_inventory).run({char_id: char.id, item_id: item.id, qty: item.qty})
}

const update_item_names = async (db) => {
  query = `select id from items where de is NULL`
  unnamed_items = db.prepare(query).all()
  unnamed_items.forEach(uitem => {
    fetch_wowhead(uitem.id, db)
  });
}

const fetch_wowhead = async (id, db) => {
  url = 'https://de.classic.wowhead.com/item='
  url_pf = '&xml'
  return request(url+id+url_pf, (err, res, body) => {
    if (err){
      console.log(err)
      return
    }
    //console.log(body)
    write_item_name(body, id, db)
  })
}

const write_item_name = (xml, id, db) => {
  parseXML(xml, (err, res)=>{
    if (!err){
      if (typeof res.wowhead.item !== 'undefined'){
        iname = res.wowhead.item[0].name[0]
        console.log(iname)
        db.prepare(`update items set de = ? where id = ?`).run(iname, id)
      }
    }
  })
}

const display_inventory = (char, message, db) => {
  rows = db.prepare(`select i.de, sum(y.qty) as qty
    from inventory as y
    join items as i on i.id=y.item_id
    group by y.item_id`).all()

  message.reply( '\n\n```'+
    rows.map((row)=>{
      return row.qty+'x   '+row.de
    }).join('\n')+'```'
  )
}

module.exports = (client, message, db) => {
  console.log('message.js called')
  if(message.content.startsWith('!wasnda')){
    (async (message, db) => {
      await wasnda(message, db)
    })(message, db)
  }
  else if (message.content.startsWith('!itisknown')){
    (async (message, db) => {
      await itisknown(message, db)
    })(message, db)
    
  } else if (message.content.startsWith('!letitbeknown')){
    (async (message, db) => {
      await letitbeknown(message, db)
    })(message, db)
  }
}