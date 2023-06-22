import fetch from 'node-fetch';

const BASEURL = Buffer.from("aHR0cDovL3JhZGlvLmdhcmRlbi9hcGkvYXJhL2NvbnRlbnQ=", 'base64').toString('utf-8');

// stations.json data as a JSON object
const stationsData = {
    "favorites": [
        "S75sbxoD",
        "Q8bAf9wc",
        "edLkM5f4",
        "bVAGzwWy",
        "SvCJ0zhu",
        "xAjAGSd1",
        "9lnKrV26",
        "to5IKEqr",
        "GLV1daNG",
        "YzuD3ptB",
        "4gKAHq3y",
        "IjPr48ul",
        "p8X5GY7z",
        "6r4KKSDv",
        "7vEaGrbU",
        "cXqr0Klq",
        "0CDxvhRD",
        "kFB69zxJ",
        "AHgJRFsc",
        "asHx6V00",
        "fxeipVFL",
        "SLHoxgT6",
        "KUO-dC2-",
        "Z1OAPW8N",
        "Bkz1IwV9",
        "SfwKTG1z",
        "DMQpXd44",
        "17VfvQyB",
        "s63fh4h0",
        "zBVPsllm",
        "-iYWlqOr",
        "BC4i8Gx5",
        "IgQtF9uK",
        "8AFVa_Em"
    ]
};

// modules for radio garden
async function getChannels() {
    const container = [];
    const idcontainer = [];
    const URL = BASEURL + "/favorites/v2";
    const data = JSON.stringify(stationsData);
    const response = await fetch(URL, {
        method: 'POST',
        body: data,
        headers: { 'Content-Type': 'application/json' }
    });
    const responseData = await response.json();
    for (const i of responseData.data) {
        container.push([i.page.title, i.page.subtitle]);
        const id = i.page.url.split("/").pop();

        idcontainer.push(id);
    }
    return [container, idcontainer];
}

function getListenUrl(id) {
    const URL = `${BASEURL}/listen/${id}/channel.mp3`;
    return URL;
}

async function searchRG(query) {
    const container = [];
    const idcontainer = [];
    const URL = `${Buffer.from('aHR0cDovL3JhZGlvLmdhcmRlbi9hcGkvc2VhcmNoP3E9', 'base64').toString('utf-8')}${query}`;
    const response = await fetch(URL);
    const responseData = await response.json();
    // return responseData.hits.hits[0];
    for (let i of responseData.hits.hits) {
        const source = i._source;
        let location = source.subtitle;
        if (!location) {
            location = source.title;
        }
        const title = source.title;
        if (source.type === "country") {
            continue;
        }
        const stid = source.url.split("/").pop();
        container.push([title, location]);
        idcontainer.push(stid);
    }
    return [container, idcontainer];
}

// getChannels().then(json => {
//     console.log(getListenUrl(json[1][10]));
// });

// searchRG("mirchi").then(json => {
//    console.log(getListenUrl(json[1][1]));
// });
