function lambda(input, callback) {
  // import Toolbelt
  const { Toolbelt, LpServices } = require("lp-faas-toolbelt");
  const httpClient = Toolbelt.HTTPClient(); // For API Docs look @ https://www.npmjs.com/package/request-promise
  const secretClient = Toolbelt.SecretClient();
  const { conversationId } = input.payload;

  /**
  * arguments: String array of command arguments.
  * conversationId: The ID of the conversation in which the command was called.
  */


  // UPDATE BELOW
  const leUserId = "1130079770"; // userid of bot joining
  const agentLoginName = "testbot"; // login name of bot joining
  // Create an APP KEY in Conversational Cloud with 'login' permission. This App Key is then used to expose a bearer token required for this function
  const appKey = await secretClient.readSecret('AppKey');
  


  const main = async (input, callback) => {

    async function getToken(name, appKey, secret, accessToken, accessSecretToken) {
      console.info(`siteId: ${process.env.BRAND_ID}`)
      var res = await httpClient(`https://sy.agentvep.liveperson.net/api/account/${process.env.BRAND_ID}/login?v=1.3`, {
        method: "POST", // HTTP VERB
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ "username": name, "appKey": appKey, "secret": secret, "accessToken": accessToken, "accessTokenSecret": accessSecretToken }),
        simple: false,
        resolveWithFullResponse: false
      })
        .then(response => { return response; })
      return res;
    }

    async function botJoin(token, agentLoginName, leUserId, convId, yourId, jointype) {
      console.info(JSON.stringify({ token: token, agentLoginName: agentLoginName, leUserId: leUserId, convId: convId, yourId: yourId, jointype: jointype }))
      var res = await httpClient(`https://sy.intentid.liveperson.net/v1/userjoin/${jointype}/${convId}`, {
        method: "POST",
        headers: { 'Accept': 'application/json, text/plain, */*', 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, 'user-id': `${yourId}`, 'account-id': process.env.BRAND_ID, },
        body: JSON.stringify({ "conversationId": convId, "leUserId": leUserId, "brandId": process.env.BRAND_ID, "userName": agentLoginName }),
        simple: false,
        resolveWithFullResponse: false
      })
        .then(response => { return response; })
      return res;
    }

    var result = async () => {
      const joinType = 'join' // remove option removed from function. Agent can remove bot using AWS UI            
      const tokenData = await getToken(appKey.value.username, appKey.value.appKey, appKey.value.secret, appKey.value.accessToken, appKey.value.accessSecretToken);
      const jsonData = JSON.parse(tokenData);
      const yourId = jsonData.config.userId;
      const token = jsonData.bearer
      const botJoinRes = await  botJoin(token, agentLoginName, leUserId, conversationId, yourId, joinType)
      console.info(botJoinRes)
      return botJoinRes;

    }
    callback(null, result());
  }
  main(input, callback);
}