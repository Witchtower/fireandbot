// update inventory by args or by attachment
const request_promise = require('request-promise')
const request = require('request')
const Base64 = require('js-base64').Base64
const parseXML = require('xml2js').parseString;

const help_message = `Du musst schon diesen langen, komplizierten \
Text aus dem Addon kopieren und hier einfügen...\n\
Wenn Discord dir sagt, dass der Text zu lang ist, schreib\
ihn in eine Textdatei (z.B. mit notepad.exe) und häng die \
Datei an die Nachricht.`

const success_message = 'Habe alles aufgeschrieben. Wenn Items dabei sind die ich noch nicht kenne, suche ich mir jetzt die Namen dazu raus. Das kann etwas dauern.'

const select_or_insert_char = (name, db) => {
    select_char =`select id from chars where name = ?`
    char = db.prepare(select_char).get(name)
    if (typeof char !== 'undefined') {
        return char
    }
    insert_char = `insert into chars (id, name) values ((select max(id)+1 from chars),?)`
    db.prepare(insert_char).run(name)
    return db.prepare(select_char).get(name)
}

const parse = (base64code) => {
    [bankchar, , ...stacks] = 
        Base64.decode(base64code).split(';')
            .map((x)=>x.substr(1,x.length-2))
    stacks = stacks.map((x)=>x.split(','))
    items = stacks.map( (x)=>{ 
        y = {id: parseInt(x[2]), qty: parseInt(x[3])}
        return y 
    })
    // [charname];[taschen];[stack];[stack];
    // split on ; so ...
    items.pop() 
    return [bankchar, ...items]
}

const clear_inventory_for = (char, db) => {
    delete_inventory = `delete from inventory where char_id = ?`
    db.prepare(delete_inventory).run(char.id)
}

const let_item_be_known = (item, char, db) => {
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

  const update = async (args, message, db) => {
    if (args.length < 2 && message.attachments.size < 1) {
        message.reply(help_message)
        return
    }
    code = args[1]
    if (message.attachments.size > 0) {
        code = await request_promise(message.attachments.first().url)
    }
    [charname, ...items] = parse(code)
    charname = charname.split(',')[0]
    char = select_or_insert_char(charname, db)
    
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

    clear_inventory_for(char, db)
    items.forEach(item => {
        let_item_be_known(item, char, db)
    });

    message.reply(success_message)
    await update_item_names(db)
    
}

module.exports = update