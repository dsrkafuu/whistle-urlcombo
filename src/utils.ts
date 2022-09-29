import axios, { AxiosError, AxiosRequestConfig } from 'axios';

/**
 * get plugin config set in whistle
 */
export function getPluginConfig(
  req: Whistle.PluginServerRequest,
  options: Whistle.PluginOptions
) {
  // get config of plugin
  const configURI = decodeURIComponent(
    `${req.headers[options.RULE_VALUE_HEADER]}`
  );

  // split with `:`, not `\:`
  const configs: string[] = [];
  let lastChar = '';
  let tempStr = '';
  for (const char of configURI) {
    if (char === ':' && lastChar !== '\\') {
      configs.push(tempStr);
      tempStr = '';
      lastChar = '';
    } else {
      tempStr += char;
      lastChar = char;
    }
  }
  if (tempStr) {
    configs.push(tempStr);
  }

  const delimiter = configs[0]; // ??
  const seperator = configs[1]; // ,
  if (delimiter && seperator) {
    return {
      delimiter,
      seperator,
    };
  } else {
    return null;
  }
}

/**
 * parse combo url to full urls array
 */
export function parseCombo(
  combo: string,
  delimiter: string,
  seperator: string
) {
  const [baseURL, fullPaths] = combo.split(delimiter);
  const paths = fullPaths.split(seperator);
  const urls = paths.map((path) => {
    const baseTrail = baseURL.endsWith('/');
    const pathTrail = path.startsWith('/');
    if (baseTrail && pathTrail) {
      return `${baseURL}${path.replace('/', '')}`;
    } else if (baseTrail || pathTrail) {
      return `${baseURL}${path}`;
    } else {
      return `${baseURL}/${path}`;
    }
  });
  return urls;
}

export function cloneDeep(source: unknown) {
  return JSON.parse(JSON.stringify(source));
}

/**
 * fetch data with axios
 */
export async function request(
  req: Whistle.PluginServerRequest,
  url: string,
  config: AxiosRequestConfig
) {
  const res = await axios.request({
    ...cloneDeep({
      headers: req.headers,
      method: req.method,
      url,
    }),
    ...config,
  });
  return res;
}

/**
 * init cors header for all response
 */
export function setCORSHeaders(
  req: Whistle.PluginServerRequest,
  res: Whistle.PluginServerResponse
) {
  const origin = req.headers['origin'];
  if (origin) {
    res.setHeader('access-control-allow-origin', origin);
    res.setHeader('access-control-allow-credentials', 'true');
  } else {
    res.setHeader('access-control-allow-origin', '*');
  }
}

/**
 * handle proxy errors,
 * either axios error or runtime error
 */
export function handleError(
  req: Whistle.PluginServerRequest,
  res: Whistle.PluginServerResponse,
  e: unknown
) {
  setCORSHeaders(req, res);

  // axios error
  if (e instanceof AxiosError && e.response) {
    res.statusCode = e.response.status;
    if (e.response.headers['content-type'] && e.response.data) {
      res.setHeader('content-type', e.response.headers['content-type']);
    }
    res.end(e.response.data || null);
    return;
  }

  // internal server error
  console.error(e);
  res.statusCode = 502;
  res.end('Whistle URLCombo Proxy Error\n\n' + JSON.stringify(e));
}
