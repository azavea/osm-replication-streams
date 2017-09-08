const zlib = require("zlib");

const _ = require("highland");
const axios = require("axios");
const yaml = require("js-yaml");

const DEFAULT_BASE_URL = "http://planet.osm.org/replication/changesets/";

const getMostRecentReplicationSequence = async ({ baseURL }) => {
  try {
    const rsp = await axios.get(`${baseURL}state.yaml`);

    return yaml.safeLoad(rsp.data).sequence;
  } catch (err) {
    throw err;
  }
};

async function getChange(sequence, { baseURL }) {
  const state = sequence.toString().padStart(9, 0);
  const path = `${state.slice(0, 3)}/${state.slice(3, 6)}/${state.slice(6, 9)}`;
  const rsp = await axios.get(`${baseURL}${path}.osm.gz`, {
    responseType: "stream"
  });

  return rsp.data;
}

module.exports = options => {
  const opts = {
    baseURL: DEFAULT_BASE_URL,
    checkpoint: () => {},
    delay: 30e3,
    infinite: true,
    ...options
  };

  let state = opts.initialSequence;

  return _(async (push, next) => {
    if (state == null) {
      try {
        state = await getMostRecentReplicationSequence({
          baseURL: opts.baseURL
        });
      } catch (err) {
        return push(err, _.nil);
      }
    }

    try {
      const change = await getChange(state, { baseURL: opts.baseURL });

      push(null, change);

      options.checkpoint(state);

      state++;

      next();
    } catch (err) {
      if (options.infinite) {
        return setTimeout(next, opts.delay);
      }

      if (!(err.response && err.response.status === 404)) {
        // raise non-404s
        return push(err, _.nil);
      }

      return push(null, _.nil);
    }
  })
    .map(s => s.pipe(zlib.createUnzip()))
    .map(s => _(s).append("\u001e"))
    .sequence();
};
