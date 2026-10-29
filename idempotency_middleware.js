const fs = require('fs');

const idempotencyCache = {};

function loadRequest(){
    const rawData = fs.readFileSync('incoming_request.json',  'utf8');
    return JSON.parse(rawData);
}

function processTransactionalRequest(requestData, idempotencyKey) {
    console.log(`Processing Request with Key: ${idempotencyKey}`);

    if(idempotencyCache[idempotencyKey]) {
      console.log("CACHE HIT: Duplicate request detected! Returning cached response.");
      return {
        status:200,
        cached: true,
        data: idempotencyCache[idempotencyKey]
      };
    }

    console.log("CACHE MISS: Executing  core transactional logic , Charging wallet ...");
    const responsePayload = {
        transactionId: "tx_res_99887766", 
        status: "success",
        chargedAmount: requestData.amount,
        timestamp: new Date().toISOString()
    };

    idempotencyCache[idempotencyKey] = responsePayload;

    return {
        status: 201,
        cached: false,
        data: responsePayload
    };
}

const reqPayload = loadRequest();
const testKey = reqPayload.idempotencyKey;

const firstAttempt = processTransactionalRequest(reqPayload, testKey);
console.log("Response 1:", firstAttempt);

const secondAttempt = processTransactionalRequest(reqPayload, testKey);
console.log("Response 2:", secondAttempt);

