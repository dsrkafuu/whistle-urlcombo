import {
  getPluginConfig,
  handleError,
  parseCombo,
  request,
  setCORSHeaders,
} from './utils';

async function handler(
  req: Whistle.PluginServerRequest,
  res: Whistle.PluginServerResponse,
  options: Whistle.PluginOptions
) {
  // get config of plugin
  const configs = getPluginConfig(req, options);
  if (!configs) {
    req.passThrough();
    return;
  }
  const { delimiter, seperator } = configs;

  // parse combo url
  const { fullUrl } = req.originalReq;
  const parsedURLS = parseCombo(fullUrl, delimiter, seperator);
  if (!parsedURLS.length) {
    req.passThrough();
    return;
  }

  // get responses
  let contentType = 'text/plain';
  const responses = await Promise.all(
    parsedURLS.map(async (url) => {
      const { data, headers } = await request(req, url, {
        proxy: options.config,
      });
      if (headers['content-type']) {
        contentType = headers['content-type'];
      }
      return data;
    })
  );
  const fullResponse = responses.join('\n\n');

  // send concated response
  setCORSHeaders(req, res);
  res.setHeader('content-type', contentType);
  res.setHeader('cache-control', 'no-cache');
  res.setHeader('x-whistle-urlcombo-status', 'HIT');
  res.end(fullResponse);
}

export function server(
  server: Whistle.PluginServer,
  options: Whistle.PluginOptions
) {
  // only handle http request
  server.on(
    'request',
    async (
      req: Whistle.PluginServerRequest,
      res: Whistle.PluginServerResponse
    ) => {
      try {
        await handler(req, res, options);
      } catch (e) {
        handleError(req, res, e);
      }
    }
  );
}
