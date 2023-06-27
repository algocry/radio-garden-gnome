const { GLib, Soup } = imports.gi;

const BASEURL = "aHR0cDovL3JhZGlvLmdhcmRlbi9hcGkvYXJhL2NvbnRlbnQ=";
const FAVORITES_ENDPOINT = "/favorites/v2";
const BROWSE_ENDPOINT = "/browse"
const SEARCH_BASE_URL = "aHR0cDovL3JhZGlvLmdhcmRlbi9hcGkvc2VhcmNoP3E9";

const PROXY_URL = "https://cors-proxy.0x0is1.repl.co/proxy";

const session = new Soup.Session();

function httpRequest(method, url, data, headers) {
  return new Promise((resolve, reject) => {
    const message = Soup.Message.new(method, url);

    if (headers) {
      for (const key in headers) {
        message.request_headers.append(key, headers[key]);
      }
    }

    if (data) {
      const encoder = new TextEncoder();
      message.set_request('application/json', 2, encoder.encode(data));
    }

    session.queue_message(message, (session, message) => {
      if (message.status_code === Soup.KnownStatusCode.OK) {
        resolve(JSON.parse(message.response_body.data));
      } else {
        reject(Object.values(headers));
      }
    });
  });
}

async function getChannels(stationsData) {
  const container = [];
  const idcontainer = [];
  const URL = decodeBase64(BASEURL) + FAVORITES_ENDPOINT;
  const data = JSON.stringify(stationsData);
  const response = await httpRequest('POST', PROXY_URL, data, {
    'Content-Type': 'application/json',
    'Target-URL': URL,
  });

  for (const i of response.data) {
    container.push([i.page.title, i.page.subtitle]);
    const id = i.page.url.split("/").pop();
    idcontainer.push(id);
  }

  return [container, idcontainer];
}

function getListenUrl(id) {
  const URL = `${decodeBase64(BASEURL)}/listen/${id}/channel.mp3`;
  return URL;
}

async function search(query) {
  const container = [];
  const idcontainer = [];
  const encodedQuery = encodeURIComponent(query);
  const URL = `${decodeBase64(SEARCH_BASE_URL)}${encodedQuery}`;
  const headers = {
    'Target-URL': URL,
  };

  try {
    const response = await httpRequest('GET', PROXY_URL, null, headers);

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
    throw error; // Re-throw the error to be caught by the caller
  }

  return [container, idcontainer];
}
async function browse() {
  const container = [];
  const idcontainer = [];
  const URL = `${decodeBase64(BASEURL)}${BROWSE_ENDPOINT}`;
  const headers = {
    'Target-URL': URL,
  };

  try {
    const response = await httpRequest('GET', PROXY_URL, null, headers);

    for (let i of response.data.content) {
      if (i.type === 'playlist-excerpt') {
        container.push(i.title);
        idcontainer.push(i.page.url);
      } else if (i.type === 'playlist-carousel') {
        for (let carouselItem of i.items) {
          container.push(carouselItem.title);
          idcontainer.push(carouselItem.url);
        }
      }
    }
  } catch (error) {
    throw error; // Re-throw the error to be caught by the caller
  }

  return [container, idcontainer];
}

async function playlist(url) {
  const container = [];
  const idcontainer = [];
  const URL = `${decodeBase64(BASEURL)}${url}`;
  const headers = {
    'Target-URL': URL,
  };

  try {
    const response = await httpRequest('GET', PROXY_URL, null, headers);

    for (let i of response.data.content[1].items) {
      let location = i.subtitle;
      const title = i.title;
      const stid = i.href.split('/').pop();
      container.push([title, location]);
      idcontainer.push(stid);
    }
  } catch (error) {
    throw error; // Re-throw the error to be caught by the caller
  }

  return [container, idcontainer];
}


function decodeBase64(encodedString) {
  const byteArray = GLib.base64_decode(encodedString);
  const decodedString = byteArray ? byteArray.toString() : '';
  return decodedString;
}

var exports = {
  getChannels: getChannels,
  getListenUrl: getListenUrl,
  search: search,
  browse: browse,
  playlist: playlist
};
