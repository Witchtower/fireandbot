const Base64 = require('js-base64').Base64
const request = require('request')
const requestPromise = require('request-promise')
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
    if (ar.length < 2 && message.attachments.size < 1){
      message.reply('Du musst schon diesen langen, komplizierten \
Text aus dem Addon kopieren und hier einfügen...\n\
Wenn Discord dir sagt, dass der Text zu lang ist, schreib\
ihn in eine Textdatei (z.B. mit notepad.exe) und häng die \
Datei an die Nachricht.')
    } else {
      base_msg = ar[1]
      if (message.attachments.size > 0) {
        base_msg = await read_attachment(message.attachments.first())
      }
      [charname, ...items] = parse(base_msg)
      charname = charname.split(',')[0]
      char = get_char_by_name(charname, db)
      items.pop()
      //sum qty for grouped item.ids
      summed = [];
      items = items.reduce(function(res, value) {
        if (!res[value.id]) {
          res[value.id] = { id: value.id, qty: 0 }
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
      //await display_inventory(char, message, db)
      message.reply('Hab alles aufgeschrieben, wenn items dabei sind die ich noch nicht kenne, suche ich mir jetzt die namen dazu raus. Das kann etwas dauern.')
      await update_item_names(db)
    }
  }
  catch (ex) {
    console.log(ex)
    message.reply('ERROR: letitbeknown ('+ex.message+')')
  }
}

const read_attachment = async (attachment) => {
  response = await requestPromise(attachment.url)
  console.log(response)
  return response
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
  //await Promise.all(unnamed_items.map(item => fetch_wowhead(item)))
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

const display_inventory = async (char, message, db) => {
  rows = db.prepare(`select i.de, sum(y.qty) as qty
    from inventory as y
    join items as i on i.id=y.item_id
    group by y.item_id
    order by i.de`).all()
  message.reply('test')
  message.reply( '\n\n```'+
    rows.map((row)=>{
      return row.qty+'x   '+row.de
    }).join('\n')+'```'
  )
}

module.exports = { wasnda, itisknown, letitbeknown }