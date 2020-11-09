const _ = require("highland");
const AWS = require("aws-sdk");
const jsYaml = require("js-yaml");
const { Readable } = require("stream");
const url = require("url");
const zlib = require("zlib");

const S3 = new AWS.S3();

const EMPTY_DIFF = '<osm generator="osm-replication-streams" version="0.6"><note>The data included in this document is from www.openstreetmap.org. The data is made available under ODbL.</note></osm>';

function trim(s, c) {
  if (c === "]") c = "\\]";
  if (c === "\\") c = "\\\\";
  return s.replace(new RegExp(
    "^[" + c + "]+|[" + c + "]+$", "g"
  ), "");
}

const getMostRecentReplicationSequence = async ({ baseURL }) => {
  try {
    const uri = new url.URL(baseURL);
    const params = {
      Bucket: uri.host,
      Key: `${trim(uri.pathname, "/")}/status.txt`
    };
    const rsp = await S3.getObject(params).promise();

    return parseInt(rsp.Body, 10);
  } catch (err) {
    console.warn(`Failed to get the most recent replication sequence: ${err.message}`);
    throw err;
  }
};

async function getChange(sequence, { baseURL }) {
  const sequenceStr = sequence.toString().padStart(9, '0');
  const pt1 = sequenceStr.slice(0, 3);
  const pt2 = sequenceStr.slice(3, 6);
  const pt3 = sequenceStr.slice(6, 9);
  const diffUrl = new url.URL(`${trim(baseURL, "/")}/${pt1}/${pt2}/${pt3}.xml.gz`);
  const params = {
    Bucket: diffUrl.host,
    Key: trim(diffUrl.pathname, "/"),
  };

  // First check if object exists because I can't figure out how to intercept a read error
  // and substitute an empty diff later when the readObject request is converted
  // with createReadStream
  try {
    await S3.headObject(params).promise();
  } catch (err) {
    if (err.statusCode === 404) {
      console.warn(`Found 404 for ${params}. Continuing with empty diff.`);
      const emptyStream = Readable.from([EMPTY_DIFF]).pipe(zlib.createGzip());
      emptyStream.sequenceNumber = sequence;
      return emptyStream;
    }
    console.warn(`Failed to get change ${sequence}: ${err.statusCode} ${err.code}`);
    throw err;
  }

  const s3Stream = S3.getObject(params).createReadStream();
  s3Stream.sequenceNumber = sequence;
  return s3Stream;
}

module.exports = options => {
  const opts = {
    baseURL: undefined,
    delay: 30e3,
    infinite: true,
    ...options
  };

  if (!opts.baseURL) {
    throw new Error('options.baseURL is required!');
  }

  if (!opts.baseURL.startsWith("s3")) {
    throw new Error('options.baseURL must be an s3 URI!');
  }

  let state = opts.initialSequence;

  return _(async (push, next) => {
    try {
      const nextState = await getMostRecentReplicationSequence({
        baseURL: opts.baseURL
      });

      if (state == null || state < 0) {
        try {
          if (state < 0) {
            state += nextState;
          } else {
            state = nextState;
          }
        } catch (err) {
          return push(err, _.nil);
        }
      }

      if (state <= nextState) {
        const changeStream = await getChange(state, { baseURL: opts.baseURL });

        push(null, changeStream);

        state++;

        next();
      } else {
        if (options.infinite) {
          return setTimeout(next, opts.delay);
        }

        return push(null, _.nil);
      }
    } catch (err) {
      // retry
      return setTimeout(next, opts.delay);
    }
  })
    .map(s => {
      const s2 = s.pipe(zlib.createGunzip());
      s2.sequenceNumber = s.sequenceNumber
      return s2;
    })
    .map(s => {
      const startMarker = jsYaml.dump({
        status: "start",
        sequenceNumber: s.sequenceNumber
      });

      const endMarker = jsYaml.dump({
        status: "end",
        sequenceNumber: s.sequenceNumber
      });

      return _([`<!--\n${startMarker}\n-->`])
        .concat(s)
        .append(`<!--\n${endMarker}\n-->`)
        .append("\u001e");
    })
    .sequence();
};
