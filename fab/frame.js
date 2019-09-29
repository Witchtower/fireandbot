const discordFrame = async (message, db, fn) => {
    try {
        //prepare args list for component call
        args = message.content.split(' ')
        //call fab component
        lines = await fn(args, message, db)

        //option 1: string with length < 2000
        if(typeof lines === "string" && lines.length < 2000) {
            message.reply('\n```'+lines+'```')
            return
        }

        //option 2: string with length >= 2000
        //we want to create an array of lines
        //to split at linebreak
        if(typeof lines === "string" 
            && lines.length >=2000 
            && lines.indexOf('\n') > -1
            && lines.indexOf('\n') < 2000) 
        {
            lines = lines.split('\n')
        }

        // option 3: we have an Array of strings (lines)
        // (possibly produced by option 2)
        // if neccessary group lines into sections
        lps = 42 //lines_per_section
        console.log(lines)
        if(Array.isArray(lines)){
            if(lines.length < 2) {
                message.reply('\n\n```'+lines[0]+' ```')
                return
            }
            if(lines.length < lps) {
                message.reply('\n\n```'+lines.join('\n')+'```')
                return
            } else {
                sections = lines.length / lps
                for (var i = 0; i < sections; i++){
                    end_pos = i*lps+lps
                    if(end_pos >= lines.length) {
                        end_pos = lines.length-1
                    }
                    reply_text = lines.slice(i*lps, end_pos)
                    message.reply('\n\n```'+reply_text.join('\n')+'```')
                }
            }
        }
    }
    catch (ex){
        console.log(ex)
        message.reply('ERROR: '+ex.message)
    }
}

module.exports = { discordFrame }