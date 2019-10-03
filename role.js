const add_user_to_role = (args, message, db) => {
    console.log(message.channel.name)
    if( !(message.channel.name === "willkommenschannel" )){
        return
    }

    const [command, target_role, pass] = args
    
    let role = message.guild.roles.find(role => role.name === target_role)
    if (target_role === "Allianzmitglied" && pass === process.env.ALLIANZ_PASS) {
        message.member.addRole(role)
    }
    if (target_role === "Gildenmitglied" && pass === process.env.GUILDMEMBER_PASS) {
        message.member.addRole(role)
    }
    message.delete()
}
module.exports = add_user_to_role