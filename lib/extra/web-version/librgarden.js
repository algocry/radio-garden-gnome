const BASEURL = "aHR0cDovL3JhZGlvLmdhcmRlbi9hcGkvYXJhL2NvbnRlbnQ=";
const FAVORITES_ENDPOINT = "/favorites/v2";
const SEARCH_BASE_URL = "aHR0cDovL3JhZGlvLmdhcmRlbi9hcGkvc2VhcmNoP3E9";
const SEARCH_ENDPOINT = "/search?q=";
const PROXY_URL = "https://cors-proxy.0x0is1.repl.co/proxy";

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

function xhrRequest(method, url, data, headers) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');

    if (headers) {
      for (const key in headers) {
        xhr.setRequestHeader(key, headers[key]);
      }
    }

    xhr.onload = function () {
      if (xhr.status === 200) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        reject(xhr.statusText);
      }
    };
    xhr.onerror = function () {
      reject(xhr.statusText);
    };
    xhr.send(data);
  });
}

async function getChannels() {
  const container = [];
  const idcontainer = [];
  const URL = atob(BASEURL) + FAVORITES_ENDPOINT;
  const data = JSON.stringify(stationsData);
  const response = await xhrRequest('POST', PROXY_URL, JSON.stringify({
    target: URL,
    data: data
  }));
  for (const i of response.data) {
    container.push([i.page.title, i.page.subtitle]);
    const id = i.page.url.split("/").pop();
    idcontainer.push(id);
  }
  return [container, idcontainer];
}

function getListenUrl(id) {
  const URL = `${atob(BASEURL)}/listen/${id}/channel.mp3`;
  return URL;
}

async function searchRG(query) {
  const container = [];
  const idcontainer = [];
  const baseUrl = atob(SEARCH_BASE_URL);
  const encodedQuery = encodeURIComponent(query);
  const URL = `${baseUrl}${SEARCH_ENDPOINT}${encodedQuery}`;
  const headers = {
    'Target-URL': URL
  };

  try {
    const response = await xhrRequest('GET', PROXY_URL, null, headers);

    for (const i of response.hits.hits) {
      const source = i._source;
      let location = source.subtitle || source.title;
      const title = source.title;
      if (source.type === 'country') {
        continue;
      }
      const stid = source.url.split('/').pop();
      container.push([title, location]);
      idcontainer.push(stid);
    }
  } catch (error) {
    console.error('Error during searchRG:', error);
  }

  return [container, idcontainer];
}

// Example usage:
getChannels().then(json => {
  console.log(getListenUrl(json[1][10]));
});

searchRG("mirchi").then(json => {
  console.log(getListenUrl(json[1][1]));
});
